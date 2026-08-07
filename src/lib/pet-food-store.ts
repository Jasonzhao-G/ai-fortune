import { addMessage } from "./message-store";
import { getOrCreateUser } from "./user-store";

export const USES_PER_BAG = 5;
export const SIGNUP_GIFT_BAGS = 1;
export const REFERRAL_GIFT_BAGS = 1;

export interface PetFoodBalance {
  giftedUses: number;
  purchasedUses: number;
  unlimitedUntil?: string;
}

export interface PetFoodPlan {
  id: string;
  label: string;
  price: number;
  desc: string;
  type: "bag" | "unlimited";
  days?: number;
  uses?: number;
}

export const PET_FOOD_PLANS: PetFoodPlan[] = [
  { id: "bag", label: "一瓶灵丹", price: 19.9, desc: "可测算 5 次", type: "bag", uses: 5 },
  { id: "3d", label: "三天灵丹", price: 39.9, desc: "三天随意测算", type: "unlimited", days: 3 },
  { id: "month", label: "一个月灵丹", price: 299, desc: "30 天随意测算", type: "unlimited", days: 30 },
  { id: "half", label: "半年灵丹", price: 599, desc: "183 天随意测算", type: "unlimited", days: 183 },
  { id: "year", label: "一年灵丹", price: 899, desc: "365 天随意测算", type: "unlimited", days: 365 },
];

const FOOD_KEY = "ai-fortune-pet-food";

function getAllFood(): Record<string, PetFoodBalance> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FOOD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFood(userId: string, balance: PetFoodBalance) {
  const all = getAllFood();
  all[userId] = balance;
  localStorage.setItem(FOOD_KEY, JSON.stringify(all));
}

export function getPetFoodBalance(userId?: string): PetFoodBalance {
  const id = userId ?? getOrCreateUser().id;
  const stored = getAllFood()[id];
  if (stored) return stored;
  return { giftedUses: SIGNUP_GIFT_BAGS * USES_PER_BAG, purchasedUses: 0 };
}

export function initPetFoodForUser(userId: string): void {
  const all = getAllFood();
  if (!all[userId]) {
    all[userId] = { giftedUses: SIGNUP_GIFT_BAGS * USES_PER_BAG, purchasedUses: 0 };
    localStorage.setItem(FOOD_KEY, JSON.stringify(all));
  }
}

export function hasUnlimitedAccess(balance: PetFoodBalance): boolean {
  if (!balance.unlimitedUntil) return false;
  return new Date(balance.unlimitedUntil) > new Date();
}

export function getTotalUses(balance: PetFoodBalance): number {
  if (hasUnlimitedAccess(balance)) return 9999;
  return balance.giftedUses + balance.purchasedUses;
}

export function getGiftedBags(balance: PetFoodBalance): number {
  return Math.floor(balance.giftedUses / USES_PER_BAG);
}

export function getPurchasedBags(balance: PetFoodBalance): number {
  return Math.floor(balance.purchasedUses / USES_PER_BAG);
}

export function getTotalBags(balance: PetFoodBalance): number {
  if (hasUnlimitedAccess(balance)) return 999;
  return getGiftedBags(balance) + getPurchasedBags(balance) +
    (balance.giftedUses % USES_PER_BAG + balance.purchasedUses % USES_PER_BAG > 0 ? 1 : 0);
}

export function canConsumePetFood(userId?: string): boolean {
  const balance = getPetFoodBalance(userId);
  return hasUnlimitedAccess(balance) || getTotalUses(balance) > 0;
}

export function consumePetFood(userId?: string): boolean {
  const user = getOrCreateUser();
  const id = userId ?? user.id;
  const balance = getPetFoodBalance(id);
  if (hasUnlimitedAccess(balance)) return true;
  if (balance.giftedUses + balance.purchasedUses <= 0) return false;
  if (balance.giftedUses > 0) balance.giftedUses--;
  else balance.purchasedUses--;
  saveFood(id, balance);
  return true;
}

export function grantGiftedFood(userId: string, bags = 1): void {
  const balance = getPetFoodBalance(userId);
  balance.giftedUses += bags * USES_PER_BAG;
  saveFood(userId, balance);
}

export function purchasePetFood(planId: string, userId?: string): PetFoodBalance {
  const id = userId ?? getOrCreateUser().id;
  const plan = PET_FOOD_PLANS.find((p) => p.id === planId);
  if (!plan) return getPetFoodBalance(id);
  const balance = getPetFoodBalance(id);
  if (plan.type === "bag" && plan.uses) {
    balance.purchasedUses += plan.uses;
  } else if (plan.type === "unlimited" && plan.days) {
    const base = hasUnlimitedAccess(balance) ? new Date(balance.unlimitedUntil!) : new Date();
    base.setDate(base.getDate() + plan.days);
    balance.unlimitedUntil = base.toISOString();
  }
  saveFood(id, balance);
  return balance;
}

/** 生成支付二维码（演示用，真实环境需对接支付网关） */
export function getPaymentQrUrl(
  planId: string,
  method: "alipay" | "wechat",
  userId?: string,
): string {
  const plan = PET_FOOD_PLANS.find((p) => p.id === planId);
  const id = userId ?? getOrCreateUser().id;
  const payload = [
    "ai-fortune-pay",
    method,
    planId,
    plan?.price ?? 0,
    id,
    Date.now(),
  ].join("|");
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
}

export function giftPetFood(fromUserId: string, toUserId: string, bags: number): boolean {
  if (bags <= 0 || fromUserId === toUserId) return false;
  const from = getPetFoodBalance(fromUserId);
  const needed = bags * USES_PER_BAG;
  if (from.giftedUses + from.purchasedUses < needed) return false;

  let remaining = needed;
  if (from.giftedUses >= remaining) {
    from.giftedUses -= remaining;
  } else {
    remaining -= from.giftedUses;
    from.giftedUses = 0;
    from.purchasedUses -= remaining;
  }
  saveFood(fromUserId, from);

  const to = getPetFoodBalance(toUserId);
  to.giftedUses += bags * USES_PER_BAG;
  saveFood(toUserId, to);

  const fromUser = getOrCreateUser();
  addMessage({
    userId: toUserId,
    type: "gift_food",
    title: "收到灵丹礼物",
    content: `${fromUser.nickname} 向您赠送了 ${bags} 瓶灵丹（${bags * USES_PER_BAG} 次测算）～`,
    relatedUserId: fromUserId,
  });
  addMessage({
    userId: fromUserId,
    type: "gift_food",
    title: "灵丹赠送成功",
    content: `您已成功赠送 ${bags} 瓶灵丹，感谢分享～`,
    relatedUserId: toUserId,
  });
  return true;
}

import type { UserProfile, UsageRecord, HistoryItem } from "./types";

const USER_KEY = "ai-fortune-user";
const USAGE_KEY = "ai-fortune-usage";
const HISTORY_KEY = "ai-fortune-history";
const BONUS_KEY = "ai-fortune-referral-bonuses";

const AVATAR_SEEDS = ["cosmic", "star", "moon", "sun", "dragon", "phoenix", "lotus", "cloud"];
const REFERRAL_BONUS_DAYS = 3;

function randomId(): string {
  return `LF${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=c45c48,d4a574,5a8a7a`;
}

function applyTrialDays(user: UserProfile, days: number): UserProfile {
  const base =
    user.trialExpiry && new Date(user.trialExpiry) > new Date()
      ? new Date(user.trialExpiry)
      : new Date();
  base.setDate(base.getDate() + days);
  return { ...user, trialExpiry: base.toISOString() };
}

function applyPendingBonuses(user: UserProfile): UserProfile {
  if (typeof window === "undefined") return user;
  const raw = localStorage.getItem(BONUS_KEY);
  const bonuses: Record<string, number> = raw ? JSON.parse(raw) : {};
  const days = bonuses[user.id];
  if (!days) return user;
  delete bonuses[user.id];
  localStorage.setItem(BONUS_KEY, JSON.stringify(bonuses));
  const updated = applyTrialDays(user, days);
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

export function grantReferralBonus(inviterId: string, days = REFERRAL_BONUS_DAYS): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(USER_KEY);
  if (existing) {
    const current = JSON.parse(existing) as UserProfile;
    if (current.id === inviterId) {
      const updated = applyTrialDays(current, days);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return;
    }
  }
  const raw = localStorage.getItem(BONUS_KEY);
  const bonuses: Record<string, number> = raw ? JSON.parse(raw) : {};
  bonuses[inviterId] = (bonuses[inviterId] || 0) + days;
  localStorage.setItem(BONUS_KEY, JSON.stringify(bonuses));
}

export function getTrialExpiryLabel(user: UserProfile): string | null {
  if (!user.trialExpiry) return null;
  const exp = new Date(user.trialExpiry);
  if (exp <= new Date()) return null;
  return exp.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
}

export function getOrCreateUser(refCode?: string): UserProfile {
  if (typeof window === "undefined") {
    return {
      id: "LF00000000",
      avatar: avatarUrl("default"),
      nickname: "访客",
      inviteCode: "LF00000000",
      createdAt: new Date().toISOString(),
    };
  }

  const existing = localStorage.getItem(USER_KEY);
  if (existing) {
    let user = JSON.parse(existing) as UserProfile;
    if (refCode && refCode !== user.id && !user.referredBy) {
      user.referredBy = refCode;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return applyPendingBonuses(user);
  }

  const id = randomId();
  const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)] + id;
  let user: UserProfile = {
    id,
    avatar: avatarUrl(seed),
    nickname: `命理者${id.slice(-4)}`,
    inviteCode: id,
    referredBy: refCode && refCode !== id ? refCode : undefined,
    createdAt: new Date().toISOString(),
    subscription: null,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(USAGE_KEY, JSON.stringify({ lifekline: 0, xiang: 0, aiAsk: 0, liuyao: 0 }));

  if (refCode && refCode !== id) {
    const raw = localStorage.getItem("ai-fortune-referrals");
    const refs: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    if (!refs[refCode]) refs[refCode] = [];
    if (!refs[refCode].includes(id)) {
      refs[refCode].push(id);
      localStorage.setItem("ai-fortune-referrals", JSON.stringify(refs));
      grantReferralBonus(refCode, REFERRAL_BONUS_DAYS);
    }
  }

  return user;
}

export function updateUser(patch: Partial<UserProfile>): UserProfile {
  const user = getOrCreateUser();
  const updated = { ...user, ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

export function getUsage(): UsageRecord {
  if (typeof window === "undefined") return { lifekline: 0, xiang: 0, aiAsk: 0, liuyao: 0 };
  const raw = localStorage.getItem(USAGE_KEY);
  const usage = raw ? JSON.parse(raw) : { lifekline: 0, xiang: 0, aiAsk: 0, liuyao: 0 };
  return { lifekline: 0, xiang: 0, aiAsk: 0, liuyao: 0, ...usage };
}

export function incrementUsage(type: keyof UsageRecord): UsageRecord {
  const usage = getUsage();
  usage[type]++;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function hasTrialAccess(): boolean {
  const user = getOrCreateUser();
  if (!user.trialExpiry) return false;
  return new Date(user.trialExpiry) > new Date();
}

export function hasSubscription(): boolean {
  const user = getOrCreateUser();
  if (!user.subscription || !user.subscriptionExpiry) return false;
  return new Date(user.subscriptionExpiry) > new Date();
}

export function hasActiveAccess(): boolean {
  return hasSubscription() || hasTrialAccess();
}

export function canUse(type: keyof UsageRecord): boolean {
  if (hasActiveAccess()) return true;
  return getUsage()[type] < 3;
}

export function getRemaining(type: keyof UsageRecord): number {
  if (hasActiveAccess()) return 999;
  return Math.max(0, 3 - getUsage()[type]);
}

export function mockSubscribe(plan: "month" | "half" | "year"): UserProfile {
  const days = { month: 30, half: 183, year: 365 }[plan];
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return updateUser({
    subscription: plan,
    subscriptionExpiry: expiry.toISOString(),
  });
}

export function addHistory(item: Omit<HistoryItem, "id" | "createdAt">): void {
  const list = getHistory();
  list.unshift({
    ...item,
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
}

export function getHistory(type?: HistoryItem["type"]): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  const list: HistoryItem[] = raw ? JSON.parse(raw) : [];
  return type ? list.filter((h) => h.type === type) : list;
}

export function getInviteLink(userId: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}?ref=${userId}`;
}

export function getInviteQrUrl(link: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
}

export { REFERRAL_BONUS_DAYS };

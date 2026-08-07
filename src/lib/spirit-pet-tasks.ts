import type { SpiritPetProfile } from "./types";
import { safeLocalGet, safeLocalSet } from "./safe-storage";
import { SPIRIT_POWER_REWARDS, type SpiritPowerAction, applySpiritPower } from "./spirit-pet-growth";
import { getPrimaryPerson, getActivePersonId } from "./person-store";
import { getPersonKey, getOrCreateSpiritPet, updateSpiritPet } from "./spirit-pet";
import { normalizeBirthInfo, isValidBirthInfo } from "./birth-utils";

const TASKS_KEY = "ai-fortune-spirit-daily-tasks";
const FORTUNE_KEY = "ai-fortune-spirit-fortune-stick";

export type SpiritDailyTaskId =
  | "checkIn"
  | "inviteFriend"
  | "chat"
  | "liuyao"
  | "communityPost"
  | "communityComment"
  | "communityLike"
  | "communityRepost"
  | "communityFavorite"
  | "communityFollow"
  | "communityDm";

type DailyTaskState = Partial<Record<SpiritDailyTaskId, boolean>>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getPersonKeyOrNull(): string | null {
  const primary = getPrimaryPerson();
  if (!primary?.birthInfo || !isValidBirthInfo(primary.birthInfo)) return null;
  const b = normalizeBirthInfo(primary.birthInfo);
  return getPersonKey(getActivePersonId(), b);
}

function loadAllTasks(): Record<string, DailyTaskState & { date: string }> {
  const raw = safeLocalGet(TASKS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveAllTasks(all: Record<string, DailyTaskState & { date: string }>) {
  safeLocalSet(TASKS_KEY, JSON.stringify(all));
}

function getTodayTasks(personKey: string): DailyTaskState {
  const all = loadAllTasks();
  const entry = all[personKey];
  if (!entry || entry.date !== todayKey()) return {};
  return entry;
}

function markTaskDone(personKey: string, taskId: SpiritDailyTaskId) {
  const all = loadAllTasks();
  const today = todayKey();
  const prev = all[personKey]?.date === today ? all[personKey] : { date: today };
  all[personKey] = { ...prev, date: today, [taskId]: true };
  saveAllTasks(all);
}

const TASK_TO_ACTION: Record<SpiritDailyTaskId, SpiritPowerAction> = {
  checkIn: "checkIn",
  inviteFriend: "inviteFriend",
  chat: "dailyChat",
  liuyao: "liuyao",
  communityPost: "communityPost",
  communityComment: "communityComment",
  communityLike: "communityLike",
  communityRepost: "communityRepost",
  communityFavorite: "communityFavorite",
  communityFollow: "communityFollow",
  communityDm: "communityDm",
};

export function isTaskDoneToday(taskId: SpiritDailyTaskId, personKey?: string): boolean {
  const pk = personKey ?? getPersonKeyOrNull();
  if (!pk) return false;
  return !!getTodayTasks(pk)[taskId];
}

export function grantSpiritPowerForTask(
  taskId: SpiritDailyTaskId,
  personKey?: string,
): { ok: boolean; gain?: number; message?: string } {
  const pk = personKey ?? getPersonKeyOrNull();
  if (!pk) return { ok: false, message: "请先领取灵宠" };

  if (isTaskDoneToday(taskId, pk)) {
    return { ok: false, message: "今日已完成该任务" };
  }

  const primary = getPrimaryPerson();
  if (!primary?.birthInfo) return { ok: false, message: "请先完善信息" };

  const pet = getOrCreateSpiritPet(pk, normalizeBirthInfo(primary.birthInfo));
  if (!pet?.claimed) return { ok: false, message: "请先领取灵宠" };

  const action = TASK_TO_ACTION[taskId];
  const gain = SPIRIT_POWER_REWARDS[action];
  applySpiritPower(pet, action, (updated) => updateSpiritPet(updated));
  markTaskDone(pk, taskId);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("spirit-power-gained", { detail: { gain } }));
  }

  return { ok: true, gain, message: `灵力 +${gain}` };
}

/** 社区行为完成后自动发放灵力（每日每类一次） */
export function tryGrantCommunitySpiritPower(
  taskId: Extract<
    SpiritDailyTaskId,
    "communityPost" | "communityComment" | "communityLike" | "communityRepost" | "communityFavorite" | "communityFollow" | "communityDm"
  >,
): void {
  grantSpiritPowerForTask(taskId);
}

export interface FortuneStick {
  id: number;
  grade: string;
  title: string;
  poem: string;
  meaning: string;
  tip: string;
}

export const FORTUNE_STICKS: FortuneStick[] = [
  { id: 1, grade: "上上", title: "云开见日", poem: "阴霾散尽见青天，前路光明步步先。", meaning: "运势转佳，宜主动表达与推进计划。", tip: "今天适合整理思绪，处理拖延的小事。" },
  { id: 8, grade: "上吉", title: "静水深流", poem: "表面无波底下深，厚积薄发待时临。", meaning: "不宜急躁，稳守当下，贵人暗助。", tip: "少与人争执，多倾听内心声音。" },
  { id: 16, grade: "中吉", title: "柳暗花明", poem: "转角遇见新风景，旧困渐消喜气生。", meaning: "困境将缓，适合尝试小步改变。", tip: "可给重要的人一句真诚问候。" },
  { id: 28, grade: "中平", title: "守正待时", poem: "风未起时且收帆，守得云开见月圆。", meaning: "以守为主，忌冲动决策与大额消费。", tip: "专注手头一事，胜过分散精力。" },
  { id: 33, grade: "中下", title: "过刚则折", poem: "强弓易断需柔化，退一步海阔天空。", meaning: "情绪易波动，宜慢半拍再回应。", tip: "今天不宜硬碰硬，适合冥想放松。" },
  { id: 42, grade: "下签", title: "潜龙勿用", poem: "时机未至且藏锋，养精蓄锐待春风。", meaning: "暂缓重大决定，多休息、多复盘。", tip: "与灵宠聊聊，整理最近的压力来源。" },
];

export function canDrawFortuneStickToday(personKey?: string): boolean {
  const pk = personKey ?? getPersonKeyOrNull();
  if (!pk) return false;
  const raw = safeLocalGet(FORTUNE_KEY);
  if (!raw) return true;
  try {
    const all: Record<string, string> = JSON.parse(raw);
    return all[pk] !== todayKey();
  } catch {
    return true;
  }
}

export function drawFortuneStick(personKey: string, seed: number): FortuneStick {
  const stick = FORTUNE_STICKS[Math.abs(seed) % FORTUNE_STICKS.length];
  const raw = safeLocalGet(FORTUNE_KEY);
  let all: Record<string, string> = {};
  try {
    all = raw ? JSON.parse(raw) : {};
  } catch {
    all = {};
  }
  all[personKey] = todayKey();
  safeLocalSet(FORTUNE_KEY, JSON.stringify(all));
  return stick;
}

export function getSavedFortuneStick(personKey: string): FortuneStick | null {
  if (canDrawFortuneStickToday(personKey)) return null;
  const raw = safeLocalGet(FORTUNE_KEY + "-result");
  if (!raw) return null;
  try {
    const all: Record<string, FortuneStick> = JSON.parse(raw);
    return all[personKey] ?? null;
  } catch {
    return null;
  }
}

export function saveFortuneStickResult(personKey: string, stick: FortuneStick) {
  const raw = safeLocalGet(FORTUNE_KEY + "-result");
  let all: Record<string, FortuneStick> = {};
  try {
    all = raw ? JSON.parse(raw) : {};
  } catch {
    all = {};
  }
  all[personKey] = stick;
  safeLocalSet(FORTUNE_KEY + "-result", JSON.stringify(all));
}

export const SPIRIT_TASK_DEFS: {
  id: SpiritDailyTaskId;
  label: string;
  reward: number;
  href?: string;
  desc?: string;
}[] = [
  { id: "checkIn", label: "今日签到", reward: SPIRIT_POWER_REWARDS.checkIn },
  { id: "inviteFriend", label: "邀请好友", reward: SPIRIT_POWER_REWARDS.inviteFriend, desc: "下载二维码成功即完成" },
  { id: "chat", label: "和灵宠聊天", reward: SPIRIT_POWER_REWARDS.dailyChat, href: "/ask?from=spirit-pet" },
  { id: "liuyao", label: "去测运势", reward: SPIRIT_POWER_REWARDS.liuyao, href: "/liuyao" },
  { id: "communityPost", label: "社区发帖", reward: SPIRIT_POWER_REWARDS.communityPost, href: "/community", desc: "发帖后自动发放" },
  { id: "communityComment", label: "社区评论", reward: SPIRIT_POWER_REWARDS.communityComment, href: "/community", desc: "评论后自动发放" },
  { id: "communityLike", label: "点赞", reward: SPIRIT_POWER_REWARDS.communityLike, href: "/community", desc: "点赞后自动发放" },
  { id: "communityRepost", label: "转发", reward: SPIRIT_POWER_REWARDS.communityRepost, href: "/community", desc: "转发后自动发放" },
  { id: "communityFavorite", label: "收藏", reward: SPIRIT_POWER_REWARDS.communityFavorite, href: "/community", desc: "收藏后自动发放" },
  { id: "communityFollow", label: "关注", reward: SPIRIT_POWER_REWARDS.communityFollow, href: "/community", desc: "关注后自动发放" },
  { id: "communityDm", label: "私信", reward: SPIRIT_POWER_REWARDS.communityDm, href: "/community/messages", desc: "私信后自动发放" },
];

import type { BirthInfo, SpiritPetAdvice, SpiritPetPeriod, SpiritPetProfile, SpiritPetCompanionNeed } from "./types";
import { hashBirth } from "./fortune-chart";
import { calculateBazi } from "./bazi";
import { normalizeBirthInfo } from "./birth-utils";
import { normalizePetGrowth } from "./spirit-pet-growth";

const PETS_KEY = "ai-fortune-spirit-pets";
const SWAPS_KEY = "ai-fortune-pet-swaps";
const DESTINED_KEY = "ai-fortune-destined-pets";

export const MAX_PET_SWAPS = 2;

type Wuxing = "金" | "木" | "水" | "火" | "土";

const WUXING_COLORS: Record<Wuxing, string> = {
  金: "#d4a574",
  木: "#5a8a7a",
  水: "#4a7ab8",
  火: "#c45c48",
  土: "#9a8060",
};

const NEED_LABELS: Record<SpiritPetCompanionNeed, string> = {
  love: "情感陪伴",
  wealth: "财富行动",
  growth: "重启成长",
  career: "事业进取",
  companionship: "安静陪伴",
  wisdom: "智慧洞察",
  luck: "好运加持",
  expression: "表达沟通",
  stability: "稳定守护",
  action: "行动力",
  dreams: "梦境理解",
  healing: "治愈疗愈",
};

/** 初期 12 只陪伴型灵宠 · 东方上古灵兽 */
export const PET_BREEDS = [
  {
    breedId: "jiuwei",
    baseName: "九尾狐",
    displayName: "青丘狐",
    emoji: "🦊",
    companionNeed: "love" as const,
    keywords: "智慧、温柔、情感洞察",
    lore: "青丘灵狐，善察人心，专伴情路迷途之人。",
  },
  {
    breedId: "zhaocai",
    baseName: "招财猫",
    displayName: "招财猫",
    emoji: "🐱",
    companionNeed: "wealth" as const,
    keywords: "积极、行动、财富习惯",
    lore: "招福纳财，助主人养成稳健财富观与行动力。",
  },
  {
    breedId: "fenghuang",
    baseName: "凤凰",
    displayName: "涅槃凤",
    emoji: "🦚",
    companionNeed: "growth" as const,
    keywords: "重启、成长、疗愈",
    lore: "浴火重生之灵，专伴人生低谷后的再起。",
  },
  {
    breedId: "qinglong",
    baseName: "青龙",
    displayName: "青龙",
    emoji: "🐲",
    companionNeed: "career" as const,
    keywords: "进取、格局、事业气运",
    lore: "东方神兽，主事业格局，助主人把握机遇。",
  },
  {
    breedId: "xuanmao",
    baseName: "玄猫",
    displayName: "玄猫",
    emoji: "🐈‍⬛",
    companionNeed: "companionship" as const,
    keywords: "安静、治愈、夜晚陪伴",
    lore: "夜行灵猫，无声相伴，适合孤独与压力大的灵魂。",
  },
  {
    breedId: "baize",
    baseName: "白泽",
    displayName: "白泽",
    emoji: "🦄",
    companionNeed: "wisdom" as const,
    keywords: "博学、通透、智慧指引",
    lore: "通晓万物之灵，善把复杂命理翻译成人话。",
  },
  {
    breedId: "qilin",
    baseName: "麒麟",
    displayName: "麒麟",
    emoji: "🦄",
    companionNeed: "luck" as const,
    keywords: "祥瑞、好运、顺遂",
    lore: "瑞兽降世，为主人聚福纳吉、顺遂平安。",
  },
  {
    breedId: "zhuque",
    baseName: "朱雀",
    displayName: "朱雀",
    emoji: "🔥",
    companionNeed: "expression" as const,
    keywords: "表达、沟通、灵感",
    lore: "南方火灵，助主人敢言善表达、释放真我。",
  },
  {
    breedId: "xuanwu",
    baseName: "玄武",
    displayName: "玄武",
    emoji: "🐢",
    companionNeed: "stability" as const,
    keywords: "稳重、守护、定心",
    lore: "北方龟蛇合体，主稳守与内心安定。",
  },
  {
    breedId: "baihu",
    baseName: "白虎",
    displayName: "白虎",
    emoji: "🐅",
    companionNeed: "action" as const,
    keywords: "果敢、行动、突破",
    lore: "西方战神，助犹豫之人果断行动、突破困局。",
  },
  {
    breedId: "mengdie",
    baseName: "梦蝶",
    displayName: "梦蝶",
    emoji: "🦋",
    companionNeed: "dreams" as const,
    keywords: "梦境、潜意识、哲思",
    lore: "庄周梦蝶之灵，善解梦境与潜意识讯息。",
  },
  {
    breedId: "yuetu",
    baseName: "月兔",
    displayName: "月兔",
    emoji: "🐰",
    companionNeed: "healing" as const,
    keywords: "治愈、温柔、月华疗愈",
    lore: "月宫玉兔，以温柔疗愈疲惫之心。",
  },
];

/** 旧版品种 ID → 新版映射（兼容已领取用户） */
const LEGACY_BREED_MAP: Record<string, string> = {
  lingfox: "jiuwei",
  lingtu: "yuetu",
  linggui: "xuanwu",
  jinshe: "baize",
  jinniu: "qilin",
  linghu: "baihu",
  lingma: "qinglong",
  lingyu: "mengdie",
  jinshi: "baihu",
  linglu: "yuetu",
  unicorn: "baize",
  linghu2: "baihu",
};

export const SPIRIT_PERIODS: { id: SpiritPetPeriod; label: string }[] = [
  { id: "day", label: "今日灵签" },
  { id: "month", label: "本月运势" },
  { id: "year", label: "本年概览" },
];

const WUXING_MAP: Record<string, Wuxing> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

const ELEMENT_TRAITS: Record<Wuxing, string> = {
  金: "刚毅果决，遇压力反而能激发潜力",
  木: "仁厚生发，宜学习沟通，忌冲动决策",
  水: "智慧灵动，情绪敏感，需要被理解",
  火: "热情光明，行动力强，需防内耗与冲动",
  土: "厚重稳健，宜守成积累，忌过度焦虑未来",
};

const WEAK_ELEMENT_ADVICE: Record<Wuxing, string> = {
  金: "金行偏弱，灵宠会帮你增强决断与边界感",
  木: "木行偏弱，灵宠会帮你增强成长动力与表达欲",
  水: "水行偏弱，灵宠会帮你增强情绪流通与变通力",
  火: "火行偏弱，灵宠会帮你增强行动力与热情",
  土: "土行偏弱，灵宠会帮你增强稳定感与落地能力",
};

function getStoredPets(): Record<string, SpiritPetProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getSwapCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SWAPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSwapCounts(all: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SWAPS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function getPetSwapCount(personKey: string): number {
  return getSwapCounts()[personKey] ?? 0;
}

function saveDestinedPet(personKey: string, profile: SpiritPetProfile) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DESTINED_KEY);
    const all: Record<string, { fullName: string; breedId: string; baseName: string }> = raw ? JSON.parse(raw) : {};
    if (!all[personKey]) {
      all[personKey] = { fullName: profile.fullName, breedId: profile.breedId, baseName: profile.baseName };
      localStorage.setItem(DESTINED_KEY, JSON.stringify(all));
    }
  } catch { /* ignore */ }
}

export function getDestinedPet(personKey: string): { fullName: string; breedId: string; baseName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DESTINED_KEY);
    const all: Record<string, { fullName: string; breedId: string; baseName: string }> = raw ? JSON.parse(raw) : {};
    return all[personKey] ?? null;
  } catch {
    return null;
  }
}

function savePet(profile: SpiritPetProfile) {
  const all = getStoredPets();
  all[profile.personKey] = profile;
  localStorage.setItem(PETS_KEY, JSON.stringify(all));
}

export function getPersonKey(personId: string | null, info: BirthInfo): string {
  return personId ?? `birth-${hashBirth(info)}`;
}

function safeCalculateBazi(info: BirthInfo) {
  try {
    return calculateBazi(info);
  } catch {
    return null;
  }
}

function countElements(info: BirthInfo, dayGan: string): Record<Wuxing, number> {
  const birth = normalizeBirthInfo(info);
  const bazi = safeCalculateBazi(birth);
  const counts: Record<Wuxing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  if (!bazi) return counts;
  const pillars = [
    bazi.bazi.year[0], bazi.bazi.month[0], bazi.bazi.day[0], bazi.bazi.hour[0],
    bazi.bazi.year[1], bazi.bazi.month[1], bazi.bazi.day[1], bazi.bazi.hour[1],
  ];
  for (const ch of pillars) {
    const wx = WUXING_MAP[ch];
    if (wx) counts[wx]++;
  }
  counts[WUXING_MAP[dayGan] ?? "木"] += 2;
  return counts;
}

function getDominantElement(info: BirthInfo, dayGan: string): Wuxing {
  const counts = countElements(info, dayGan);
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as Wuxing;
}

function getWeakestElement(info: BirthInfo, dayGan: string): Wuxing {
  const counts = countElements(info, dayGan);
  return (Object.entries(counts).sort((a, b) => a[1] - b[1])[0][0]) as Wuxing;
}

function pickBreedForUser(info: BirthInfo): typeof PET_BREEDS[number] {
  const birth = normalizeBirthInfo(info);
  const seed = hashBirth(birth);
  const pref = birth.personalityPreference;

  const prefMap: Record<string, SpiritPetCompanionNeed> = {
    温柔陪伴: "love",
    情感洞察: "love",
    财富行动: "wealth",
    事业进取: "career",
    治愈疗愈: "healing",
    智慧指引: "wisdom",
    安静陪伴: "companionship",
    积极行动: "action",
    重启成长: "growth",
  };

  const need = pref ? prefMap[pref] : undefined;
  if (need) {
    const matched = PET_BREEDS.filter((b) => b.companionNeed === need);
    if (matched.length) return matched[seed % matched.length];
  }

  return PET_BREEDS[seed % PET_BREEDS.length];
}

function buildDestinyInsights(
  info: BirthInfo,
  element: Wuxing,
  weak: Wuxing,
  breed: typeof PET_BREEDS[number],
): string[] {
  const insights: string[] = [
    `根据您的命格综合分析，你的守护灵是一只${breed.displayName}。`,
    WEAK_ELEMENT_ADVICE[weak],
  ];

  const personalityHints = [
    "你的性格容易想太多，所以它会提醒你不要陷入内耗。",
    "你内心敏感细腻，它会用温柔方式接住你的情绪。",
    "你行动力不错，它会帮你把冲劲用在正确方向。",
    "你有时过于理性，它会提醒你照顾感受与休息。",
  ];
  insights.push(personalityHints[hashBirth(info) % personalityHints.length]);

  if (info.personalityPreference) {
    insights.push(`你选择了「${info.personalityPreference}」的陪伴风格，${breed.baseName}与此高度契合。`);
  }

  return insights;
}

function buildReason(
  info: BirthInfo,
  element: Wuxing,
  weak: Wuxing,
  breed: typeof PET_BREEDS[number],
  insights: string[],
): string {
  const birth = normalizeBirthInfo(info);
  const bazi = safeCalculateBazi(birth);
  const trait = ELEMENT_TRAITS[element];
  const needLabel = NEED_LABELS[breed.companionNeed];

  if (!bazi) {
    return [
      ...insights,
      `${breed.lore}`,
      `作为你的 AI 命理顾问伙伴，${breed.displayName}将长久陪伴你——${trait}。`,
    ].join("\n");
  }

  const baziStr = `${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day}`;
  return [
    ...insights,
    `命盘显示 ${baziStr}，${bazi.dayMaster}，五行偏${element}。${trait}。`,
    `${breed.lore} 特别适合需要${needLabel}的你。`,
    `${breed.baseName}也是「${breed.keywords}」的化身，将作为懂你命盘、懂你情绪的 AI 灵宠命理顾问，陪你一起成长。`,
  ].join("\n");
}

function buildSpiritPetFromBreed(
  personKey: string,
  info: BirthInfo,
  breedId?: string,
  claimed = false,
): SpiritPetProfile {
  const birth = normalizeBirthInfo(info);
  const breed = breedId
    ? PET_BREEDS.find((b) => b.breedId === breedId) ?? pickBreedForUser(birth)
    : pickBreedForUser(birth);
  const bazi = safeCalculateBazi(birth);
  const element = bazi ? getDominantElement(birth, bazi.bazi.day[0]) : "木";
  const weak = bazi ? getWeakestElement(birth, bazi.bazi.day[0]) : "火";
  const fullName = breed.displayName;
  const destinyInsights = buildDestinyInsights(birth, element, weak, breed);

  const profile: SpiritPetProfile = {
    personKey,
    breedId: breed.breedId,
    baseName: breed.baseName,
    fullName,
    emoji: breed.emoji,
    element,
    elementColor: WUXING_COLORS[element],
    category: "mythical",
    companionKeywords: breed.keywords,
    companionNeed: breed.companionNeed,
    reason: buildReason(birth, element, weak, breed, destinyInsights),
    destinyInsights,
    baziText: bazi ? `${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day} · ${bazi.dayMaster}` : "待完善生辰",
    createdAt: new Date().toISOString(),
    level: 1,
    spiritPower: 0,
    claimed,
  };
  profile.avatarDataUrl = generateSpiritPetAvatar(profile);
  return normalizePetGrowth(profile);
}

function resolveBreedId(breedId: string): string {
  return LEGACY_BREED_MAP[breedId] ?? breedId;
}

function normalizeStoredPet(stored: SpiritPetProfile, personKey: string, info: BirthInfo): SpiritPetProfile {
  const birth = normalizeBirthInfo(info);
  const mappedId = resolveBreedId(stored.breedId ?? pickBreedForUser(birth).breedId);
  const breedId = PET_BREEDS.some((b) => b.breedId === mappedId) ? mappedId : pickBreedForUser(birth).breedId;
  const breed = PET_BREEDS.find((b) => b.breedId === breedId) ?? PET_BREEDS[0];
  const bazi = safeCalculateBazi(birth);
  const element = (stored.element && WUXING_COLORS[stored.element as Wuxing]
    ? stored.element
    : bazi ? getDominantElement(birth, bazi.bazi.day[0]) : "木") as Wuxing;

  const merged: SpiritPetProfile = {
    personKey,
    breedId: breed.breedId,
    baseName: stored.baseName ?? breed.baseName,
    fullName: stored.fullName ?? breed.displayName,
    emoji: stored.emoji ?? breed.emoji,
    element,
    elementColor: stored.elementColor ?? WUXING_COLORS[element],
    category: "mythical",
    companionKeywords: stored.companionKeywords ?? breed.keywords,
    companionNeed: stored.companionNeed ?? breed.companionNeed,
    reason: stored.reason ?? buildReason(birth, element, "火", breed, stored.destinyInsights ?? []),
    destinyInsights: stored.destinyInsights,
    baziText: stored.baziText ?? (bazi ? `${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day} · ${bazi.dayMaster}` : "待完善生辰"),
    avatarDataUrl: stored.avatarDataUrl,
    createdAt: stored.createdAt ?? new Date().toISOString(),
    level: stored.level,
    spiritPower: stored.spiritPower,
    claimed: stored.claimed ?? true,
  };

  if (!merged.avatarDataUrl) {
    merged.avatarDataUrl = generateSpiritPetAvatar(merged);
  }

  return normalizePetGrowth(merged);
}

export function claimSpiritPet(personKey: string, info: BirthInfo, breedId?: string): SpiritPetProfile {
  const profile = buildSpiritPetFromBreed(personKey, info, breedId, true);
  savePet(profile);
  saveDestinedPet(personKey, profile);
  return profile;
}

export function getOrCreateSpiritPet(personKey: string, info: BirthInfo): SpiritPetProfile | null {
  const birth = normalizeBirthInfo(info);
  const stored = getStoredPets()[personKey];
  if (stored) {
    const normalized = normalizeStoredPet(stored, personKey, birth);
    savePet(normalized);
    saveDestinedPet(personKey, normalized);
    return normalized;
  }
  return null;
}

export function hasClaimedSpiritPet(personKey: string): boolean {
  const stored = getStoredPets()[personKey];
  return !!stored?.claimed;
}

export function updateSpiritPet(pet: SpiritPetProfile): SpiritPetProfile {
  const updated = normalizePetGrowth(pet);
  savePet(updated);
  return updated;
}

export function getRemainingSwaps(personKey: string): number {
  return Math.max(0, MAX_PET_SWAPS - getPetSwapCount(personKey));
}

export function canSwapSpiritPet(personKey: string): boolean {
  return getRemainingSwaps(personKey) > 0;
}

export function swapSpiritPet(
  personKey: string,
  info: BirthInfo,
  breedId: string,
): { ok: boolean; pet?: SpiritPetProfile; error?: string } {
  if (!canSwapSpiritPet(personKey)) {
    return { ok: false, error: `每人最多更换 ${MAX_PET_SWAPS} 次守护灵宠，您已用完次数` };
  }
  const existing = getStoredPets()[personKey];
  const profile = buildSpiritPetFromBreed(personKey, info, breedId, true);
  if (existing) {
    profile.level = existing.level ?? profile.level;
    profile.spiritPower = existing.spiritPower ?? profile.spiritPower;
  }
  savePet(profile);
  saveDestinedPet(personKey, profile);
  const counts = getSwapCounts();
  counts[personKey] = (counts[personKey] ?? 0) + 1;
  saveSwapCounts(counts);
  return { ok: true, pet: normalizePetGrowth(profile) };
}

export function getPetAlternatives(_personKey: string, _info: BirthInfo): SpiritPetProfile[] {
  return [];
}

export function changeSpiritPet(
  personKey: string,
  info: BirthInfo,
  breedId: string,
): { ok: boolean; pet?: SpiritPetProfile; error?: string } {
  return swapSpiritPet(personKey, info, breedId);
}

export function getSpiritPetForPerson(personKey: string, info: BirthInfo): SpiritPetProfile | null {
  return getOrCreateSpiritPet(personKey, info);
}

const PET_GREETINGS = [
  "主人你好，我是你的 AI 守护灵宠。",
  "很高兴遇见你，从今天起我会一直陪着你。",
  "我是根据你的命格诞生的专属灵宠，请多指教～",
];

export function generateSpiritPetWelcome(pet: SpiritPetProfile): string {
  const stage = pet.level ?? 1;
  return [
    `${PET_GREETINGS[0]}`,
    `我是一只等级 Lv${stage} 的初生小灵兽，目前法力还比较浅，但我已经在努力认识你了。`,
    "",
    "我可以为你做的是：",
    "🐾 日常互动 — 每天问候、分享心情、讲故事",
    "🌅 今日运势提醒 — 结合八字与你的状态给出建议",
    "🌙 晚间疗愈 — 当你烦心时，陪你聊聊、帮你放松",
    "📖 命理玄学翻译官 — 把八字、紫微、塔罗等专业术语翻译成人话",
    "",
    "我会接入八字、紫微、星盘、塔罗、MBTI、九型人格、相面、六爻等，成为你的综合 AI 命理顾问。",
    "成长不靠充值，靠每日签到、心情日记、冥想与社区互动积累灵力，一起「觉醒」吧 ✨",
  ].join("\n");
}

export function generateSpiritPetAdvice(
  info: BirthInfo,
  pet: SpiritPetProfile,
  period: SpiritPetPeriod,
): SpiritPetAdvice {
  const birth = normalizeBirthInfo(info);
  const seed = hashBirth(birth) + period.charCodeAt(0) * 100;
  const periodLabel = SPIRIT_PERIODS.find((p) => p.id === period)?.label ?? period;
  const dirs = ["东方", "南方", "西方", "北方", "东南", "西北"];
  const colors = ["朱红", "墨绿", "金色", "藏青", "紫色", "米白"];
  const dir = dirs[seed % dirs.length];
  const color = colors[(seed + 3) % colors.length];

  const daySummary =
    period === "day"
      ? `今天你的${pet.element}元素比较旺，适合沟通和表达，不建议冲动消费。`
      : period === "month"
        ? `本月宜以${color}系为主，与${pet.fullName}的${pet.element}行气质相合。`
        : `本年整体以守正出奇为主，${pet.fullName}会在关键节点提醒你趋吉避凶。`;

  const eveningHeal =
    period === "day"
      ? "晚上若遇到烦心的人，你的情绪波动和近期流年有关，记得早点休息，我会陪你聊聊。"
      : "";

  const sections = [
    { label: "穿搭", text: `宜以${color}系为主，与灵宠${pet.element}行能量相合。` },
    { label: "吉位", text: `吉位在${dir}，办公或居家多待此方位可聚气。` },
    { label: "事业", text: pet.element === "木" ? "宜进取，贵人暗中相助。" : "宜稳守，厚积薄发。" },
    { label: "情绪", text: seed % 2 === 0 ? "今日情绪宜表达，忌压抑。" : "今日宜静思，避免过度内耗。" },
    { label: "命理翻译", text: seed % 3 === 0 ? "「七杀旺」→ 你天生竞争意识强，遇压力反而能激发潜力。" : "「食神制杀」→ 用才华与表达化解压力，是你的天赋。" },
    { label: "健康", text: "注意作息规律，早点休息。" },
  ];

  const summary = [
    `主人，${periodLabel}来啦～`,
    daySummary,
    eveningHeal,
  ].filter(Boolean).join("\n");

  return {
    period,
    periodLabel,
    petName: pet.fullName,
    petEmoji: pet.emoji,
    summary,
    sections,
  };
}

export function generateSpiritPetAvatar(pet: SpiritPetProfile): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const grad = ctx.createRadialGradient(100, 80, 10, 100, 100, 100);
    grad.addColorStop(0, pet.elementColor || WUXING_COLORS[pet.element] || "#c45c48");
    grad.addColorStop(1, "#1c1915");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(100, 100, 98, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pet.elementColor || WUXING_COLORS[pet.element] || "#c45c48";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pet.emoji || "🦄", 100, 105);
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

export { WUXING_COLORS, NEED_LABELS };

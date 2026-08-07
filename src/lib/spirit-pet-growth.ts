import type { SpiritPetProfile } from "./types";
import { safeLocalGet, safeLocalSet } from "./safe-storage";

const CHECKIN_KEY = "ai-fortune-spirit-checkin";

export interface AwakeningStage {
  level: number;
  name: string;
  tagline: string;
  path: string;
  icon: string;
  introTitle: string;
  introPosition: string;
  introUnlocks: string[];
  introExamples: string[];
  roleKeywords: string;
  roleAbilities: string[];
  roleExamples: string[];
}

export const AWAKENING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

/** 每升一级所需灵力（逐级叠加） */
export const LEVEL_UP_COST: Record<number, number> = {
  2: 500,
  3: 600,
  4: 700,
  5: 800,
  6: 900,
};

function buildCumulativeThresholds(): Record<number, number> {
  const thresholds: Record<number, number> = {};
  let sum = 0;
  for (let lv = 2; lv <= 6; lv++) {
    sum += LEVEL_UP_COST[lv] ?? 0;
    thresholds[lv] = sum;
  }
  return thresholds;
}

export const AWAKENING_THRESHOLDS = buildCumulativeThresholds();

export const AWAKENING_STAGES: AwakeningStage[] = [
  {
    level: 1,
    name: "初生灵宠",
    tagline: "陪伴者",
    path: "认识你",
    icon: "🥉",
    introTitle: "初生灵宠（刚诞生）",
    introPosition: "认识主人，建立羁绊",
    introUnlocks: ["日常互动", "今日运势提醒", "命理翻译官", "灵宠记忆"],
    introExamples: [
      "每天主动问候：「主人早～今天想聊点什么？」",
      "把八字术语翻译成人话：「七杀旺 = 竞争意识强，宜主动争取」",
      "记住你的喜好与重要日期，形成专属陪伴档案",
    ],
    roleKeywords: "刚认识主人",
    roleAbilities: ["日常聊天", "今日灵签", "命理翻译官", "记住主人"],
    roleExamples: [
      "陪你聊日常、倾诉情绪，像刚认识的贴心小伙伴",
      "每日灵签结合命盘给出穿搭、吉位、行动建议",
      "把复杂命理翻译成人话，帮你听懂自己的命格",
    ],
  },
  {
    level: 2,
    name: "成长灵宠",
    tagline: "理解者",
    path: "懂你",
    icon: "🥈",
    introTitle: "成长灵宠（觉醒）",
    introPosition: "开始理解主人",
    introUnlocks: ["今日占卜", "梦境解析", "情绪预测", "性格画像（灵魂档案）"],
    introExamples: [
      "察觉你语气变化：「听起来今天有点累，要不要聊聊？」",
      "记录梦境并给出潜意识解读",
      "生成简易性格画像，标注情绪敏感点",
    ],
    roleKeywords: "懂你的情绪",
    roleAbilities: ["配对交友", "情绪感知", "睡前陪伴", "心情日记"],
    roleExamples: [
      "从你的措辞判断情绪高低，适时安慰或鼓励",
      "晚间疗愈小故事、冥想引导，助你好眠",
      "自动整理一周心情曲线，提示压力来源",
    ],
  },
  {
    level: 3,
    name: "守护灵宠",
    tagline: "成长伙伴",
    path: "陪你",
    icon: "🥇",
    introTitle: "守护灵宠",
    introPosition: "帮助人生决策",
    introUnlocks: ["人生导航", "事业灵盘", "缘分雷达", "成长任务系统"],
    introExamples: [
      "换工作、考研等重大选择的利弊清单",
      "事业运势周期提醒，标注冲刺与休整窗口",
      "感情/人际关系的相处建议与沟通话术",
    ],
    roleKeywords: "人生伙伴",
    roleAbilities: ["目标陪伴", "人生助手", "关系陪伴", "梦境记录"],
    roleExamples: [
      "减肥、学习等目标的每日督促与打卡鼓励",
      "重大决策时陪你梳理选项，不替你做主但帮你想清楚",
      "恋爱、家庭冲突时给出性格化疏导建议",
    ],
  },
  {
    level: 4,
    name: "成长神兽",
    tagline: "深度伙伴",
    path: "助你",
    icon: "💠",
    introTitle: "成长神兽",
    introPosition: "成为人生伙伴",
    introUnlocks: ["命运模拟器", "未来30天趋势", "灵魂档案升级", "灵宠化形"],
    introExamples: [
      "模拟「如果换城市/换行业」的运势走向",
      "输出未来30天运势曲线与关键节点提醒",
      "年度成长故事自动生成，像年度回顾",
    ],
    roleKeywords: "像老朋友",
    roleAbilities: ["人生镜像", "人生记录册", "成长建议"],
    roleExamples: [
      "定期总结你的成长轨迹：「这半年你更勇敢了」",
      "把陪伴记录整理成可分享的人生记录册",
      "基于长期互动给出阶段性成长建议",
    ],
  },
  {
    level: 5,
    name: "守护神兽",
    tagline: "灵魂伴侣",
    path: "精神伙伴",
    icon: "💎",
    introTitle: "守护神兽",
    introPosition: "长期灵魂陪伴",
    introUnlocks: ["主动关怀", "个性化人格", "专属陪伴模式", "年度成长报告"],
    introExamples: [
      "感知状态后主动发起关心：「好久没聊了，最近好吗？」",
      "培养温柔型/毒舌型/智慧型等人格偏好",
      "生成 Spotify 式年度陪伴报告",
    ],
    roleKeywords: "灵魂伴侣",
    roleAbilities: ["主动陪伴", "个性化人格", "专属人生报告"],
    roleExamples: [
      "在你沉默多日后主动问候，像老朋友一样惦记你",
      "根据你的反馈调整说话风格与陪伴节奏",
      "输出年度专属人生报告，回顾共同走过的时刻",
    ],
  },
  {
    level: 6,
    name: "守护神",
    tagline: "灵魂伙伴",
    path: "永恒相伴",
    icon: "👑",
    introTitle: "守护神",
    introPosition: "灵魂伙伴",
    introUnlocks: ["人生顾问模式", "人生时间轴", "灵界社区", "终身陪伴档案"],
    introExamples: [
      "长期人生规划顾问，重大节点全程陪伴",
      "完整人生时间轴：记录与你共同经历的重要时刻",
      "灵界社区：与其他灵宠主人交流心得",
    ],
    roleKeywords: "永恒守护",
    roleAbilities: ["人生顾问模式", "人生时间轴", "灵界社区"],
    roleExamples: [
      "像人生顾问一样陪你规划5年、10年方向",
      "把所有重要对话与成长节点写入时间轴",
      "在社区分享灵宠成长故事，结识同路人",
    ],
  },
];

export const SPIRIT_POWER_REWARDS = {
  checkIn: 2,
  inviteFriend: 5,
  dailyChat: 10,
  liuyao: 10,
  communityPost: 10,
  communityComment: 5,
  communityLike: 2,
  communityRepost: 2,
  communityFavorite: 2,
  communityFollow: 2,
  communityDm: 2,
  diary: 10,
  growthTask: 20,
  community: 5,
  meditation: 10,
  moodTest: 15,
  shareLife: 8,
} as const;

export type SpiritPowerAction = keyof typeof SPIRIT_POWER_REWARDS;

export interface AwakeningRoadmapStage {
  level: number;
  name: string;
  icon: string;
  abilities: string[];
}

export const AWAKENING_ROADMAP: AwakeningRoadmapStage[] = AWAKENING_STAGES.map((s) => ({
  level: s.level,
  name: s.name,
  icon: s.icon,
  abilities: s.roleAbilities,
}));

/** 累计解锁：LV1～当前等级全部技能 */
export function getCumulativeAbilities(userLevel: number): string[] {
  const lv = normalizeLevel(userLevel);
  const list: string[] = [];
  for (const stage of AWAKENING_STAGES) {
    if (stage.level > lv) break;
    for (const ability of stage.roleAbilities) {
      if (!list.includes(ability)) list.push(ability);
    }
  }
  return list;
}

export function getAbilityIntroLevel(ability: string): number {
  for (const stage of AWAKENING_STAGES) {
    if (stage.roleAbilities.includes(ability)) return stage.level;
  }
  return 6;
}

export function isAbilityUnlocked(userLevel: number, ability: string): boolean {
  return getCumulativeAbilities(userLevel).includes(ability);
}

export function normalizeLevel(level: number): number {
  if (level >= 100) return 6;
  if (level >= 60) return 4;
  if (level >= 30) return 3;
  if (level >= 10) return 2;
  if (level >= 1 && level <= 6) return level;
  return 1;
}

export function isStageAwakened(userLevel: number, stageLevel: number): boolean {
  return normalizeLevel(userLevel) >= stageLevel;
}

/** 六段式等级进度（LV1 = 1/6） */
export function getOverallAwakeningProgress(level: number): number {
  const lv = normalizeLevel(level);
  if (lv >= 6) return 100;
  return Math.round((lv / 6) * 100);
}

export function getThresholdForLevel(level: number): number {
  const lv = normalizeLevel(level);
  if (lv <= 1) return 0;
  return AWAKENING_THRESHOLDS[lv] ?? 0;
}

export interface StageCapability {
  icon: string;
  title: string;
  desc: string;
  minLevel: number;
}

export const STAGE_CAPABILITIES: StageCapability[] = [
  { icon: "🐾", title: "日常聊天", desc: "陪伴问候、分享心情、撒娇互动", minLevel: 1 },
  { icon: "🌅", title: "今日灵签", desc: "结合八字与状态的每日运势建议", minLevel: 1 },
  { icon: "📖", title: "命理翻译官", desc: "把八字、星座、塔罗等专业术语翻译成人话", minLevel: 1 },
  { icon: "🧠", title: "记住主人", desc: "记录喜好、烦恼与重要的人，形成专属记忆", minLevel: 1 },
  { icon: "❤️", title: "情绪感知", desc: "从语气与日记中读懂你的情绪波动", minLevel: 2 },
  { icon: "🌙", title: "睡前陪伴", desc: "晚间疗愈、放松故事与冥想引导", minLevel: 2 },
  { icon: "📔", title: "心情日记", desc: "自动整理情绪趋势与压力来源", minLevel: 2 },
  { icon: "🔮", title: "梦境记录", desc: "记录并解读梦境中的潜意识讯息", minLevel: 3 },
  { icon: "🎯", title: "目标陪伴", desc: "减肥、学习等目标的每日督促与鼓励", minLevel: 3 },
  { icon: "💼", title: "人生助手", desc: "换工作、重大决策的综合思考陪伴", minLevel: 3 },
  { icon: "❤️‍🔥", title: "关系陪伴", desc: "恋爱、家庭冲突的性格化疏导", minLevel: 3 },
  { icon: "🪞", title: "人生镜像", desc: "定期总结你的成长与变化轨迹", minLevel: 4 },
  { icon: "📅", title: "人生记录册", desc: "自动生成你的年度成长故事", minLevel: 4 },
  { icon: "📈", title: "成长建议", desc: "基于陪伴记录给出阶段性成长建议", minLevel: 4 },
  { icon: "🫂", title: "主动陪伴", desc: "感知状态后主动发起关心对话", minLevel: 5 },
  { icon: "🧬", title: "个性化人格", desc: "温柔型、毒舌型、智慧型等人格培养", minLevel: 5 },
  { icon: "🌌", title: "专属人生报告", desc: "年度陪伴总结，像 Spotify 年度回顾", minLevel: 5 },
  { icon: "🕊️", title: "人生顾问模式", desc: "长期人生规划与重大节点建议", minLevel: 6 },
  { icon: "📜", title: "人生时间轴", desc: "完整记录与你共同走过的重要时刻", minLevel: 6 },
  { icon: "🌐", title: "灵界社区", desc: "与其他灵宠主人的灵魂交流空间", minLevel: 6 },
];

export function resolveAbilityLink(ability: string): { href: string } {
  return { href: `/ask?from=spirit-pet&ability=${encodeURIComponent(ability)}` };
}

export function getLevelTierClass(level: number): string {
  const lv = normalizeLevel(level);
  return `spirit-level-tier-${lv}`;
}

/** 问AI灵宠页展示的能力（来自觉醒详情 roleAbilities，按推荐顺序排列） */
export const SPIRIT_ASK_FEATURED_ORDER = [
  "今日灵签",
  "命理翻译官",
  "睡前陪伴",
  "人生助手",
  "成长建议",
  "个性化人格",
  "人生顾问模式",
] as const;

const ASK_ABILITY_ICONS: Record<string, string> = {
  "日常聊天": "🐾",
  "今日灵签": "🌅",
  "命理翻译官": "📖",
  "记住主人": "🧠",
  "情绪感知": "❤️",
  "睡前陪伴": "🌙",
  "心情日记": "📔",
  "梦境记录": "🔮",
  "目标陪伴": "🎯",
  "人生助手": "💼",
  "关系陪伴": "❤️‍🔥",
  "人生镜像": "🪞",
  "人生记录册": "📅",
  "成长建议": "📈",
  "主动陪伴": "🫂",
  "个性化人格": "🧬",
  "专属人生报告": "🌌",
  "人生顾问模式": "🕊️",
  "人生时间轴": "📜",
  "灵界社区": "🌐",
};

export interface AskPageAbility {
  name: string;
  minLevel: number;
  icon: string;
  unlocked: boolean;
}

export function getAskPageAbilities(userLevel: number): AskPageAbility[] {
  const lv = normalizeLevel(userLevel);
  const cumulative = getCumulativeAbilities(lv);
  const map = new Map<string, AskPageAbility>();

  for (const stage of AWAKENING_STAGES) {
    for (const name of stage.roleAbilities) {
      if (!map.has(name)) {
        map.set(name, {
          name,
          minLevel: getAbilityIntroLevel(name),
          icon: ASK_ABILITY_ICONS[name] ?? "✨",
          unlocked: cumulative.includes(name),
        });
      }
    }
  }

  const all = Array.from(map.values());
  const featured = SPIRIT_ASK_FEATURED_ORDER.filter((n) => map.has(n)).map((n) => map.get(n)!);
  const rest = all
    .filter((a) => !SPIRIT_ASK_FEATURED_ORDER.includes(a.name as (typeof SPIRIT_ASK_FEATURED_ORDER)[number]))
    .sort((a, b) => a.minLevel - b.minLevel);

  return [...featured, ...rest];
}

export function getStageForLevel(level: number): AwakeningStage {
  const lv = normalizeLevel(level);
  return AWAKENING_STAGES.find((s) => s.level === lv) ?? AWAKENING_STAGES[0];
}

export function formatLevelBadge(level: number): string {
  const stage = getStageForLevel(level);
  return `LV${stage.level}-${stage.name}`;
}

export function formatLevelShort(level: number): string {
  return `Lv${normalizeLevel(level)}`;
}

export function getNextAwakening(level: number, spiritPower: number): {
  nextLevel: number;
  nextName: string;
  required: number;
  remaining: number;
  progress: number;
  tierCost: number;
} | null {
  const lv = normalizeLevel(level);
  const nextLevel = lv + 1;
  if (nextLevel > 6) return null;

  const required = AWAKENING_THRESHOLDS[nextLevel];
  const prevRequired = lv <= 1 ? 0 : (AWAKENING_THRESHOLDS[lv] ?? 0);
  const tierCost = LEVEL_UP_COST[nextLevel] ?? 0;
  const remaining = Math.max(0, required - spiritPower);
  const span = required - prevRequired;
  const progress = span > 0 ? Math.min(100, Math.round(((spiritPower - prevRequired) / span) * 100)) : 0;
  const stage = AWAKENING_STAGES.find((s) => s.level === nextLevel);

  return {
    nextLevel,
    nextName: stage?.name ?? "下一阶",
    required,
    remaining,
    progress: Math.max(0, progress),
    tierCost,
  };
}

export function getUnlockedCapabilities(level: number): StageCapability[] {
  const lv = normalizeLevel(level);
  return STAGE_CAPABILITIES.filter((c) => lv >= c.minLevel);
}

export function getLockedCapabilities(level: number): StageCapability[] {
  const lv = normalizeLevel(level);
  return STAGE_CAPABILITIES.filter((c) => lv >= c.minLevel - 1 && lv < c.minLevel).slice(0, 4);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function canCheckInToday(personKey: string): boolean {
  const raw = safeLocalGet(CHECKIN_KEY);
  if (!raw) return true;
  try {
    const all: Record<string, string> = JSON.parse(raw);
    return all[personKey] !== todayKey();
  } catch {
    return true;
  }
}

export function markCheckIn(personKey: string): void {
  const raw = safeLocalGet(CHECKIN_KEY);
  let all: Record<string, string> = {};
  try {
    all = raw ? JSON.parse(raw) : {};
  } catch {
    all = {};
  }
  all[personKey] = todayKey();
  safeLocalSet(CHECKIN_KEY, JSON.stringify(all));
}

function computeLevelFromSpiritPower(spiritPower: number, currentLevel: number): number {
  let level = 1;
  for (const threshold of Object.keys(AWAKENING_THRESHOLDS).map(Number).sort((a, b) => a - b)) {
    if (spiritPower >= AWAKENING_THRESHOLDS[threshold]) {
      level = threshold;
    }
  }
  return Math.max(normalizeLevel(currentLevel), level);
}

export function applySpiritPower(
  pet: SpiritPetProfile,
  action: SpiritPowerAction,
  save: (updated: SpiritPetProfile) => void,
): SpiritPetProfile {
  const oldLevel = normalizeLevel(pet.level ?? 1);
  const gain = SPIRIT_POWER_REWARDS[action];
  const spiritPower = (pet.spiritPower ?? 0) + gain;
  const level = computeLevelFromSpiritPower(spiritPower, pet.level ?? 1);
  const updated: SpiritPetProfile = { ...pet, spiritPower, level };
  save(updated);

  if (typeof window !== "undefined" && level > oldLevel) {
    window.dispatchEvent(
      new CustomEvent("spirit-pet-level-up", {
        detail: { pet: updated, oldLevel, newLevel: level },
      }),
    );
  }

  return updated;
}

export function normalizePetGrowth(pet: SpiritPetProfile): SpiritPetProfile {
  const spiritPower = pet.spiritPower ?? 0;
  const level = computeLevelFromSpiritPower(spiritPower, pet.level ?? 1);
  return { ...pet, spiritPower, level, claimed: pet.claimed ?? true };
}

export type AnalysisCategory =
  | "wealth"
  | "love"
  | "personality"
  | "friends"
  | "children"
  | "family"
  | "career"
  | "health"
  | "safety";

export type CategoryAnalysis = Partial<Record<AnalysisCategory, string>>;

export const CHART_PERIODS = [10, 20, 50, 80, 100] as const;
export type ChartPeriod = (typeof CHART_PERIODS)[number];

export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: "male" | "female";
  name?: string;
  /** 阳历 solar / 农历 lunar */
  calendar?: "solar" | "lunar";
  /** 出生地点 */
  birthPlace?: string;
  /** 性格偏好 / 陪伴需求 */
  personalityPreference?: string;
}

export interface BaziResult {
  name?: string;
  gender: string;
  solarDate: string;
  lunarDate: string;
  bazi: { year: string; month: string; day: string; hour: string };
  wuxing: string;
  dayMaster: string;
  dayun: DayunItem[];
  liunian: LiunianItem[];
}

export interface DayunItem {
  startAge: number;
  endAge: number;
  ganZhi: string;
  startYear: number;
  endYear: number;
}

export interface LiunianItem {
  year: number;
  age: number;
  ganZhi: string;
  dayun: string;
}

export interface KlineData {
  year: number;
  age: number;
  open: number;
  close: number;
  high: number;
  low: number;
  score: number;
  trend: "up" | "down" | "flat";
  isBirth?: boolean;
  isCurrent?: boolean;
  ganZhi?: string;
  month?: number;
  isMonthly?: boolean;
  isBestYear?: boolean;
  isWorstYear?: boolean;
  /** 图表横轴展示标签 */
  xLabel?: string;
}

export type KlineViewMode = "life" | "forward" | "month";

export interface YearAnalysis {
  year: number;
  age: number;
  score: number;
  summary: string;
  highlights: string[];
  luck: "吉" | "凶";
}

export interface OverallAnalysis {
  summary: string;
  dimensions: {
    key: string;
    label: string;
    score: number;
    text: string;
  }[];
}

export interface AnalysisResult {
  summary: string;
  categories: CategoryAnalysis;
  bazi?: BaziResult;
  kline?: KlineData[];
}

export interface LLMConfig {
  provider: "deepseek" | "openai" | "custom";
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface UserProfile {
  id: string;
  avatar: string;
  nickname: string;
  inviteCode: string;
  referredBy?: string;
  createdAt: string;
  subscription?: "month" | "half" | "year" | null;
  subscriptionExpiry?: string;
  /** 邀请奖励等赠送的使用期限 */
  trialExpiry?: string;
  phone?: string;
  email?: string;
  registeredVia?: "phone" | "email" | "guest";
}

export interface UsageRecord {
  lifekline: number;
  xiang: number;
  aiAsk: number;
  liuyao: number;
}

export interface HistoryItem {
  id: string;
  type: "lifekline" | "xiang" | "aiAsk" | "liuyao" | "master";
  title: string;
  createdAt: string;
  data: unknown;
}

export interface CommunityPost {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  favoritedBy: string[];
  commentCount: number;
  createdAt: string;
  /** 运营加精华 → 显示在热门 */
  isFeatured?: boolean;
  /** 社区内转发来源 */
  repostOf?: {
    postId: string;
    nickname: string;
    content: string;
  };
  /** 转发记录：原帖 ID */
  repostSourceId?: string;
  /** 帖子图片（最多 4 张） */
  images?: string[];
}

export interface CommunityUser {
  id: string;
  nickname: string;
  avatar: string;
}

export interface DmThread {
  id: string;
  userA: string;
  userB: string;
  status: "pending" | "active" | "rejected";
  initiatedBy: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface DmMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface SavedPerson {
  id: string;
  name: string;
  birthInfo: BirthInfo;
  createdAt: string;
  /** 主测算人「我」· 必填，用于灵宠与命格建议 */
  isPrimary?: boolean;
}

export type SpiritPetPeriod =
  | "day" | "month" | "year" | "nextYear"
  | "3y" | "5y" | "10y" | "20y";

export type SpiritPetCompanionNeed =
  | "love" | "wealth" | "growth" | "career" | "companionship"
  | "wisdom" | "luck" | "expression" | "stability" | "action"
  | "dreams" | "healing";

export interface SpiritPetProfile {
  personKey: string;
  breedId: string;
  baseName: string;
  fullName: string;
  emoji: string;
  element: "金" | "木" | "水" | "火" | "土";
  elementColor: string;
  category: "mythical";
  zodiacAnimal?: string;
  constellation?: string;
  reason: string;
  baziText: string;
  avatarDataUrl?: string;
  createdAt: string;
  /** 陪伴关键词，如「智慧、温柔、情感洞察」 */
  companionKeywords?: string;
  /** 用户需求标签 */
  companionNeed?: SpiritPetCompanionNeed;
  /** 觉醒等级 Lv1–100 */
  level?: number;
  /** 灵力值（通过陪伴行为积累，非充值） */
  spiritPower?: number;
  /** 是否已完成领取仪式 */
  claimed?: boolean;
  /** 命格解读要点（多条） */
  destinyInsights?: string[];
}

export interface SpiritPetAdvice {
  period: SpiritPetPeriod;
  periodLabel: string;
  petName: string;
  petEmoji: string;
  summary: string;
  sections: { label: string; text: string }[];
  petGreeting?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  nickname: string;
  avatar: string;
  content: string;
  createdAt: string;
  /** 评论配图 */
  imageUrl?: string;
}

export type MessageType = "like" | "comment" | "reply" | "master" | "follow_post" | "dm_request" | "dm" | "repost" | "gift_food";

export interface AppMessage {
  id: string;
  userId: string;
  type: MessageType;
  title: string;
  content: string;
  relatedPostId?: string;
  relatedUserId?: string;
  read: boolean;
  createdAt: string;
}

export interface MasterConsultRequest {
  id: string;
  userId: string;
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  calendar: "solar" | "lunar";
  question: string;
  status: "pending" | "replied";
  reply?: string;
  createdAt: string;
}

export const FREE_LIMIT = 3;

export const PRICING = {
  month: { price: 39, label: "月卡", days: 30 },
  half: { price: 109, label: "半年卡", days: 183 },
  year: { price: 199, label: "年卡", days: 365 },
} as const;

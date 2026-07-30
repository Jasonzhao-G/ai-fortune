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
  /** 社区内转发来源 */
  repostOf?: {
    postId: string;
    nickname: string;
    content: string;
  };
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  nickname: string;
  avatar: string;
  content: string;
  createdAt: string;
}

export type MessageType = "like" | "comment" | "reply" | "master";

export interface AppMessage {
  id: string;
  userId: string;
  type: MessageType;
  title: string;
  content: string;
  relatedPostId?: string;
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

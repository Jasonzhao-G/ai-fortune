import type { KlineData } from "./types";

export const DEMO_KLINE: KlineData[] = [
  { year: 2026, age: 28, open: 52, close: 58, high: 62, low: 50, score: 58, trend: "up" },
  { year: 2027, age: 29, open: 58, close: 55, high: 60, low: 52, score: 55, trend: "down" },
  { year: 2028, age: 30, open: 55, close: 63, high: 66, low: 54, score: 63, trend: "up" },
  { year: 2029, age: 31, open: 63, close: 68, high: 72, low: 61, score: 68, trend: "up" },
  { year: 2030, age: 32, open: 68, close: 65, high: 70, low: 62, score: 65, trend: "down" },
  { year: 2031, age: 33, open: 65, close: 72, high: 75, low: 64, score: 72, trend: "up" },
  { year: 2032, age: 34, open: 72, close: 70, high: 74, low: 67, score: 70, trend: "down" },
  { year: 2033, age: 35, open: 70, close: 76, high: 78, low: 68, score: 76, trend: "up" },
  { year: 2034, age: 36, open: 76, close: 74, high: 79, low: 71, score: 74, trend: "down" },
  { year: 2035, age: 37, open: 74, close: 80, high: 83, low: 72, score: 80, trend: "up" },
];

export const DEMO_BAZI = {
  pillars: ["庚午", "辛巳", "甲子", "戊辰"],
  solar: "1998年5月12日 08:30",
  lunar: "农历戊寅年四月十七 辰时",
  dayMaster: "甲木日主",
  wuxing: "五行：木旺火相",
  summary: "甲木生于巳月，木火通明。日主得令，格局清奇，中年后运势渐入佳境。",
};

export const DEMO_AI_ASK = {
  question: "今年事业运势如何？",
  answer: "今年整体运势平稳向上，春季有贵人相助，宜把握三月至五月的机会。下半年注意劳逸结合，忌急躁冒进。",
};

export const DEMO_XIANG = {
  type: "手相",
  summary: "掌纹清晰，生命线长而深，智慧线末端上扬，预示思维敏捷、晚年安康。感情线平稳，事业线从月丘起，中年后事业渐入佳境。",
  tags: ["财运中上", "感情专一", "健康良好"],
};

export const DEMO_LIUYAO = {
  guaName: "泰",
  luck: "吉",
  question: "今年能否换工作？",
  analysis: "天地交泰，上下沟通顺畅。当前卦象示变动有利，但需择善时而动，不可仓促。",
};

export const DEMO_REPORT = {
  title: "2026 年度运势报告",
  scores: [
    { label: "整体", value: 72 },
    { label: "财运", value: 68 },
    { label: "事业", value: 75 },
    { label: "感情", value: 65 },
  ],
  summary: "今年整体运势中上，事业有突破机会，财运平稳，感情宜主动沟通。",
};

export const DEMO_STATS = { thisYear: 58, avg: 68, peakYear: 2035 };

export const DEMO_SUMMARY_ZH =
  "您的八字为庚午 辛巳 甲子 戊辰，甲木日主，五行偏木。当前运势平稳向好，中年以后渐入佳境。";

export const DEMO_SUMMARY_EN =
  "Your chart shows steady fortune trending upward.";

export const LIFE_YEAR_OPTIONS = [
  { label: "1年", value: 1 },
  { label: "3年", value: 3 },
  { label: "5年", value: 5 },
  { label: "10年", value: 10 },
  { label: "20年", value: 20 },
  { label: "全部", value: 100 },
] as const;

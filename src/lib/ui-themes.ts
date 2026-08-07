export type UiThemeId = "cloud" | "jade" | "dawn" | "ink";

export interface UiThemeMeta {
  id: UiThemeId;
  name: string;
  tagline: string;
  desc: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

export const UI_THEMES: UiThemeMeta[] = [
  {
    id: "cloud",
    name: "云白",
    tagline: "简洁 · 大气 · 推荐",
    desc: "高对比白底 + 清晰蓝调，阅读友好，适合日常陪伴与命理工具。",
    preview: { bg: "#F5F7FA", card: "#FFFFFF", accent: "#2563EB", text: "#111827" },
  },
  {
    id: "jade",
    name: "青瓷",
    tagline: "清新 · 东方 · 静雅",
    desc: "淡青绿底色 +  teal 点缀，干净通透，契合灵宠与玄学气质。",
    preview: { bg: "#F0FAF8", card: "#FFFFFF", accent: "#0D9488", text: "#134E4A" },
  },
  {
    id: "dawn",
    name: "晨曦",
    tagline: "温暖 · 亲和 · 明亮",
    desc: "暖白底 + 珊瑚橙强调，柔和不刺眼，更有情感温度。",
    preview: { bg: "#FFFBF7", card: "#FFFFFF", accent: "#EA580C", text: "#292524" },
  },
  {
    id: "ink",
    name: "墨韵",
    tagline: "深色 · 高对比 · 夜间",
    desc: "深灰底 + 亮蓝强调，夜间护眼，信息层级清晰。",
    preview: { bg: "#0F1117", card: "#1A1D27", accent: "#60A5FA", text: "#F3F4F6" },
  },
];

export const DEFAULT_UI_THEME: UiThemeId = "cloud";

export const UI_THEME_STORAGE_KEY = "ai-fortune-ui-theme";

export function isUiThemeId(v: string | null): v is UiThemeId {
  return v === "cloud" || v === "jade" || v === "dawn" || v === "ink";
}

export function getThemeMeta(id: UiThemeId): UiThemeMeta {
  return UI_THEMES.find((t) => t.id === id) ?? UI_THEMES[0];
}

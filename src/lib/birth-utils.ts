import type { BirthInfo } from "./types";

/** 补齐旧数据或残缺生辰，避免排盘/灵宠计算报错 */
export function normalizeBirthInfo(info: Partial<BirthInfo> & Pick<BirthInfo, "year" | "month" | "day">): BirthInfo {
  const year = Number(info.year);
  const month = Number(info.month);
  const day = Number(info.day);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error("生辰日期无效");
  }
  return {
    year,
    month: Math.min(12, Math.max(1, month)),
    day: Math.min(31, Math.max(1, day)),
    hour: typeof info.hour === "number" && Number.isFinite(info.hour) ? Math.min(23, Math.max(0, info.hour)) : 12,
    minute: typeof info.minute === "number" && Number.isFinite(info.minute) ? Math.min(59, Math.max(0, info.minute)) : 0,
    gender: info.gender === "female" ? "female" : "male",
    name: info.name,
    calendar: info.calendar === "lunar" ? "lunar" : "solar",
  };
}

export function isValidBirthInfo(info: Partial<BirthInfo> | null | undefined): info is BirthInfo {
  if (!info) return false;
  const year = Number(info.year);
  const month = Number(info.month);
  const day = Number(info.day);
  return Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day);
}

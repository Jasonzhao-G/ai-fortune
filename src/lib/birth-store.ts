import type { BirthInfo } from "./types";

const BIRTH_KEY = "ai-fortune-birth";

export function loadBirthInfo(): BirthInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(BIRTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BirthInfo;
    return {
      ...parsed,
      calendar: parsed.calendar ?? "solar",
    };
  } catch {
    return null;
  }
}

export function saveBirthInfo(info: BirthInfo): BirthInfo {
  const normalized: BirthInfo = {
    ...info,
    calendar: info.calendar ?? "solar",
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(BIRTH_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function formatBirthSummary(info: BirthInfo): string {
  const cal = info.calendar === "lunar" ? "农历" : "阳历";
  const name = info.name ? `${info.name} · ` : "";
  return `${name}${cal} ${info.year}年${info.month}月${info.day}日 ${String(info.hour).padStart(2, "0")}:${String(info.minute).padStart(2, "0")} · ${info.gender === "male" ? "男" : "女"}`;
}

import type { BirthInfo } from "./types";
import { getActivePerson } from "./person-store";
import { normalizeBirthInfo, isValidBirthInfo } from "./birth-utils";

const BIRTH_KEY = "ai-fortune-birth";

export { normalizeBirthInfo, isValidBirthInfo } from "./birth-utils";

export function loadBirthInfo(): BirthInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(BIRTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BirthInfo>;
    if (!isValidBirthInfo(parsed)) return null;
    return normalizeBirthInfo(parsed);
  } catch {
    return null;
  }
}

/** 优先使用当前测算人的生辰 */
export function getEffectiveBirthInfo(): BirthInfo | null {
  const active = typeof window !== "undefined" ? getActivePerson() : null;
  if (active?.birthInfo && isValidBirthInfo(active.birthInfo)) {
    return normalizeBirthInfo(active.birthInfo);
  }
  return loadBirthInfo();
}

export function saveBirthInfo(info: BirthInfo): BirthInfo {
  const normalized = normalizeBirthInfo(info);
  if (typeof window !== "undefined") {
    localStorage.setItem(BIRTH_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function formatBirthSummary(info: BirthInfo | Partial<BirthInfo> | null | undefined): string {
  if (!info || !isValidBirthInfo(info)) return "生辰信息待完善";
  try {
    const normalized = normalizeBirthInfo(info as BirthInfo);
    const cal = normalized.calendar === "lunar" ? "农历" : "阳历";
    const name = normalized.name ? `${normalized.name} · ` : "";
    return `${name}${cal} ${normalized.year}年${normalized.month}月${normalized.day}日 ${String(normalized.hour).padStart(2, "0")}:${String(normalized.minute).padStart(2, "0")} · ${normalized.gender === "male" ? "男" : "女"}`;
  } catch {
    return "生辰信息待完善";
  }
}

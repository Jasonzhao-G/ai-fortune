const TTL_MS = 60 * 1000;
const PREFIX = "ai-fortune-session-";

export type SessionResultKey = "lifekline" | "bazi" | "liuyao" | "xiang";

interface CachedEntry<T> {
  savedAt: number;
  data: T;
}

export function saveSessionResult<T>(key: SessionResultKey, data: T): void {
  if (typeof window === "undefined") return;
  const entry: CachedEntry<T> = { savedAt: Date.now(), data };
  try {
    sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    /* quota */
  }
}

export function loadSessionResult<T>(key: SessionResultKey): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedEntry<T>;
    if (Date.now() - entry.savedAt > TTL_MS) {
      sessionStorage.removeItem(`${PREFIX}${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function clearSessionResult(key: SessionResultKey): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${PREFIX}${key}`);
}

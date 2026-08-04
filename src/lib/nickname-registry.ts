import { getOrCreateUser } from "./user-store";
import { safeJsonParse, safeLocalGet, safeLocalSet } from "./safe-storage";

const REGISTRY_KEY = "ai-fortune-nickname-registry";

function getRegistry(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return safeJsonParse<Record<string, string>>(safeLocalGet(REGISTRY_KEY), {});
}

function saveRegistry(reg: Record<string, string>) {
  safeLocalSet(REGISTRY_KEY, JSON.stringify(reg));
}

export function isNicknameTaken(nickname: string, excludeUserId?: string): boolean {
  const key = nickname.trim().toLowerCase();
  if (!key) return false;
  const reg = getRegistry();
  const owner = reg[key];
  return !!owner && owner !== excludeUserId;
}

export function registerNickname(nickname: string, userId: string, oldNickname?: string): void {
  const reg = getRegistry();
  if (oldNickname) {
    delete reg[oldNickname.trim().toLowerCase()];
  }
  reg[nickname.trim().toLowerCase()] = userId;
  saveRegistry(reg);
}

export function ensureNicknameRegistered(userId: string, nickname: string): void {
  try {
    const reg = getRegistry();
    const key = nickname.trim().toLowerCase();
    if (!reg[key]) {
      reg[key] = userId;
      saveRegistry(reg);
    }
  } catch { /* ignore */ }
}

/** 初始化当前用户昵称到注册表 */
export function syncCurrentUserNickname(): void {
  try {
    const user = getOrCreateUser();
    ensureNicknameRegistered(user.id, user.nickname);
  } catch { /* ignore */ }
}

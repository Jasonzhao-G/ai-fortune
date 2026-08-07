import type { VirtualKind } from "./catalog";

export interface OwnedVirtualItem {
  sku: string;
  name: string;
  kind: VirtualKind;
  emoji: string;
  acquiredAt: string;
}

const KEY = "ai-fortune-shop-inventory";

function getAll(): Record<string, OwnedVirtualItem[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(userId: string, items: OwnedVirtualItem[]) {
  const all = getAll();
  all[userId] = items;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getOwnedVirtualItems(userId: string): OwnedVirtualItem[] {
  return getAll()[userId] ?? [];
}

export function ownsVirtualItem(userId: string, sku: string): boolean {
  return getOwnedVirtualItems(userId).some((i) => i.sku === sku);
}

export function grantVirtualItem(
  userId: string,
  item: Omit<OwnedVirtualItem, "acquiredAt">,
): OwnedVirtualItem[] {
  if (ownsVirtualItem(userId, item.sku)) {
    return getOwnedVirtualItems(userId);
  }
  const next: OwnedVirtualItem = { ...item, acquiredAt: new Date().toISOString() };
  const items = [...getOwnedVirtualItems(userId), next];
  save(userId, items);
  return items;
}

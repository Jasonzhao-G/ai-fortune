import type { BirthInfo } from "./types";
import { hashBirth } from "./fortune-chart";

const RECORDS_KEY = "ai-fortune-calc-records";

export type RecordType = "lifekline" | "bazi" | "aiAsk" | "master" | "xiang" | "liuyao";

export interface CalcRecord {
  id: string;
  type: RecordType;
  personKey: string;
  personName: string;
  personLabel: string;
  title: string;
  summary: string;
  createdAt: string;
  data: unknown;
}

export interface PersonGroup {
  personKey: string;
  personName: string;
  personLabel: string;
  recordCount: number;
  lastCreatedAt: string;
}

const TYPE_LABELS: Record<RecordType, string> = {
  lifekline: "人生K线",
  bazi: "八字排盘",
  aiAsk: "问AI灵宠",
  master: "问真人大师",
  xiang: "AI看相",
  liuyao: "AI六爻",
};

export function getRecordTypeLabel(type: RecordType): string {
  return TYPE_LABELS[type];
}

/** 记录 Tab 展示名（区分人生K线与八字排盘） */
export function getRecordDisplayLabel(record: CalcRecord): string {
  if (record.type === "bazi") return "八字排盘";
  if (record.type === "lifekline") {
    const data = record.data as { kind?: string } | undefined;
    if (data?.kind === "bazi") return "八字排盘";
    if (record.title?.startsWith("人生K线")) return record.title.split(" · ")[0] ?? "人生K线";
    return "人生K线";
  }
  if (record.title) return record.title.length > 12 ? record.title.slice(0, 12) + "…" : record.title;
  return getRecordTypeLabel(record.type);
}

export function buildPersonKey(name: string, birth?: BirthInfo | null): string {
  const n = (name || "匿名").trim();
  if (birth) return `${n}_${hashBirth(birth)}`;
  return `${n}_general`;
}

export function buildPersonLabel(name: string, birth?: BirthInfo | null): string {
  const n = (name || "匿名").trim();
  if (!birth) return n;
  return `${n} · ${birth.year}年${birth.month}月${birth.day}日`;
}

export function getRecords(): CalcRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecord(
  input: Omit<CalcRecord, "id" | "createdAt">
): CalcRecord {
  const record: CalcRecord = {
    ...input,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    createdAt: new Date().toISOString(),
  };
  const list = [record, ...getRecords()].slice(0, 500);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(list));
  return record;
}

export function getPersonGroups(): PersonGroup[] {
  const map = new Map<string, PersonGroup>();
  for (const r of getRecords()) {
    const existing = map.get(r.personKey);
    if (!existing) {
      map.set(r.personKey, {
        personKey: r.personKey,
        personName: r.personName,
        personLabel: r.personLabel,
        recordCount: 1,
        lastCreatedAt: r.createdAt,
      });
    } else {
      existing.recordCount++;
      if (r.createdAt > existing.lastCreatedAt) existing.lastCreatedAt = r.createdAt;
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastCreatedAt).getTime() - new Date(a.lastCreatedAt).getTime()
  );
}

export function getRecordsByPerson(personKey: string): CalcRecord[] {
  return getRecords()
    .filter((r) => r.personKey === personKey)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRecordById(id: string): CalcRecord | undefined {
  return getRecords().find((r) => r.id === id);
}

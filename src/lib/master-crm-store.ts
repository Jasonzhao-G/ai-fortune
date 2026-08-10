import type { BirthInfo } from "./types";
import { safeJsonParse, safeLocalGet, safeLocalSet } from "./safe-storage";

const CRM_KEY = "ai-fortune-master-crm-queue";

export type MasterCrmStatus = "pending" | "reviewing" | "replied";

export interface MasterCrmSubmission {
  id: string;
  userId: string;
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  calendar: "solar" | "lunar";
  question: string;
  price: number;
  status: MasterCrmStatus;
  consultId: string;
  recordId: string;
  birth: BirthInfo;
  createdAt: string;
  /** 预留：对接后台 CRM 后标记已同步 */
  syncedToBackend: boolean;
}

function loadAll(): MasterCrmSubmission[] {
  return safeJsonParse<MasterCrmSubmission[]>(safeLocalGet(CRM_KEY), []);
}

function saveAll(list: MasterCrmSubmission[]) {
  safeLocalSet(CRM_KEY, JSON.stringify(list.slice(0, 300)));
}

export function saveMasterCrmSubmission(
  input: Omit<MasterCrmSubmission, "id" | "createdAt" | "status" | "syncedToBackend">,
): MasterCrmSubmission {
  const item: MasterCrmSubmission = {
    ...input,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    status: "pending",
    syncedToBackend: false,
    createdAt: new Date().toISOString(),
  };
  const list = [item, ...loadAll()];
  saveAll(list);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("master-crm-updated"));
  }
  return item;
}

export function getMasterCrmSubmissions(userId?: string): MasterCrmSubmission[] {
  const list = loadAll();
  if (!userId) return list;
  return list.filter((s) => s.userId === userId);
}

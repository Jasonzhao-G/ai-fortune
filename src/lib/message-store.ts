import type { AppMessage, MasterConsultRequest } from "./types";
import { safeJsonParse, safeLocalGet, safeLocalSet } from "./safe-storage";

const MESSAGES_KEY = "ai-fortune-messages";
const MASTER_KEY = "ai-fortune-master-consults";

function loadMessages(): AppMessage[] {
  return safeJsonParse<AppMessage[]>(safeLocalGet(MESSAGES_KEY), []);
}

function saveMessages(all: AppMessage[]) {
  safeLocalSet(MESSAGES_KEY, JSON.stringify(all.slice(0, 200)));
}

function loadMasterConsults(): MasterConsultRequest[] {
  return safeJsonParse<MasterConsultRequest[]>(safeLocalGet(MASTER_KEY), []);
}

function saveMasterConsults(list: MasterConsultRequest[]) {
  safeLocalSet(MASTER_KEY, JSON.stringify(list));
}

export function getMessages(userId: string): AppMessage[] {
  if (typeof window === "undefined") return [];
  return loadMessages()
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadCount(userId: string): number {
  try {
    return getMessages(userId).filter((m) => !m.read).length;
  } catch {
    return 0;
  }
}

export function addMessage(msg: Omit<AppMessage, "id" | "createdAt" | "read">): AppMessage {
  const item: AppMessage = {
    ...msg,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    read: false,
    createdAt: new Date().toISOString(),
  };
  const all = loadMessages();
  all.unshift(item);
  saveMessages(all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("messages-updated"));
  }
  return item;
}

export function markMessageRead(id: string): void {
  const all = loadMessages();
  saveMessages(all.map((m) => (m.id === id ? { ...m, read: true } : m)));
}

export function markAllRead(userId: string): void {
  const all = loadMessages();
  saveMessages(all.map((m) => (m.userId === userId ? { ...m, read: true } : m)));
}

export function submitMasterConsult(
  data: Omit<MasterConsultRequest, "id" | "status" | "createdAt" | "reply">
): MasterConsultRequest {
  const req: MasterConsultRequest = {
    ...data,
    id: Date.now().toString(36),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const list = loadMasterConsults();
  list.unshift(req);
  saveMasterConsults(list);

  addMessage({
    userId: data.userId,
    type: "master",
    title: "咨询已提交",
    content: "您的问题已送达真人大师，大师将在 24 小时内回复，请留意消息通知。",
  });

  return req;
}

/** 演示用：模拟大师回复 */
export function mockMasterReply(consultId: string, userId: string, question: string): void {
  const list = loadMasterConsults();
  const reply =
    "观您所问，当下运势处于调整期，宜守不宜攻。近三月可多行善积德，静待时机。感情方面需以诚相待，事业切忌急躁冒进。具体流年细节已附在回复中，供您参考。";
  saveMasterConsults(
    list.map((c) => (c.id === consultId ? { ...c, status: "replied" as const, reply } : c))
  );

  addMessage({
    userId,
    type: "master",
    title: "真人大师已回复",
    content: `关于「${question.slice(0, 20)}${question.length > 20 ? "…" : ""}」：${reply}`,
  });
}

export function getMasterConsults(userId: string): MasterConsultRequest[] {
  if (typeof window === "undefined") return [];
  return loadMasterConsults().filter((c) => c.userId === userId);
}

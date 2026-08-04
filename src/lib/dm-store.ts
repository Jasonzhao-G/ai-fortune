import type { DmMessage, DmThread } from "./types";
import { getOrCreateUser } from "./user-store";
import { addMessage } from "./message-store";
import { safeJsonParse, safeLocalGet, safeLocalSet } from "./safe-storage";

const THREADS_KEY = "ai-fortune-dm-threads";
const MESSAGES_KEY = "ai-fortune-dm-messages";

function threadKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function getThreads(): DmThread[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<DmThread[]>(safeLocalGet(THREADS_KEY), []);
}

function saveThreads(threads: DmThread[]) {
  safeLocalSet(THREADS_KEY, JSON.stringify(threads));
}

function getAllMessages(): DmMessage[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<DmMessage[]>(safeLocalGet(MESSAGES_KEY), []);
}

function saveMessages(msgs: DmMessage[]) {
  safeLocalSet(MESSAGES_KEY, JSON.stringify(msgs.slice(-500)));
}

export function getThreadBetween(userId: string, otherId: string): DmThread | undefined {
  const [a, b] = threadKey(userId, otherId);
  return getThreads().find((t) => t.userA === a && t.userB === b);
}

export function getMyThreads(userId: string): DmThread[] {
  return getThreads()
    .filter((t) => t.userA === userId || t.userB === userId)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getThreadMessages(threadId: string): DmMessage[] {
  return getAllMessages()
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/** 发送私信：首次需对方同意 */
export function sendDm(toUserId: string, content: string): { ok: boolean; error?: string; threadId?: string } {
  const user = getOrCreateUser();
  if (!content.trim()) return { ok: false, error: "消息不能为空" };
  if (toUserId === user.id) return { ok: false, error: "不能给自己发私信" };

  const [a, b] = threadKey(user.id, toUserId);
  let threads = getThreads();
  let thread = threads.find((t) => t.userA === a && t.userB === b);

  if (!thread) {
    thread = {
      id: Date.now().toString(36) + "t",
      userA: a,
      userB: b,
      status: "pending",
      initiatedBy: user.id,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    threads = [thread, ...threads];
    saveThreads(threads);

    addMessage({
      userId: toUserId,
      type: "dm_request",
      title: "收到私信请求",
      content: `${user.nickname} 想给你发私信：${content.slice(0, 40)}…`,
      relatedUserId: user.id,
    });
  } else if (thread.status === "rejected" && thread.initiatedBy === user.id) {
    return { ok: false, error: "对方已拒绝私信请求" };
  } else if (thread.status === "pending" && thread.initiatedBy !== user.id) {
    return { ok: false, error: "请先同意或拒绝对方的私信请求" };
  } else if (thread.status === "pending" && thread.initiatedBy === user.id) {
    return { ok: false, error: "等待对方同意首次私信请求" };
  }

  const msg: DmMessage = {
    id: Date.now().toString(36) + "m",
    threadId: thread.id,
    senderId: user.id,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  saveMessages([...getAllMessages(), msg]);

  threads = getThreads().map((t) =>
    t.id === thread!.id ? { ...t, lastMessageAt: msg.createdAt } : t
  );
  saveThreads(threads);

  if (thread.status === "active") {
    addMessage({
      userId: toUserId,
      type: "dm",
      title: "新私信",
      content: `${user.nickname}：${content.slice(0, 50)}`,
    });
  }

  return { ok: true, threadId: thread.id };
}

export function acceptDmFrom(fromUserId: string): boolean {
  const user = getOrCreateUser();
  const thread = getThreadBetween(user.id, fromUserId);
  if (!thread || thread.status !== "pending" || thread.initiatedBy !== fromUserId) return false;
  respondDmRequest(thread.id, true);
  return true;
}

export function rejectDmFrom(fromUserId: string): boolean {
  const user = getOrCreateUser();
  const thread = getThreadBetween(user.id, fromUserId);
  if (!thread || thread.status !== "pending" || thread.initiatedBy !== fromUserId) return false;
  respondDmRequest(thread.id, false);
  return true;
}

export function respondDmRequest(threadId: string, accept: boolean): void {
  const user = getOrCreateUser();
  const threads = getThreads().map((t) => {
    if (t.id !== threadId) return t;
    const otherId = t.userA === user.id ? t.userB : t.userA;
    if (t.initiatedBy === user.id) return t;
    const status = accept ? "active" as const : "rejected" as const;
    if (accept) {
      addMessage({
        userId: otherId,
        type: "dm",
        title: "私信请求已通过",
        content: `${user.nickname} 已同意你的私信，现在可以自由交流了。`,
      });
    }
    return { ...t, status };
  });
  saveThreads(threads);
}

export function canSendDm(userId: string, otherId: string): { allowed: boolean; reason?: string } {
  const thread = getThreadBetween(userId, otherId);
  if (!thread) return { allowed: true };
  if (thread.status === "active") return { allowed: true };
  if (thread.status === "rejected") return { allowed: false, reason: "私信已被拒绝" };
  if (thread.initiatedBy === userId) return { allowed: false, reason: "等待对方同意首次私信" };
  return { allowed: false, reason: "请先处理对方的私信请求" };
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  getMyThreads, getThreadMessages, sendDm, canSendDm,
  acceptDmFrom, rejectDmFrom, getThreadBetween,
} from "@/lib/dm-store";
import { getCommunityUser } from "@/lib/community-store";
import UserAvatar from "@/components/UserAvatar";
import type { DmThread } from "@/lib/types";

function otherId(thread: DmThread, uid: string): string {
  return thread.userA === uid ? thread.userB : thread.userA;
}

export default function MessagesChatPage() {
  const { user } = useApp();
  const uid = user?.id ?? "";
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [tip, setTip] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!uid) return;
    setThreads(getMyThreads(uid));
    const params = new URLSearchParams(window.location.search);
    const withUser = params.get("with");
    if (withUser) {
      const t = getThreadBetween(uid, withUser);
      if (t) setActiveId(t.id);
      else setActiveId(`new:${withUser}`);
    }
  }, [uid, tick]);

  const refresh = () => setTick((k) => k + 1);

  const activeThread = activeId?.startsWith("new:")
    ? null
    : threads.find((t) => t.id === activeId);

  const activeOtherId = activeId?.startsWith("new:")
    ? activeId.slice(4)
    : activeThread
      ? otherId(activeThread, uid)
      : null;

  const messages = activeThread ? getThreadMessages(activeThread.id) : [];
  const other = activeOtherId ? getCommunityUser(activeOtherId) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  const handleSend = () => {
    if (!activeOtherId || !draft.trim()) return;
    const check = canSendDm(uid, activeOtherId);
    const res = sendDm(activeOtherId, draft.trim());
    if (res.ok) {
      setDraft("");
      if (!activeThread && res.threadId) setActiveId(res.threadId);
      if (check.allowed && !getThreadBetween(uid, activeOtherId)) {
        setTip("私信请求已发送，对方同意后可继续聊天");
        setTimeout(() => setTip(null), 3000);
      }
      refresh();
    } else {
      setTip(res.error ?? "发送失败");
    }
  };

  const pendingIncoming = threads.filter(
    (t) => t.status === "pending" && t.initiatedBy !== uid,
  );

  // ─── 会话详情（X 风格聊天气泡） ───
  if (activeOtherId && other) {
    const thread = getThreadBetween(uid, activeOtherId);
    const status = thread?.status;
    const check = canSendDm(uid, activeOtherId);
    const waitingAccept = status === "pending" && thread?.initiatedBy === uid;
    const needRespond = status === "pending" && thread?.initiatedBy !== uid;

    return (
      <div className="flex h-[calc(100vh-140px)] flex-col px-4 pb-4">
        <div className="flex items-center gap-2 border-b border-app-border py-3">
          <button onClick={() => setActiveId(null)} className="text-app-accent">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <UserAvatar userId={other.id} avatar={other.avatar} nickname={other.nickname} size="sm" verified={other.verified} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-app-text">{other.nickname}</p>
            <p className="text-[10px] text-app-muted">{other.id}</p>
          </div>
          <Link href={`/community/user/${other.id}`} className="text-[10px] text-app-accent">主页</Link>
        </div>

        {needRespond && (
          <div className="my-3 rounded-xl border border-app-gold/40 bg-app-gold/10 p-3">
            <p className="text-xs text-app-text">对方想给你发私信，是否同意？</p>
            <p className="mt-1 text-[10px] text-app-muted">同意后双方可自由聊天；拒绝则对方无法继续打扰你</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => { acceptDmFrom(activeOtherId); refresh(); }}
                className="rounded-lg bg-app-accent px-3 py-1.5 text-xs text-white">同意</button>
              <button onClick={() => { rejectDmFrom(activeOtherId); setActiveId(null); refresh(); }}
                className="rounded-lg border border-app-border px-3 py-1.5 text-xs text-app-muted">拒绝</button>
            </div>
          </div>
        )}

        {waitingAccept && (
          <div className="my-3 rounded-xl border border-app-border bg-app-bg/60 p-3 text-center">
            <p className="text-xs text-app-muted">等待对方同意你的私信请求…</p>
            <p className="mt-1 text-[10px] text-app-muted">对方同意前，你只能发送这一条消息</p>
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto py-3">
          {messages.length === 0 && !needRespond && (
            <p className="py-8 text-center text-xs text-app-muted">发送第一条私信吧</p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === uid;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  mine ? "rounded-br-md bg-app-accent text-white" : "rounded-bl-md bg-app-bg text-app-text"
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {tip && <p className="mb-2 text-center text-[10px] text-app-accent">{tip}</p>}

        {!needRespond && status !== "rejected" && (
          <div className="border-t border-app-border pt-3">
            {!check.allowed && waitingAccept ? (
              <p className="text-center text-[10px] text-app-muted">{check.reason}</p>
            ) : (
              <div className="flex gap-2">
                <input
                  className="app-input flex-1 !py-2 text-xs"
                  placeholder={status === "active" || !thread ? "输入消息…" : "输入首条私信…"}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={!!waitingAccept && messages.length > 0}
                />
                <button onClick={handleSend} disabled={!draft.trim() || (!!waitingAccept && messages.length > 0)}
                  className="rounded-xl bg-app-accent px-3 text-app-bg disabled:opacity-40">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {status === "rejected" && thread?.initiatedBy === uid && (
          <p className="py-3 text-center text-xs text-app-muted">对方已拒绝你的私信请求</p>
        )}
      </div>
    );
  }

  // ─── 会话列表（X 风格） ───
  return (
    <div className="px-4 pb-4">
      <Link href="/community" className="mb-3 inline-flex items-center gap-1 text-xs text-app-accent">
        <ChevronLeft className="h-4 w-4" /> 返回社区
      </Link>
      <h1 className="page-title mb-4">私信</h1>

      {pendingIncoming.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-app-gold">待处理的私信请求</p>
          {pendingIncoming.map((t) => {
            const oid = otherId(t, uid);
            const u = getCommunityUser(oid);
            const preview = getThreadMessages(t.id).slice(-1)[0]?.content;
            return (
              <button key={t.id} onClick={() => setActiveId(t.id)}
                className="mb-2 flex w-full items-center gap-3 app-card !p-3 text-left">
                <UserAvatar userId={u.id} avatar={u.avatar} size="md" verified={u.verified} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-app-text">{u.nickname}</p>
                  <p className="truncate text-[11px] text-app-muted">{preview ?? "请求与你私信"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-app-gold/20 px-2 py-0.5 text-[9px] text-app-gold">待同意</span>
              </button>
            );
          })}
        </div>
      )}

      {threads.length === 0 ? (
        <p className="py-12 text-center text-xs text-app-muted">暂无私信，去社区找感兴趣的人聊聊吧</p>
      ) : (
        <div className="divide-y divide-app-border rounded-xl border border-app-border">
          {threads.map((t) => {
            const oid = otherId(t, uid);
            const u = getCommunityUser(oid);
            const msgs = getThreadMessages(t.id);
            const preview = msgs[msgs.length - 1]?.content ?? "";
            const mine = msgs[msgs.length - 1]?.senderId === uid;
            return (
              <button key={t.id} onClick={() => setActiveId(t.id)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-app-bg/50">
                <UserAvatar userId={u.id} avatar={u.avatar} size="md" verified={u.verified} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-medium text-app-text">{u.nickname}</p>
                    {t.status === "pending" && t.initiatedBy === uid && (
                      <span className="text-[9px] text-app-muted">· 待同意</span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-app-muted">
                    {mine ? "你: " : ""}{preview || "暂无消息"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

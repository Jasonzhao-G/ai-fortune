"use client";

import { useEffect, useState } from "react";
import { X, Bell, Heart, MessageCircle, Sparkles, UserPlus, Mail, Repeat2, Gift } from "lucide-react";
import {
  getMessages, markMessageRead, markAllRead, getUnreadCount,
} from "@/lib/message-store";
import type { AppMessage } from "@/lib/types";

interface MessagesPanelProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

const ICONS: Record<AppMessage["type"], typeof Bell> = {
  like: Heart,
  comment: MessageCircle,
  reply: MessageCircle,
  master: Sparkles,
  follow_post: UserPlus,
  dm_request: Mail,
  dm: Mail,
  repost: Repeat2,
  gift_food: Gift,
};

export default function MessagesPanel({ userId, open, onClose }: MessagesPanelProps) {
  const [messages, setMessages] = useState<AppMessage[]>([]);

  useEffect(() => {
    if (open) {
      setMessages(getMessages(userId));
      markAllRead(userId);
    }
  }, [open, userId]);

  if (!open) return null;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "刚刚";
    if (h < 24) return `${h}小时前`;
    return `${Math.floor(h / 24)}天前`;
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto border-l border-app-border bg-app-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-app-border bg-app-card p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-app-accent" />
            <h2 className="text-sm font-semibold text-app-text">消息</h2>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-app-muted" /></button>
        </div>

        {messages.length === 0 ? (
          <p className="p-8 text-center text-xs text-app-muted">暂无消息</p>
        ) : (
          <div className="divide-y divide-app-border">
            {messages.map((msg) => {
              const Icon = ICONS[msg.type] ?? Bell;
              return (
                <button
                  key={msg.id}
                  onClick={() => { markMessageRead(msg.id); setMessages(getMessages(userId)); }}
                  className={`w-full p-4 text-left transition-colors hover:bg-app-card-hover ${
                    !msg.read ? "bg-app-accent/5" : ""
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-app-gold" />
                    <span className="text-xs font-medium text-app-text">{msg.title}</span>
                    <span className="ml-auto text-[10px] text-app-muted">{timeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-app-muted">{msg.content}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function useUnreadCount(userId: string | undefined, refreshKey = 0): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (userId) setCount(getUnreadCount(userId));
  }, [userId, refreshKey]);
  return count;
}

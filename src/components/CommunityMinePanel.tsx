"use client";

import { X, Bell, Bookmark, MessageCircle, Repeat2 } from "lucide-react";
import { getMessages } from "@/lib/message-store";
import { acceptDmFrom, rejectDmFrom } from "@/lib/dm-store";
import {
  getMyFavoritePosts, getMyComments, getMyRepostPosts,
} from "@/lib/community-store";
import type { CommunityPost, AppMessage } from "@/lib/types";

interface CommunityMinePanelProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export default function CommunityMinePanel({ open, onClose, userId }: CommunityMinePanelProps) {
  if (!open) return null;

  const messages = getMessages(userId);
  const favorites = getMyFavoritePosts(userId);
  const comments = getMyComments(userId);
  const reposts = getMyRepostPosts(userId);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "刚刚";
    if (h < 24) return `${h}小时前`;
    return `${Math.floor(h / 24)}天前`;
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: typeof Bell; children: React.ReactNode }) => (
    <section className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-app-accent" />
        <h3 className="text-xs font-medium text-app-text">{title}</h3>
      </div>
      {children}
    </section>
  );

  const renderPostList = (posts: CommunityPost[], empty: string) => (
    posts.length === 0 ? (
      <p className="py-4 text-center text-xs text-app-muted">{empty}</p>
    ) : (
      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="app-card !p-3">
            <p className="text-[10px] text-app-muted">@{post.nickname}</p>
            <p className="mt-1 text-xs text-app-text">{post.content}</p>
            <p className="mt-1 text-[10px] text-app-muted">{timeAgo(post.createdAt)}</p>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[92%] max-w-sm overflow-y-auto border-l border-app-border bg-app-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-app-border bg-app-card p-4">
          <h2 className="text-sm font-semibold text-app-text">我的</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-app-muted" /></button>
        </div>

        <div className="p-4">
          <Section title="我的消息" icon={Bell}>
            {messages.length === 0 ? (
              <p className="py-4 text-center text-xs text-app-muted">暂无消息</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg: AppMessage) => (
                  <div key={msg.id} className="app-card !p-3">
                    <p className="text-xs font-medium text-app-text">{msg.title}</p>
                    <p className="mt-1 text-[11px] text-app-muted">{msg.content}</p>
                    <p className="mt-1 text-[10px] text-app-muted">{timeAgo(msg.createdAt)}</p>
                    {msg.type === "dm_request" && msg.relatedUserId && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => acceptDmFrom(msg.relatedUserId!)}
                          className="rounded-lg bg-app-accent px-2 py-1 text-[10px] text-white">同意私信</button>
                        <button onClick={() => rejectDmFrom(msg.relatedUserId!)}
                          className="rounded-lg border border-app-border px-2 py-1 text-[10px] text-app-muted">拒绝</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="我的收藏" icon={Bookmark}>
            {renderPostList(favorites, "暂无收藏")}
          </Section>

          <Section title="我的评论" icon={MessageCircle}>
            {comments.length === 0 ? (
              <p className="py-4 text-center text-xs text-app-muted">暂无评论</p>
            ) : (
              <div className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="app-card !p-3">
                    <p className="text-xs text-app-text">{c.content}</p>
                    <p className="mt-1 text-[10px] text-app-muted">{timeAgo(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="我的转发" icon={Repeat2}>
            {renderPostList(reposts, "暂无转发")}
          </Section>
        </div>
      </div>
    </div>
  );
}

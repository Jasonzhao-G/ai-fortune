"use client";

import { useEffect, useState } from "react";
import { getPosts, setPostFeatured, getAllCommunityUsers, setUserVerified } from "@/lib/community-store";
import type { CommunityPost } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";

/** 运营后台：精华帖 + 创作者加 V */
export default function CommunityAdminPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [users, setUsers] = useState<ReturnType<typeof getAllCommunityUsers>>([]);
  const [section, setSection] = useState<"posts" | "verified">("posts");

  const refresh = () => {
    setPosts(getPosts());
    setUsers(getAllCommunityUsers());
  };

  useEffect(() => { refresh(); }, []);

  const toggleFeatured = (id: string, featured: boolean) => {
    setPostFeatured(id, featured);
    refresh();
  };

  const toggleVerified = (userId: string, verified: boolean) => {
    setUserVerified(userId, verified);
    refresh();
  };

  return (
    <div className="px-4 pb-4">
      <header className="mb-4 pt-2 text-center">
        <h1 className="page-title">社区运营</h1>
        <p className="text-xs text-app-muted">精华帖 · 创作者认证加 V</p>
      </header>

      <div className="mb-4 flex gap-1 rounded-xl border border-app-border p-0.5">
        {([["posts", "精华帖"], ["verified", "加 V 认证"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)}
            className={`flex-1 rounded-lg py-1.5 text-[10px] ${section === id ? "bg-app-accent text-white" : "text-app-muted"}`}>
            {label}
          </button>
        ))}
      </div>

      {section === "posts" && (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="app-card flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{p.nickname}</p>
                <p className="truncate text-[10px] text-app-muted">{p.content || "（图片帖）"}</p>
              </div>
              <button onClick={() => toggleFeatured(p.id, !p.isFeatured)}
                className={`shrink-0 rounded-lg px-3 py-1 text-[10px] ${
                  p.isFeatured ? "bg-app-gold text-white" : "border border-app-border text-app-muted"
                }`}>
                {p.isFeatured ? "已精华" : "加精华"}
              </button>
            </div>
          ))}
        </div>
      )}

      {section === "verified" && (
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="py-8 text-center text-xs text-app-muted">暂无社区用户</p>
          ) : users.map((u) => (
            <div key={u.id} className="app-card flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <UserAvatar userId={u.id} avatar={u.avatar} size="md" verified={u.verified} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{u.nickname}</p>
                  <p className="truncate text-[10px] text-app-muted">{u.id}</p>
                </div>
              </div>
              <button onClick={() => toggleVerified(u.id, !u.verified)}
                className={`shrink-0 rounded-lg px-3 py-1 text-[10px] ${
                  u.verified ? "bg-app-accent text-white" : "border border-app-border text-app-muted"
                }`}>
                {u.verified ? "已加 V" : "加 V"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

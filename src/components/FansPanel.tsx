"use client";

import { useState } from "react";
import { X, MessageCircle, Users } from "lucide-react";
import { getFollowers, getCommunityUser } from "@/lib/community-store";
import { sendDm, canSendDm, getThreadBetween } from "@/lib/dm-store";
import { useApp } from "@/context/AppContext";

interface FansPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function FansPanel({ open, onClose }: FansPanelProps) {
  const { user } = useApp();
  const [dmTarget, setDmTarget] = useState<string | null>(null);
  const [dmText, setDmText] = useState("");
  const [tip, setTip] = useState<string | null>(null);

  if (!open || !user) return null;

  const fans = getFollowers(user.id);

  const handleSend = () => {
    if (!dmTarget || !dmText.trim()) return;
    const res = sendDm(dmTarget, dmText);
    if (res.ok) {
      setTip("私信已发送");
      setDmText("");
      setTimeout(() => { setTip(null); setDmTarget(null); }, 1500);
    } else {
      setTip(res.error ?? "发送失败");
    }
  };

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto border-r border-app-border bg-app-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-app-border bg-app-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-app-gold" />
            <h2 className="text-sm font-semibold text-app-text">我的粉丝 ({fans.length})</h2>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-app-muted" /></button>
        </div>

        {tip && <p className="mx-4 mt-3 rounded-lg bg-app-accent/10 px-3 py-2 text-[11px] text-app-accent">{tip}</p>}

        {fans.length === 0 ? (
          <p className="p-8 text-center text-xs text-app-muted">暂无粉丝，多发帖吸引关注吧</p>
        ) : (
          <div className="divide-y divide-app-border">
            {fans.map((fid) => {
              const u = getCommunityUser(fid);
              const check = canSendDm(user.id, fid);
              const thread = getThreadBetween(user.id, fid);
              return (
                <div key={fid} className="flex items-center gap-3 p-4">
                  <img src={u.avatar} alt="" className="h-10 w-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app-text">{u.nickname}</p>
                    <p className="text-[10px] text-app-muted">
                      {thread?.status === "active" ? "可自由私信" : thread?.status === "pending" ? "等待同意" : "点击发私信"}
                    </p>
                  </div>
                  <button
                    onClick={() => setDmTarget(fid)}
                    className="flex items-center gap-1 rounded-lg border border-app-border px-2 py-1 text-[10px] text-app-accent"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    私信
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {dmTarget && (
          <div className="fixed inset-x-0 bottom-0 z-[95] border-t border-app-border bg-app-card p-4">
            <p className="mb-2 text-xs text-app-muted">
              发给 {getCommunityUser(dmTarget).nickname}
              {!canSendDm(user.id, dmTarget).allowed && " · 首次私信需对方同意"}
            </p>
            <div className="flex gap-2">
              <input
                className="app-input flex-1 !py-2 text-xs"
                placeholder="输入私信内容..."
                value={dmText}
                onChange={(e) => setDmText(e.target.value)}
              />
              <button onClick={handleSend} className="rounded-xl bg-app-accent px-4 text-xs text-white">发送</button>
              <button onClick={() => setDmTarget(null)} className="rounded-xl border border-app-border px-3 text-xs">取消</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

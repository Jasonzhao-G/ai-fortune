"use client";

import { Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ProfileMenu from "@/components/ProfileMenu";
import { useUnreadCount } from "@/components/MessagesPanel";
import { useState } from "react";

export default function TopBar() {
  const { user } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const unread = useUnreadCount(user?.id, refreshKey);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-app-border/60 bg-app-bg/90 px-4 py-2.5 backdrop-blur-md">
        <button onClick={() => setMenuOpen(true)} className="relative flex items-center gap-2">
          {user ? (
            <>
              <img src={user.avatar} alt="" className="h-8 w-8 rounded-full border border-app-gold/40" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-app-accent text-[9px] text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-app-border" />
          )}
        </button>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-app-gold" />
          <span className="text-sm font-bold tracking-widest text-app-text">AI K线</span>
        </div>
        <div className="w-8" />
      </header>
      {user && (
        <ProfileMenu
          user={user}
          open={menuOpen}
          onClose={() => { setMenuOpen(false); setRefreshKey((k) => k + 1); }}
        />
      )}
    </>
  );
}

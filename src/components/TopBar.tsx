"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ProfileMenu from "@/components/ProfileMenu";
import ProfileEditModal from "@/components/ProfileEditModal";
import { useUnreadCount } from "@/components/MessagesPanel";
import { getOrCreateUser } from "@/lib/user-store";
import { BRAND_NAME, BRAND_LOGO } from "@/lib/brand";

export default function TopBar() {
  const pathname = usePathname();
  const { user, refreshUser } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onSpiritPet = pathname === "/spirit-pet" || pathname.startsWith("/spirit-pet/");

  const openMenu = () => {
    refreshUser();
    setMenuOpen(true);
  };

  let menuUser = user;
  if (menuOpen && !menuUser && typeof window !== "undefined") {
    try { menuUser = getOrCreateUser(); } catch { /* ignore */ }
  }

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("messages-updated", refresh);
    return () => window.removeEventListener("messages-updated", refresh);
  }, []);

  const unread = useUnreadCount(menuUser?.id ?? user?.id, refreshKey);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-app-border bg-app-card/95 px-4 py-3 backdrop-blur-lg">
        <button onClick={openMenu} className="relative flex items-center gap-1.5">
          {menuUser ?? user ? (
            <>
              <img src={(menuUser ?? user)!.avatar} alt="" className="h-9 w-9 rounded-full border border-app-border object-cover" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white ring-2 ring-app-card">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-app-border" />
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xl">{BRAND_LOGO}</span>
          <span className="nav-brand">{BRAND_NAME}</span>
        </div>

        {onSpiritPet ? (
          <Link href="/shop" className="flex min-w-[40px] flex-col items-center">
            <ShoppingBag className="h-5 w-5 text-app-gold" strokeWidth={2} />
            <span className="micro font-semibold text-app-gold">灵宠商城</span>
          </Link>
        ) : (
          <div className="min-w-[40px]" aria-hidden />
        )}
      </header>

      {menuUser && (
        <>
          <ProfileMenu
            user={menuUser}
            open={menuOpen}
            onClose={() => { setMenuOpen(false); setRefreshKey((k) => k + 1); }}
            onEditProfile={() => { setMenuOpen(false); setEditOpen(true); }}
          />
          <ProfileEditModal
            user={menuUser}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onUpdated={() => { refreshUser(); setRefreshKey((k) => k + 1); }}
          />
        </>
      )}
    </>
  );
}

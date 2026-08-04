"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import ProfileMenu from "@/components/ProfileMenu";
import ProfileEditModal from "@/components/ProfileEditModal";
import PetFoodPanel from "@/components/PetFoodPanel";
import { useUnreadCount } from "@/components/MessagesPanel";
import { getTotalUses, getPetFoodBalance, hasUnlimitedAccess } from "@/lib/pet-food-store";
import { getOrCreateUser } from "@/lib/user-store";
import { BRAND_NAME, BRAND_LOGO } from "@/lib/brand";

export default function TopBar() {
  const { user, refreshUser } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [foodOpen, setFoodOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openMenu = () => {
    refreshUser();
    setMenuOpen(true);
  };

  let menuUser = user;
  if (menuOpen && !menuUser && typeof window !== "undefined") {
    try { menuUser = getOrCreateUser(); } catch { /* ignore */ }
  }

  const unread = useUnreadCount(menuUser?.id ?? user?.id, refreshKey);

  let foodLabel = "0";
  if (user) {
    try {
      const foodBalance = getPetFoodBalance(user.id);
      foodLabel = hasUnlimitedAccess(foodBalance) ? "∞" : `${getTotalUses(foodBalance)}`;
    } catch {
      foodLabel = "0";
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-app-border/60 bg-app-bg/90 px-4 py-2.5 backdrop-blur-md">
        <button onClick={openMenu} className="relative flex items-center gap-1.5">
          {menuUser ?? user ? (
            <>
              <img src={(menuUser ?? user)!.avatar} alt="" className="h-8 w-8 rounded-full border border-app-gold/40 object-cover" />
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
          <span className="text-lg">{BRAND_LOGO}</span>
          <span className="text-sm font-bold tracking-widest text-app-text">{BRAND_NAME}</span>
        </div>

        <button onClick={() => setFoodOpen(true)} className="flex flex-col items-center">
          <span className="text-sm">🍖</span>
          <span className="text-[9px] text-app-gold">{foodLabel}</span>
        </button>
      </header>

      {menuUser && (
        <>
          <ProfileMenu
            user={menuUser}
            open={menuOpen}
            onClose={() => { setMenuOpen(false); setRefreshKey((k) => k + 1); }}
            onEditProfile={() => { setMenuOpen(false); setEditOpen(true); }}
            onOpenPetFood={() => { setMenuOpen(false); setFoodOpen(true); }}
          />
          <ProfileEditModal
            user={menuUser}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onUpdated={() => { refreshUser(); setRefreshKey((k) => k + 1); }}
          />
          <PetFoodPanel
            userId={menuUser.id}
            open={foodOpen}
            onClose={() => setFoodOpen(false)}
            onRefresh={() => setRefreshKey((k) => k + 1)}
          />
        </>
      )}
    </>
  );
}

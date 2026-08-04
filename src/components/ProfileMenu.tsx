"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Gift, Sparkles, Sun, Moon, Globe, Mail, Info, Bell, History, UserPen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { UserProfile } from "@/lib/types";
import { getInviteLink } from "@/lib/user-store";
import { getTotalUses, getPetFoodBalance, hasUnlimitedAccess } from "@/lib/pet-food-store";
import ContactModal from "@/components/ContactModal";
import MessagesPanel, { useUnreadCount } from "@/components/MessagesPanel";
import InviteModal from "@/components/InviteModal";

interface ProfileMenuProps {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
  onEditProfile?: () => void;
  onOpenPetFood?: () => void;
}

export default function ProfileMenu({ user, open, onClose, onEditProfile, onOpenPetFood }: ProfileMenuProps) {
  const { theme, setTheme, locale, setLocale, refreshUser } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [msgKey, setMsgKey] = useState(0);
  const unread = useUnreadCount(user.id, msgKey);

  if (!open) return null;

  const inviteLink = getInviteLink(user.id);
  let foodBalance;
  try {
    foodBalance = getPetFoodBalance(user.id);
  } catch {
    foodBalance = { giftedUses: 5, purchasedUses: 0 };
  }
  const foodLabel = hasUnlimitedAccess(foodBalance)
    ? "无限灵粮"
    : `${getTotalUses(foodBalance)} 次灵粮`;

  return (
    <>
      <div className="fixed inset-0 z-[80]">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-r border-app-border bg-app-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-app-border p-4">
            <h2 className="text-sm font-semibold text-app-text">我的</h2>
            <button onClick={onClose}><X className="h-5 w-5 text-app-muted" /></button>
          </div>

          <div className="border-b border-app-border p-4">
            <div className="flex items-center gap-3">
              <button onClick={onEditProfile} className="shrink-0">
                <img src={user.avatar} alt="" className="h-14 w-14 rounded-full border-2 border-app-gold/40 object-cover" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-app-text">{user.nickname}</p>
                <p className="text-xs text-app-muted">ID: {user.id}</p>
                {user.subscription && (
                  <span className="mt-1 inline-block rounded-full bg-app-accent/20 px-2 py-0.5 text-[10px] text-app-accent">会员</span>
                )}
                <button onClick={onOpenPetFood} className="mt-1 inline-block rounded-full bg-app-gold/20 px-2 py-0.5 text-[10px] text-app-gold">
                  🍖 {foodLabel}
                </button>
              </div>
            </div>
            {onEditProfile && (
              <button onClick={onEditProfile} className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-app-border py-2 text-xs text-app-accent">
                <UserPen className="h-3.5 w-3.5" /> 编辑头像与昵称
              </button>
            )}
          </div>

          <div className="p-2">
            <button
              onClick={() => { setShowMessages(true); refreshUser(); }}
              className="menu-item"
            >
              <Bell className="h-4 w-4 text-app-accent" />
              消息
              {unread > 0 && (
                <span className="ml-auto rounded-full bg-app-accent px-1.5 py-0.5 text-[10px] text-white">
                  {unread}
                </span>
              )}
            </button>

            <Link href="/records" onClick={onClose} className="menu-item">
              <History className="h-4 w-4 text-app-gold" />
              我的测算
            </Link>

            <Link href="/community/me" onClick={onClose} className="menu-item">
              <Sparkles className="h-4 w-4 text-app-accent" />
              社区个人中心
            </Link>

            <Link href="/spirit-pet" onClick={onClose} className="menu-item">
              <Sparkles className="h-4 w-4 text-app-gold" />
              AI 灵宠
            </Link>

            <button onClick={() => setShowInvite(true)} className="menu-item">
              <Gift className="h-4 w-4 text-app-gold" />邀请好友
            </button>
            <button onClick={() => alert("精彩活动即将上线！")} className="menu-item">
              <Sparkles className="h-4 w-4 text-app-accent" />活动
            </button>

            <div className="my-2 border-t border-app-border" />

            <p className="px-4 py-1 text-[10px] text-app-muted">主题模式</p>
            <div className="flex gap-2 px-4 pb-2">
              {(["dark", "light"] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-2 text-xs ${
                    theme === t ? "border-app-accent text-app-accent" : "border-app-border text-app-muted"
                  }`}>
                  {t === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  {t === "dark" ? "深色" : "浅色"}
                </button>
              ))}
            </div>

            <p className="px-4 py-1 text-[10px] text-app-muted">语言</p>
            <div className="flex gap-2 px-4 pb-2">
              {(["zh", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLocale(l)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-2 text-xs ${
                    locale === l ? "border-app-accent text-app-accent" : "border-app-border text-app-muted"
                  }`}>
                  <Globe className="h-3 w-3" />{l === "zh" ? "中文" : "EN"}
                </button>
              ))}
            </div>

            <button onClick={() => setShowContact(true)} className="menu-item">
              <Mail className="h-4 w-4 text-app-muted" />联系客服
            </button>

            <div className="menu-item cursor-default hover:bg-transparent">
              <Info className="h-4 w-4 text-app-muted" />
              <span className="text-app-muted">版本 v1.3.0</span>
            </div>
          </div>
        </div>
      </div>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
      <MessagesPanel
        userId={user.id}
        open={showMessages}
        onClose={() => { setShowMessages(false); setMsgKey((k) => k + 1); refreshUser(); }}
      />
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        userId={user.id}
        inviteLink={inviteLink}
      />
    </>
  );
}

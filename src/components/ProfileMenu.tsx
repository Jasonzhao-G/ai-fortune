"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { X, Gift, Sparkles, Sun, Moon, Globe, Mail, Info, Copy, Check, Bell, History } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { UserProfile } from "@/lib/types";
import {
  getInviteLink, getInviteQrUrl, getTrialExpiryLabel, REFERRAL_BONUS_DAYS,
} from "@/lib/user-store";
import { getReferralCount } from "@/lib/community-store";
import ContactModal from "@/components/ContactModal";
import MessagesPanel, { useUnreadCount } from "@/components/MessagesPanel";

interface ProfileMenuProps {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ user, open, onClose }: ProfileMenuProps) {
  const { theme, setTheme, locale, setLocale, refreshUser } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msgKey, setMsgKey] = useState(0);
  const unread = useUnreadCount(user.id, msgKey);

  if (!open) return null;

  const inviteLink = getInviteLink(user.id);
  const refCount = getReferralCount(user.id);
  const trialLabel = getTrialExpiryLabel(user);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <img src={user.avatar} alt="" className="h-14 w-14 rounded-full border-2 border-app-gold/40" />
              <div>
                <p className="font-medium text-app-text">{user.nickname}</p>
                <p className="text-xs text-app-muted">ID: {user.id}</p>
                {user.subscription && (
                  <span className="mt-1 inline-block rounded-full bg-app-accent/20 px-2 py-0.5 text-[10px] text-app-accent">会员</span>
                )}
                {trialLabel && (
                  <span className="mt-1 inline-block rounded-full bg-app-gold/20 px-2 py-0.5 text-[10px] text-app-gold">
                    奖励至 {trialLabel}
                  </span>
                )}
              </div>
            </div>
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

            <button onClick={() => setShowInvite(!showInvite)} className="menu-item">
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

            {showInvite && (
              <div className="mx-2 mt-2 rounded-xl border border-app-border p-4">
                <div className="mb-3 rounded-xl bg-app-accent/10 p-3">
                  <p className="text-xs font-semibold text-app-accent">邀请有礼</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-app-muted">
                    成功邀请 1 位好友注册，即可获得 <span className="font-bold text-app-gold">{REFERRAL_BONUS_DAYS} 天</span> 使用期限！多邀多得，分享给朋友一起测命理吧 🎁
                  </p>
                </div>
                <p className="mb-2 text-xs font-medium">已邀请 {refCount} 人 · 累计 {refCount * REFERRAL_BONUS_DAYS} 天</p>
                <div className="mb-3 flex justify-center">
                  <img src={getInviteQrUrl(inviteLink)} alt="QR" className="h-32 w-32 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <input readOnly value={inviteLink} className="app-input flex-1 text-[10px]" />
                  <button onClick={copyLink} className="rounded-xl border border-app-border px-3">
                    {copied ? <Check className="h-4 w-4 text-app-green" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
      <MessagesPanel
        userId={user.id}
        open={showMessages}
        onClose={() => { setShowMessages(false); setMsgKey((k) => k + 1); refreshUser(); }}
      />
    </>
  );
}

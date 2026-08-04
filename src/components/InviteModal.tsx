"use client";

import { useState } from "react";
import { X, Copy, Check, Download } from "lucide-react";
import { getInviteQrUrl } from "@/lib/user-store";
import { REFERRAL_GIFT_BAGS, USES_PER_BAG } from "@/lib/pet-food-store";
import { getReferralCount } from "@/lib/community-store";
import { downloadPoster } from "@/lib/poster";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  inviteLink: string;
}

export default function InviteModal({ open, onClose, userId, inviteLink }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const refCount = getReferralCount(userId);
  const qrUrl = getInviteQrUrl(inviteLink);

  if (!open) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      downloadPoster(canvas.toDataURL("image/png"), "AI灵宠-邀请二维码.png");
    };
    img.src = qrUrl;
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-app-border bg-app-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X className="h-5 w-5 text-app-muted" />
        </button>

        <div className="flex flex-col items-center text-center">
          <p className="text-base font-semibold text-app-accent">邀请好友</p>
          <p className="mt-2 text-[11px] leading-relaxed text-app-muted">
            成功邀请 1 位好友注册，即可获得 <span className="font-bold text-app-gold">{REFERRAL_GIFT_BAGS} 袋灵粮</span>
            （{REFERRAL_GIFT_BAGS * USES_PER_BAG} 次测算）！
          </p>
          <p className="mt-3 text-xs text-app-text">
            已邀请 {refCount} 人 · 累计 {refCount * REFERRAL_GIFT_BAGS} 袋灵粮
          </p>

          <div className="my-5 flex flex-col items-center justify-center">
            <div className="rounded-2xl bg-white p-3 shadow-lg">
              <img src={qrUrl} alt="邀请二维码" className="h-40 w-40" />
            </div>
            <p className="mt-2 max-w-[220px] text-[10px] leading-relaxed text-app-muted">
              发给好友扫码，使用手机自带浏览器打开哦～
            </p>
          </div>

          <button onClick={downloadQr}
            className="mb-4 flex items-center gap-2 rounded-xl border border-app-gold/50 bg-app-gold/10 px-4 py-2 text-xs text-app-gold">
            <Download className="h-4 w-4" /> 下载保存二维码
          </button>

          <div className="flex w-full gap-2">
            <input readOnly value={inviteLink} className="app-input flex-1 text-[10px]" />
            <button onClick={copyLink} className="rounded-xl border border-app-border px-3">
              {copied ? <Check className="h-4 w-4 text-app-green" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

const WECHAT_ID = "294801955";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copyWechat = () => {
    navigator.clipboard.writeText(WECHAT_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-app-border bg-app-card p-5 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3">
          <X className="h-5 w-5 text-app-muted" />
        </button>
        <h3 className="mb-1 text-center text-base font-semibold text-app-text">联系客服</h3>
        <p className="mb-4 text-center text-xs text-app-muted">添加微信，获取帮助与反馈</p>
        <div className="rounded-xl border border-app-border bg-app-bg p-4 text-center">
          <p className="mb-1 text-xs text-app-muted">客服微信</p>
          <p className="text-xl font-bold tracking-wider text-app-gold">{WECHAT_ID}</p>
        </div>
        <button onClick={copyWechat} className="app-btn mt-4 flex items-center justify-center gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "已复制" : "点击复制微信号"}
        </button>
      </div>
    </div>
  );
}

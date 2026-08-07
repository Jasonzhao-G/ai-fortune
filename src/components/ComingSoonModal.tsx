"use client";

import { X } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export default function ComingSoonModal({
  open,
  title = "功能预告",
  message = "功能正在升级中，敬请期待！",
  onClose,
}: ComingSoonModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-app-border bg-app-card p-5 text-center shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="block-title text-app-text">{title}</h3>
          <button type="button" onClick={onClose} aria-label="关闭">
            <X className="h-5 w-5 text-app-muted" />
          </button>
        </div>
        <p className="body-text leading-relaxed text-app-muted">{message}</p>
        <button type="button" onClick={onClose} className="app-btn mt-4">
          我知道了
        </button>
      </div>
    </div>
  );
}

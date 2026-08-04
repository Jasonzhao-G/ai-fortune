"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, message, confirmLabel = "确认", cancelLabel = "取消", onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-app-border bg-app-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-app-text">{title}</h3>
          <button onClick={onCancel}><X className="h-5 w-5 text-app-muted" /></button>
        </div>
        <p className="mb-4 whitespace-pre-line text-xs leading-relaxed text-app-muted">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="app-btn-outline flex-1">{cancelLabel}</button>
          <button onClick={onConfirm} className="app-btn flex-1">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

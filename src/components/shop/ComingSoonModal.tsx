"use client";

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export default function ComingSoonModal({
  open,
  onClose,
  title = "马上上线，敬请期待！",
}: ComingSoonModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-2xl border border-app-border bg-app-card p-6 text-center shadow-2xl">
        <p className="text-4xl">🛍️</p>
        <p className="mt-3 block-title text-app-gold">{title}</p>
        <p className="caption mt-2">我们正在筹备中，上线后会第一时间通知你</p>
        <button type="button" onClick={onClose} className="app-btn mt-4 !mb-0 w-full">
          知道了
        </button>
      </div>
    </div>
  );
}

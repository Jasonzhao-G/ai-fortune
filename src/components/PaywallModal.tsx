"use client";

import { PRICING } from "@/lib/types";
import { mockSubscribe } from "@/lib/user-store";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  onSubscribed?: () => void;
}

export default function PaywallModal({ open, onClose, feature, onSubscribed }: PaywallModalProps) {
  if (!open) return null;

  const handleSubscribe = (plan: "month" | "half" | "year") => {
    mockSubscribe(plan);
    onSubscribed?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-t-3xl border border-app-border bg-app-card p-6 sm:rounded-3xl">
        <h2 className="mb-1 text-lg font-semibold text-app-text">解锁无限测算</h2>
        <p className="mb-4 text-xs text-app-muted">
          「{feature}」免费次数已用完，订阅后可无限使用全部功能
        </p>

        <div className="space-y-2">
          {(["month", "half", "year"] as const).map((plan) => {
            const p = PRICING[plan];
            return (
              <button
                key={plan}
                onClick={() => handleSubscribe(plan)}
                className="flex w-full items-center justify-between rounded-xl border border-app-border px-4 py-3 transition-colors hover:border-app-accent"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-app-text">{p.label}</p>
                  <p className="text-[10px] text-app-muted">{p.days}天无限次</p>
                </div>
                <p className="text-lg font-bold text-app-accent">¥{p.price}</p>
              </button>
            );
          })}
        </div>

        <button onClick={onClose} className="mt-4 w-full py-2 text-xs text-app-muted">
          稍后再说
        </button>
      </div>
    </div>
  );
}

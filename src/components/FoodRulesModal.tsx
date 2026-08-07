"use client";

import { X } from "lucide-react";
import { PET_FOOD_PLANS, USES_PER_BAG, SIGNUP_GIFT_BAGS } from "@/lib/pet-food-store";
import SpiritGourdIcon from "@/components/icons/SpiritGourdIcon";

interface FoodRulesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FoodRulesModal({ open, onClose }: FoodRulesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-app-border bg-app-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="heading-3">灵丹规则</p>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-app-muted hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 body-text">
          <p className="flex items-start gap-2">
            <SpiritGourdIcon className="mt-0.5 h-5 w-5 shrink-0 text-app-gold" title="灵丹" />
            <span><span className="font-semibold">1 瓶灵丹 = {USES_PER_BAG} 次测算</span>（人生K线、AI六爻、八字排盘、AI看相、问AI灵宠等）</span>
          </p>
          <p>新用户注册赠送 <span className="font-semibold text-app-gold">{SIGNUP_GIFT_BAGS} 瓶</span>灵丹</p>
          <p className="caption text-app-muted">灵丹不足时，灵宠会提醒你购买；也可在「灵宠商城 → 灵丹」购买</p>
          <div className="rounded-xl border border-app-border bg-app-bg/50 p-3">
            <p className="block-label mb-2 text-app-gold">灵丹价格</p>
            {PET_FOOD_PLANS.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between border-b border-app-border/40 py-2 last:border-0">
                <span className="caption">{plan.label}</span>
                <span className="caption font-semibold text-app-gold">¥{plan.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

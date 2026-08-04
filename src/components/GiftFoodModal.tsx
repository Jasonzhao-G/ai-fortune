"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { giftPetFood, getPetFoodBalance, getTotalUses, USES_PER_BAG } from "@/lib/pet-food-store";
import { getCommunityUser } from "@/lib/community-store";

interface GiftFoodModalProps {
  open: boolean;
  onClose: () => void;
  toUserId: string;
  fromUserId: string;
  onGifted?: () => void;
}

export default function GiftFoodModal({ open, onClose, toUserId, fromUserId, onGifted }: GiftFoodModalProps) {
  const [bags, setBags] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const target = getCommunityUser(toUserId);
  let balance;
  try {
    balance = getPetFoodBalance(fromUserId);
  } catch {
    balance = { giftedUses: 5, purchasedUses: 0 };
  }
  const totalUses = getTotalUses(balance);
  const maxBags = Math.floor(totalUses / USES_PER_BAG);

  const handleGift = () => {
    if (bags > maxBags) {
      setError("灵粮余额不足，请先购买");
      return;
    }
    if (giftPetFood(fromUserId, toUserId, bags)) {
      setSuccess(true);
      setTimeout(() => { onGifted?.(); onClose(); }, 1500);
    } else {
      setError("赠送失败，请检查余额");
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-app-border bg-app-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X className="h-5 w-5 text-app-muted" />
        </button>
        <h2 className="mb-4 text-base font-semibold text-app-text">🎁 赠送灵粮</h2>
        <p className="mb-3 text-xs text-app-muted">赠送给 {target.nickname}</p>
        <p className="mb-3 text-[10px] text-app-gold">您的灵粮余额：{totalUses} 次（可赠 {maxBags} 袋）</p>

        {success ? (
          <p className="py-6 text-center text-sm text-app-accent">赠送成功！</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-center gap-4">
              <button onClick={() => setBags(Math.max(1, bags - 1))}
                className="h-8 w-8 rounded-full border border-app-border text-lg">−</button>
              <span className="text-lg font-bold text-app-text">{bags} 袋</span>
              <button onClick={() => setBags(Math.min(maxBags || 1, bags + 1))}
                className="h-8 w-8 rounded-full border border-app-border text-lg">+</button>
            </div>
            {error && <p className="mb-2 text-center text-[11px] text-app-red">{error}</p>}
            <button onClick={handleGift} disabled={maxBags < 1}
              className="app-btn disabled:opacity-40">确认赠送</button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import BuyFoodModal from "@/components/BuyFoodModal";

interface PetFoodHungryModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  onPurchased?: () => void;
}

export default function PetFoodHungryModal({ open, onClose, feature, onPurchased }: PetFoodHungryModalProps) {
  const [buyOpen, setBuyOpen] = useState(false);

  if (buyOpen) {
    return (
      <BuyFoodModal
        open={buyOpen}
        onClose={() => { setBuyOpen(false); onClose(); }}
        onPurchased={() => { onPurchased?.(); setBuyOpen(false); onClose(); }}
      />
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-t-3xl border border-app-border bg-app-card p-6 text-center sm:rounded-3xl">
        <p className="text-5xl spirit-pet-float">🦄</p>
        <p className="mt-3 text-sm font-medium text-app-gold">灵宠饿啦～</p>
        <p className="mt-2 text-xs leading-relaxed text-app-muted">
          主人，粮食不够了，银家干不动了呢，好饿哦～快给我买粮食～
          {feature && <span className="mt-1 block text-app-accent">「{feature}」需要消耗 1 次灵丹</span>}
        </p>
        <button onClick={() => setBuyOpen(true)} className="app-btn mt-4">买灵丹</button>
        <button onClick={onClose} className="mt-3 w-full py-2 text-xs text-app-muted">稍后再说</button>
      </div>
    </div>
  );
}

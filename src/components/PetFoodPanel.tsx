"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  getPetFoodBalance, getTotalUses, getGiftedBags, getPurchasedBags,
  hasUnlimitedAccess, USES_PER_BAG,
} from "@/lib/pet-food-store";
import BuyFoodModal from "@/components/BuyFoodModal";
import { SpiritGourdHeading } from "@/components/icons/SpiritGourdIcon";

interface PetFoodPanelProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onRefresh?: () => void;
}

export default function PetFoodPanel({ open, onClose, userId, onRefresh }: PetFoodPanelProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!open) return null;

  let balance;
  try {
    balance = getPetFoodBalance(userId);
  } catch {
    balance = { giftedUses: 5, purchasedUses: 0 };
  }
  const unlimited = hasUnlimitedAccess(balance);
  const totalUses = getTotalUses(balance);
  const giftedBags = getGiftedBags(balance);
  const purchasedBags = getPurchasedBags(balance);
  const partialGift = balance.giftedUses % USES_PER_BAG;
  const partialPurch = balance.purchasedUses % USES_PER_BAG;

  return (
    <>
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm rounded-2xl border border-app-border bg-app-card p-6 shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4">
            <X className="h-5 w-5 text-app-muted" />
          </button>
          <h2 className="mb-4 text-base font-semibold text-app-text">
            <SpiritGourdHeading>我的灵丹</SpiritGourdHeading>
          </h2>

          <div className="mb-4 rounded-xl border border-app-gold/30 bg-app-gold/5 p-4 text-center">
            {unlimited ? (
              <>
                <p className="text-2xl font-bold text-app-gold">无限测算中</p>
                <p className="mt-1 text-[10px] text-app-muted">
                  有效期至 {new Date(balance.unlimitedUntil!).toLocaleDateString("zh-CN")}
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-app-gold">{totalUses}</p>
                <p className="text-[10px] text-app-muted">剩余测算次数</p>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between rounded-lg border border-app-border px-3 py-2">
              <span className="text-app-muted">赠送的灵丹</span>
              <span className="text-app-text">
                {giftedBags} 瓶{partialGift > 0 ? ` + ${partialGift} 次` : ""}
              </span>
            </div>
            <div className="flex justify-between rounded-lg border border-app-border px-3 py-2">
              <span className="text-app-muted">购买的灵丹</span>
              <span className="text-app-text">
                {purchasedBags} 瓶{partialPurch > 0 ? ` + ${partialPurch} 次` : ""}
              </span>
            </div>
            <div className="flex justify-between rounded-lg border border-app-gold/30 bg-app-gold/5 px-3 py-2">
              <span className="text-app-gold">灵丹总额</span>
              <span className="font-medium text-app-gold">
                {unlimited ? "无限" : `${giftedBags + purchasedBags} 瓶 + ${partialGift + partialPurch} 次`}
              </span>
            </div>
          </div>

          {!unlimited && totalUses <= 0 && (
            <p className="mt-3 text-center text-[11px] text-app-accent">
              主人，粮食不够了，银家干不动了呢，好饿哦～
            </p>
          )}

          <Link href="/shop/category/food" onClick={onClose} className="app-btn mt-4">去商城买粮</Link>
        </div>
      </div>

      <BuyFoodModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        onPurchased={() => { setRefreshKey((k) => k + 1); onRefresh?.(); setBuyOpen(false); }}
        key={refreshKey}
      />
    </>
  );
}

"use client";

import PetFoodHungryModal from "@/components/PetFoodHungryModal";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  onSubscribed?: () => void;
}

/** 灵丹不足时弹出灵宠饿肚子提示 */
export default function PaywallModal({ open, onClose, feature, onSubscribed }: PaywallModalProps) {
  return (
    <PetFoodHungryModal
      open={open}
      onClose={onClose}
      feature={feature}
      onPurchased={onSubscribed}
    />
  );
}

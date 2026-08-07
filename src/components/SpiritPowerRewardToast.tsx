"use client";

import { useEffect } from "react";
import type { SpiritPetProfile } from "@/lib/types";

interface SpiritPowerRewardToastProps {
  pet: SpiritPetProfile | null;
  gain: number | null;
  onDone: () => void;
}

export default function SpiritPowerRewardToast({ pet, gain, onDone }: SpiritPowerRewardToastProps) {
  useEffect(() => {
    if (gain == null || !pet) return;
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [gain, pet, onDone]);

  if (gain == null || !pet) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-6 backdrop-blur-sm">
      <div className="spirit-power-reward-pop w-full max-w-xs rounded-2xl border border-app-gold/40 bg-app-card p-5 text-center shadow-xl">
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 text-4xl spirit-pet-float"
          style={{ borderColor: pet.elementColor, boxShadow: `0 0 24px ${pet.elementColor}44` }}
        >
          {pet.emoji}
        </div>
        <p className="body-text leading-relaxed text-app-text">
          太棒了~谢谢你主人，我又增加了
          <span className="font-bold text-app-gold"> {gain} </span>
          点灵力，我离觉醒升级更近了一步！
        </p>
      </div>
    </div>
  );
}

export const SPIRIT_POWER_GAIN_EVENT = "spirit-power-gained";

export function emitSpiritPowerGain(gain: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SPIRIT_POWER_GAIN_EVENT, { detail: { gain } }));
}

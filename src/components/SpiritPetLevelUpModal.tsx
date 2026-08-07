"use client";

import { useEffect } from "react";
import type { SpiritPetProfile } from "@/lib/types";
import { formatLevelBadge } from "@/lib/spirit-pet-growth";

interface SpiritPetLevelUpModalProps {
  pet: SpiritPetProfile;
  newLevel: number;
  onClose: () => void;
}

const LEVEL_UP_MESSAGE =
  "太棒了主人~你的守护灵宠觉醒了一个层次，我升级解锁了其他的灵力，让我继续努力为你守护吧~";

export default function SpiritPetLevelUpModal({ pet, newLevel, onClose }: SpiritPetLevelUpModalProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/65 px-4 backdrop-blur-md">
      <div className="spirit-level-up-pop w-full max-w-sm text-center">
        <div className="relative mx-auto mb-5 flex h-36 w-36 items-center justify-center">
          <div className="spirit-level-up-ring pointer-events-none absolute inset-0 rounded-full" />
          <div className="spirit-level-up-ring-delay pointer-events-none absolute inset-2 rounded-full" />
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 spirit-pet-aura"
            style={{
              borderColor: pet.elementColor,
              boxShadow: `0 0 48px ${pet.elementColor}88, inset 0 0 24px ${pet.elementColor}33`,
            }}
          >
            <span className="text-6xl drop-shadow-lg">{pet.emoji}</span>
          </div>
        </div>

        <p className="block-title text-app-gold">觉醒升级！</p>
        <p className="spirit-level-name spirit-level-name-lg mt-2 inline-flex gap-1.5">
          {formatLevelBadge(newLevel)}
        </p>
        <p className="body-text mx-auto mt-4 max-w-xs leading-relaxed text-app-text">
          {LEVEL_UP_MESSAGE}
        </p>
      </div>
    </div>
  );
}

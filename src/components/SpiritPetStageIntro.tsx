"use client";

import type { SpiritPetProfile } from "@/lib/types";
import { getStageForLevel } from "@/lib/spirit-pet-growth";

interface SpiritPetStageIntroProps {
  pet: SpiritPetProfile;
  className?: string;
}

/** 「初生灵宠（刚诞生）」等级介绍模块 */
export default function SpiritPetStageIntro({ pet, className = "" }: SpiritPetStageIntroProps) {
  const stage = getStageForLevel(pet.level ?? 1);

  return (
    <div className={`app-card panel-gold relative text-left ${className}`}>
      <div className="rounded-xl px-3 py-2.5 spirit-intro-box">
        <p className="block-title text-app-gold">{stage.introTitle}</p>
        <p className="body-text mt-1.5">
          <span className="font-semibold text-app-accent">定位：</span>
          {stage.introPosition}
        </p>
        <p className="caption mt-1">
          <span className="font-semibold text-app-text">解锁：</span>
          {stage.introUnlocks.join(" · ")}
        </p>
      </div>
    </div>
  );
}

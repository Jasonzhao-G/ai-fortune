"use client";

import type { SpiritPetProfile } from "@/lib/types";

interface SpiritPetDisplayProps {
  pet: SpiritPetProfile;
  personName: string;
  compact?: boolean;
}

export default function SpiritPetDisplay({ pet, personName, compact }: SpiritPetDisplayProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-app-gold/40 bg-gradient-to-br from-app-accent/20 via-app-bg to-app-gold/10 ${compact ? "p-4" : "p-6"} text-center`}>
      <div className="pointer-events-none absolute inset-0 spirit-pet-glow" style={{ background: `radial-gradient(circle at 50% 35%, ${pet.elementColor}33, transparent 65%)` }} />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-app-gold/60 spirit-pet-sparkle" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-1.5 w-1.5 rounded-full bg-white/40 spirit-pet-sparkle-delay" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/3 h-1 w-1 rounded-full bg-app-accent/50 spirit-pet-sparkle" />

      <p className="relative text-[10px] text-app-gold">{personName} 的守护灵宠 · 终生不变</p>
      <div className="relative mx-auto my-3 flex h-28 w-28 items-center justify-center rounded-full border-2 spirit-pet-float"
        style={{ borderColor: pet.elementColor, boxShadow: `0 0 30px ${pet.elementColor}55` }}>
        <span className={`${compact ? "text-5xl" : "text-6xl"} drop-shadow-lg`}>{pet.emoji}</span>
      </div>
      <p className="relative text-2xl font-bold" style={{ color: pet.elementColor }}>{pet.fullName}</p>
      <p className="relative mt-1 text-[10px] text-app-muted">{pet.baziText}</p>
      <span className="relative mt-2 inline-block rounded-full px-2 py-0.5 text-[10px]"
        style={{ background: `${pet.elementColor}22`, color: pet.elementColor }}>
        {pet.element}行 · {pet.category === "zodiac" ? "生肖灵宠" : pet.category === "constellation" ? "星座灵宠" : "上古灵兽"}
      </span>
    </div>
  );
}

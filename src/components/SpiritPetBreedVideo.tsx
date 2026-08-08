"use client";

import { getSpiritBeastAsset } from "@/lib/spirit-beast-assets";

interface SpiritPetBreedVideoProps {
  breedId: string;
  emoji: string;
  className?: string;
}

export default function SpiritPetBreedVideo({
  breedId,
  emoji,
  className = "",
}: SpiritPetBreedVideoProps) {
  const asset = getSpiritBeastAsset(breedId);

  if (asset?.video) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-app-gold/25 bg-gradient-to-b from-app-bg/80 to-black/40 ${className}`}
      >
        <video
          src={asset.video}
          className="mx-auto max-h-[min(52vh,360px)] w-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          controls
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-app-border bg-gradient-to-br from-app-accent/15 to-app-gold/10 ${className}`}
    >
      <span className="text-7xl spirit-pet-float">{emoji}</span>
    </div>
  );
}

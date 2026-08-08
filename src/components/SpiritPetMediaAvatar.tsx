"use client";

import { useState } from "react";
import Image from "next/image";
import { getSpiritBeastAsset } from "@/lib/spirit-beast-assets";

interface SpiritPetMediaAvatarProps {
  breedId: string;
  emoji: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  animate?: boolean;
  /** 有视频素材时优先循环播放（灵宠档案等） */
  preferVideo?: boolean;
}

const SIZE_CLASS = {
  xs: "h-7 w-7 text-sm",
  sm: "h-9 w-9 text-lg",
  md: "h-16 w-16 text-3xl",
  lg: "h-24 w-24 text-5xl",
  xl: "h-28 w-28 text-6xl",
  "2xl": "h-36 w-36 text-7xl",
  "3xl": "h-44 w-44 text-8xl",
} as const;

export default function SpiritPetMediaAvatar({
  breedId,
  emoji,
  size = "md",
  className = "",
  animate = true,
  preferVideo = true,
}: SpiritPetMediaAvatarProps) {
  const asset = getSpiritBeastAsset(breedId);
  const sizeClass = SIZE_CLASS[size];
  const [videoFailed, setVideoFailed] = useState(false);
  const breatheClass = animate ? "spirit-pet-breathe" : "";

  if (preferVideo && asset?.video && !videoFailed) {
    return (
      <div className={`relative overflow-hidden rounded-full bg-black/20 ${sizeClass} ${className}`}>
        <video
          src={asset.video}
          poster={asset.avatar}
          className={`h-full w-full object-cover object-center ${breatheClass}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
        />
      </div>
    );
  }

  if (asset?.avatar) {
    return (
      <div className={`relative overflow-hidden rounded-full ${sizeClass} ${className}`}>
        <Image
          src={asset.avatar}
          alt=""
          fill
          className={`object-cover object-center ${breatheClass}`}
          sizes="112px"
        />
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center ${sizeClass} ${className}`}>
      {emoji}
    </span>
  );
}

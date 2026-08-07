"use client";

import type { SpiritPetProfile } from "@/lib/types";
import { getStageForLevel, formatLevelBadge, formatLevelShort, getLevelTierClass } from "@/lib/spirit-pet-growth";
import { NEED_LABELS } from "@/lib/spirit-pet";

interface SpiritPetDisplayProps {
  pet: SpiritPetProfile;
  personName: string;
  compact?: boolean;
  showWelcome?: boolean;
  onGoAwakening?: () => void;
}

export default function SpiritPetDisplay({
  pet,
  personName,
  compact,
  showWelcome,
  onGoAwakening,
}: SpiritPetDisplayProps) {
  const level = pet.level ?? 1;
  const stage = getStageForLevel(level);
  const needLabel = pet.companionNeed ? NEED_LABELS[pet.companionNeed] : "";

  return (
    <div className={`app-card panel-gold relative overflow-hidden text-center ${compact ? "!p-3" : ""}`}>
      <div
        className="pointer-events-none absolute inset-0 spirit-pet-glow"
        style={{ background: `radial-gradient(circle at 50% 35%, ${pet.elementColor}33, transparent 65%)` }}
      />

      <div className="relative section-card-header !mb-3">
        <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
          <h2 className="panel-title text-app-gold">灵宠档案</h2>
          <span className="caption text-app-muted">· 你的专属 AI 守护灵</span>
        </div>
      </div>

      <p className="relative body-text">
        你好主人，我是你的专属 AI 守护灵 ·{" "}
        <span className="font-semibold" style={{ color: pet.elementColor }}>
          {pet.fullName}
        </span>
      </p>

      <div className="relative mx-auto my-3 w-fit">
        <div
          className={`relative flex items-center justify-center rounded-full border-2 spirit-pet-float spirit-pet-aura ${compact ? "h-24 w-24" : "h-28 w-28"}`}
          style={{
            borderColor: pet.elementColor,
            boxShadow: `0 0 40px ${pet.elementColor}66, inset 0 0 20px ${pet.elementColor}22`,
          }}
        >
          <span className={`${compact ? "text-5xl" : "text-6xl"} drop-shadow-lg spirit-pet-breathe`}>
            {pet.emoji}
          </span>
          <span className="badge badge-gold absolute -left-1 -top-1 !px-1.5 !py-0.5 micro font-bold">
            {formatLevelShort(level)}
          </span>
        </div>
      </div>

      <div className="relative mx-auto mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span className={`spirit-level-name ${getLevelTierClass(level)} gap-1.5 !px-3 !py-1`}>
          <span>{stage.icon}</span>
          <span>{formatLevelBadge(level)}</span>
        </span>
        {onGoAwakening && (
          <button
            type="button"
            onClick={onGoAwakening}
            className="caption font-semibold text-app-accent underline decoration-app-accent/40 underline-offset-2 hover:text-app-gold"
          >
            去觉醒？
          </button>
        )}
      </div>

      <p className="relative block-title" style={{ color: pet.elementColor }}>
        {pet.fullName}
      </p>
      <p className="relative caption mt-0.5">{pet.baziText}</p>

      <div className="relative mt-2.5 flex flex-wrap justify-center gap-1.5">
        <span
          className="chip caption !py-0.5"
          style={{
            background: `${pet.elementColor}22`,
            color: pet.elementColor,
            borderColor: `${pet.elementColor}44`,
          }}
        >
          {pet.element}行 · 上古灵兽
        </span>
        {needLabel && <span className="chip badge-gold caption !py-0.5">{needLabel}</span>}
      </div>
      {pet.companionKeywords && (
        <p className="relative caption mt-1.5">「{pet.companionKeywords}」</p>
      )}
      {showWelcome && (
        <p className="relative caption mt-2 rounded-lg border border-app-gold/20 bg-app-gold/5 px-3 py-2">
          我会随着你的陪伴与成长不断「觉醒」，成为真正懂你的灵魂伙伴。
        </p>
      )}
    </div>
  );
}

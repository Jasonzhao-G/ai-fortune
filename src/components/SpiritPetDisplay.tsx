"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { SpiritPetProfile } from "@/lib/types";
import { getStageForLevel, formatLevelBadge, formatLevelShort, getLevelTierClass } from "@/lib/spirit-pet-growth";
import { NEED_LABELS, PET_BREEDS } from "@/lib/spirit-pet";
import { PET_CATALOG } from "@/lib/pet-catalog";
import SpiritPetMediaAvatar from "@/components/SpiritPetMediaAvatar";
import SpiritPetBreedModal from "@/components/SpiritPetBreedModal";

interface SpiritPetDisplayProps {
  pet: SpiritPetProfile;
  personName: string;
  compact?: boolean;
  showWelcome?: boolean;
  onGoAwakening?: () => void;
  onChangePet?: () => void;
  /** 头像旁「和我互动」入口（灵宠主页显示，对话页隐藏） */
  showInteractLink?: boolean;
}

export default function SpiritPetDisplay({
  pet,
  compact,
  showWelcome,
  onGoAwakening,
  onChangePet,
  showInteractLink = true,
}: SpiritPetDisplayProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"intro" | "skills">("intro");
  const level = pet.level ?? 1;
  const stage = getStageForLevel(level);
  const needLabel = pet.companionNeed ? NEED_LABELS[pet.companionNeed] : "";
  const breed = PET_BREEDS.find((b) => b.breedId === pet.breedId);
  const catalog = PET_CATALOG.find((c) => c.breedId === pet.breedId);

  const avatarShell = compact ? "h-40 w-40" : "h-48 w-48 sm:h-52 sm:w-52";
  const avatarSize = compact ? "2xl" : "3xl";

  return (
    <>
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

        <div className={`relative mx-auto my-3 flex items-end justify-center ${showInteractLink ? "gap-3 sm:gap-4" : ""}`}>
          <button
            type="button"
            onClick={() => { setDetailTab("intro"); setDetailOpen(true); }}
            className="block w-fit rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="戳我了解更多"
          >
            <div
              className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 spirit-pet-float spirit-pet-aura ${avatarShell}`}
              style={{
                borderColor: pet.elementColor,
                boxShadow: `0 0 48px ${pet.elementColor}77, inset 0 0 24px ${pet.elementColor}22`,
              }}
            >
              <SpiritPetMediaAvatar
                breedId={pet.breedId}
                emoji={pet.emoji}
                size={avatarSize}
                className="!h-full !w-full !rounded-full"
              />
              <span className="badge badge-gold absolute left-1 top-1 !px-2 !py-0.5 micro font-bold">
                {formatLevelShort(level)}
              </span>
            </div>
            <p className="caption mt-2 text-app-accent">戳我了解更多~</p>
          </button>

          {showInteractLink && (
            <Link
              href="/ask?from=spirit-pet"
              className="group mb-6 flex shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-app-accent/40 bg-app-accent/15 shadow-sm transition-all group-hover:border-app-accent group-hover:bg-app-accent/25 group-active:scale-95"
                style={{ boxShadow: "0 0 20px rgba(196,92,72,0.15)" }}
              >
                <MessageCircle className="h-7 w-7 text-app-accent" strokeWidth={1.75} />
              </span>
              <span className="rounded-full bg-app-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-app-accent">
                和我互动
              </span>
            </Link>
          )}
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

        <p className="relative block-title text-lg" style={{ color: pet.elementColor }}>
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

        {onChangePet && (
          <div className="relative mt-2 border-t border-app-border/40 pt-3">
            <button type="button" onClick={onChangePet} className="app-btn-outline w-full !py-2.5">
              更换我的守护灵宠
            </button>
          </div>
        )}
      </div>

      {detailOpen && breed && catalog && (
        <SpiritPetBreedModal
          pet={breed}
          catalog={catalog}
          tab={detailTab}
          onClose={() => setDetailOpen(false)}
          onTabChange={setDetailTab}
        />
      )}
    </>
  );
}

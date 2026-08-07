"use client";

import { useState } from "react";
import Link from "next/link";
import type { SpiritPetProfile } from "@/lib/types";
import {
  getStageForLevel,
  getNextAwakening,
  getOverallAwakeningProgress,
  AWAKENING_ROADMAP,
  AWAKENING_STAGES,
  isStageAwakened,
  isAbilityUnlocked,
  getCumulativeAbilities,
  normalizeLevel,
  formatLevelBadge,
  resolveAbilityLink,
  getLevelTierClass,
} from "@/lib/spirit-pet-growth";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import SpiritPetLevelModal from "@/components/SpiritPetLevelModal";
import SpiritPetPowerModal from "@/components/SpiritPetPowerModal";
import Badge from "@/components/ui/Badge";

interface SpiritPetAwakeningPanelProps {
  pet: SpiritPetProfile;
  onGoTasks?: () => void;
}

const LEVEL_CARD_TINT: Record<number, { awake: string; locked: string }> = {
  1: { awake: "border-app-gold/40 bg-app-gold/8", locked: "border-app-border bg-app-bg/20" },
  2: { awake: "border-app-accent/40 bg-app-accent/8", locked: "border-app-border bg-app-bg/20" },
  3: { awake: "border-emerald-500/35 bg-emerald-500/6", locked: "border-app-border bg-app-bg/20" },
  4: { awake: "border-orange-500/35 bg-orange-500/6", locked: "border-app-border bg-app-bg/20" },
  5: { awake: "border-violet-500/35 bg-violet-500/6", locked: "border-app-border bg-app-bg/20" },
  6: { awake: "border-app-gold/50 bg-app-gold/10", locked: "border-app-border bg-app-bg/20" },
};

function AbilityChip({
  ability,
  unlocked,
  href,
}: {
  ability: string;
  unlocked: boolean;
  href: string;
}) {
  const className = `flex min-h-[36px] items-center justify-center rounded-lg border px-2 text-center caption font-medium leading-tight transition-colors ${
    unlocked
      ? "chip-active hover:opacity-90"
      : "border-app-border bg-app-bg/30 text-app-muted opacity-60"
  }`;

  if (!unlocked) {
    return <span className={className}>{ability}</span>;
  }
  return (
    <Link href={href} className={className} onClick={(e) => e.stopPropagation()}>
      {ability}
    </Link>
  );
}

export default function SpiritPetAwakeningPanel({ pet, onGoTasks }: SpiritPetAwakeningPanelProps) {
  const level = normalizeLevel(pet.level ?? 1);
  const spiritPower = pet.spiritPower ?? 0;
  const stage = getStageForLevel(level);
  const next = getNextAwakening(level, spiritPower);
  const overall = getOverallAwakeningProgress(level);
  const [expanded, setExpanded] = useState(false);
  const [modalLevel, setModalLevel] = useState<number | null>(null);
  const [modalTab, setModalTab] = useState<"intro" | "role">("intro");
  const [powerModalOpen, setPowerModalOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  const visibleStages = expanded
    ? AWAKENING_ROADMAP
    : AWAKENING_ROADMAP.filter((s) => s.level === level || s.level === (next?.nextLevel ?? level));

  const cumulativeAbilities = getCumulativeAbilities(level);

  const modalStage = modalLevel != null ? AWAKENING_STAGES.find((s) => s.level === modalLevel) : null;

  const openLevelModal = (lv: number) => {
    setModalTab("intro");
    setModalLevel(lv);
  };

  const handleLevelCardClick = (lv: number) => {
    setActiveLevel((prev) => (prev === lv ? null : lv));
    openLevelModal(lv);
  };

  return (
    <>
      <div className="app-card panel-awakening">
        <div className="section-card-header !items-end">
          <div>
            <h2 className="panel-title text-app-accent">觉醒增长体系</h2>
            <p className="panel-subtitle">积累灵力 · 逐级觉醒 · 解锁陪伴能力</p>
          </div>
        </div>

        {/* 当前阶段 + 灵力 */}
        <div className="mb-4 grid grid-cols-[1fr_auto] items-center gap-3 border-b border-app-border/50 pb-4">
          <div className="min-w-0 space-y-1">
            <p className="block-label text-app-accent">觉醒阶段 · {stage.path}</p>
            <p className="block-title leading-snug">
              <span className={`spirit-level-name ${getLevelTierClass(level)}`}>
                {stage.icon} {formatLevelBadge(level)}
              </span>
            </p>
            <p className="caption text-app-muted">「{stage.tagline}」</p>
            <p className="caption mt-1 text-app-accent">
              已解锁 {cumulativeAbilities.length} 项灵力技能（含此前等级）
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPowerModalOpen(true)}
            className="flex min-w-[76px] flex-col items-center justify-center rounded-xl border border-app-gold/40 bg-app-gold/10 px-3 py-2.5 transition-colors hover:border-app-gold"
          >
            <span className="block-label leading-none">灵力值</span>
            <span className="block-title mt-1 leading-none text-app-gold">{spiritPower}</span>
          </button>
        </div>

        {/* 即将觉醒 */}
        {next ? (
          <div className="mb-4 space-y-2.5 rounded-xl border border-app-accent/25 bg-app-accent/5 p-3">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-3">
              <p className="block-title leading-snug">✨ 即将觉醒 → {next.nextName}</p>
              <p className="caption font-semibold text-app-gold sm:text-right">还差 {next.remaining} 灵力</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-app-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-app-accent to-app-gold transition-all"
                style={{ width: `${next.progress}%` }}
              />
            </div>
            <button type="button" onClick={onGoTasks} className="app-btn app-btn-sm !mb-0 w-full">
              去做任务 →
            </button>
          </div>
        ) : (
          <p className="mb-4 rounded-xl border border-app-gold/30 bg-app-gold/10 p-3 text-center block-title text-app-gold">
            🌌 已达守护神形态，灵魂伙伴完全觉醒
          </p>
        )}

        {/* 觉醒等级 · 总进度 */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="block-title">觉醒等级</p>
          <button
            type="button"
            onClick={() => openLevelModal(level)}
            className="inline-flex shrink-0 items-center gap-1 caption font-semibold text-app-accent"
          >
            <Info className="h-3.5 w-3.5" />
            等级介绍
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-app-border/60 bg-app-bg/30 p-3">
          <div className="caption mb-2 flex items-center justify-between font-medium">
            <span className={`spirit-level-name spirit-level-name-sm ${getLevelTierClass(1)}`}>
              🥉 LV1 初生灵宠
            </span>
            <span className={`spirit-level-name spirit-level-name-sm ${getLevelTierClass(6)}`}>
              👑 LV6 守护神
            </span>
          </div>
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
            {AWAKENING_STAGES.map((s) => (
              <div
                key={s.level}
                className={`flex-1 transition-colors ${level >= s.level ? "bg-gradient-to-r from-app-accent to-app-gold" : "bg-app-border"}`}
                title={`LV${s.level} ${s.name}`}
              />
            ))}
          </div>
          <p className="caption mt-2 text-center font-semibold">
            当前 <span className={`spirit-level-name !py-0 ${getLevelTierClass(level)}`}>{formatLevelBadge(level)}</span>
            {" "}· {overall}%
          </p>
        </div>

        {/* 等级卡片列表 */}
        <div className="space-y-2.5">
          {visibleStages.map((roadStage) => {
            const awakened = isStageAwakened(level, roadStage.level);
            const stageDetail = AWAKENING_STAGES.find((s) => s.level === roadStage.level);
            const tint = LEVEL_CARD_TINT[roadStage.level] ?? LEVEL_CARD_TINT[1];
            const isCurrent = roadStage.level === level;

            return (
              <div
                key={roadStage.level}
                role="button"
                tabIndex={0}
                onClick={() => handleLevelCardClick(roadStage.level)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLevelCardClick(roadStage.level);
                  }
                }}
                className={`spirit-level-card cursor-pointer rounded-xl border p-3 transition-all ${
                  awakened ? tint.awake : tint.locked
                } ${isCurrent ? "ring-1 ring-app-gold/50" : ""} ${
                  activeLevel === roadStage.level ? "spirit-level-card-active" : ""
                }`}
              >
                {/* 标题行：图标 | 名称+状态 | 详情 */}
                <div className="grid grid-cols-[36px_1fr_auto] items-center gap-x-2">
                  <span
                    className={`spirit-level-icon ${getLevelTierClass(roadStage.level)} flex h-9 w-9 items-center justify-center rounded-lg text-lg leading-none`}
                  >
                    {roadStage.icon}
                  </span>
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className={`spirit-level-name spirit-level-name-md ${getLevelTierClass(roadStage.level)}`}>
                      LV{roadStage.level} {roadStage.name}
                    </span>
                    <Badge variant={awakened ? "success" : "muted"} className="!py-0 shrink-0">
                      {awakened ? "已觉醒" : "未觉醒"}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLevelModal(roadStage.level);
                    }}
                    className="caption shrink-0 font-semibold text-app-accent"
                  >
                    详情
                  </button>
                </div>

                {/* 作用 · 与标题列对齐 */}
                {stageDetail && (
                  <div className="mt-2 grid grid-cols-[36px_1fr] gap-x-2 border-b border-app-border/40 pb-2.5">
                    <span aria-hidden className="block" />
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="block-label w-7 shrink-0 text-app-accent">灵力</span>
                      <span className="body-text min-w-0 flex-1 leading-snug">{stageDetail.roleKeywords}</span>
                    </div>
                  </div>
                )}

                {/* 能力按钮 · 与标题列对齐 */}
                <div className={`grid grid-cols-[36px_1fr] gap-x-2 ${stageDetail ? "mt-2.5" : "mt-2"}`}>
                  <span aria-hidden className="block" />
                  <div className="grid grid-cols-2 gap-1.5">
                  {roadStage.abilities.map((ability) => {
                    const link = resolveAbilityLink(ability);
                    return (
                      <AbilityChip
                        key={ability}
                        ability={ability}
                        unlocked={isAbilityUnlocked(level, ability)}
                        href={link.href}
                      />
                    );
                  })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => setExpanded(!expanded)} className="spirit-expand-btn">
          {expanded ? (
            <>
              收起全部等级
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              查看全部 LV1-LV6 等级
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {modalStage && (
        <SpiritPetLevelModal
          stage={modalStage}
          tab={modalTab}
          onClose={() => setModalLevel(null)}
          onTabChange={setModalTab}
        />
      )}
      {powerModalOpen && <SpiritPetPowerModal onClose={() => setPowerModalOpen(false)} />}
    </>
  );
}

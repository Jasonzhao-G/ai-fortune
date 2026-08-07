"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PET_BREEDS } from "@/lib/spirit-pet";
import { PET_CATALOG } from "@/lib/pet-catalog";
import { AWAKENING_ROADMAP } from "@/lib/spirit-pet-growth";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";

interface SpiritPetOnboardingProps {
  onClaim: () => void;
  onReturnToPet?: () => void;
}

export default function SpiritPetOnboarding({ onClaim, onReturnToPet }: SpiritPetOnboardingProps) {
  const [expanded, setExpanded] = useState<string | null>(PET_BREEDS[0]?.breedId ?? null);

  return (
    <>
      {onReturnToPet && (
        <BackLink onClick={onReturnToPet} label="返回到我的专属 AI 灵宠" className="mb-3" />
      )}

      <PageHeader
        title="AI 灵宠"
        subtitle="十二灵兽 · 择一相伴 · 填写命格后匹配专属守护灵"
      />

      <p className="section-label">灵兽图鉴</p>
      <div className="page-section space-y-2">
        {PET_BREEDS.map((pet) => {
          const catalog = PET_CATALOG.find((c) => c.breedId === pet.breedId);
          const open = expanded === pet.breedId;
          return (
            <div key={pet.breedId} className="app-card overflow-hidden !p-0 !mb-2">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : pet.breedId)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-app-accent/20 to-app-gold/10 text-2xl spirit-pet-float">
                  {pet.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="block-title">
                    {pet.baseName}
                    {catalog?.needShort && (
                      <Badge variant="gold" className="ml-1.5 align-middle">{catalog.needShort}</Badge>
                    )}
                  </p>
                  <p className="caption mt-0.5">{pet.keywords}</p>
                  <p className="caption mt-0.5 line-clamp-1 text-app-accent">{pet.lore}</p>
                </div>
                {open ? <ChevronUp className="h-4 w-4 shrink-0 text-app-muted" /> : <ChevronDown className="h-4 w-4 shrink-0 text-app-muted" />}
              </button>

              {open && catalog && (
                <div className="border-t border-app-border bg-app-bg/30 px-3 pb-3 pt-2">
                  <p className="caption mb-2">
                    <span className="font-semibold text-app-text">适合：</span>{catalog.suitableFor}
                  </p>
                  <p className="caption mb-1.5 font-semibold text-app-gold">核心技能</p>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {catalog.skills.map((s) => (
                      <span key={s} className="chip caption !py-0.5">{s}</span>
                    ))}
                  </div>
                  <p className="caption mb-1 font-semibold text-app-gold">觉醒历程</p>
                  <p className="caption leading-relaxed">{catalog.awakeningJourney}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionCard variant="accent" title="通用觉醒进阶" subtitle="所有灵宠共享 · 通过任务积累灵力">
        <div className="space-y-2">
          {AWAKENING_ROADMAP.map((stage) => (
            <div key={stage.level} className="flex gap-2 caption">
              <span className="shrink-0">{stage.icon}</span>
              <span className="shrink-0 font-semibold text-app-gold">LV{stage.level}</span>
              <span className="shrink-0 font-medium text-app-text">{stage.name}</span>
              <span className="text-app-muted">{stage.abilities.join("、")}</span>
            </div>
          ))}
        </div>
        <p className="micro mt-2">非充值升级 · 签到、聊天、测运势、社区互动均可获得灵力</p>
      </SectionCard>

      {!onReturnToPet && (
        <div className="page-section">
          <button type="button" onClick={onClaim} className="app-btn">
            ✨ 领取专属自己的 AI 灵宠
          </button>
          <p className="caption mt-2 text-center">
            填写姓名、生辰、出生地点与性格偏好 · 系统将匹配命格专属灵宠
          </p>
        </div>
      )}
    </>
  );
}

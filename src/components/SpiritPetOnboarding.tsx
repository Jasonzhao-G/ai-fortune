"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PET_BREEDS } from "@/lib/spirit-pet";
import { PET_CATALOG } from "@/lib/pet-catalog";
import { AWAKENING_ROADMAP } from "@/lib/spirit-pet-growth";
import { MAX_PET_SWAPS } from "@/lib/spirit-pet";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import SectionCard from "@/components/ui/SectionCard";
import Badge from "@/components/ui/Badge";
import SpiritPetBreedModal from "@/components/SpiritPetBreedModal";
import SpiritPetMediaAvatar from "@/components/SpiritPetMediaAvatar";

const INITIAL_VISIBLE = 6;

interface SpiritPetOnboardingProps {
  onClaim: () => void;
  onReturnToPet?: () => void;
  /** 更换守护灵模式：图鉴弹窗显示「领养」 */
  swapMode?: boolean;
  remainingSwaps?: number;
  onAdoptBreed?: (breedId: string) => void;
}

export default function SpiritPetOnboarding({
  onClaim,
  onReturnToPet,
  swapMode = false,
  remainingSwaps = 0,
  onAdoptBreed,
}: SpiritPetOnboardingProps) {
  const [showAll, setShowAll] = useState(false);
  const [modalBreedId, setModalBreedId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"intro" | "skills">("intro");

  const visibleBreeds = showAll ? PET_BREEDS : PET_BREEDS.slice(0, INITIAL_VISIBLE);
  const modalPet = PET_BREEDS.find((p) => p.breedId === modalBreedId);
  const modalCatalog = PET_CATALOG.find((c) => c.breedId === modalBreedId);

  const openModal = (breedId: string) => {
    setModalBreedId(breedId);
    setModalTab("intro");
  };

  const adoptHint = swapMode
    ? `每人最多更换 ${MAX_PET_SWAPS} 次 · 当前剩余 ${remainingSwaps} 次`
    : undefined;

  return (
    <>
      {onReturnToPet && (
        <BackLink onClick={onReturnToPet} label="返回到我的专属 AI 灵宠" className="mb-3" />
      )}

      {swapMode && (
        <div className="mb-4 rounded-xl border border-app-gold/35 bg-app-gold/10 px-4 py-3 text-center">
          <p className="block-title text-app-gold">更换守护灵宠</p>
          <p className="caption mt-1 text-app-muted">
            浏览图鉴，选择心仪的灵兽并点击「领养」· 剩余 {remainingSwaps} 次机会
          </p>
        </div>
      )}

      <PageHeader
        title="AI 灵宠"
        subtitle={swapMode ? "择一新灵兽 · 领养后将替换当前守护灵" : "十二灵兽 · 择一相伴 · 填写命格后匹配专属守护灵"}
      />

      <p className="section-label">灵兽图鉴</p>
      <div className="page-section grid grid-cols-3 gap-2">
        {visibleBreeds.map((pet) => {
          const catalog = PET_CATALOG.find((c) => c.breedId === pet.breedId);
          return (
            <button
              key={pet.breedId}
              type="button"
              onClick={() => openModal(pet.breedId)}
              className="app-card flex flex-col items-center !p-3 text-center transition-transform hover:scale-[1.02]"
            >
              <div className="mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-app-accent/20 to-app-gold/10 spirit-pet-float">
                <SpiritPetMediaAvatar breedId={pet.breedId} emoji={pet.emoji} size="lg" className="!h-full !w-full !rounded-xl" />
              </div>
              <p className="block-title text-[13px]">{pet.baseName}</p>
              {catalog?.needShort && (
                <Badge variant="gold" className="mt-1 !text-[10px]">{catalog.needShort}</Badge>
              )}
              <p className="caption mt-1 line-clamp-2 text-[10px]">{pet.keywords}</p>
            </button>
          );
        })}
      </div>

      {!showAll && PET_BREEDS.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="app-btn-outline mx-auto mb-4 flex max-w-xs items-center justify-center gap-1"
        >
          <ChevronDown className="h-4 w-4" />
          展开全部 {PET_BREEDS.length} 只灵兽图鉴
        </button>
      )}

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
        <p className="micro mt-2">签到、聊天、测运势、社区互动均可获得灵力</p>
      </SectionCard>

      {!onReturnToPet && !swapMode && (
        <div className="page-section">
          <button type="button" onClick={onClaim} className="app-btn">
            ✨ 领取专属自己的 AI 灵宠
          </button>
          <p className="caption mt-2 text-center">
            填写姓名、生辰、出生地点与性格偏好 · 系统将匹配命格专属灵宠
          </p>
        </div>
      )}

      {modalPet && modalCatalog && (
        <SpiritPetBreedModal
          pet={modalPet}
          catalog={modalCatalog}
          tab={modalTab}
          onClose={() => setModalBreedId(null)}
          onTabChange={setModalTab}
          showAdopt={swapMode && !!onAdoptBreed && remainingSwaps > 0}
          onAdopt={
            onAdoptBreed && modalBreedId
              ? () => {
                  onAdoptBreed(modalBreedId);
                  setModalBreedId(null);
                }
              : undefined
          }
          adoptHint={adoptHint}
        />
      )}
    </>
  );
}

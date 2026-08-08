"use client";

import { X } from "lucide-react";
import { PET_BREEDS } from "@/lib/spirit-pet";
import { PET_CATALOG } from "@/lib/pet-catalog";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Badge from "@/components/ui/Badge";
import SpiritPetMediaAvatar from "@/components/SpiritPetMediaAvatar";
import SpiritPetBreedVideo from "@/components/SpiritPetBreedVideo";

type PetBreed = (typeof PET_BREEDS)[number];
type PetCatalogEntry = (typeof PET_CATALOG)[number];

interface SpiritPetBreedModalProps {
  pet: PetBreed;
  catalog: PetCatalogEntry;
  tab: "intro" | "skills";
  onClose: () => void;
  onTabChange: (tab: "intro" | "skills") => void;
  /** 图鉴更换模式：显示领养按钮 */
  showAdopt?: boolean;
  onAdopt?: () => void;
  adoptHint?: string;
}

export default function SpiritPetBreedModal({
  pet,
  catalog,
  tab,
  onClose,
  onTabChange,
  showAdopt,
  onAdopt,
  adoptHint,
}: SpiritPetBreedModalProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-app-border bg-app-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <SpiritPetMediaAvatar breedId={pet.breedId} emoji={pet.emoji} size="md" />
            <div>
              <p className="heading-3">{pet.baseName}</p>
              <p className="caption">{pet.displayName} · {pet.keywords}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-app-muted hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge variant="gold">{catalog.needShort}</Badge>
          <span className="chip caption !py-0.5">{pet.companionNeed && "上古灵兽"}</span>
        </div>

        <SegmentedControl
          value={tab}
          options={[
            { id: "intro" as const, label: "灵兽介绍" },
            { id: "skills" as const, label: "技能与觉醒" },
          ]}
          onChange={onTabChange}
          className="!mb-4"
        />

        <SpiritPetBreedVideo breedId={pet.breedId} emoji={pet.emoji} className="mb-4 min-h-[200px]" />

        {tab === "intro" ? (
          <div className="space-y-3 body-text">
            <p className="heading-3 text-app-gold">{pet.displayName}</p>
            <p><span className="font-semibold text-app-text">传说：</span>{pet.lore}</p>
            <p><span className="font-semibold text-app-text">适合：</span>{catalog.suitableFor}</p>
            <div className="rounded-xl border border-app-gold/30 bg-app-gold/5 p-3">
              <p className="caption mb-2 font-semibold text-app-gold">陪伴关键词</p>
              <p className="caption">{pet.keywords}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 body-text">
            <div>
              <p className="mb-2 font-semibold text-app-gold">核心技能</p>
              <div className="flex flex-wrap gap-2">
                {catalog.skills.map((s) => (
                  <span key={s} className="chip chip-active caption !py-0.5">{s}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-app-accent/30 bg-app-accent/5 p-3">
              <p className="caption mb-2 font-semibold text-app-accent">觉醒历程</p>
              <p className="caption leading-relaxed">{catalog.awakeningJourney}</p>
            </div>
          </div>
        )}

        {showAdopt && onAdopt && (
          <div className="mt-4 border-t border-app-border pt-4">
            {adoptHint && <p className="caption mb-2 text-center text-app-muted">{adoptHint}</p>}
            <button type="button" onClick={onAdopt} className="app-btn w-full">
              ✨ 领养 {pet.baseName}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

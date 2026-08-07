"use client";

import { X } from "lucide-react";
import { AWAKENING_STAGES, LEVEL_UP_COST, formatLevelBadge } from "@/lib/spirit-pet-growth";

interface SpiritPetPowerModalProps {
  onClose: () => void;
}

export default function SpiritPetPowerModal({ onClose }: SpiritPetPowerModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-app-border bg-app-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="heading-3">升级条件 · 灵力值</p>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-app-muted hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="body-text mb-4">每升一级需额外积累对应灵力</p>
        <div className="space-y-2">
          {AWAKENING_STAGES.map((stage) => {
            const cost = LEVEL_UP_COST[stage.level];
            return (
              <div key={stage.level} className="flex items-center justify-between rounded-xl border border-app-border bg-app-bg/50 px-3 py-2.5">
                <span className="flex items-center gap-2 subsection-title">
                  <span>{stage.icon}</span>
                  {formatLevelBadge(stage.level)}
                </span>
                <span className="caption font-semibold text-app-gold">
                  {stage.level === 1 ? "初始阶段" : `升级需 ${cost} 灵力`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="caption mt-4">
          LV1→LV2：500 · LV2→LV3：600 · LV3→LV4：700 · LV4→LV5：800 · LV5→LV6：900
        </p>
      </div>
    </div>
  );
}

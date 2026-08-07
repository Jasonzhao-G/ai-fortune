"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { AwakeningStage } from "@/lib/spirit-pet-growth";
import { resolveAbilityLink } from "@/lib/spirit-pet-growth";
import SegmentedControl from "@/components/ui/SegmentedControl";

interface SpiritPetLevelModalProps {
  stage: AwakeningStage;
  tab: "intro" | "role";
  onClose: () => void;
  onTabChange: (tab: "intro" | "role") => void;
}

export default function SpiritPetLevelModal({ stage, tab, onClose, onTabChange }: SpiritPetLevelModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-app-border bg-app-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{stage.icon}</span>
            <div>
              <p className="heading-3">LV{stage.level} · {stage.name}</p>
              <p className="caption">{stage.path} · {stage.tagline}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-app-muted hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <SegmentedControl
          value={tab}
          options={[
            { id: "intro" as const, label: "成长体系介绍" },
            { id: "role" as const, label: "陪伴型作用" },
          ]}
          onChange={onTabChange}
          className="!mb-4"
        />

        {tab === "intro" ? (
          <div className="space-y-3 body-text">
            <p className="heading-3 text-app-gold">{stage.introTitle}</p>
            <p><span className="font-semibold text-app-text">定位：</span>{stage.introPosition}</p>
            <div>
              <p className="mb-1 font-semibold text-app-text">解锁功能</p>
              <ul className="space-y-1">
                {stage.introUnlocks.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-app-text">
                    <span className="text-app-accent">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            {stage.introExamples.length > 0 && (
              <div className="rounded-xl border border-app-gold/30 bg-app-gold/5 p-3">
                <p className="caption mb-2 font-semibold text-app-gold">功能示例</p>
                {stage.introExamples.map((ex) => (
                  <p key={ex} className="caption mb-1.5 last:mb-0">· {ex}</p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 body-text">
            <p><span className="font-semibold text-app-text">关键词：</span>{stage.roleKeywords}</p>
            <div>
              <p className="mb-1 font-semibold text-app-text">核心能力</p>
              <div className="flex flex-wrap gap-2">
                {stage.roleAbilities.map((item) => {
                  const link = resolveAbilityLink(item);
                  return (
                    <Link key={item} href={link.href} className="chip chip-active caption !py-0.5">
                      {item}
                    </Link>
                  );
                })}
              </div>
            </div>
            {stage.roleExamples.length > 0 && (
              <div className="rounded-xl border border-app-accent/30 bg-app-accent/5 p-3">
                <p className="caption mb-2 font-semibold text-app-accent">陪伴示例</p>
                {stage.roleExamples.map((ex) => (
                  <p key={ex} className="caption mb-1.5 last:mb-0">· {ex}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

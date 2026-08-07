"use client";

import { getUnlockedCapabilities, getLockedCapabilities, getStageForLevel } from "@/lib/spirit-pet-growth";

interface SpiritPetCapabilitiesProps {
  level: number;
}

export default function SpiritPetCapabilities({ level }: SpiritPetCapabilitiesProps) {
  const unlocked = getUnlockedCapabilities(level);
  const locked = getLockedCapabilities(level);
  const stage = getStageForLevel(level);

  return (
    <div className="app-card mb-4">
      <p className="mb-2 text-xs font-medium text-app-text">
        {stage.name} 已解锁能力
        <span className="ml-1 text-[10px] font-normal text-app-muted">（{unlocked.length} 项）</span>
      </p>
      <div className="space-y-2">
        {unlocked.slice(-6).map((cap) => (
          <div key={cap.title} className="flex items-start gap-2 rounded-xl border border-app-border/60 bg-app-bg/30 p-2">
            <span className="text-base">{cap.icon}</span>
            <div>
              <p className="text-[11px] font-medium text-app-text">{cap.title}</p>
              <p className="text-[10px] text-app-muted">{cap.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {locked.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-xs font-medium text-app-muted">下一阶即将觉醒</p>
          <div className="space-y-1.5 opacity-60">
            {locked.map((cap) => (
              <div key={cap.title} className="flex items-center gap-2 rounded-lg border border-dashed border-app-border px-2 py-1.5">
                <span>{cap.icon}</span>
                <span className="text-[10px] text-app-muted">{cap.title} · Lv{cap.minLevel} 觉醒</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

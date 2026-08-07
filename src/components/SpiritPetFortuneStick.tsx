"use client";

import { useState, useEffect } from "react";
import type { SpiritPetProfile } from "@/lib/types";
import {
  canDrawFortuneStickToday,
  drawFortuneStick,
  getSavedFortuneStick,
  saveFortuneStickResult,
  type FortuneStick,
} from "@/lib/spirit-pet-tasks";
import { hashBirth } from "@/lib/fortune-chart";
import type { BirthInfo } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";

interface SpiritPetFortuneStickProps {
  pet: SpiritPetProfile;
  personKey: string;
  birth: BirthInfo;
}

export default function SpiritPetFortuneStick({ pet, personKey, birth }: SpiritPetFortuneStickProps) {
  const [drawing, setDrawing] = useState(false);
  const [stick, setStick] = useState<FortuneStick | null>(null);
  const [canDraw, setCanDraw] = useState(true);

  useEffect(() => {
    const saved = getSavedFortuneStick(personKey);
    if (saved) {
      setStick(saved);
      setCanDraw(false);
    } else {
      setCanDraw(canDrawFortuneStickToday(personKey));
    }
  }, [personKey]);

  const handleDraw = () => {
    if (!canDraw || drawing) return;
    setDrawing(true);
    setTimeout(() => {
      const seed = hashBirth(birth) + Date.now();
      const result = drawFortuneStick(personKey, seed);
      saveFortuneStickResult(personKey, result);
      setStick(result);
      setCanDraw(false);
      setDrawing(false);
    }, 1800);
  };

  return (
    <SectionCard
      id="fortune-stick"
      variant="fortune"
      title="今日灵签"
      subtitle={`${pet.fullName} 为你解签 · 每日一签`}
      className="scroll-mt-4"
      action={<span className="text-2xl">🏮</span>}
    >

      {!stick && !drawing && canDraw && (
        <button
          onClick={handleDraw}
          className="relative mx-auto flex h-32 w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-app-gold/50 bg-gradient-to-b from-app-gold/10 to-transparent transition-transform active:scale-95"
        >
          <div className="spirit-pet-shimmer absolute inset-0 opacity-30" />
          <span className="relative text-4xl">🎋</span>
          <p className="relative mt-2 block-title text-app-gold">点击摇签</p>
          <p className="relative caption">心诚则灵</p>
        </button>
      )}

      {drawing && (
        <div className="flex h-32 flex-col items-center justify-center rounded-2xl bg-app-bg/50">
          <div className="animate-bounce text-4xl">🎋</div>
          <p className="caption text-app-gold spirit-pet-shimmer">灵签摇动中…</p>
        </div>
      )}

      {stick && (
        <div className="rounded-2xl border border-app-gold/30 bg-gradient-to-br from-app-gold/10 to-app-card p-4 text-center">
          <p className="caption text-app-gold">第 {stick.id} 签 · {stick.grade}签</p>
          <p className="block-title mt-1">{stick.title}</p>
          <p className="body-text mt-2 italic text-app-muted">{stick.poem}</p>
          <div className="mt-3 rounded-xl bg-app-bg/40 p-2.5 text-left">
            <p className="block-label text-app-gold">解签</p>
            <p className="body-text mt-1">{stick.meaning}</p>
            <p className="caption mt-2">💡 {stick.tip}</p>
          </div>
          {!canDraw && <p className="micro mt-2">明日再来求签</p>}
        </div>
      )}
    </SectionCard>
  );
}

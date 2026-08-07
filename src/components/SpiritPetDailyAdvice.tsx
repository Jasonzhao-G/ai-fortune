"use client";

import { useMemo } from "react";
import type { BirthInfo, SpiritPetProfile } from "@/lib/types";
import { generateSpiritPetAdvice } from "@/lib/spirit-pet";
import SectionCard from "@/components/ui/SectionCard";

interface SpiritPetDailyAdviceProps {
  pet: SpiritPetProfile;
  birth: BirthInfo;
}

/** 今日运势指引 · 命盘解读（穿搭 / 吉位 / 事业等） */
export default function SpiritPetDailyAdvice({ pet, birth }: SpiritPetDailyAdviceProps) {
  const advice = useMemo(() => generateSpiritPetAdvice(birth, pet, "day"), [birth, pet]);

  return (
    <SectionCard
      id="daily-fortune-guide"
      variant="fortune"
      title="今日运势指引"
      subtitle={`${pet.fullName} 结合你的命盘 · 穿搭吉位事业建议`}
      className="mt-3 scroll-mt-4"
    >
      <div className="rounded-xl border border-app-gold/25 bg-gradient-to-br from-app-gold/8 to-transparent p-3.5">
        <p className="body-text whitespace-pre-line leading-relaxed">
          {pet.emoji} {advice.summary}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {advice.sections.map((sec) => (
          <div
            key={sec.label}
            className="rounded-xl border border-app-border/60 bg-app-bg/40 px-3 py-2.5 text-left"
          >
            <p className="block-label text-app-gold">{sec.label}</p>
            <p className="caption mt-1 leading-snug text-app-text">{sec.text}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

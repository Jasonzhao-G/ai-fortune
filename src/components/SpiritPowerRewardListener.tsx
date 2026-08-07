"use client";

import { useEffect, useState } from "react";
import SpiritPowerRewardToast from "@/components/SpiritPowerRewardToast";
import { resolveSpiritPetPageState } from "@/lib/spirit-pet-page-state";
import type { SpiritPetProfile } from "@/lib/types";

/** 全局监听灵力任务完成，展示感谢弹窗 */
export default function SpiritPowerRewardListener() {
  const [pet, setPet] = useState<SpiritPetProfile | null>(null);
  const [gain, setGain] = useState<number | null>(null);

  useEffect(() => {
    const onGain = (e: Event) => {
      const detail = (e as CustomEvent<{ gain: number }>).detail;
      if (typeof detail?.gain !== "number" || detail.gain <= 0) return;
      const snap = resolveSpiritPetPageState();
      if (snap.pet?.claimed) {
        setPet(snap.pet);
        setGain(detail.gain);
      }
    };
    window.addEventListener("spirit-power-gained", onGain);
    return () => window.removeEventListener("spirit-power-gained", onGain);
  }, []);

  return (
    <SpiritPowerRewardToast
      pet={pet}
      gain={gain}
      onDone={() => {
        setGain(null);
        window.dispatchEvent(new CustomEvent("spirit-pet-refresh"));
      }}
    />
  );
}

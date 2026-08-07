"use client";

import { useCallback, useEffect, useState } from "react";
import type { SpiritPetProfile } from "@/lib/types";
import SpiritPetLevelUpModal from "@/components/SpiritPetLevelUpModal";

interface LevelUpDetail {
  pet: SpiritPetProfile;
  newLevel: number;
}

export default function SpiritPetLevelUpListener() {
  const [detail, setDetail] = useState<LevelUpDetail | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { pet, newLevel } = (e as CustomEvent<LevelUpDetail>).detail;
      if (pet && newLevel) setDetail({ pet, newLevel });
    };
    window.addEventListener("spirit-pet-level-up", handler);
    return () => window.removeEventListener("spirit-pet-level-up", handler);
  }, []);

  const close = useCallback(() => setDetail(null), []);

  if (!detail) return null;

  return (
    <SpiritPetLevelUpModal pet={detail.pet} newLevel={detail.newLevel} onClose={close} />
  );
}

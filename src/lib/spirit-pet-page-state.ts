import type { BirthInfo, SpiritPetAdvice, SpiritPetProfile } from "./types";
import { getEffectiveBirthInfo, normalizeBirthInfo, isValidBirthInfo } from "./birth-store";
import { getPrimaryPerson, getActivePersonId } from "./person-store";
import { getPersonKey, getOrCreateSpiritPet, generateSpiritPetAdvice } from "./spirit-pet";

export type SpiritPetPagePhase = "initializing" | "onboarding" | "claim" | "generating" | "companion";

export interface SpiritPetPageSnapshot {
  phase: SpiritPetPagePhase;
  pet: SpiritPetProfile | null;
  birth: BirthInfo | null;
  personKey: string;
  personName: string;
  advice: SpiritPetAdvice | null;
}

const EMPTY: SpiritPetPageSnapshot = {
  phase: "initializing",
  pet: null,
  birth: null,
  personKey: "",
  personName: "主人",
  advice: null,
};

/** 同步解析当前应展示的灵宠页（避免先闪图鉴再进主页） */
export function resolveSpiritPetPageState(): SpiritPetPageSnapshot {
  if (typeof window === "undefined") return EMPTY;

  try {
    const primary = getPrimaryPerson();
    const raw = primary?.birthInfo ?? getEffectiveBirthInfo();
    if (!raw || !isValidBirthInfo(raw)) {
      return { ...EMPTY, phase: "onboarding" };
    }

    const birth = normalizeBirthInfo(raw);
    const personKey = getPersonKey(getActivePersonId(), birth);
    const profile = getOrCreateSpiritPet(personKey, birth);

    if (!profile?.claimed) {
      return { ...EMPTY, phase: "onboarding" };
    }

    return {
      phase: "companion",
      pet: profile,
      birth,
      personKey,
      personName: primary?.name ?? birth.name ?? "主人",
      advice: generateSpiritPetAdvice(birth, profile, "day"),
    };
  } catch {
    return { ...EMPTY, phase: "onboarding" };
  }
}

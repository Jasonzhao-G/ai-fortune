"use client";

import { AppProvider } from "@/context/AppContext";
import SpiritPowerRewardListener from "@/components/SpiritPowerRewardListener";
import SpiritPetLevelUpListener from "@/components/SpiritPetLevelUpListener";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
      <SpiritPowerRewardListener />
      <SpiritPetLevelUpListener />
    </AppProvider>
  );
}

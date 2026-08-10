"use client";

import { useState, useCallback, useEffect } from "react";
import BirthForm from "@/components/BirthForm";
import GenerationOverlay from "@/components/GenerationOverlay";
import AnalysisPanel from "@/components/AnalysisPanel";
import PaywallModal from "@/components/PaywallModal";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import BoostFortuneButton from "@/components/BoostFortuneButton";
import { calculateBazi } from "@/lib/bazi";
import { getMockBaziAnalysis } from "@/lib/mock-analysis";
import { canUse, incrementUsage, getRemaining } from "@/lib/user-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "@/lib/record-store";
import { saveBirthInfo } from "@/lib/birth-store";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import { saveSessionResult, loadSessionResult, clearSessionResult } from "@/lib/session-result-cache";
import type { BirthInfo, BaziResult } from "@/lib/types";

interface BaziSessionState {
  birthInfo: BirthInfo;
  bazi: BaziResult;
}

export default function BaziHubPanel() {
  const [phase, setPhase] = useState<"form" | "generating" | "result">("form");
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [bazi, setBazi] = useState<BaziResult | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);
  const remaining = getRemaining("lifekline");

  useEffect(() => {
    const cached = loadSessionResult<BaziSessionState>("bazi");
    if (cached?.birthInfo && cached.bazi) {
      setBirthInfo(cached.birthInfo);
      setBazi(cached.bazi);
      setPhase("result");
    }
  }, []);

  const handleSubmit = (info: BirthInfo) => {
    if (!ensurePrimaryPersonBeforeCalc()) {
      setPrimaryModal(true);
      return;
    }
    if (!canUse("lifekline")) {
      setPaywall(true);
      return;
    }
    setBirthInfo(info);
    setPhase("generating");
  };

  const onGenerateComplete = useCallback(() => {
    if (!birthInfo) return;
    try {
      const baziResult = calculateBazi(birthInfo);
      const analysis = getMockBaziAnalysis(baziResult);
      setBazi(baziResult);
      incrementUsage("lifekline");
      saveBirthInfo(birthInfo);
      const personName = birthInfo.name || `命理者${birthInfo.year}`;
      saveRecord({
        type: "bazi",
        personKey: buildPersonKey(personName, birthInfo),
        personName,
        personLabel: buildPersonLabel(personName, birthInfo),
        title: "八字排盘",
        summary: analysis.summary,
        data: { birthInfo, bazi: baziResult, analysis },
      });
      saveSessionResult("bazi", { birthInfo, bazi: baziResult });
      setPhase("result");
    } catch (err) {
      console.error("bazi generate failed", err);
      setPhase("form");
    }
  }, [birthInfo]);

  if (phase === "generating") {
    return (
      <div className="relative min-h-[320px]">
        <GenerationOverlay
          embedded
          onComplete={onGenerateComplete}
          duration={5000}
          title="正在排盘"
          icon="☯"
        />
      </div>
    );
  }

  if (phase === "result" && bazi && birthInfo) {
    return (
      <div className="page-section">
        <p className="caption mb-3 text-app-muted">
          四柱八字 · 命格解读 · 剩余免费 {remaining} 次
        </p>
        <AnalysisPanel result={getMockBaziAnalysis(bazi)} bazi={bazi} />
        <div className="mt-4 space-y-2">
          <BoostFortuneButton />
          <button
            type="button"
            onClick={() => {
              clearSessionResult("bazi");
              setPhase("form");
              setBazi(null);
              setBirthInfo(null);
            }}
            className="app-btn-outline w-full"
          >
            重新排盘
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="caption mb-3 text-app-muted">
        四柱八字 · 独立排盘测算 · 剩余免费 {remaining} 次
      </p>
      <div className="app-card mb-4">
        <BirthForm onSubmit={handleSubmit} submitLabel="生成八字排盘" />
      </div>
      <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="八字排盘" />
      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
    </>
  );
}

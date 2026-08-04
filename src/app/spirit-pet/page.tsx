"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, UserCircle, RefreshCw } from "lucide-react";
import { getActivePerson, getActivePersonId, getPrimaryPerson, hasPrimaryPerson } from "@/lib/person-store";
import {
  SPIRIT_PERIODS, generateSpiritPetAdvice, getOrCreateSpiritPet, getPersonKey,
  getPetAlternatives, changeSpiritPet, getRemainingSwaps, getDestinedPet, MAX_PET_SWAPS,
} from "@/lib/spirit-pet";
import type { SpiritPetPeriod, SpiritPetAdvice, SpiritPetProfile, BirthInfo } from "@/lib/types";
import { getEffectiveBirthInfo, loadBirthInfo, isValidBirthInfo, normalizeBirthInfo } from "@/lib/birth-store";
import { updateUser } from "@/lib/user-store";
import { getTotalUses, getPetFoodBalance, hasUnlimitedAccess } from "@/lib/pet-food-store";
import { useApp } from "@/context/AppContext";
import SpiritPetDisplay from "@/components/SpiritPetDisplay";
import ReportPosterButton, { SharePosterButton } from "@/components/ReportPosterButton";
import BuyFoodModal from "@/components/BuyFoodModal";
import SpiritPetErrorBoundary from "@/components/SpiritPetErrorBoundary";
import ConfirmModal from "@/components/ConfirmModal";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import { DEMO_SPIRIT_PET, DEMO_SPIRIT_PET_PROFILE, DEMO_SPIRIT_PET_ADVICE } from "@/lib/demo-data";

function SpiritPetPageContent() {
  const { refreshUser } = useApp();
  const [period, setPeriod] = useState<SpiritPetPeriod>("day");
  const [advice, setAdvice] = useState<SpiritPetAdvice | null>(DEMO_SPIRIT_PET_ADVICE);
  const [pet, setPet] = useState<SpiritPetProfile | null>(DEMO_SPIRIT_PET_PROFILE);
  const [alternatives, setAlternatives] = useState<SpiritPetProfile[]>([]);
  const [personName, setPersonName] = useState(DEMO_SPIRIT_PET.personName);
  const [birth, setBirth] = useState<BirthInfo | null>(null);
  const [personKey, setPersonKey] = useState("");
  const [avatarTip, setAvatarTip] = useState<string | null>(null);
  const [showSwap, setShowSwap] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [remainingSwaps, setRemainingSwaps] = useState(MAX_PET_SWAPS);
  const [buyOpen, setBuyOpen] = useState(false);
  const [foodKey, setFoodKey] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [swapConfirm, setSwapConfirm] = useState<SpiritPetProfile | null>(null);
  const [swapTip, setSwapTip] = useState<string | null>(null);
  const [primaryModal, setPrimaryModal] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  const requirePrimary = () => {
    if (hasPrimaryPerson()) return true;
    setPrimaryModal(true);
    return false;
  };

  const showDemo = () => {
    setDemoMode(true);
    setLoadError(null);
    setPet(DEMO_SPIRIT_PET_PROFILE);
    setBirth(null);
    setPersonKey("");
    setPersonName(DEMO_SPIRIT_PET.personName);
    setAdvice(DEMO_SPIRIT_PET_ADVICE);
    setRemainingSwaps(MAX_PET_SWAPS);
  };

  const loadPet = () => {
    try {
      if (!hasPrimaryPerson()) {
        showDemo();
        return;
      }
      setDemoMode(false);
      const primary = getPrimaryPerson();
      const active = getActivePerson();
      const raw = primary?.birthInfo ?? active?.birthInfo ?? getEffectiveBirthInfo() ?? loadBirthInfo();
      if (!raw || !isValidBirthInfo(raw)) {
        showDemo();
        return;
      }
      const b = normalizeBirthInfo(raw);
      const pk = getPersonKey(getActivePersonId(), b);
      const profile = getOrCreateSpiritPet(pk, b);
      setLoadError(null);
      setBirth(b);
      setPersonKey(pk);
      setPersonName(primary?.name ?? active?.name ?? b.name ?? "测算人");
      setPet(profile);
      setAlternatives([]);
      setRemainingSwaps(getRemainingSwaps(pk));
      setAdvice(generateSpiritPetAdvice(b, profile, period));
    } catch (err) {
      console.error("load spirit pet failed", err);
      showDemo();
    }
  };

  useEffect(() => { loadPet(); }, [period, foodKey]);

  useEffect(() => {
    if (demoMode || !showSwap || !birth || !personKey) {
      setAlternatives([]);
      return;
    }
    try {
      setAlternatives(getPetAlternatives(personKey, birth));
    } catch {
      setAlternatives([]);
    }
  }, [demoMode, showSwap, birth, personKey]);

  let foodUses = "0";
  try {
    const foodBalance = getPetFoodBalance();
    foodUses = hasUnlimitedAccess(foodBalance) ? "∞" : String(getTotalUses(foodBalance));
  } catch {
    foodUses = "0";
  }

  const handleSetAvatar = () => {
    if (!requirePrimary()) return;
    if (!pet?.avatarDataUrl) return;
    updateUser({ avatar: pet.avatarDataUrl });
    refreshUser();
    setAvatarTip("已将灵宠设为头像，长久守护您～");
    setTimeout(() => setAvatarTip(null), 2500);
  };

  const handleSwapClick = (alt: SpiritPetProfile) => {
    if (!requirePrimary()) return;
    setSwapError(null);
    setSwapConfirm(alt);
  };

  const handleOpenSwap = () => {
    if (!requirePrimary()) return;
    setSwapError(null);
    setShowSwap(!showSwap);
  };

  const handleConfirmSwap = () => {
    if (!birth || !swapConfirm) return;
    const result = changeSpiritPet(personKey, swapConfirm);
    if (!result.ok || !result.pet) {
      setSwapError(result.error ?? "更换失败");
      setSwapConfirm(null);
      return;
    }
    const left = getRemainingSwaps(personKey);
    setSwapError(null);
    setPet(result.pet);
    setAdvice(generateSpiritPetAdvice(birth, result.pet, period));
    setShowSwap(false);
    setSwapConfirm(null);
    setRemainingSwaps(left);
    setSwapTip(left > 0 ? `更换成功！您还可更换 ${left} 次` : "更换成功！更换次数已用完");
    setTimeout(() => setSwapTip(null), 3000);
  };

  const handlePeriodChange = (id: SpiritPetPeriod) => {
    if (demoMode && !requirePrimary()) return;
    setPeriod(id);
  };

  if (loadError) {
    return (
      <div className="px-4 pb-4 pt-8 text-center">
        <p className="mb-4 text-sm text-red-400">{loadError}</p>
        <Link href="/records" className="app-btn inline-block">去检查测算人</Link>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="px-4 pb-4 pt-8 text-center">
        <p className="mb-4 text-sm text-app-muted">灵宠数据加载中…</p>
      </div>
    );
  }

  const reportSummary = advice?.sections?.length
    ? `${advice.summary}\n\n${advice.sections.map((s) => `${s.label}：${s.text}`).join("\n")}`
    : pet.reason;

  return (
    <div className="px-4 pb-4">
      <Link href="/records" className="mb-3 inline-flex items-center gap-1 text-xs text-app-accent">
        <ChevronLeft className="h-4 w-4" /> 返回我的测算
      </Link>

      {demoMode && (
        <div className="app-card mb-3 border-app-gold/30 bg-app-gold/5 text-center">
          <p className="text-[11px] leading-relaxed text-app-muted">
            当前为<strong className="text-app-text">示例展示</strong>。添加主测算人「我」后，可生成专属守护灵宠与命格建议。
          </p>
          <button onClick={() => setPrimaryModal(true)} className="mt-2 text-[11px] text-app-accent">
            去添加主测算人 →
          </button>
        </div>
      )}

      <div className="app-card mb-4 flex items-center justify-between border-app-gold/30 bg-gradient-to-r from-app-gold/10 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍖</span>
          <div>
            <p className="text-xs font-medium text-app-text">宠物粮余额</p>
            <p className="text-lg font-bold text-app-gold">{foodUses} 次</p>
          </div>
        </div>
        <button onClick={() => setBuyOpen(true)} className="rounded-xl bg-app-accent px-3 py-1.5 text-[10px] text-white">
          买粮
        </button>
      </div>

      <SpiritPetDisplay pet={pet} personName={personName} />

      <button
        onClick={handleOpenSwap}
        disabled={demoMode || remainingSwaps <= 0}
        className="mt-3 flex w-full items-center justify-center gap-1 text-[11px] text-app-accent disabled:opacity-40">
        <RefreshCw className="h-3.5 w-3.5" />
        {demoMode ? "添加主测算人后可更换品种" : remainingSwaps > 0 ? "不喜欢这个灵宠？更换品种" : "更换次数已用完"}
      </button>
      {!demoMode && (
        <p className="mt-1 text-center text-[10px] text-app-muted">
          剩余更换次数 {remainingSwaps}/{MAX_PET_SWAPS} · 每人最多更换 2 次
        </p>
      )}

      {swapTip && <p className="mt-1 text-center text-[10px] text-app-accent">{swapTip}</p>}
      {swapError && <p className="mt-1 text-center text-[10px] text-red-400">{swapError}</p>}

      {showSwap && !demoMode && remainingSwaps > 0 && alternatives.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {alternatives.map((alt) => (
            <button key={alt.breedId} onClick={() => handleSwapClick(alt)}
              className="app-card !p-2 text-center transition-colors hover:border-app-gold">
              <span className="text-2xl">{alt.emoji}</span>
              <p className="mt-1 text-[9px] font-medium text-app-gold">{alt.baseName}</p>
              <p className="text-[8px] text-app-muted">{alt.fullName}</p>
            </button>
          ))}
        </div>
      )}

      <div className="app-card mt-4">
        <p className="mb-2 text-xs font-medium text-app-gold">为什么您的守护灵宠是 {pet.fullName}？</p>
        <p className="text-[11px] leading-relaxed text-app-muted">{pet.reason}</p>
      </div>

      <button onClick={handleSetAvatar}
        className="app-btn-secondary mt-3 flex items-center justify-center gap-2">
        <UserCircle className="h-4 w-4" /> 将灵宠设为头像
      </button>
      {avatarTip && <p className="mt-2 text-center text-[11px] text-app-accent">{avatarTip}</p>}

      <div className="mb-4 mt-5 flex flex-wrap gap-1.5">
        {SPIRIT_PERIODS.map(({ id, label }) => (
          <button key={id} onClick={() => handlePeriodChange(id)}
            className={`rounded-full px-3 py-1 text-[10px] ${
              period === id ? "bg-app-accent text-white" : "border border-app-border text-app-muted"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {advice && (
        <div className="app-card">
          <h3 className="mb-2 text-sm font-medium text-app-accent">{advice.periodLabel}</h3>
          <div className="mb-4 rounded-xl border border-app-gold/30 bg-app-gold/5 px-3 py-2">
            <p className="whitespace-pre-line text-xs leading-relaxed text-app-text">{advice.summary}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(advice.sections ?? []).map((s) => (
              <div key={s.label} className="rounded-xl border border-app-border p-2">
                <p className="text-[10px] font-medium text-app-gold">{s.label}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-app-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <ReportPosterButton
          label="生成灵宠报告"
          onBeforeGenerate={() => requirePrimary()}
          data={{
            title: `${personName}的守护灵宠报告`,
            subtitle: advice?.periodLabel,
            summary: reportSummary,
            type: "spirit-pet",
            petEmoji: pet.emoji,
            petName: pet.fullName,
            petReason: pet.reason,
            baziText: pet.baziText,
          }}
        />
        <SharePosterButton
          onBeforeGenerate={() => requirePrimary()}
          data={{
            title: `我的守护灵宠 · ${pet.fullName}`,
            summary: pet.reason,
            type: "spirit-pet",
            petEmoji: pet.emoji,
            petName: pet.fullName,
            petReason: pet.reason,
          }}
        />
      </div>

      <BuyFoodModal open={buyOpen} onClose={() => setBuyOpen(false)} onPurchased={() => setFoodKey((k) => k + 1)} />
      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />

      <ConfirmModal
        open={!!swapConfirm}
        title="确认更换灵宠品种"
        message={swapConfirm && pet ? (() => {
          const destined = getDestinedPet(personKey);
          const bestName = destined?.fullName ?? pet.fullName;
          return `根据您的命格，最适合您的灵宠就是【${bestName}】，请问您确定要更换成【${swapConfirm.fullName}】吗？\n\n确认后将消耗 1 次更换机会，每人最多更换 ${MAX_PET_SWAPS} 次。`;
        })() : ""}
        confirmLabel="确认更换"
        cancelLabel="不更换"
        onConfirm={handleConfirmSwap}
        onCancel={() => setSwapConfirm(null)}
      />
    </div>
  );
}

export default function SpiritPetPage() {
  return (
    <SpiritPetErrorBoundary>
      <SpiritPetPageContent />
    </SpiritPetErrorBoundary>
  );
}

"use client";

import { useLayoutEffect, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { UserCircle, BookOpen, ShoppingBag } from "lucide-react";
import SpiritPetStageIntro from "@/components/SpiritPetStageIntro";
import SpiritPetMatchFriendsButton from "@/components/SpiritPetMatchFriendsButton";
import { normalizeLevel, getStageForLevel, formatLevelBadge, getCumulativeAbilities, AWAKENING_STAGES } from "@/lib/spirit-pet-growth";
import {
  generateSpiritPetAdvice,
  getOrCreateSpiritPet,
  getPersonKey,
  claimSpiritPet,
  generateSpiritPetWelcome,
  getRemainingSwaps,
  canSwapSpiritPet,
  swapSpiritPet,
  PET_BREEDS,
} from "@/lib/spirit-pet";
import type { SpiritPetAdvice, SpiritPetProfile, BirthInfo } from "@/lib/types";
import { normalizeBirthInfo } from "@/lib/birth-store";
import { addPrimaryPerson, getPrimaryPerson, getActivePersonId } from "@/lib/person-store";
import { updateUser } from "@/lib/user-store";
import { useApp } from "@/context/AppContext";
import SpiritPetDisplay from "@/components/SpiritPetDisplay";
import SpiritPetOnboarding from "@/components/SpiritPetOnboarding";
import SpiritPetClaimForm from "@/components/SpiritPetClaimForm";
import SpiritPetAwakeningPanel from "@/components/SpiritPetAwakeningPanel";
import SpiritPetTasksPanel from "@/components/SpiritPetTasksPanel";
import ReportPosterButton, { SharePosterButton } from "@/components/ReportPosterButton";
import SpiritPetErrorBoundary from "@/components/SpiritPetErrorBoundary";
import GenerationOverlay from "@/components/GenerationOverlay";
import PageHeader from "@/components/ui/PageHeader";
import PageCarouselBanner from "@/components/PageCarouselBanner";
import { PAGE_BANNERS } from "@/lib/page-banners";
import SectionCard from "@/components/ui/SectionCard";
import BackLink from "@/components/ui/BackLink";
import {
  resolveSpiritPetPageState,
  type SpiritPetPagePhase,
} from "@/lib/spirit-pet-page-state";

const GEN_STEPS = [
  "AI 大师正在感应命格…",
  "正在遍历十二上古灵兽…",
  "解读五行、性格与陪伴需求…",
  "命格共鸣，灵宠即将诞生…",
  "绑定灵魂羁绊中…",
];

function SpiritPetPageContent() {
  const { refreshUser } = useApp();
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<SpiritPetPagePhase>("initializing");
  const [advice, setAdvice] = useState<SpiritPetAdvice | null>(null);
  const [pet, setPet] = useState<SpiritPetProfile | null>(null);
  const [personName, setPersonName] = useState("主人");
  const [birth, setBirth] = useState<BirthInfo | null>(null);
  const [personKey, setPersonKey] = useState("");
  const [avatarTip, setAvatarTip] = useState<string | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [genTip, setGenTip] = useState(GEN_STEPS[0]);
  const [swapMode, setSwapMode] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const tasksRef = useRef<HTMLDivElement>(null);
  const awakeningRef = useRef<HTMLDivElement>(null);

  const scrollToTasks = useCallback(() => {
    tasksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToAwakening = useCallback(() => {
    awakeningRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useLayoutEffect(() => {
    if (phase === "onboarding") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [phase]);

  useLayoutEffect(() => {
    try {
      const snap = resolveSpiritPetPageState();
      setPhase(snap.phase);
      setPet(snap.pet);
      setBirth(snap.birth);
      setPersonKey(snap.personKey);
      setPersonName(snap.personName);
      setAdvice(snap.advice);
    } catch (err) {
      console.error("spirit pet init failed", err);
      setPhase("onboarding");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) return;
    try {
      const snap = resolveSpiritPetPageState();
      setPhase(snap.phase);
      setPet(snap.pet);
      setBirth(snap.birth);
      setPersonKey(snap.personKey);
      setPersonName(snap.personName);
      setAdvice(snap.advice);
    } catch {
      setPhase("onboarding");
    } finally {
      setReady(true);
    }
  }, [ready]);

  const refreshPet = useCallback(() => {
    if (!birth || !personKey) return;
    const profile = getOrCreateSpiritPet(personKey, birth);
    if (profile) setPet(profile);
  }, [birth, personKey]);

  useEffect(() => {
    const onRefresh = () => refreshPet();
    window.addEventListener("spirit-pet-refresh", onRefresh);
    return () => window.removeEventListener("spirit-pet-refresh", onRefresh);
  }, [refreshPet]);

  const handleClaimSubmit = (info: BirthInfo) => {
    setPhase("generating");
    let i = 0;
    const tipTimer = setInterval(() => {
      i = (i + 1) % GEN_STEPS.length;
      setGenTip(GEN_STEPS[i]);
    }, 900);

    setTimeout(() => {
      clearInterval(tipTimer);
      try {
        if (!getPrimaryPerson()) addPrimaryPerson(info);
        const primary = getPrimaryPerson();
        const b = normalizeBirthInfo(primary?.birthInfo ?? info);
        const pk = getPersonKey(getActivePersonId(), b);
        const profile = claimSpiritPet(pk, b);
        setBirth(b);
        setPersonKey(pk);
        setPersonName(b.name ?? "主人");
        setPet(profile);
        setAdvice(generateSpiritPetAdvice(b, profile, "day"));
        setWelcomeOpen(true);
        setPhase("companion");
      } catch (err) {
        console.error(err);
        setPhase("claim");
      }
    }, 4500);
  };

  const handleSetAvatar = () => {
    if (!pet?.avatarDataUrl) return;
    updateUser({ avatar: pet.avatarDataUrl });
    refreshUser();
    setAvatarTip("已将灵宠设为头像～");
    setTimeout(() => setAvatarTip(null), 2500);
  };

  const handleChangePet = () => {
    if (!personKey) return;
    if (!canSwapSpiritPet(personKey)) {
      setSwapError(`每人最多更换 2 次守护灵宠，您已用完次数`);
      return;
    }
    const remaining = getRemainingSwaps(personKey);
    const ok = window.confirm(
      `更换守护灵宠将替换当前灵兽，等级与灵力会保留。\n每人最多更换 2 次，当前剩余 ${remaining} 次。\n\n确定前往图鉴选择新灵兽吗？`,
    );
    if (!ok) return;
    setSwapError(null);
    setSwapMode(true);
    setPhase("onboarding");
  };

  const handleAdoptBreed = (breedId: string) => {
    if (!birth || !personKey) return;
    const breedName = PET_BREEDS.find((b) => b.breedId === breedId)?.baseName ?? "灵兽";
    const remaining = getRemainingSwaps(personKey);
    const ok = window.confirm(`确定领养「${breedName}」作为新的守护灵宠吗？\n更换后剩余 ${remaining - 1} 次机会。`);
    if (!ok) return;

    const result = swapSpiritPet(personKey, birth, breedId);
    if (!result.ok || !result.pet) {
      setSwapError(result.error ?? "更换失败");
      return;
    }

    setPet(result.pet);
    setAdvice(generateSpiritPetAdvice(birth, result.pet, "day"));
    setSwapMode(false);
    setSwapError(null);
    setPhase("companion");
    window.dispatchEvent(new Event("spirit-pet-refresh"));
  };

  if (!ready || phase === "initializing") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-app-accent/20" />
        <p className="caption mt-3 text-app-muted">灵宠界面加载中…</p>
      </div>
    );
  }

  if (phase === "onboarding") {
    const hasClaimedPet = !!pet?.claimed;
    return (
      <>
        {swapError && (
          <p className="caption mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-red-400">
            {swapError}
          </p>
        )}
        <SpiritPetOnboarding
          onClaim={() => setPhase("claim")}
          onReturnToPet={
            hasClaimedPet
              ? () => {
                  setSwapMode(false);
                  setSwapError(null);
                  setPhase("companion");
                }
              : undefined
          }
          swapMode={swapMode && hasClaimedPet}
          remainingSwaps={personKey ? getRemainingSwaps(personKey) : 0}
          onAdoptBreed={swapMode && hasClaimedPet ? handleAdoptBreed : undefined}
        />
      </>
    );
  }

  if (phase === "claim") {
    return (
      <>
        <BackLink onClick={() => setPhase("onboarding")} label="返回灵宠图鉴" className="mb-3" />
        <SectionCard title="填写信息 · 领取专属灵宠" subtitle="系统将根据您的命理、性格偏好，从十二灵兽中匹配最契合的专属守护灵。">
          <SpiritPetClaimForm onSubmit={handleClaimSubmit} />
        </SectionCard>
      </>
    );
  }

  if (phase === "generating") {
    return (
      <GenerationOverlay
        message={genTip}
        subMessage="懂你命盘、懂你情绪、陪你成长"
        title="✨ 灵宠诞生中"
        icon="🐲"
        duration={4500}
        steps={GEN_STEPS}
      />
    );
  }

  if (!pet || !birth) {
    return (
      <div className="pt-8 text-center">
        <p className="body-text text-app-muted">灵宠加载中…</p>
      </div>
    );
  }

  const reportSummary = advice?.summary ?? pet.reason;
  const petLevel = normalizeLevel(pet.level ?? 1);
  const reportStage = getStageForLevel(petLevel);
  const cumulativeAbilities = getCumulativeAbilities(petLevel);
  const petAwakeningStages = AWAKENING_STAGES.filter((s) => s.level <= petLevel).map((s) => ({
    level: s.level,
    name: s.name,
    abilities: s.roleAbilities,
  }));

  return (
    <>
      <PageHeader title="AI 灵宠" subtitle="陪伴成长 · 觉醒升级" />
      <PageCarouselBanner slides={PAGE_BANNERS["spirit-pet"]} className="!mb-3 !pt-0" />

      <SpiritPetDisplay
        pet={pet}
        personName={personName}
        onGoAwakening={scrollToAwakening}
        onChangePet={handleChangePet}
      />

      {swapError && (
        <p className="caption mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-red-400">
          {swapError}
        </p>
      )}

      <section className="page-section !mt-3 !mb-3">
        <button
          type="button"
          onClick={() => {
            setSwapMode(false);
            setSwapError(null);
            setPhase("onboarding");
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          }}
          className="app-btn-gold flex w-full items-center justify-center gap-2"
        >
          <BookOpen className="h-5 w-5" />
          浏览上古十二灵兽图鉴
        </button>
      </section>

      <SpiritPetStageIntro pet={pet} className="!mb-4" />

      {(pet.destinyInsights ?? []).length > 0 && (
        <SectionCard variant="destiny" title="命格解读" subtitle={`为何是 ${pet.fullName}？ · 基于八字命格匹配`}>
          <ul className="space-y-2">
            {pet.destinyInsights!.map((line, i) => (
              <li key={i} className="body-text">• {line}</li>
            ))}
          </ul>
        </SectionCard>
      )}

      <section ref={awakeningRef} id="spirit-awakening" className="page-section scroll-mt-4">
        <SpiritPetAwakeningPanel pet={pet} onGoTasks={scrollToTasks} />
      </section>

      <SpiritPetMatchFriendsButton unlocked={petLevel >= 2} />

      <section className="page-section scroll-mt-4">
        <Link href="/shop" className="app-btn-gold flex items-center justify-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          去灵宠商城逛逛
        </Link>
      </section>

      <section ref={tasksRef} id="spirit-tasks" className="page-section scroll-mt-4">
        <SpiritPetTasksPanel personKey={personKey} onPowerGained={refreshPet} />
      </section>

      {welcomeOpen && (
        <SectionCard variant="accent" title="灵宠诞生" subtitle="自我介绍 · 初次相遇">
          <p className="whitespace-pre-line body-text">{generateSpiritPetWelcome(pet)}</p>
          <button type="button" onClick={() => setWelcomeOpen(false)} className="caption mt-3 font-semibold text-app-accent">
            我知道了 →
          </button>
        </SectionCard>
      )}

      <button type="button" onClick={handleSetAvatar} className="app-btn-secondary flex items-center justify-center gap-2">
        <UserCircle className="h-4 w-4" /> 将灵宠设为头像
      </button>
      {avatarTip && <p className="caption mt-2 text-center text-app-accent">{avatarTip}</p>}

      <div className="mt-2 space-y-2">
        <ReportPosterButton
          label="生成灵宠报告"
          data={{
            title: `${personName}的 AI 守护灵报告`,
            subtitle: advice?.periodLabel,
            summary: reportSummary,
            type: "spirit-pet",
            ownerName: personName,
            petEmoji: pet.emoji,
            petName: pet.fullName,
            petReason: pet.reason,
            petLevel,
            petLevelLabel: formatLevelBadge(petLevel),
            petIntroTitle: reportStage.introTitle,
            petIntroPosition: reportStage.introPosition,
            petIntroUnlocks: reportStage.introUnlocks,
            petIntroExamples: reportStage.introExamples,
            petDestinyInsights: pet.destinyInsights,
            petAwakeningStages,
            petRoleKeywords: reportStage.roleKeywords,
            petTagline: reportStage.tagline,
            petRoleExamples: reportStage.roleExamples,
            petSpiritPower: pet.spiritPower ?? 0,
            petCumulativeAbilities: cumulativeAbilities,
            petBaziDetail: pet.baziText,
          }}
        />
        <SharePosterButton
          data={{
            title: `我的 AI 守护灵 · ${pet.fullName}`,
            summary: pet.reason,
            type: "spirit-pet",
            ownerName: personName,
            petEmoji: pet.emoji,
            petName: pet.fullName,
            petReason: pet.reason,
            petLevel,
            petLevelLabel: formatLevelBadge(petLevel),
            petIntroTitle: reportStage.introTitle,
            petIntroPosition: reportStage.introPosition,
            petIntroExamples: reportStage.introExamples,
            petDestinyInsights: pet.destinyInsights,
            petAwakeningStages,
            petRoleKeywords: reportStage.roleKeywords,
            petTagline: reportStage.tagline,
            petRoleExamples: reportStage.roleExamples,
            petCumulativeAbilities: cumulativeAbilities,
            petBaziDetail: pet.baziText,
          }}
        />
      </div>
    </>
  );
}

export default function SpiritPetPage() {
  return (
    <SpiritPetErrorBoundary>
      <SpiritPetPageContent />
    </SpiritPetErrorBoundary>
  );
}

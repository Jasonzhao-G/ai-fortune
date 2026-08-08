"use client";

import { Suspense, useEffect, useLayoutEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SpiritPetChatPanel from "@/components/SpiritPetChatPanel";
import AiAskBox from "@/components/AiAskBox";
import SpiritPetFortuneStick from "@/components/SpiritPetFortuneStick";
import SpiritPetDailyAdvice from "@/components/SpiritPetDailyAdvice";
import SpiritPetMatchFriendsButton from "@/components/SpiritPetMatchFriendsButton";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import PageCarouselBanner from "@/components/PageCarouselBanner";
import { PAGE_BANNERS } from "@/lib/page-banners";
import { resolveSpiritPetPageState } from "@/lib/spirit-pet-page-state";
import { getEffectiveBirthInfo, normalizeBirthInfo, isValidBirthInfo } from "@/lib/birth-store";
import {
  getStageForLevel,
  normalizeLevel,
  getLevelTierClass,
  formatLevelBadge,
  getAskPageAbilities,
} from "@/lib/spirit-pet-growth";
import { getSpiritPetTimeGreeting } from "@/lib/spirit-pet-greeting";
import BoostFortuneButton from "@/components/BoostFortuneButton";
import SpiritPetMediaAvatar from "@/components/SpiritPetMediaAvatar";
import type { BirthInfo, SpiritPetProfile } from "@/lib/types";

function AskPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSpiritPet = searchParams.get("from") === "spirit-pet";
  const abilityParam = searchParams.get("ability");

  const [pet, setPet] = useState<SpiritPetProfile | null>(null);
  const [birth, setBirth] = useState<BirthInfo | null>(null);
  const [personKey, setPersonKey] = useState("");
  const [personName, setPersonName] = useState("主人");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const snap = resolveSpiritPetPageState();
      if (snap.pet?.claimed) {
        setPet(snap.pet);
        const rawBirth = snap.birth ?? getEffectiveBirthInfo();
        if (rawBirth && isValidBirthInfo(rawBirth)) {
          setBirth(normalizeBirthInfo(rawBirth));
        }
        setPersonKey(snap.personKey);
        setPersonName(snap.personName);
      }
    } catch (err) {
      console.error("ask page init failed", err);
    } finally {
      setReady(true);
    }
  }, []);

  useLayoutEffect(() => {
    if (!ready || !fromSpiritPet) return;
    const section = searchParams.get("section");
    if (section === "daily-fortune" || section === "今日运势指引") return;
    if (
      abilityParam &&
      !abilityParam.includes("灵签") &&
      !abilityParam.includes("运势指引")
    ) {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [ready, fromSpiritPet, abilityParam, searchParams]);

  useEffect(() => {
    if (!abilityParam || abilityParam.includes("灵签") || abilityParam.includes("运势指引")) return;
    const timer = window.setTimeout(() => {
      document.getElementById("spirit-pet-chat")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [abilityParam]);

  const level = pet ? normalizeLevel(pet.level ?? 1) : 1;
  const stage = getStageForLevel(level);
  const spiritPower = pet?.spiritPower ?? 0;
  const abilities = getAskPageAbilities(level);
  const timeGreeting = getSpiritPetTimeGreeting();

  const selectAbility = useCallback(
    (name: string) => {
      if (name.includes("灵签")) {
        const el = document.getElementById("fortune-stick");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", "spirit-pet");
      params.set("ability", name);
      router.push(`/ask?${params.toString()}`, { scroll: false });
      window.setTimeout(() => {
        document.getElementById("spirit-pet-chat")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    },
    [router, searchParams],
  );

  const fortuneBirth = birth ?? getEffectiveBirthInfo();
  const normalizedBirth =
    fortuneBirth && isValidBirthInfo(fortuneBirth) ? normalizeBirthInfo(fortuneBirth) : null;

  useEffect(() => {
    const section = searchParams.get("section");
    if (section !== "daily-fortune" && section !== "今日运势指引") return;
    const timer = window.setTimeout(() => {
      document.getElementById("daily-fortune-guide")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchParams, ready, pet, normalizedBirth]);

  if (!ready) {
    return <p className="caption text-center text-app-muted">加载中…</p>;
  }

  return (
    <>
      {fromSpiritPet && (
        <BackLink href="/spirit-pet" label="返回 AI 灵宠" className="mb-3" />
      )}

      <PageHeader
        title="问AI灵宠"
        subtitle={fromSpiritPet ? "与专属守护灵互动 · 点击能力即可体验" : "AI 灵宠在线答疑 · 命理智慧随时问"}
      />

      <PageCarouselBanner slides={PAGE_BANNERS.ask} className="!mb-3 !pt-0" />

      {pet && (
        <div className="app-card panel-gold mb-4 overflow-hidden">
          <div className="flex items-start gap-3">
            <div
              className={`spirit-level-badge ${getLevelTierClass(level)} flex h-[112px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-2xl p-1 sm:h-[120px] sm:w-[120px]`}
            >
              <SpiritPetMediaAvatar breedId={pet.breedId} emoji={pet.emoji} size="2xl" className="!h-full !w-full !rounded-2xl" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="rounded-2xl border border-app-gold/30 bg-app-gold/10 px-3 py-2.5 text-[15px] font-semibold leading-snug text-app-text">
                {timeGreeting}
              </p>
              <p className="mt-2 block-title" style={{ color: pet.elementColor }}>{pet.fullName}</p>
              <span className={`spirit-level-name spirit-level-name-lg ${getLevelTierClass(level)} mt-1 inline-block`}>
                {stage.icon} {formatLevelBadge(level)}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2.5 border-t border-app-border/40 pt-3">
            <div className="rounded-xl bg-app-bg/40 px-3 py-2">
              <p className="block-label text-app-accent">我的名字</p>
              <p className="body-text font-semibold">{personName}</p>
            </div>

            <div className="rounded-xl bg-app-bg/40 px-3 py-2">
              <p className="block-label text-app-accent">介绍</p>
              <p className="body-text mt-0.5">{stage.introTitle} · {stage.introPosition}</p>
              <p className="caption mt-1 text-app-muted">{pet.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-app-gold/35 bg-app-gold/10 px-3 py-2">
                <p className="block-label text-app-gold">灵力值</p>
                <p className="block-title text-app-gold">{spiritPower}</p>
              </div>
              <div className="rounded-xl bg-app-bg/40 px-3 py-2">
                <p className="block-label text-app-accent">我的作用</p>
                <p className="caption leading-snug">{stage.roleKeywords} · {stage.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {pet && (
        <SpiritPetChatPanel
          key={abilityParam ?? "default"}
          variant="page"
          showPetProfile={false}
          pet={pet}
          personName={personName}
          birthInfo={normalizedBirth}
          initialAbility={abilityParam?.includes("灵签") ? null : abilityParam}
        />
      )}

      {!pet && <AiAskBox spiritPetMode={fromSpiritPet} />}

      {pet && (
        <section className="page-section">
          <p className="block-label mb-2 text-app-accent">我的功能 · 点击查看，灵宠自动回复</p>
          <div className="flex flex-wrap gap-2">
            {abilities.map((cap) =>
              cap.unlocked ? (
                <button
                  key={cap.name}
                  type="button"
                  onClick={() => selectAbility(cap.name)}
                  className={`chip gap-1 !py-1.5 caption transition-all ${
                    abilityParam === cap.name ? "chip-active ring-1 ring-app-accent" : "chip-active hover:opacity-90"
                  }`}
                >
                  <span>{cap.icon}</span>
                  {cap.name}
                </button>
              ) : (
                <span
                  key={cap.name}
                  className="chip caption !py-1.5 opacity-45"
                  title={`觉醒 LV${cap.minLevel} 解锁`}
                >
                  <span>{cap.icon}</span>
                  {cap.name}
                </span>
              ),
            )}
          </div>
        </section>
      )}

      {!fromSpiritPet && !pet && (
        <Link href="/spirit-pet" className="app-btn-gold mt-2 flex items-center justify-center gap-2">
          <span>🦄</span>
          先去收养我的第一只灵宠
        </Link>
      )}

      {!fromSpiritPet && (
        <Link href="/lifekline" className="app-btn-outline mt-2 block text-center">
          也可以测算人生 K 线 →
        </Link>
      )}

      {pet && normalizedBirth && personKey && (
        <section className="page-section pb-4">
          <SpiritPetMatchFriendsButton unlocked={level >= 2} />
          <SpiritPetFortuneStick pet={pet} personKey={personKey} birth={normalizedBirth} />
          <div className="mt-3">
            <BoostFortuneButton />
          </div>
          <SpiritPetDailyAdvice pet={pet} birth={normalizedBirth} />
        </section>
      )}
    </>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<p className="caption text-center">加载中…</p>}>
      <AskPageContent />
    </Suspense>
  );
}

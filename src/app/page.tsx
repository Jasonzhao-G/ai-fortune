"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles, TrendingUp, MessageCircle, FileText, Users,
  UserRound, ChevronRight, ShoppingBag, Hand, Sun,
} from "lucide-react";
import HomeKlinePreview from "@/components/HomeKlinePreview";
import PageCarouselBanner from "@/components/PageCarouselBanner";
import HexagramIconMini from "@/components/icons/HexagramIconMini";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import SpiritPetMediaAvatar from "@/components/SpiritPetMediaAvatar";
import { BRAND_SLOGAN_LINES } from "@/lib/brand";
import { PAGE_BANNERS } from "@/lib/page-banners";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import {
  DEMO_KLINE, DEMO_STATS, DEMO_BAZI, DEMO_AI_ASK, DEMO_XIANG, DEMO_LIUYAO, DEMO_REPORT, DEMO_SPIRIT_PET, DEMO_SPIRIT_PET_BREEDS,
} from "@/lib/demo-data";

const PRIMARY_ROW1 = [
  { href: "/spirit-pet", emoji: "🦄", label: "AI 灵宠", desc: "守护灵宠" },
  { href: "/lifekline", icon: TrendingUp, label: "人生K线", desc: "命势可视化" },
  { href: "/liuyao", hexagram: true, label: "AI六爻", desc: "卦象占卜" },
];

const PRIMARY_ROW2 = [
  { href: "/lifekline?tab=bazi", icon: Sparkles, label: "八字排盘", desc: "四柱八字" },
  { href: "/xiang", icon: Hand, label: "AI看相", desc: "手相面相" },
  { type: "fortune-guide" as const, icon: Sun, label: "今日运势指引", desc: "每日运势" },
];

const SECONDARY = [
  { href: "/shop", icon: ShoppingBag, label: "灵宠商城" },
  { href: "/ask?from=spirit-pet", icon: MessageCircle, label: "问AI灵宠" },
  { href: "/master", icon: UserRound, label: "问真人大师" },
  { href: "/records", icon: FileText, label: "我的测算" },
  { href: "/community", icon: Users, label: "社区" },
  { href: "/lifekline", icon: FileText, label: "运势报告" },
];

function DemoHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="section-card-header !mb-2">
      <p className="subsection-title">{title}</p>
      <Link href={href} className="caption flex items-center gap-0.5 text-app-accent">
        去体验 <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [primaryModalOpen, setPrimaryModalOpen] = useState(false);

  const goDailyFortuneGuide = () => {
    if (!ensurePrimaryPersonBeforeCalc()) {
      setPrimaryModalOpen(true);
      return;
    }
    router.push("/ask?from=spirit-pet&section=daily-fortune");
  };

  const demoKline = DEMO_KLINE.map((d) => ({
    ...d,
    isCurrent: d.year === 2026,
    trend: (d.close >= d.open ? "up" : "down") as "up" | "down",
  }));

  return (
    <div className="pb-6">
      <section className="page-section pt-2 text-center">
        {BRAND_SLOGAN_LINES.map((line, i) => (
          <p key={line} className={i === 0 ? "heading-1" : "page-subtitle mt-1"}>{line}</p>
        ))}
      </section>

      <PageCarouselBanner slides={PAGE_BANNERS.home} className="!mb-4 !pt-0" />

      <Link href="/lifekline" className="app-btn-gold app-btn-sm mb-3 flex items-center justify-center gap-2">
        马上测算我的人生 K 线！
      </Link>

      {/* 核心功能 */}
      <section className="page-section">
        <p className="section-label">核心功能</p>
        <div className="mb-2 grid grid-cols-3 gap-2">
          {PRIMARY_ROW1.map((item) => {
            const Icon = "icon" in item ? item.icon : null;
            return (
            <Link key={item.label} href={item.href} className="module-card-featured !py-3">
              <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-app-accent/15">
                {"emoji" in item && item.emoji ? (
                  <span className="text-2xl leading-none">{item.emoji}</span>
                ) : "hexagram" in item && item.hexagram ? (
                  <HexagramIconMini className="text-app-accent" />
                ) : Icon ? (
                  <Icon className="h-5 w-5 text-app-accent" strokeWidth={1.8} />
                ) : null}
              </div>
              <span className="caption font-semibold text-app-text">{item.label}</span>
              <span className="micro mt-0.5">{item.desc}</span>
            </Link>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PRIMARY_ROW2.map((item) => {
            if ("type" in item && item.type === "fortune-guide") {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={goDailyFortuneGuide}
                  className="module-card-featured !py-3 text-left"
                >
                  <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-app-gold/15">
                    <Icon className="h-5 w-5 text-app-gold" strokeWidth={1.8} />
                  </div>
                  <span className="caption font-semibold text-app-text">{item.label}</span>
                  <span className="micro mt-0.5">{item.desc}</span>
                </button>
              );
            }
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className="module-card-featured !py-3">
                <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-app-gold/15">
                  <Icon className="h-5 w-5 text-app-gold" strokeWidth={1.8} />
                </div>
                <span className="caption font-semibold text-app-text">{item.label}</span>
                <span className="micro mt-0.5">{item.desc}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <Link href="/spirit-pet" className="app-btn-gold app-btn-sm mb-5 flex items-center justify-center gap-2">
        <span className="text-base">🦄</span>
        马上收养我的第一只灵宠！
      </Link>

      {/* 更多服务 */}
      <section className="page-section">
        <p className="section-label">更多服务</p>
        <div className="grid grid-cols-3 gap-2">
          {SECONDARY.map(({ href, icon: Icon, label }) => (
            <Link key={label} href={href} className="module-card !p-2">
              <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-app-bg">
                <Icon className="h-3.5 w-3.5 text-app-gold" strokeWidth={1.8} />
              </div>
              <span className="micro text-app-text">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 功能示例 */}
      <section className="page-section space-y-5">
        <p className="section-label">功能示例</p>

        {/* AI灵宠 */}
        <div>
          <DemoHeader title="AI 灵宠 · 示例" href="/spirit-pet" />
          <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {DEMO_SPIRIT_PET_BREEDS.map((b) => (
              <div key={b.breedId} className="app-card !p-2 text-center">
                <div className="mx-auto mb-1 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl">
                  <SpiritPetMediaAvatar
                    breedId={b.breedId}
                    emoji={b.petEmoji}
                    size="lg"
                    className="!h-full !w-full !rounded-xl"
                  />
                </div>
                <p className="mt-1 text-[9px] font-medium text-app-gold">{b.petName}</p>
                <p className="text-[8px] text-app-muted">{b.label}</p>
              </div>
            ))}
          </div>
          <div className="app-card text-center">
            <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full">
              <SpiritPetMediaAvatar
                breedId="jiuwei"
                emoji={DEMO_SPIRIT_PET.petEmoji}
                size="xl"
                className="!h-full !w-full"
              />
            </div>
            <p className="mt-2 text-sm font-bold text-app-gold">{DEMO_SPIRIT_PET.petName}</p>
            <p className="mt-1 text-[10px] text-app-muted">{DEMO_SPIRIT_PET.periodLabel}</p>
            <p className="mt-2 text-xs leading-relaxed text-app-text">{DEMO_SPIRIT_PET.summary}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {DEMO_SPIRIT_PET.highlights.map((h) => (
                <span key={h} className="rounded-full border border-app-border px-2 py-0.5 text-[10px] text-app-muted">{h}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 人生K线 */}
        <div>
          <DemoHeader title="人生 K 线 · 示例" href="/lifekline" />
          <HomeKlinePreview data={demoKline} />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { label: "今年", value: DEMO_STATS.thisYear },
              { label: "均势", value: DEMO_STATS.avg },
              { label: "峰值年", value: DEMO_STATS.peakYear },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-app-border bg-app-card p-2 text-center">
                <p className="text-[10px] text-app-muted">{label}</p>
                <p className="text-sm font-semibold text-app-gold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 八字排盘 */}
        <div>
          <DemoHeader title="八字排盘 · 示例" href="/lifekline?tab=bazi" />
          <div className="app-card">
            <div className="mb-3 grid grid-cols-4 gap-2 text-center">
              {DEMO_BAZI.pillars.map((p, i) => (
                <div key={i} className="rounded-xl bg-app-bg py-2">
                  <p className="text-[10px] text-app-muted">{["年", "月", "日", "时"][i]}</p>
                  <p className="text-sm font-bold text-app-accent">{p}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-app-muted">{DEMO_BAZI.solar}</p>
            <p className="text-[11px] text-app-muted">{DEMO_BAZI.lunar}</p>
            <p className="mt-2 text-xs leading-relaxed text-app-text">{DEMO_BAZI.summary}</p>
          </div>
        </div>

        {/* 问AI灵宠 */}
        <div>
          <DemoHeader title="问AI灵宠 · 示例" href="/ask?from=spirit-pet" />
          <div className="app-card space-y-2">
            <div className="rounded-xl bg-app-bg px-3 py-2">
              <p className="text-[10px] text-app-muted">你问</p>
              <p className="text-xs text-app-text">{DEMO_AI_ASK.question}</p>
            </div>
            <div className="rounded-xl border border-app-accent/30 bg-app-accent/5 px-3 py-2">
              <p className="text-[10px] text-app-accent">AI 答</p>
              <p className="text-xs leading-relaxed text-app-text">{DEMO_AI_ASK.answer}</p>
            </div>
          </div>
        </div>

        {/* 运势报告 */}
        <div>
          <DemoHeader title="运势报告 · 示例" href="/lifekline" />
          <div className="app-card">
            <p className="mb-3 text-sm font-medium text-app-gold">{DEMO_REPORT.title}</p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {DEMO_REPORT.scores.map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-app-border p-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-app-muted">{label}</span>
                    <span className="font-bold text-app-accent">{value}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-app-border">
                    <div className="h-full rounded-full bg-app-accent" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-app-muted">{DEMO_REPORT.summary}</p>
          </div>
        </div>

        {/* AI看相 */}
        <div>
          <DemoHeader title="AI 看相 · 示例" href="/xiang" />
          <div className="app-card">
            <span className="mb-2 inline-block rounded-full bg-app-gold/20 px-2 py-0.5 text-[10px] text-app-gold">
              {DEMO_XIANG.type}分析
            </span>
            <p className="text-xs leading-relaxed text-app-text">{DEMO_XIANG.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {DEMO_XIANG.tags.map((t) => (
                <span key={t} className="rounded-full border border-app-border px-2 py-0.5 text-[10px] text-app-muted">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI六爻 */}
        <div>
          <DemoHeader title="AI 六爻 · 示例" href="/liuyao" />
          <div className="app-card">
            <p className="mb-1 text-[10px] text-app-muted">所问：{DEMO_LIUYAO.question}</p>
            <div className="my-2 flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-app-gold">{DEMO_LIUYAO.guaName}卦</span>
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">{DEMO_LIUYAO.luck}</span>
            </div>
            <p className="text-xs leading-relaxed text-app-muted">{DEMO_LIUYAO.analysis}</p>
          </div>
        </div>
      </section>

      <p className="caption mt-6 text-center">仅供娱乐参考 · 不构成决策建议</p>

      <PrimaryPersonModal open={primaryModalOpen} onClose={() => setPrimaryModalOpen(false)} />
    </div>
  );
}

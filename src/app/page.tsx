"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Sparkles, TrendingUp, MessageCircle, FileText, ScanEye, Users, Hexagon,
  UserRound, ChevronRight,
} from "lucide-react";
import {
  DEMO_KLINE, DEMO_STATS, DEMO_BAZI, DEMO_AI_ASK, DEMO_XIANG, DEMO_LIUYAO, DEMO_REPORT, DEMO_SPIRIT_PET, DEMO_SPIRIT_PET_BREEDS,
} from "@/lib/demo-data";

const LifeklineChart = dynamic(() => import("@/components/LifeklineChart"), {
  ssr: false,
  loading: () => <div className="h-[180px] animate-pulse rounded-xl bg-app-border/30" />,
});

const PRIMARY_ROW1 = [
  { href: "/spirit-pet", icon: Sparkles, label: "AI 灵宠", desc: "守护灵宠" },
  { href: "/lifekline", icon: TrendingUp, label: "人生K线", desc: "命势可视化" },
  { href: "/liuyao", icon: Hexagon, label: "AI六爻", desc: "卦象占卜" },
];

const PRIMARY_ROW2 = [
  { href: "/lifekline", icon: Sparkles, label: "八字排盘", desc: "四柱八字" },
  { href: "/xiang", icon: ScanEye, label: "AI看相", desc: "手相面相" },
];

const SECONDARY = [
  { href: "/ask", icon: MessageCircle, label: "问AI" },
  { href: "/master", icon: UserRound, label: "问真人大师" },
  { href: "/records", icon: FileText, label: "我的测算" },
  { href: "/community", icon: Users, label: "社区" },
  { href: "/lifekline", icon: FileText, label: "运势报告" },
];

function DemoHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <p className="text-xs font-medium text-app-text">{title}</p>
      <Link href={href} className="flex items-center gap-0.5 text-[10px] text-app-accent">
        去体验 <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const demoKline = DEMO_KLINE.map((d) => ({
    ...d,
    isCurrent: d.year === 2026,
    trend: (d.close >= d.open ? "up" : "down") as "up" | "down",
  }));

  return (
    <div className="px-4 pb-6">
      <section className="mb-4 pt-2 text-center">
        <h1 className="page-title text-2xl">AI 灵宠</h1>
        <p className="mt-1 text-xs text-app-muted">AI 大模型驱动的灵宠陪伴 K 线命理可视化平台</p>
      </section>

      <Link href="/lifekline" className="cta-banner mb-5 block">
        <p className="text-base font-bold text-white">马上测算我的人生 K 线！</p>
        <p className="mt-0.5 text-[11px] text-white/80">输入生辰八字 · 一键生成命势图表 →</p>
      </Link>

      {/* 核心功能 */}
      <section className="mb-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-app-muted">核心功能</p>
        <div className="mb-2 grid grid-cols-3 gap-2">
          {PRIMARY_ROW1.map(({ href, icon: Icon, label, desc }) => (
            <Link key={label} href={href} className="module-card-featured !py-3">
              <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-app-accent/15">
                <Icon className="h-5 w-5 text-app-accent" strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold text-app-text">{label}</span>
              <span className="mt-0.5 text-[10px] text-app-muted">{desc}</span>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRIMARY_ROW2.map(({ href, icon: Icon, label, desc }) => (
            <Link key={label} href={href} className="module-card-featured !py-3">
              <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-app-gold/15">
                <Icon className="h-5 w-5 text-app-gold" strokeWidth={1.8} />
              </div>
              <span className="text-xs font-semibold text-app-text">{label}</span>
              <span className="mt-0.5 text-[10px] text-app-muted">{desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 更多服务 */}
      <section className="mb-6">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-app-muted">更多服务</p>
        <div className="grid grid-cols-5 gap-2">
          {SECONDARY.map(({ href, icon: Icon, label }) => (
            <Link key={label} href={href} className="module-card !p-2">
              <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-app-bg">
                <Icon className="h-3.5 w-3.5 text-app-gold" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] text-app-text">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 功能示例 */}
      <section className="space-y-5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-app-muted">功能示例</p>

        {/* AI灵宠 */}
        <div>
          <DemoHeader title="AI 灵宠 · 示例" href="/spirit-pet" />
          <div className="mb-2 grid grid-cols-5 gap-2">
            {DEMO_SPIRIT_PET_BREEDS.map((b) => (
              <div key={b.petName} className="app-card !p-2 text-center">
                <p className="text-2xl">{b.petEmoji}</p>
                <p className="mt-1 text-[9px] font-medium text-app-gold">{b.petName}</p>
                <p className="text-[8px] text-app-muted">{b.label}</p>
              </div>
            ))}
          </div>
          <div className="app-card text-center">
            <p className="text-4xl">{DEMO_SPIRIT_PET.petEmoji}</p>
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
          <LifeklineChart data={demoKline} compact />
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
          <DemoHeader title="八字排盘 · 示例" href="/lifekline" />
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

        {/* 问AI */}
        <div>
          <DemoHeader title="问 AI · 示例" href="/ask" />
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

      <p className="mt-6 text-center text-[10px] text-app-muted">仅供娱乐参考 · 不构成决策建议</p>
    </div>
  );
}

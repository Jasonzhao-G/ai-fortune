"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import BirthForm from "@/components/BirthForm";
import LifeklineChart, { MonthlyLineMini } from "@/components/LifeklineChart";
import GenerationOverlay from "@/components/GenerationOverlay";
import PaywallModal from "@/components/PaywallModal";
import OverallOverviewPanel from "@/components/OverallOverviewPanel";
import {
  generateFullLifeKline,
  generatePeriodKline,
  generateMonthlyKline,
  generateYearAnalysis,
  generateOverallAnalysis,
} from "@/lib/fortune-chart";
import { calculateBazi } from "@/lib/bazi";
import { canUse, incrementUsage, getRemaining, addHistory } from "@/lib/user-store";
import {
  saveRecord, buildPersonKey, buildPersonLabel,
} from "@/lib/record-store";
import { saveBirthInfo } from "@/lib/birth-store";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import type { BirthInfo, KlineData, YearAnalysis, OverallAnalysis, BaziResult, KlineViewMode } from "@/lib/types";
import { X } from "lucide-react";
import ReportPosterButton, { SharePosterButton } from "@/components/ReportPosterButton";
import { LIFE_YEAR_OPTIONS } from "@/lib/demo-data";
import PageHeader from "@/components/ui/PageHeader";
import PageCarouselBanner from "@/components/PageCarouselBanner";
import FortuneHubNav, { type FortuneHubTab } from "@/components/FortuneHubNav";
import LiuyaoHubPanel from "@/components/fortune-hub/LiuyaoHubPanel";
import XiangHubPanel from "@/components/fortune-hub/XiangHubPanel";
import MasterHubPanel from "@/components/fortune-hub/MasterHubPanel";
import AskHubPanel from "@/components/fortune-hub/AskHubPanel";
import RecordsHubPanel from "@/components/fortune-hub/RecordsHubPanel";
import BaziHubPanel from "@/components/fortune-hub/BaziHubPanel";
import FoodRulesModal from "@/components/FoodRulesModal";
import { PAGE_BANNERS } from "@/lib/page-banners";

function periodTitle(lifeYears: number, drillYear: number | null): string {
  if (drillYear) return `${drillYear}年 · 月度 K 线`;
  if (lifeYears === 1) return `${new Date().getFullYear()}年 · 月度 K 线`;
  if (lifeYears >= 100) return "人生 K 线 · 0–100 岁";
  return `未来 ${lifeYears} 年 · 年 K 线`;
}

function periodSubtitle(lifeYears: number, drillYear: number | null): string {
  if (drillYear) return "横轴：月份 · 单击返回上一级";
  if (lifeYears === 1) return "横轴：月份 · 双击看流年分析";
  if (lifeYears >= 100) return "横轴：年龄(岁) · 单击看月K线 · 双击看流年分析";
  return "横轴：年份 · 单击看月K线 · 双击看流年分析";
}

export default function LifeklinePage() {
  const [phase, setPhase] = useState<"form" | "generating" | "result">("form");
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [fullKline, setFullKline] = useState<KlineData[]>([]);
  const [periodKline, setPeriodKline] = useState<KlineData[]>([]);
  const [drillYear, setDrillYear] = useState<number | null>(null);
  const [bazi, setBazi] = useState<BaziResult | null>(null);
  const [overall, setOverall] = useState<OverallAnalysis | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearAnalysis | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [paywall, setPaywall] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);
  const [lifeYears, setLifeYears] = useState(10);
  const [remaining, setRemaining] = useState(5);
  const [foodRulesOpen, setFoodRulesOpen] = useState(false);
  const [hubTab, setHubTab] = useState<FortuneHubTab>("lifekline");

  useEffect(() => {
    setRemaining(getRemaining("lifekline"));
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "bazi" || tab === "liuyao" || tab === "xiang" || tab === "master" || tab === "ask" || tab === "records") {
      setHubTab(tab as FortuneHubTab);
    }
  }, [phase]);
  const hasResult = phase === "result" && fullKline.length > 0;
  const showLifeOverview = hasResult && lifeYears < 100;

  const mainData = useMemo(() => {
    if (!hasResult) return [];
    if (drillYear && birthInfo) return generateMonthlyKline(birthInfo, drillYear);
    return periodKline;
  }, [hasResult, drillYear, birthInfo, periodKline]);

  const mainViewMode: KlineViewMode = useMemo(() => {
    if (drillYear || lifeYears === 1) return "month";
    if (lifeYears >= 100) return "life";
    return "forward";
  }, [drillYear, lifeYears]);

  useEffect(() => {
    if (birthInfo && phase === "result") {
      try {
        setPeriodKline(generatePeriodKline(birthInfo, lifeYears));
        setDrillYear(null);
        setSelectedYear(null);
        setSelectedIndex(undefined);
      } catch (err) {
        console.error("period kline failed", err);
      }
    }
  }, [lifeYears, birthInfo, phase]);

  const handleSubmit = (info: BirthInfo) => {
    if (!ensurePrimaryPersonBeforeCalc()) { setPrimaryModal(true); return; }
    if (!canUse("lifekline")) { setPaywall(true); return; }
    setBirthInfo(info);
    setPhase("generating");
  };

  const onGenerateComplete = useCallback(() => {
    if (!birthInfo) return;
    try {
      const full = generateFullLifeKline(birthInfo);
      const period = generatePeriodKline(birthInfo, lifeYears);
      let baziResult: BaziResult | null = null;
      try {
        baziResult = calculateBazi(birthInfo);
      } catch {
        baziResult = null;
      }
      const overallResult = generateOverallAnalysis(full, birthInfo);

      setFullKline(full);
      setPeriodKline(period);
      setDrillYear(null);
      setBazi(baziResult);
      setOverall(overallResult);
      incrementUsage("lifekline");
      addHistory({
        type: "lifekline",
        title: `${birthInfo.name || birthInfo.year + "年"}生辰K线`,
        data: { birthInfo, kline: full, overall: overallResult, bazi: baziResult },
      });
      const personName = birthInfo.name || `命理者${birthInfo.year}`;
      saveRecord({
        type: "lifekline",
        personKey: buildPersonKey(personName, birthInfo),
        personName,
        personLabel: buildPersonLabel(personName, birthInfo),
        title: `人生K线 · ${lifeYears === 1 ? "1年(月)" : lifeYears === 100 ? "全部" : lifeYears + "年"}`,
        summary: overallResult.summary,
        data: { birthInfo, kline: full, overall: overallResult, bazi: baziResult, lifeYears },
      });
      saveBirthInfo(birthInfo);
      setPhase("result");
    } catch (err) {
      console.error("lifekline generate failed", err);
      setPhase("form");
    }
  }, [birthInfo, lifeYears]);

  const handleBarClick = (_index: number, item: KlineData) => {
    if (!birthInfo || item.isMonthly) return;
    setDrillYear(item.year);
    setSelectedIndex(undefined);
    setSelectedYear(null);
  };

  const handleBarDoubleClick = (index: number, item: KlineData) => {
    if (item.isMonthly) return;
    setSelectedIndex(index);
    setSelectedYear(generateYearAnalysis(item));
  };

  const handleBackFromDrill = () => {
    setDrillYear(null);
    setSelectedIndex(undefined);
  };

  if (phase === "generating" && hubTab === "lifekline") {
    return (
      <>
        <PageHeader
          title="人生 K 线"
          subtitle={`命势推演，可视化排盘，剩余免费 ${remaining} 次`}
        />
        <PageCarouselBanner slides={PAGE_BANNERS.lifekline} className="!mb-3 !pt-0" />
        <FortuneHubNav active={hubTab} onChange={setHubTab} />
        <div className="relative min-h-[320px]">
          <GenerationOverlay embedded onComplete={onGenerateComplete} duration={7000} />
        </div>
      </>
    );
  }

  const showKlineContent = hubTab === "lifekline";
  const showBaziContent = hubTab === "bazi";

  return (
    <>
      <PageHeader
        title="人生 K 线"
        subtitle={
          <>
            命势推演，可视化排盘，剩余免费 {remaining} 次（
            <button
              type="button"
              onClick={() => setFoodRulesOpen(true)}
              className="font-semibold text-app-accent underline decoration-app-accent/40 underline-offset-2"
            >
              查看灵丹规则
            </button>
            ）
          </>
        }
      />

      <PageCarouselBanner slides={PAGE_BANNERS.lifekline} className="!mb-3 !pt-0" />

      <FortuneHubNav active={hubTab} onChange={setHubTab} />

      {hubTab === "liuyao" && <LiuyaoHubPanel />}
      {hubTab === "xiang" && <XiangHubPanel />}
      {hubTab === "master" && <MasterHubPanel />}
      {hubTab === "ask" && <AskHubPanel />}
      {hubTab === "records" && <RecordsHubPanel />}

      {showBaziContent && <BaziHubPanel />}

      {showKlineContent && phase === "form" && (
        <>
          <div className="app-card mb-4">
            <BirthForm onSubmit={handleSubmit} />
          </div>
          <div className="mb-4">
            <p className="app-label">推演年数</p>
            <div className="flex flex-wrap gap-1.5">
              {LIFE_YEAR_OPTIONS.map(({ label, value }) => (
                <button key={value} onClick={() => setLifeYears(value)}
                  className={`rounded-lg px-3 py-1 text-xs ${
                    lifeYears === value ? "bg-app-accent text-white" : "border border-app-border text-app-muted"
                  }`}>{label}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {showKlineContent && hasResult && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {LIFE_YEAR_OPTIONS.map(({ label, value }) => (
            <button key={value} onClick={() => setLifeYears(value)}
              className={`rounded-lg px-3 py-1 text-xs ${
                lifeYears === value ? "bg-app-accent text-white" : "border border-app-border text-app-muted"
              }`}>{label}</button>
          ))}
        </div>
      )}

      {showKlineContent && (phase === "form" || hasResult) && (
        <>
          <LifeklineChart
            data={hasResult ? mainData : []}
            viewMode={hasResult ? mainViewMode : "forward"}
            birthInfo={birthInfo}
            onBarClick={handleBarClick}
            onBarDoubleClick={handleBarDoubleClick}
            selectedIndex={selectedIndex}
            empty={!hasResult}
            title={hasResult ? periodTitle(lifeYears, drillYear) : "推演 K 线"}
            subtitle={hasResult ? periodSubtitle(lifeYears, drillYear) : undefined}
            showBack={!!drillYear}
            onBack={handleBackFromDrill}
          />

          {showLifeOverview && (
            <div className="mt-3">
              <LifeklineChart
                data={fullKline}
                viewMode="life"
                birthInfo={birthInfo}
                onBarClick={handleBarClick}
                onBarDoubleClick={handleBarDoubleClick}
                compact
                title="人生总览 · 0–100 岁"
                subtitle="完整人生 K 线 · 单击某年查看月K线"
              />
            </div>
          )}

          <OverallOverviewPanel overall={overall} filled={hasResult} showBoostCta={hasResult} />

          {hasResult && overall && birthInfo && (
            <>
              <div className="mt-4 space-y-2">
                <ReportPosterButton
                  data={{
                    title: "人生K线运势报告",
                    subtitle: buildPersonLabel(birthInfo.name || "匿名", birthInfo),
                    summary: overall.summary,
                    klineCharts: (() => {
                      const charts: { title: string; data: KlineData[] }[] = [];
                      if (drillYear) {
                        charts.push({ title: `${drillYear}年 · 月度 K 线`, data: mainData });
                      } else {
                        charts.push({ title: periodTitle(lifeYears, null), data: periodKline });
                      }
                      if (showLifeOverview) {
                        charts.push({ title: "人生总览 · 0–100 岁", data: fullKline });
                      }
                      return charts;
                    })(),
                    baziText: bazi ? `${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day} ${bazi.bazi.hour} · ${bazi.dayMaster}` : undefined,
                    dimensions: overall.dimensions.map((d) => ({ label: d.label, score: d.score, text: d.text, key: d.key })),
                    type: "lifekline",
                  }}
                />
                <SharePosterButton
                  data={{
                    title: "我的人生K线",
                    summary: overall.summary,
                    klineCharts: showLifeOverview
                      ? [
                          { title: periodTitle(lifeYears, drillYear), data: drillYear ? mainData : periodKline },
                          { title: "人生总览 · 0–100 岁", data: fullKline },
                        ]
                      : [{ title: periodTitle(lifeYears, drillYear), data: drillYear ? mainData : periodKline }],
                    dimensions: overall.dimensions.map((d) => ({ label: d.label, score: d.score, key: d.key })),
                    type: "lifekline",
                  }}
                />
              </div>

              <button onClick={() => {
                setPhase("form");
                setSelectedYear(null);
                setDrillYear(null);
                setFullKline([]);
                setPeriodKline([]);
                setOverall(null);
                setBazi(null);
              }}
                className="app-btn-outline mt-4">
                重新测算
              </button>
            </>
          )}
        </>
      )}

      {selectedYear && birthInfo && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-app-border bg-app-card p-5 sm:rounded-3xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-app-text">
                {selectedYear.age}岁 · {selectedYear.year}年 流年分析
              </h3>
              <button onClick={() => { setSelectedYear(null); setSelectedIndex(undefined); }}>
                <X className="h-5 w-5 text-app-muted" />
              </button>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                selectedYear.luck === "吉" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
              }`}>{selectedYear.luck}</span>
              <span className="rounded-full px-2 py-0.5 text-xs text-app-muted">{selectedYear.score}分</span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-app-muted">{selectedYear.summary}</p>
            <ul className="mb-4 space-y-1">
              {selectedYear.highlights.map((h, i) => (
                <li key={i} className="text-[11px] text-app-muted">· {h}</li>
              ))}
            </ul>
            <p className="mb-2 text-xs font-medium text-app-text">{selectedYear.year}年 · 12个月运势</p>
            <MonthlyLineMini birthInfo={birthInfo} year={selectedYear.year} />
          </div>
        </div>
      )}

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="人生K线" />
      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
      <FoodRulesModal open={foodRulesOpen} onClose={() => setFoodRulesOpen(false)} />
    </>
  );
}

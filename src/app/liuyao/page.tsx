"use client";

import { useState } from "react";
import GenerationOverlay from "@/components/GenerationOverlay";
import ReportPosterButton, { SharePosterButton } from "@/components/ReportPosterButton";
import PaywallModal from "@/components/PaywallModal";
import HexagramLines from "@/components/HexagramLines";
import { castHexagram, type HexagramResult } from "@/lib/liuyao";
import { canUse, incrementUsage, getRemaining } from "@/lib/user-store";
import { saveRecord, buildPersonKey } from "@/lib/record-store";
import { useApp } from "@/context/AppContext";
import { DEMO_LIUYAO } from "@/lib/demo-data";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import { grantSpiritPowerForTask } from "@/lib/spirit-pet-tasks";
import PageHeader from "@/components/ui/PageHeader";

export default function LiuyaoPage() {
  const { user } = useApp();
  const [question, setQuestion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<HexagramResult | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);
  const remaining = getRemaining("liuyao");

  const handleCast = () => {
    if (!question.trim()) return;
    if (!ensurePrimaryPersonBeforeCalc()) { setPrimaryModal(true); return; }
    if (!canUse("liuyao")) { setPaywall(true); return; }
    setGenerating(true);
    setResult(null);
  };

  const onComplete = () => {
    const hex = castHexagram(question);
    setResult(hex);
    incrementUsage("liuyao");
    const personName = user?.nickname ?? "六爻问卦";
    saveRecord({
      type: "liuyao",
      personKey: buildPersonKey(personName),
      personName,
      personLabel: personName,
      title: `${hex.guaName}卦 · ${hex.luck}`,
      summary: hex.advice,
      data: { question, result: hex },
    });
    grantSpiritPowerForTask("liuyao");
    setGenerating(false);
  };

  if (generating) {
    return <GenerationOverlay onComplete={onComplete} duration={5000} />;
  }

  return (
    <>
      <PageHeader title="AI 六爻" subtitle={`诚心发问 · 爻卦天机 · 剩余免费 ${remaining} 次`} />

      {!result ? (
        <>
          <div className="app-card mb-4">
            <label className="app-label">你想问什么？</label>
            <textarea
              className="app-input min-h-[100px] resize-none"
              placeholder="例如：今年事业是否顺利？感情能否有结果？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <button onClick={handleCast} disabled={!question.trim()} className="app-btn">
            爻 卦
          </button>
          <p className="mt-3 text-center text-[10px] text-app-muted">
            静心默念所问之事，再点击爻卦
          </p>

          <div className="mt-6 app-card">
            <p className="mb-2 text-xs font-medium text-app-text">六爻测算示例</p>
            <div className="rounded-xl border border-dashed border-app-border bg-app-bg/50 px-3 py-2">
              <p className="mb-2 text-[10px] text-app-muted">所问：{DEMO_LIUYAO.question}</p>
              <HexagramLines
                lines={DEMO_LIUYAO.lines}
                title={`${DEMO_LIUYAO.guaName}卦 · 示例`}
              />
            </div>
            <div className="mt-3">
              <span className="mb-2 inline-block rounded-full bg-app-gold/20 px-2 py-0.5 text-[10px] text-app-gold">
                {DEMO_LIUYAO.guaName}卦 · {DEMO_LIUYAO.luck}
              </span>
              <p className="text-xs leading-relaxed text-app-text">{DEMO_LIUYAO.analysis}</p>
              <p className="mt-2 text-[11px] text-app-gold">💡 {DEMO_LIUYAO.advice}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="app-card mb-4">
            <p className="mb-1 text-xs text-app-muted">所问</p>
            <p className="text-sm text-app-text">{result.question}</p>
          </div>

          <div className="app-card mb-4">
            <HexagramLines
              lines={result.lines}
              title={`${result.guaName}卦`}
              subtitle={result.guaDesc}
            />
            <div className="text-center">
              <span className={`rounded-full px-3 py-1 text-xs ${
                result.luck === "大吉" || result.luck === "吉" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
              }`}>{result.luck}</span>
            </div>
          </div>

          <div className="app-card mb-4">
            <h3 className="mb-2 text-sm font-medium">卦象解读</h3>
            <p className="whitespace-pre-line text-xs leading-relaxed text-app-muted">{result.analysis}</p>
            <p className="mt-3 text-xs text-app-gold">💡 {result.advice}</p>
          </div>

          <button onClick={() => { setResult(null); setQuestion(""); }}
            className="app-btn mb-4 w-full">再来一卦？</button>

          <ReportPosterButton
            data={{
              title: `${result.guaName}卦 · ${result.luck}`,
              subtitle: result.question.slice(0, 30),
              summary: result.analysis + "\n" + result.advice,
              type: "liuyao",
            }}
          />
          <SharePosterButton
            data={{
              title: `${result.guaName}卦`,
              summary: result.advice,
              type: "liuyao",
            }}
          />
        </>
      )}

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="AI六爻" />
      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
    </>
  );
}

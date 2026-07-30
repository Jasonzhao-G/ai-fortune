"use client";

import { useState } from "react";
import GenerationOverlay from "@/components/GenerationOverlay";
import ReportPosterButton, { SharePosterButton } from "@/components/ReportPosterButton";
import PaywallModal from "@/components/PaywallModal";
import { castHexagram, type HexagramResult } from "@/lib/liuyao";
import { canUse, incrementUsage, getRemaining } from "@/lib/user-store";
import { saveRecord, buildPersonKey } from "@/lib/record-store";
import { useApp } from "@/context/AppContext";

function HexagramDisplay({ result }: { result: HexagramResult }) {
  const lines = [...result.lines].reverse();
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-8 text-[10px] text-app-muted text-right">{6 - i}爻</span>
          <div className="flex w-24 justify-center gap-1">
            {line.isYang ? (
              <div className="h-2 w-20 rounded bg-app-gold" />
            ) : (
              <>
                <div className="h-2 w-8 rounded bg-app-gold" />
                <div className="h-2 w-8 rounded bg-app-gold" />
              </>
            )}
          </div>
          <span className="w-10 text-[10px] text-app-muted">{line.label}</span>
        </div>
      ))}
      <p className="mt-2 text-lg font-bold text-app-gold">{result.guaName}卦</p>
      <p className="text-xs text-app-muted">{result.guaDesc}</p>
    </div>
  );
}

export default function LiuyaoPage() {
  const { user } = useApp();
  const [question, setQuestion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<HexagramResult | null>(null);
  const [paywall, setPaywall] = useState(false);
  const remaining = getRemaining("liuyao");

  const handleCast = () => {
    if (!question.trim()) return;
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
    setGenerating(false);
  };

  if (generating) {
    return <GenerationOverlay onComplete={onComplete} duration={5000} />;
  }

  return (
    <div className="px-4 pb-4">
      <header className="mb-4 pt-2 text-center">
        <h1 className="page-title">AI 六爻</h1>
        <p className="text-xs text-app-muted">诚心发问 · 爻卦天机</p>
        <p className="mt-1 text-[10px] text-app-accent">剩余免费 {remaining} 次</p>
      </header>

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
        </>
      ) : (
        <>
          <div className="app-card mb-4">
            <p className="mb-1 text-xs text-app-muted">所问</p>
            <p className="text-sm text-app-text">{result.question}</p>
          </div>

          <div className="app-card mb-4">
            <HexagramDisplay result={result} />
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

          <button onClick={() => { setResult(null); setQuestion(""); }}
            className="app-btn-outline mt-3">再次爻卦</button>
        </>
      )}

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="AI六爻" />
    </div>
  );
}

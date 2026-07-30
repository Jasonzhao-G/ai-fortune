"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import AnalysisPanel from "@/components/AnalysisPanel";
import GenerationOverlay from "@/components/GenerationOverlay";
import PaywallModal from "@/components/PaywallModal";
import ReportPosterButton, { SharePosterButton } from "@/components/ReportPosterButton";
import { canUse, incrementUsage, getRemaining, addHistory } from "@/lib/user-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "@/lib/record-store";
import { useApp } from "@/context/AppContext";
import type { AnalysisResult } from "@/lib/types";

type Tab = "palm" | "face";

export default function XiangPage() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("palm");
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [pendingType, setPendingType] = useState<Tab>("palm");

  const remaining = getRemaining("xiang");

  const startAnalyze = () => {
    if (!preview) return;
    if (!canUse("xiang")) { setPaywall(true); return; }
    setPendingType(tab);
    setGenerating(true);
    setResult(null);
  };

  const onGenerateComplete = async () => {
    setGenerating(false);
    try {
      const res = await fetch("/api/analyze/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: pendingType, image: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.analysis);
      incrementUsage("xiang");
      addHistory({
        type: "xiang",
        title: pendingType === "palm" ? "手相分析" : "面相分析",
        data: data.analysis,
      });
      const personName = user?.nickname ?? "看相用户";
      saveRecord({
        type: "xiang",
        personKey: buildPersonKey(personName),
        personName,
        personLabel: personName,
        title: pendingType === "palm" ? "手相看相" : "面相看相",
        summary: data.analysis.summary,
        data: { ...data.analysis, tab: pendingType },
      });
    } catch {
      setResult(null);
    }
  };

  if (generating) {
    return <GenerationOverlay onComplete={onGenerateComplete} duration={5000} />;
  }

  return (
    <div className="px-4 pb-4">
      <header className="mb-4 pt-2 text-center">
        <h1 className="page-title">看相</h1>
        <p className="text-xs text-app-muted">AI 智能 · 手相 & 面相分析</p>
        <p className="mt-1 text-[10px] text-app-accent">剩余免费 {remaining} 次</p>
      </header>

      <div className="mb-4 flex rounded-xl border border-app-border p-0.5">
        {(["palm", "face"] as Tab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPreview(null); setResult(null); }}
            className={`flex-1 rounded-lg py-2 text-xs transition-colors ${
              tab === t ? "bg-app-accent text-white" : "text-app-muted"
            }`}>
            {t === "palm" ? "手相" : "面相"}
          </button>
        ))}
      </div>

      <ImageUpload
        label={tab === "palm" ? "上传手相照片" : "上传面相照片"}
        hint={tab === "palm" ? "手掌平放，掌纹清晰" : "正面拍摄，光线均匀"}
        preview={preview}
        onImageSelect={setPreview}
        onClear={() => { setPreview(null); setResult(null); }}
      />

      {preview && !result && (
        <button onClick={startAnalyze} className="app-btn mt-4">
          AI 大师看相分析
        </button>
      )}

      {result && (
        <div className="mt-4">
          <AnalysisPanel result={result} />
          <div className="mt-4 space-y-2">
            <ReportPosterButton
              data={{
                title: tab === "palm" ? "手相看相报告" : "面相看相报告",
                summary: result.summary,
                type: "xiang",
              }}
            />
            <SharePosterButton
              data={{
                title: tab === "palm" ? "我的手相分析" : "我的面相分析",
                summary: result.summary,
                type: "xiang",
              }}
            />
          </div>
          <button onClick={() => { setPreview(null); setResult(null); }}
            className="app-btn-outline mt-3">再次测算</button>
        </div>
      )}

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="看相" />
    </div>
  );
}

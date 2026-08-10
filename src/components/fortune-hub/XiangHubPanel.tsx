"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ImageUpload from "@/components/ImageUpload";
import AnalysisPanel from "@/components/AnalysisPanel";
import XiangScanOverlay from "@/components/XiangScanOverlay";
import PaywallModal from "@/components/PaywallModal";
import ReportPosterButton, { SharePosterButton } from "@/components/ReportPosterButton";
import { canUse, incrementUsage, getRemaining, addHistory } from "@/lib/user-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "@/lib/record-store";
import { useApp } from "@/context/AppContext";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import { DEMO_XIANG_PALM, DEMO_XIANG_FACE } from "@/lib/demo-data";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import XiangDemoDiagram from "@/components/XiangDemoDiagram";
import BoostFortuneButton from "@/components/BoostFortuneButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { analyzeXiangImage } from "@/lib/xiang-analyze-client";
import { saveSessionResult, loadSessionResult, clearSessionResult } from "@/lib/session-result-cache";
import type { AnalysisResult } from "@/lib/types";

type Tab = "palm" | "face";

const XIANG_TABS = [
  { id: "palm" as const, label: "手相" },
  { id: "face" as const, label: "面相" },
];

const SCAN_MS = 3000;

export default function XiangHubPanel() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("palm");
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);
  const [pendingType, setPendingType] = useState<Tab>("palm");
  const pendingPreview = useRef<string | null>(null);
  const remaining = getRemaining("xiang");

  useEffect(() => {
    const cached = loadSessionResult<{ tab: Tab; preview: string; result: AnalysisResult }>("xiang");
    if (cached?.result && cached.preview) {
      setTab(cached.tab);
      setPreview(cached.preview);
      setResult(cached.result);
    }
  }, []);

  const runAnalyze = useCallback(async () => {
    const image = pendingPreview.current;
    if (!image) return;
    setLoading(true);
    setAnalyzeError(null);
    try {
      const { analysis } = await analyzeXiangImage(pendingType, image);
      setResult(analysis);
      incrementUsage("xiang");
      addHistory({
        type: "xiang",
        title: pendingType === "palm" ? "手相分析" : "面相分析",
        data: analysis,
      });
      const personName = user?.nickname ?? "看相用户";
      saveRecord({
        type: "xiang",
        personKey: buildPersonKey(personName),
        personName,
        personLabel: personName,
        title: pendingType === "palm" ? "手相看相" : "面相看相",
        summary: analysis.summary,
        data: { ...analysis, tab: pendingType },
      });
      saveSessionResult("xiang", { tab: pendingType, preview: image, result: analysis });
    } catch {
      setAnalyzeError("分析暂时失败，请重试或更换图片");
      setResult(null);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }, [pendingType, user?.nickname]);

  useEffect(() => {
    if (!scanning) return;
    const timer = setTimeout(runAnalyze, SCAN_MS);
    return () => clearTimeout(timer);
  }, [scanning, runAnalyze]);

  const startAnalyze = () => {
    if (!preview) return;
    if (!ensurePrimaryPersonBeforeCalc()) { setPrimaryModal(true); return; }
    if (!canUse("xiang")) { setPaywall(true); return; }
    setPendingType(tab);
    pendingPreview.current = preview;
    setResult(null);
    setScanning(true);
  };

  const demo = tab === "palm" ? DEMO_XIANG_PALM : DEMO_XIANG_FACE;
  const scanLabel = tab === "palm" ? "手相矩阵扫描中…" : "面相矩阵扫描中…";

  return (
    <div className="relative">
      <p className="caption mb-3 text-app-muted">AI 智能 · 手相 & 面相 · 剩余免费 {remaining} 次</p>

      <SegmentedControl
        value={tab}
        options={XIANG_TABS}
        onChange={(t) => { setTab(t); setPreview(null); setResult(null); setScanning(false); }}
      />

      {!scanning && (
        <ImageUpload
          label={tab === "palm" ? "上传手相照片" : "上传面相照片"}
          hint={tab === "palm" ? "手掌平放，掌纹清晰" : "正面拍摄，光线均匀"}
          preview={preview}
          onImageSelect={setPreview}
          onClear={() => { setPreview(null); setResult(null); }}
        />
      )}

      {scanning && preview && (
        <XiangScanOverlay imageUrl={preview} label={loading ? "命相解析中…" : scanLabel} />
      )}

      {!preview && !result && !scanning && (
        <div className="mt-4 app-card">
          <p className="mb-2 text-xs font-medium text-app-text">{tab === "palm" ? "手相" : "面相"}测算示例</p>
          <div className="mb-3 rounded-xl border border-dashed border-app-border bg-app-bg/50 px-2 py-3">
            <XiangDemoDiagram type={tab} />
          </div>
          <p className="text-xs leading-relaxed text-app-text">{demo.summary}</p>
        </div>
      )}

      {preview && !result && !scanning && (
        <>
          <button onClick={startAnalyze} className="app-btn mt-4">AI 大师看相分析</button>
          {analyzeError && <p className="mt-2 text-center text-xs text-red-400">{analyzeError}</p>}
        </>
      )}

      {result && (
        <div className="mt-4">
          <AnalysisPanel result={result} />
          <div className="mt-3">
            <BoostFortuneButton />
          </div>
          <button onClick={() => { clearSessionResult("xiang"); setPreview(null); setResult(null); }} className="app-btn-outline mt-3">
            再次测算
          </button>
        </div>
      )}

      <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="看相" />
      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
    </div>
  );
}

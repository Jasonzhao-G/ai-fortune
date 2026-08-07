"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import SegmentedControl from "@/components/ui/SegmentedControl";

interface SecurityCaptchaProps {
  onVerified: (verified: boolean) => void;
}

type CaptchaMode = "slide" | "graphic";

const SLIDE_TARGET_RATIO = 0.72;
const SLIDE_TOLERANCE = 14;

function randomGraphicCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function SecurityCaptcha({ onVerified }: SecurityCaptchaProps) {
  const [mode, setMode] = useState<CaptchaMode>("slide");
  const [seed, setSeed] = useState(0);

  const [slideX, setSlideX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startSlideRef = useRef(0);
  const [slideOk, setSlideOk] = useState(false);

  const [graphicCode, setGraphicCode] = useState("");
  const [graphicInput, setGraphicInput] = useState("");
  const [graphicOk, setGraphicOk] = useState(false);

  const slideTargetPx = useMemo(() => {
    const w = trackRef.current?.clientWidth ?? 280;
    return Math.round((w - 44) * SLIDE_TARGET_RATIO);
  }, [seed, mode]);

  const resetSlide = useCallback(() => {
    setSlideX(0);
    setSlideOk(false);
    onVerified(false);
  }, [onVerified]);

  const resetGraphic = useCallback(() => {
    setGraphicCode(randomGraphicCode());
    setGraphicInput("");
    setGraphicOk(false);
    onVerified(false);
  }, [onVerified]);

  const resetAll = useCallback(() => {
    setSeed((s) => s + 1);
    resetSlide();
    resetGraphic();
  }, [resetSlide, resetGraphic]);

  useEffect(() => {
    resetGraphic();
  }, [resetGraphic]);

  useEffect(() => {
    if (mode === "slide") {
      onVerified(slideOk);
    } else {
      onVerified(graphicOk);
    }
  }, [mode, slideOk, graphicOk, onVerified]);

  const verifySlide = (x: number) => {
    const ok = Math.abs(x - slideTargetPx) <= SLIDE_TOLERANCE;
    setSlideOk(ok);
    if (ok) setSlideX(slideTargetPx);
  };

  const onSlidePointerDown = (e: React.PointerEvent) => {
    if (slideOk) return;
    setDragging(true);
    startXRef.current = e.clientX;
    startSlideRef.current = slideX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onSlidePointerMove = (e: React.PointerEvent) => {
    if (!dragging || slideOk) return;
    const trackW = trackRef.current?.clientWidth ?? 280;
    const max = trackW - 44;
    const delta = e.clientX - startXRef.current;
    const next = Math.max(0, Math.min(max, startSlideRef.current + delta));
    setSlideX(next);
  };

  const onSlidePointerUp = () => {
    if (!dragging || slideOk) return;
    setDragging(false);
    verifySlide(slideX);
  };

  const onGraphicChange = (value: string) => {
    const v = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    setGraphicInput(v);
    const ok = v.length === 4 && v === graphicCode;
    setGraphicOk(ok);
  };

  return (
    <div className="rounded-xl border border-app-border bg-app-bg/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-app-text">安全验证</p>
        <button type="button" onClick={resetAll} className="text-app-muted" aria-label="刷新验证">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <SegmentedControl
        value={mode}
        options={[
          { id: "slide" as const, label: "滑动验证" },
          { id: "graphic" as const, label: "图形验证码" },
        ]}
        onChange={(m) => {
          setMode(m);
          resetSlide();
          resetGraphic();
        }}
        className="!mb-3"
      />

      {mode === "slide" ? (
        <div>
          <p className="mb-2 text-[11px] text-app-muted">拖动滑块至缺口位置完成验证</p>
          <div className="relative mb-3 h-24 overflow-hidden rounded-xl border border-app-border bg-gradient-to-br from-app-card to-app-bg">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #d4a57422 0, #d4a57422 8px, transparent 8px, transparent 16px)",
              }}
            />
            <div
              className="absolute top-6 h-12 w-12 rounded-lg border-2 border-dashed border-app-gold/70 bg-app-gold/15"
              style={{ left: slideTargetPx + 8 }}
            />
            <div
              className="absolute top-6 flex h-12 w-12 items-center justify-center rounded-lg border border-app-gold bg-app-gold/30 text-lg shadow-md"
              style={{ left: slideX + 8 }}
            >
              🧩
            </div>
          </div>
          <div
            ref={trackRef}
            className="relative h-10 rounded-full border border-app-border bg-app-bg"
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-app-accent/20 transition-all"
              style={{ width: slideX + 44 }}
            />
            <div
              role="slider"
              aria-valuenow={slideX}
              className={`absolute top-0 flex h-10 w-11 cursor-grab items-center justify-center rounded-full border border-app-accent bg-app-accent text-white shadow ${
                slideOk ? "cursor-default" : dragging ? "cursor-grabbing" : ""
              }`}
              style={{ left: slideX }}
              onPointerDown={onSlidePointerDown}
              onPointerMove={onSlidePointerMove}
              onPointerUp={onSlidePointerUp}
              onPointerCancel={onSlidePointerUp}
            >
              {slideOk ? "✓" : "→"}
            </div>
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-app-muted">
              {slideOk ? "验证通过" : "按住滑块拖动"}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-[11px] text-app-muted">请输入下方图形验证码（不区分大小写）</p>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-app-border bg-gradient-to-r from-app-card via-app-bg to-app-card text-xl font-bold tracking-[0.35em] text-app-gold"
              style={{
                textShadow: "1px 1px 0 #00000033",
                letterSpacing: "0.35em",
                fontFamily: "monospace",
              }}
            >
              {graphicCode.split("").map((ch, i) => (
                <span key={`${seed}-${i}`} style={{ transform: `rotate(${(i - 1.5) * 8}deg)` }}>
                  {ch}
                </span>
              ))}
            </div>
            <button type="button" onClick={resetGraphic} className="caption text-app-accent">
              换一张
            </button>
          </div>
          <input
            className="app-input !py-2 text-xs uppercase tracking-widest"
            placeholder="输入 4 位验证码"
            value={graphicInput}
            onChange={(e) => onGraphicChange(e.target.value)}
            autoComplete="off"
          />
          {graphicInput.length === 4 && !graphicOk && (
            <p className="mt-1 text-[10px] text-red-400">验证码不正确</p>
          )}
          {graphicOk && <p className="mt-1 text-[10px] text-app-green">验证通过</p>}
        </div>
      )}
    </div>
  );
}

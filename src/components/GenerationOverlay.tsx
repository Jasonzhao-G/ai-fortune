"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "正在连接命理推演引擎...",
  "解析天干地支四柱...",
  "计算流年大运走势...",
  "生成人生 K 线数据...",
  "大师正在深度测算...",
  "推演五行格局能量...",
  "绘制命势可视化图表...",
  "生成综合命理报告...",
];

interface GenerationOverlayProps {
  onComplete: () => void;
  duration?: number;
}

export default function GenerationOverlay({ onComplete, duration = 6000 }: GenerationOverlayProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, duration / STEPS.length);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 100));
    }, duration / 100);

    const timer = setTimeout(onComplete, duration);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-app-bg/95 backdrop-blur-md">
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212,165,116,0.15), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-8">
        <div className="relative mb-8">
          <div className="h-24 w-24 animate-pulse rounded-full border-2 border-app-gold/50"
            style={{ boxShadow: "0 0 24px rgba(212,165,116,0.25)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl text-app-gold">☯</span>
          </div>
          <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-app-accent"
            style={{ animationDuration: "3s" }}
          />
        </div>

        <h2 className="mb-2 text-lg font-semibold text-app-text">大师正在测算</h2>
        <p className="mb-6 h-5 text-sm text-app-gold transition-all">{STEPS[step]}</p>

        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-app-border">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #c45c48, #d4a574, #5a8a7a)",
            }}
          />
        </div>
        <p className="mt-2 text-xs text-app-muted">{progress}%</p>

        <div className="mt-8 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-1 rounded-full bg-app-gold/60"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.3 + (i * 0.15),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

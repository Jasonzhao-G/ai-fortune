"use client";

import type { OverallAnalysis } from "@/lib/types";
import { EMPTY_DIMENSIONS } from "@/lib/fortune-chart";

interface OverallOverviewPanelProps {
  overall?: OverallAnalysis | null;
  filled?: boolean;
}

export default function OverallOverviewPanel({ overall, filled = false }: OverallOverviewPanelProps) {
  const dimensions = filled && overall
    ? overall.dimensions
    : EMPTY_DIMENSIONS.map((d) => ({ key: d.key, label: d.label, score: 0, text: d.text }));

  const overallDim = dimensions.find((d) => d.key === "overall") ?? dimensions[0];
  const otherDims = dimensions.filter((d) => d.key !== "overall");

  return (
    <div className="app-card mt-4">
      <h3 className="mb-3 text-center text-sm font-medium text-app-text">总体命理概览</h3>
      <p className="mb-5 text-center text-xs leading-relaxed text-app-muted">
        {filled && overall ? overall.summary : "请输入姓名与出生信息并排盘，测算完成后显示各维度评分。"}
      </p>

      {/* 整体命势 — 居中突出 */}
      <div className="mx-auto mb-5 max-w-xs rounded-2xl border-2 border-app-accent/40 bg-app-accent/5 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-app-accent">{overallDim.label}</p>
        <p className={`my-2 text-4xl font-bold ${filled ? "text-app-gold" : "text-app-muted"}`}>
          {filled ? overallDim.score : "--"}
          {filled && <span className="ml-1 text-lg font-normal text-app-muted">分</span>}
        </p>
        <div className="mx-auto mb-3 h-2 max-w-[200px] overflow-hidden rounded-full bg-app-border">
          {filled && (
            <div className="h-full rounded-full bg-app-accent" style={{ width: `${overallDim.score}%` }} />
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-app-muted">{overallDim.text}</p>
      </div>

      {/* 其他维度 */}
      <div className="grid grid-cols-2 gap-2">
        {otherDims.map((d) => (
          <div key={d.key} className="rounded-xl border border-app-border p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-app-text">{d.label}</span>
              <span className={`text-xs font-bold ${filled ? "text-app-accent" : "text-app-muted"}`}>
                {filled ? d.score : "--"}
              </span>
            </div>
            <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-app-border">
              {filled && (
                <div className="h-full rounded-full bg-app-accent" style={{ width: `${d.score}%` }} />
              )}
            </div>
            <p className="text-[10px] leading-relaxed text-app-muted">{d.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

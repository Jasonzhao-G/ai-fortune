"use client";

import type { KlineData } from "@/lib/types";

interface HomeKlinePreviewProps {
  data: KlineData[];
}

/** 首页示例用轻量 K 线预览，避免 recharts 在 Tab 切换时崩溃 */
export default function HomeKlinePreview({ data }: HomeKlinePreviewProps) {
  const max = 100;

  return (
    <div className="app-card !p-3">
      <p className="mb-2 text-[10px] text-app-muted">单击看月K线 · 双击看流年分析</p>
      <div className="flex h-[180px] items-end gap-1 rounded-xl border border-app-border bg-app-bg/50 px-2 pb-6 pt-3">
        {data.map((d) => {
          const up = d.close >= d.open;
          const bodyH = Math.max(8, (Math.abs(d.close - d.open) / max) * 120);
          const baseH = (Math.min(d.open, d.close) / max) * 120;
          return (
            <div key={d.year} className="flex min-w-0 flex-1 flex-col items-center justify-end">
              <div className="relative flex w-full max-w-[18px] flex-col justify-end" style={{ height: 130 }}>
                <div style={{ height: baseH }} />
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: bodyH,
                    backgroundColor: up ? "#e05555" : "#4a9e6a",
                  }}
                />
              </div>
              <span className="mt-1 truncate text-[8px] text-app-muted">{d.age}岁</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px]">
        <span className="flex items-center gap-1 text-red-400">
          <span className="inline-block h-3 w-2 rounded-sm bg-[#e05555]" /> 吉
        </span>
        <span className="flex items-center gap-1 text-green-400">
          <span className="inline-block h-3 w-2 rounded-sm bg-[#4a9e6a]" /> 凶
        </span>
      </div>
    </div>
  );
}

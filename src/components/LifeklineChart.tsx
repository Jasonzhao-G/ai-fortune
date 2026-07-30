"use client";

import { useState, useRef, useMemo } from "react";
import {
  ComposedChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, LabelList,
  ResponsiveContainer, CartesianGrid, Cell, ReferenceLine, Customized,
} from "recharts";
import { Maximize2, Minimize2, BarChart2, TrendingUp, X, ChevronLeft } from "lucide-react";
import type { BirthInfo, KlineData, KlineViewMode } from "@/lib/types";
import { generateMonthlyKline } from "@/lib/fortune-chart";

interface LifeklineChartProps {
  data: KlineData[];
  viewMode?: KlineViewMode;
  birthInfo?: BirthInfo | null;
  onBarClick?: (index: number, item: KlineData) => void;
  onBarDoubleClick?: (index: number, item: KlineData) => void;
  selectedIndex?: number;
  compact?: boolean;
  empty?: boolean;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

type ChartRow = KlineData & {
  xLabel: string;
  bodyBase: number;
  bodyHeight: number;
  barLabel: string;
  index: number;
};

function getTopMarkerLabel(entry: KlineData, viewMode: KlineViewMode): string | null {
  if (entry.isCurrent) return viewMode === "month" ? "今月" : "今年";
  if (entry.isBestYear) return viewMode === "month" ? "大运之月" : "大运之年";
  if (entry.isWorstYear) return viewMode === "month" ? "大凶之月" : "大凶之年";
  return null;
}

function markerColor(entry: KlineData): string {
  if (entry.isWorstYear) return "#4a9e6a";
  if (entry.isCurrent) return "#c45c48";
  return "#e05555";
}

function KlineTopMarkers({
  xAxisMap,
  yAxisMap,
  data,
  viewMode,
}: {
  xAxisMap?: Record<string, { scale: { (v: string): number; bandwidth?: () => number } }>;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  data: ChartRow[];
  viewMode: KlineViewMode;
}) {
  const xAxis = xAxisMap ? Object.values(xAxisMap)[0] : undefined;
  const yAxis = yAxisMap ? Object.values(yAxisMap)[0] : undefined;
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const bandW = xAxis.scale.bandwidth?.() ?? 8;

  return (
    <g className="kline-top-markers">
      {data.map((entry, i) => {
        const label = getTopMarkerLabel(entry, viewMode);
        if (!label) return null;
        const cx = (xAxis.scale(entry.xLabel) ?? 0) + bandW / 2;
        const barTop = yAxis.scale(Math.max(entry.open, entry.close));
        const labelY = barTop - 10;
        const lineTop = labelY - 16;
        const color = markerColor(entry);
        return (
          <g key={i}>
            <line x1={cx} y1={barTop} x2={cx} y2={lineTop} stroke={color} strokeWidth={1.5} />
            <text x={cx} y={lineTop - 2} textAnchor="middle" fontSize={9} fontWeight="600" fill={color}>
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function LifeklineChart({
  data,
  viewMode = "life",
  birthInfo,
  onBarClick,
  onBarDoubleClick,
  selectedIndex,
  compact,
  empty,
  title,
  subtitle,
  showBack,
  onBack,
}: LifeklineChartProps) {
  const [chartMode, setChartMode] = useState<"kline" | "line">("kline");
  const [fullscreen, setFullscreen] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLifeFull = viewMode === "life" && data.length > 50;
  const hasTopMarkers = data.some((d) => getTopMarkerLabel(d, viewMode));
  const height = compact ? 210 : fullscreen ? 480 : 320;
  const labelFontSize = data.length > 50 ? 6 : data.length > 20 ? 7 : 9;
  const bottomMargin = data.length > 50 ? 40 : data.length > 15 ? 36 : 28;
  const topMargin = hasTopMarkers ? 42 : 16;

  const chartData = useMemo((): ChartRow[] => data.map((d, i) => {
    const luckLabel = d.close >= d.open ? "吉" : "凶";
    const showLabel = !isLifeFull || (d.age ?? 0) % 5 === 0;
    return {
      ...d,
      xLabel: d.xLabel ?? (d.isMonthly ? `${d.month}月` : d.age === 0 ? "出生" : `${d.age}岁`),
      bodyBase: Math.min(d.open, d.close),
      bodyHeight: Math.abs(d.close - d.open) || 0.6,
      barLabel: showLabel ? luckLabel : "",
      index: i,
    };
  }), [data, isLifeFull]);

  const xAxisLabel = viewMode === "month" ? "月份" : viewMode === "forward" ? "年份" : "年龄(岁)";
  const tickInterval = data.length <= 12 ? 0 : data.length <= 20 ? 1 : Math.max(1, Math.floor(data.length / 8));

  const getCellStroke = (entry: KlineData, i: number) => {
    if (entry.isBirth) return "#d4a574";
    if (entry.isCurrent) return "#c45c48";
    if (entry.isBestYear) return "#e05555";
    if (entry.isWorstYear) return "#4a9e6a";
    if (selectedIndex === i) return "#c45c48";
    return "none";
  };

  const getCellStrokeWidth = (entry: KlineData, i: number) => {
    const isKey = entry.isBirth || entry.isCurrent || entry.isBestYear || entry.isWorstYear || selectedIndex === i;
    if (isKey && (entry.isBirth || entry.isCurrent) && viewMode === "life") return 3;
    if (isKey) return 2;
    return 0;
  };

  const handleBarPress = (index: number) => {
    if (empty) return;
    const item = data[index];
    if (!item) return;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onBarDoubleClick?.(index, item);
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      onBarClick?.(index, item);
    }, 280);
  };

  const hint = empty
    ? "填写信息后生成 K 线"
    : viewMode === "month"
      ? "单击返回 · 双击看分析"
      : "单击看月K线 · 双击看流年分析";

  const chartContent = (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {showBack && onBack && (
            <button onClick={onBack} className="mb-1 flex items-center gap-0.5 text-[10px] text-app-accent">
              <ChevronLeft className="h-3 w-3" /> 返回
            </button>
          )}
          {title && !compact && <h3 className="text-sm font-medium text-app-text">{title}</h3>}
          {subtitle && <p className="text-[10px] text-app-gold">{subtitle}</p>}
          <p className="text-[10px] text-app-muted">{hint}</p>
        </div>
        {!empty && (
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => setChartMode("kline")}
              className={`rounded-lg px-2 py-1 text-[10px] ${chartMode === "kline" ? "bg-app-accent text-white" : "text-app-muted"}`}>
              <BarChart2 className="inline h-3 w-3" /> K线
            </button>
            <button onClick={() => setChartMode("line")}
              className={`rounded-lg px-2 py-1 text-[10px] ${chartMode === "line" ? "bg-app-accent text-white" : "text-app-muted"}`}>
              <TrendingUp className="inline h-3 w-3" /> 折线
            </button>
            {!compact && (
              <button onClick={() => setFullscreen(!fullscreen)} className="rounded-lg p-1 text-app-muted hover:text-app-accent">
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}
      </div>

      {empty || data.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-app-border bg-app-bg/50"
          style={{ height }}>
          <p className="text-xs text-app-muted">暂无 K 线数据</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {chartMode === "kline" ? (
            <ComposedChart
              data={chartData}
              margin={{ top: topMargin, right: 4, left: -8, bottom: bottomMargin }}
              barCategoryGap="8%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="xLabel"
                type="category"
                tick={{ fill: "var(--color-muted)", fontSize: 8 }}
                interval={tickInterval}
                angle={data.length > 15 ? -35 : 0}
                textAnchor={data.length > 15 ? "end" : "middle"}
                height={data.length > 15 ? 48 : 30}
                label={!compact ? { value: xAxisLabel, position: "insideBottom", offset: -4, fontSize: 9, fill: "var(--color-muted)" } : undefined}
              />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--color-muted)", fontSize: 9 }}
                label={!compact ? { value: "运势分", angle: -90, position: "insideLeft", fontSize: 9, fill: "var(--color-muted)" } : undefined}
              />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload as ChartRow;
                const topLabel = getTopMarkerLabel(d, viewMode);
                return (
                  <div className="rounded-lg border border-app-border bg-app-card px-2 py-1 text-[11px]">
                    {d.isMonthly ? (
                      <p>{d.year}年 {d.month}月 · {d.age}岁 {d.isCurrent && "· 今月"}</p>
                    ) : (
                      <p>{d.age}岁 · {d.year}年 {d.isBirth && "· 出生"} {d.isCurrent && "· 今年"}</p>
                    )}
                    <p style={{ color: d.close >= d.open ? "#e05555" : "#4a9e6a" }}>
                      {topLabel ?? d.barLabel} · {d.score}分
                    </p>
                  </div>
                );
              }} />
              <ReferenceLine y={50} stroke="var(--color-border)" strokeDasharray="4 4" />
              <Bar dataKey="bodyBase" stackId="c" fill="transparent" maxBarSize={isLifeFull ? 5 : viewMode === "life" ? 6 : 28} />
              <Bar dataKey="bodyHeight" stackId="c" maxBarSize={isLifeFull ? 5 : viewMode === "life" ? 6 : 28}>
                {chartData.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.close >= entry.open ? "#e05555" : "#4a9e6a"}
                    stroke={getCellStroke(entry, i)}
                    strokeWidth={getCellStrokeWidth(entry, i)}
                    cursor="pointer"
                    onClick={() => handleBarPress(i)}
                  />
                ))}
                <LabelList dataKey="barLabel" position="bottom" fontSize={labelFontSize} fill="#888" />
              </Bar>
              <Customized
                component={(props: { xAxisMap?: Record<string, { scale: { (v: string): number; bandwidth?: () => number } }>; yAxisMap?: Record<string, { scale: (v: number) => number }> }) => (
                  <KlineTopMarkers {...props} data={chartData} viewMode={viewMode} />
                )}
              />
            </ComposedChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 16, right: 4, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="xLabel" type="category" tick={{ fill: "var(--color-muted)", fontSize: 8 }} interval={tickInterval} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--color-muted)", fontSize: 9 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#c45c48" strokeWidth={2} dot={false}
                activeDot={{ r: 4, onClick: (_, e) => handleBarPress((e as { index?: number }).index ?? 0) }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}

      {!empty && data.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-red-400">
            <span className="inline-block h-3 w-2 rounded-sm bg-[#e05555]" /> 吉
          </span>
          <span className="flex items-center gap-1 text-green-400">
            <span className="inline-block h-3 w-2 rounded-sm bg-[#4a9e6a]" /> 凶
          </span>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className={compact ? "app-card !p-3" : "app-card !p-3"}>{chartContent}</div>
      {fullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-app-bg p-4">
          <div className="mb-2 flex justify-between">
            <h3 className="font-medium text-app-text">全屏查看</h3>
            <button onClick={() => setFullscreen(false)}><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 app-card">{chartContent}</div>
        </div>
      )}
    </>
  );
}

export function MonthlyLineMini({ birthInfo, year }: { birthInfo: BirthInfo; year: number }) {
  const data = generateMonthlyKline(birthInfo, year);
  return (
    <LifeklineChart
      data={data}
      viewMode="month"
      birthInfo={birthInfo}
      compact
      title={`${year}年 月度K线`}
    />
  );
}

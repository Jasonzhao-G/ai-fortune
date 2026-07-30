import type { KlineData } from "./types";
import { getInviteQrUrl } from "./user-store";

export type PosterStyle = "classic" | "gold" | "jade";

export interface KlineChartBlock {
  title: string;
  data: KlineData[];
}

export interface PosterData {
  title: string;
  subtitle?: string;
  summary: string;
  scores?: { label: string; value: number }[];
  userName?: string;
  type: "lifekline" | "liuyao" | "xiang";
  /** @deprecated use klineCharts */
  kline?: KlineData[];
  klineCharts?: KlineChartBlock[];
  baziText?: string;
  dimensions?: { label: string; score: number; text?: string; key?: string }[];
}

export const BRAND_NAME = "AI K线";
export const BRAND_SLOGAN = "AI 驱动的人生 K 线命理可视化平台";

const STYLES: Record<PosterStyle, { bg: [string, string, string]; accent: string; gold: string; text: string; muted: string }> = {
  classic: { bg: ["#1c1915", "#2a2520", "#1a2820"], accent: "#c45c48", gold: "#d4a574", text: "#f5f0e8", muted: "#9a9088" },
  gold: { bg: ["#2a1f10", "#3d2e18", "#1f1810"], accent: "#d4a574", gold: "#f0d4a8", text: "#fff8ee", muted: "#b8a080" },
  jade: { bg: ["#141f1c", "#1a2a24", "#0f1a16"], accent: "#5a8a7a", gold: "#8ab8a8", text: "#eef5f2", muted: "#7a9a90" },
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 6) {
  const chars = text.split("");
  let line = "";
  let cy = y;
  let lines = 0;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
      lines++;
      if (lines >= maxLines) return cy;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy + lineHeight;
}

function drawKlineChart(
  ctx: CanvasRenderingContext2D,
  kline: KlineData[],
  x: number,
  y: number,
  w: number,
  h: number,
  theme: typeof STYLES.classic,
  chartTitle?: string
) {
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fill();

  if (chartTitle) {
    ctx.fillStyle = theme.gold;
    ctx.font = "bold 14px PingFang SC, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(chartTitle, x + 14, y + 22);
  }

  if (kline.length === 0) {
    ctx.fillStyle = theme.muted;
    ctx.font = "16px PingFang SC, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("K 线数据", x + w / 2, y + h / 2);
    return;
  }

  const pad = 16;
  const topPad = chartTitle ? 28 : 0;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2 - 20 - topPad;
  const barW = Math.max(2, Math.min(8, chartW / kline.length - 1));
  const step = chartW / kline.length;
  const baseY = y + pad + topPad;

  kline.forEach((d, i) => {
    const cx = x + pad + i * step + step / 2;
    const openY = baseY + chartH * (1 - d.open / 100);
    const closeY = baseY + chartH * (1 - d.close / 100);
    const top = Math.min(openY, closeY);
    const bodyH = Math.max(2, Math.abs(closeY - openY));
    ctx.fillStyle = d.close >= d.open ? "#e05555" : "#4a9e6a";
    ctx.fillRect(cx - barW / 2, top, barW, bodyH);
    if (d.isBirth) {
      ctx.strokeStyle = theme.gold;
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - barW / 2 - 1, top - 1, barW + 2, bodyH + 2);
    }
    if (d.isCurrent) {
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - barW / 2 - 1, top - 1, barW + 2, bodyH + 2);
    }
    if (d.isBestYear) {
      ctx.strokeStyle = "#e05555";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - barW / 2 - 1, top - 1, barW + 2, bodyH + 2);
    }
    if (d.isWorstYear) {
      ctx.strokeStyle = "#4a9e6a";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - barW / 2 - 1, top - 1, barW + 2, bodyH + 2);
    }
  });

  ctx.fillStyle = theme.muted;
  ctx.font = "11px PingFang SC, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(kline[0]?.isMonthly ? "1月" : "0岁", x + pad, y + h - 6);
  ctx.textAlign = "right";
  ctx.fillText(kline[0]?.isMonthly ? "12月" : "100岁", x + w - pad, y + h - 6);
}

function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  score: number,
  theme: typeof STYLES.classic,
  large = false
) {
  const barH = large ? 10 : 6;
  roundRect(ctx, x, y, w, barH, barH / 2);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  roundRect(ctx, x, y, w * (score / 100), barH, barH / 2);
  ctx.fillStyle = large ? theme.accent : theme.gold;
  ctx.fill();
}

export async function generatePoster(data: PosterData, style: PosterStyle = "classic"): Promise<string> {
  const charts: KlineChartBlock[] = data.klineCharts?.length
    ? data.klineCharts
    : data.kline?.length
      ? [{ title: "人生 K 线", data: data.kline }]
      : [];

  const chartBlockH = 200;
  const chartGap = 16;
  const chartsTotalH = charts.length * chartBlockH + (charts.length - 1) * chartGap;

  const dims: { label: string; score: number; key?: string }[] =
    data.dimensions ?? data.scores?.map((s) => ({ label: s.label, score: s.value })) ?? [];
  const overallDim = dims.find((d) => d.key === "overall" || d.label === "整体命势");
  const otherDims = dims.filter((d) => d !== overallDim);

  const H = 1320 + chartsTotalH + (overallDim ? 60 : 0) + otherDims.length * 36;
  const W = 750;
  const theme = STYLES[style];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, theme.bg[0]);
  grad.addColorStop(0.5, theme.bg[1]);
  grad.addColorStop(1, theme.bg[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = theme.gold;
  ctx.font = "bold 32px PingFang SC, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(BRAND_NAME, W / 2, 56);

  ctx.fillStyle = theme.muted;
  ctx.font = "15px PingFang SC, sans-serif";
  ctx.fillText(BRAND_SLOGAN, W / 2, 82);

  ctx.fillStyle = theme.text;
  ctx.font = "bold 34px PingFang SC, sans-serif";
  ctx.fillText(data.title, W / 2, 130);

  if (data.subtitle) {
    ctx.fillStyle = theme.muted;
    ctx.font = "20px PingFang SC, sans-serif";
    ctx.fillText(data.subtitle, W / 2, 162);
  }

  let cursorY = data.subtitle ? 185 : 165;
  charts.forEach((block) => {
    drawKlineChart(ctx, block.data, 40, cursorY, W - 80, chartBlockH, theme, block.title);
    cursorY += chartBlockH + chartGap;
  });

  if (data.baziText) {
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 20px PingFang SC, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("八字排盘", 50, cursorY + 24);
    ctx.fillStyle = theme.text;
    ctx.font = "18px PingFang SC, sans-serif";
    cursorY = wrapText(ctx, data.baziText, 50, cursorY + 52, W - 100, 26, 2) + 12;
  }

  roundRect(ctx, 40, cursorY, W - 80, 160, 12);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fill();
  ctx.fillStyle = theme.accent;
  ctx.font = "bold 22px PingFang SC, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("运势解读", 60, cursorY + 32);
  ctx.fillStyle = theme.text;
  ctx.font = "18px PingFang SC, sans-serif";
  wrapText(ctx, data.summary, 60, cursorY + 62, W - 120, 26, 4);
  cursorY += 180;

  if (dims.length > 0) {
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 20px PingFang SC, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("维度评分", 50, cursorY);
    cursorY += 32;

    if (overallDim) {
      roundRect(ctx, 40, cursorY, W - 80, 88, 12);
      ctx.fillStyle = "rgba(196,92,72,0.12)";
      ctx.fill();
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = theme.accent;
      ctx.font = "bold 18px PingFang SC, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(overallDim.label, W / 2, cursorY + 28);
      ctx.fillStyle = theme.gold;
      ctx.font = "bold 36px PingFang SC, sans-serif";
      ctx.fillText(`${overallDim.score}分`, W / 2, cursorY + 62);
      drawProgressBar(ctx, W / 2 - 120, cursorY + 72, 240, overallDim.score, theme, true);
      cursorY += 108;
    }

    otherDims.forEach(({ label, score }) => {
      ctx.fillStyle = theme.muted;
      ctx.font = "17px PingFang SC, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, 50, cursorY);
      ctx.fillStyle = theme.gold;
      ctx.textAlign = "right";
      ctx.fillText(`${score}分`, W - 50, cursorY);
      drawProgressBar(ctx, 50, cursorY + 8, W - 100, score, theme);
      cursorY += 36;
    });
    cursorY += 8;
  }

  const downloadUrl = typeof window !== "undefined" ? window.location.origin : "https://aikline.app";
  const qrUrl = getInviteQrUrl(downloadUrl);

  try {
    const qrImg = await loadImage(qrUrl);
    roundRect(ctx, W / 2 - 95, H - 280, 190, 190, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.drawImage(qrImg, W / 2 - 85, H - 270, 170, 170);
  } catch {
    roundRect(ctx, W / 2 - 95, H - 280, 190, 190, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.fillStyle = "#333";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("扫码访问", W / 2, H - 185);
  }

  ctx.fillStyle = theme.text;
  ctx.font = "bold 20px PingFang SC, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("扫码下载 · 测算你的命运", W / 2, H - 70);

  ctx.fillStyle = theme.muted;
  ctx.font = "14px PingFang SC, sans-serif";
  ctx.fillText(`仅供娱乐参考 · ${BRAND_NAME}`, W / 2, H - 40);

  if (data.userName) {
    ctx.fillStyle = theme.gold;
    ctx.font = "16px PingFang SC, sans-serif";
    ctx.fillText(`—— ${data.userName}`, W / 2, H - 100);
  }

  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function downloadPoster(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const POSTER_STYLES: { id: PosterStyle; label: string }[] = [
  { id: "classic", label: "经典朱砂" },
  { id: "gold", label: "金色典藏" },
  { id: "jade", label: "翡翠雅韵" },
];

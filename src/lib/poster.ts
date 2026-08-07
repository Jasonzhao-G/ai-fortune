import type { KlineData } from "./types";
import { getInviteQrUrl } from "./user-store";

import { BRAND_NAME, BRAND_SLOGAN } from "./brand";

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
  type: "lifekline" | "liuyao" | "xiang" | "spirit-pet";
  /** @deprecated use klineCharts */
  kline?: KlineData[];
  klineCharts?: KlineChartBlock[];
  baziText?: string;
  dimensions?: { label: string; score: number; text?: string; key?: string }[];
  petEmoji?: string;
  petName?: string;
  petReason?: string;
  /** 灵宠报告扩展字段 */
  ownerName?: string;
  petLevel?: number;
  petLevelLabel?: string;
  petIntroTitle?: string;
  petIntroPosition?: string;
  petIntroUnlocks?: string[];
  petDestinyInsights?: string[];
  petAwakeningSummary?: string;
  petAwakeningStages?: { level: number; name: string; abilities: string[] }[];
  petIntroExamples?: string[];
  petRoleKeywords?: string;
  petTagline?: string;
  petRoleExamples?: string[];
  petSpiritPower?: number;
  petCumulativeAbilities?: string[];
  petBaziDetail?: string;
  /** 六爻卦象 */
  hexagramLines?: { isYang: boolean; label?: string }[];
  guaName?: string;
  guaDesc?: string;
  luck?: string;
}


export { BRAND_NAME, BRAND_SLOGAN };

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
  chartTitle?: string,
  skipBackground = false,
) {
  if (!skipBackground) {
    roundRect(ctx, x, y, w, h, 12);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();
  }

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
  if (data.type === "spirit-pet") {
    return generateSpiritPetPoster(data, style);
  }
  if (data.type === "lifekline") {
    return generateLifeklinePoster(data, style);
  }
  if (data.type === "liuyao") {
    return generateLiuyaoPoster(data, style);
  }

  const charts: KlineChartBlock[] =
    data.klineCharts?.length
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

interface PosterModule {
  title: string;
  lines: string[];
}

const POSTER_W = 750;
const POSTER_PAD = 32;
const POSTER_CARD_PAD = 22;
const POSTER_CARD_GAP = 24;
const POSTER_BODY_FONT = "14px PingFang SC, sans-serif";
const POSTER_BODY_LH = 28;
const POSTER_LINE_GAP = 10;
const POSTER_BODY_TOP_GAP = 12;
const POSTER_TITLE_H = 44;
const POSTER_FOOTER_H = 180;
const POSTER_FOOTER_TOP_GAP = 20;
const POSTER_CHART_MODULE_H = 228;
const POSTER_CHART_INNER_H = 162;
const POSTER_DIM_ROW_H = 44;
const POSTER_DIM_TEXT_LH = 26;
const POSTER_DIM_OVERALL_H = 96;

/** @deprecated use POSTER_* constants */
const SPIRIT_PET_W = POSTER_W;
const SPIRIT_PAD = POSTER_PAD;
const SPIRIT_CARD_PAD = POSTER_CARD_PAD;
const SPIRIT_CARD_GAP = POSTER_CARD_GAP;
const SPIRIT_BODY_FONT = POSTER_BODY_FONT;
const SPIRIT_BODY_LH = POSTER_BODY_LH;
const SPIRIT_TITLE_H = POSTER_TITLE_H;

function countWrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number {
  if (!text) return 0;
  const chars = text.split("");
  let line = "";
  let lines = 0;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines++;
  return lines;
}

function measurePosterHeaderHeight(data: PosterData): number {
  return data.subtitle ? 158 : 126;
}

function measureModuleBodyHeight(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  contentW: number,
): number {
  ctx.font = POSTER_BODY_FONT;
  let h = 0;
  for (let i = 0; i < lines.length; i++) {
    h += Math.max(1, countWrapLines(ctx, lines[i], contentW)) * POSTER_BODY_LH;
    if (i < lines.length - 1) h += POSTER_LINE_GAP;
  }
  return h;
}

function measureModuleHeight(
  ctx: CanvasRenderingContext2D,
  module: PosterModule,
  cardW: number,
): number {
  const contentW = cardW - POSTER_CARD_PAD * 2;
  return (
    POSTER_CARD_PAD +
    POSTER_TITLE_H +
    POSTER_BODY_TOP_GAP +
    measureModuleBodyHeight(ctx, module.lines, contentW) +
    POSTER_CARD_PAD
  );
}

function drawWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines?: number,
): number {
  if (!text) return y;
  const chars = text.split("");
  let line = "";
  let cy = y;
  let drawn = 0;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
      drawn++;
      if (maxLines && drawn >= maxLines) return cy;
    } else {
      line = test;
    }
  }
  if (line && (!maxLines || drawn < maxLines)) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}

function drawPosterModuleCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  module: PosterModule,
  theme: typeof STYLES.classic,
): number {
  const h = measureModuleHeight(ctx, module, w);
  const contentW = w - POSTER_CARD_PAD * 2;
  const bodyX = x + POSTER_CARD_PAD;

  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fill();
  ctx.strokeStyle = `${theme.gold}88`;
  ctx.lineWidth = 1;
  ctx.stroke();

  roundRect(ctx, x + 1, y + 1, w - 2, POSTER_TITLE_H + POSTER_CARD_PAD - 4, 13);
  ctx.fillStyle = `${theme.accent}22`;
  ctx.fill();

  ctx.fillStyle = theme.accent;
  ctx.fillRect(x + POSTER_CARD_PAD, y + POSTER_CARD_PAD + 4, 4, 16);

  ctx.fillStyle = theme.gold;
  ctx.font = "bold 16px PingFang SC, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(module.title, bodyX + 10, y + POSTER_CARD_PAD + 18);

  ctx.fillStyle = theme.text;
  ctx.font = POSTER_BODY_FONT;
  let bodyY = y + POSTER_CARD_PAD + POSTER_TITLE_H + POSTER_BODY_TOP_GAP;
  for (let i = 0; i < module.lines.length; i++) {
    bodyY = drawWrappedLines(ctx, module.lines[i], bodyX, bodyY, contentW, POSTER_BODY_LH);
    if (i < module.lines.length - 1) bodyY += POSTER_LINE_GAP;
  }

  return y + h;
}

function drawModuleCardShell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  theme: typeof STYLES.classic,
) {
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fill();
  ctx.strokeStyle = `${theme.gold}88`;
  ctx.lineWidth = 1;
  ctx.stroke();

  roundRect(ctx, x + 1, y + 1, w - 2, POSTER_TITLE_H + POSTER_CARD_PAD - 4, 13);
  ctx.fillStyle = `${theme.accent}22`;
  ctx.fill();

  ctx.fillStyle = theme.accent;
  ctx.fillRect(x + POSTER_CARD_PAD, y + POSTER_CARD_PAD + 4, 4, 16);

  ctx.fillStyle = theme.gold;
  ctx.font = "bold 16px PingFang SC, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(title, x + POSTER_CARD_PAD + 10, y + POSTER_CARD_PAD + 18);
}

function drawChartModuleCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  block: KlineChartBlock,
  theme: typeof STYLES.classic,
): number {
  const h = POSTER_CHART_MODULE_H;
  drawModuleCardShell(ctx, x, y, w, h, block.title, theme);

  const chartX = x + POSTER_CARD_PAD;
  const chartY = y + POSTER_CARD_PAD + POSTER_TITLE_H;
  const chartW = w - POSTER_CARD_PAD * 2;
  drawKlineChart(ctx, block.data, chartX, chartY, chartW, POSTER_CHART_INNER_H, theme, undefined, true);

  return y + h;
}

type DimensionItem = { label: string; score: number; text?: string; key?: string };

function measureDimensionsModuleHeight(
  ctx: CanvasRenderingContext2D,
  dims: DimensionItem[],
  cardW: number,
): number {
  const contentW = cardW - POSTER_CARD_PAD * 2;
  const overallDim = dims.find((d) => d.key === "overall" || d.label === "整体命势");
  const otherDims = dims.filter((d) => d !== overallDim);

  let h = POSTER_CARD_PAD + POSTER_TITLE_H + POSTER_BODY_TOP_GAP;
  if (overallDim) h += POSTER_DIM_OVERALL_H + 8;
  ctx.font = POSTER_BODY_FONT;
  for (const dim of otherDims) {
    h += POSTER_DIM_ROW_H;
    if (dim.text) {
      h += countWrapLines(ctx, dim.text, contentW) * POSTER_DIM_TEXT_LH + 6;
    }
  }
  return h + POSTER_CARD_PAD;
}

function drawDimensionsModuleCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  dims: DimensionItem[],
  theme: typeof STYLES.classic,
): number {
  const h = measureDimensionsModuleHeight(ctx, dims, w);
  const contentW = w - POSTER_CARD_PAD * 2;
  const bodyX = x + POSTER_CARD_PAD;

  drawModuleCardShell(ctx, x, y, w, h, "维度评分", theme);

  let bodyY = y + POSTER_CARD_PAD + POSTER_TITLE_H + POSTER_BODY_TOP_GAP;
  const overallDim = dims.find((d) => d.key === "overall" || d.label === "整体命势");
  const otherDims = dims.filter((d) => d !== overallDim);

  if (overallDim) {
    roundRect(ctx, bodyX, bodyY, contentW, POSTER_DIM_OVERALL_H - 8, 12);
    ctx.fillStyle = `${theme.accent}22`;
    ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 16px PingFang SC, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(overallDim.label, x + w / 2, bodyY + 26);
    ctx.fillStyle = theme.gold;
    ctx.font = "bold 32px PingFang SC, sans-serif";
    ctx.fillText(`${overallDim.score}分`, x + w / 2, bodyY + 58);
    drawProgressBar(ctx, x + w / 2 - 110, bodyY + 68, 220, overallDim.score, theme, true);
    bodyY += POSTER_DIM_OVERALL_H;
  }

  for (const dim of otherDims) {
    ctx.fillStyle = theme.muted;
    ctx.font = "14px PingFang SC, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(dim.label, bodyX, bodyY + 16);
    ctx.fillStyle = theme.gold;
    ctx.textAlign = "right";
    ctx.fillText(`${dim.score}分`, x + w - POSTER_CARD_PAD, bodyY + 16);
    drawProgressBar(ctx, bodyX, bodyY + 24, contentW, dim.score, theme);
    bodyY += POSTER_DIM_ROW_H;
    if (dim.text) {
      ctx.fillStyle = theme.text;
      ctx.font = "13px PingFang SC, sans-serif";
      ctx.textAlign = "left";
      bodyY = drawWrappedLines(ctx, dim.text, bodyX, bodyY + 4, contentW, POSTER_DIM_TEXT_LH) + 6;
    }
  }

  return y + h;
}

function measureLifeklineHeroHeight(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  cardW: number,
): number {
  const contentW = cardW - POSTER_CARD_PAD * 2;
  ctx.font = POSTER_BODY_FONT;
  const intro = "纵览人生起伏，把握运势节奏，以下为您的人生 K 线命势报告。";
  const introLines = countWrapLines(ctx, intro, contentW);
  let h = POSTER_CARD_PAD + 96 + introLines * POSTER_BODY_LH + POSTER_CARD_PAD;
  if (data.subtitle) h += 38;
  if (data.userName) h += 16;
  return h;
}

function drawLifeklineHeroModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  data: PosterData,
  theme: typeof STYLES.classic,
): number {
  const h = measureLifeklineHeroHeight(ctx, data, w);
  const contentW = w - POSTER_CARD_PAD * 2;
  const cx = x + w / 2;

  roundRect(ctx, x, y, w, h, 16);
  const heroGrad = ctx.createLinearGradient(x, y, x, y + h);
  heroGrad.addColorStop(0, `${theme.accent}33`);
  heroGrad.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = heroGrad;
  ctx.fill();
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "72px serif";
  ctx.textAlign = "center";
  ctx.fillText("📈", cx, y + POSTER_CARD_PAD + 68);

  ctx.fillStyle = theme.text;
  ctx.font = POSTER_BODY_FONT;
  ctx.textAlign = "left";
  let bodyY = drawWrappedLines(
    ctx,
    "纵览人生起伏，把握运势节奏，以下为您的人生 K 线命势报告。",
    x + POSTER_CARD_PAD,
    y + POSTER_CARD_PAD + 92,
    contentW,
    POSTER_BODY_LH,
    3,
  );

  if (data.subtitle) {
    const badgeLabel = `测算对象：${data.subtitle}`;
    ctx.font = "13px PingFang SC, sans-serif";
    const badgeW = Math.min(contentW, ctx.measureText(badgeLabel).width + 28);
    const badgeX = cx - badgeW / 2;
    roundRect(ctx, badgeX, bodyY + 10, badgeW, 28, 14);
    ctx.fillStyle = `${theme.accent}44`;
    ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.fillText(badgeLabel, cx, bodyY + 30);
    bodyY += 38;
  }

  if (data.userName) {
    ctx.fillStyle = theme.gold;
    ctx.font = "13px PingFang SC, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`—— ${data.userName}`, cx, bodyY + 18);
  }

  return y + h;
}

function buildLifeklineTextModules(data: PosterData): PosterModule[] {
  const modules: PosterModule[] = [];

  if (data.baziText) {
    modules.push({ title: "八字排盘", lines: [data.baziText] });
  }

  if (data.summary) {
    modules.push({ title: "运势解读", lines: [data.summary] });
  }

  return modules;
}

function drawPosterPageHeader(
  ctx: CanvasRenderingContext2D,
  W: number,
  data: PosterData,
  theme: typeof STYLES.classic,
) {
  ctx.fillStyle = theme.gold;
  ctx.font = "bold 28px PingFang SC, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(BRAND_NAME, W / 2, 50);

  ctx.fillStyle = theme.text;
  ctx.font = "bold 24px PingFang SC, sans-serif";
  ctx.fillText(data.title, W / 2, 96);

  if (data.subtitle) {
    ctx.fillStyle = theme.muted;
    ctx.font = "14px PingFang SC, sans-serif";
    ctx.fillText(data.subtitle, W / 2, 132);
  }
}

function drawHexagramOnCanvas(
  ctx: CanvasRenderingContext2D,
  lines: { isYang: boolean; label?: string }[],
  cx: number,
  y: number,
  theme: typeof STYLES.classic,
): number {
  const barW = 88;
  const barH = 8;
  const gap = 14;
  const yinGap = 10;
  const display = [...lines].reverse();
  let cy = y + 20;

  display.forEach((line, i) => {
    const rowY = cy + i * gap;
    ctx.fillStyle = theme.muted;
    ctx.font = "11px PingFang SC, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${6 - i}爻`, cx - barW / 2 - 12, rowY + 6);

    ctx.fillStyle = theme.gold;
    if (line.isYang) {
      roundRect(ctx, cx - barW / 2, rowY, barW, barH, 3);
      ctx.fill();
    } else {
      const half = (barW - yinGap) / 2;
      roundRect(ctx, cx - barW / 2, rowY, half, barH, 3);
      ctx.fill();
      roundRect(ctx, cx - barW / 2 + half + yinGap, rowY, half, barH, 3);
      ctx.fill();
    }

    if (line.label) {
      ctx.fillStyle = theme.muted;
      ctx.font = "10px PingFang SC, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(line.label, cx + barW / 2 + 8, rowY + 6);
    }
  });

  return y + display.length * gap + 36;
}

async function generateLiuyaoPoster(data: PosterData, style: PosterStyle): Promise<string> {
  const W = POSTER_W;
  const theme = STYLES[style];
  const cardW = W - POSTER_PAD * 2;

  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = W;
  measureCanvas.height = 10;
  const measureCtx = measureCanvas.getContext("2d")!;
  measureCtx.font = POSTER_BODY_FONT;

  const summaryLines = data.summary.split("\n").filter(Boolean);
  const summaryBodyH = measureModuleBodyHeight(measureCtx, summaryLines, cardW - POSTER_CARD_PAD * 2);
  const summaryH = POSTER_CARD_PAD + POSTER_TITLE_H + POSTER_BODY_TOP_GAP + summaryBodyH + POSTER_CARD_PAD;

  const hexH = data.hexagramLines?.length ? 160 : 0;
  const H =
    measurePosterHeaderHeight(data) +
    hexH +
    POSTER_CARD_GAP +
    summaryH +
    POSTER_CARD_GAP +
    POSTER_FOOTER_H;

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

  drawPosterPageHeader(ctx, W, data, theme);
  let y = measurePosterHeaderHeight(data);

  if (data.hexagramLines?.length) {
    roundRect(ctx, POSTER_PAD, y, cardW, hexH - POSTER_CARD_GAP, 14);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();
    ctx.strokeStyle = `${theme.gold}44`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.gold;
    ctx.font = "bold 16px PingFang SC, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${data.guaName ?? ""}卦 · ${data.luck ?? ""}`, W / 2, y + 28);

    if (data.guaDesc) {
      ctx.fillStyle = theme.muted;
      ctx.font = "12px PingFang SC, sans-serif";
      ctx.fillText(data.guaDesc, W / 2, y + 48);
    }

    drawHexagramOnCanvas(ctx, data.hexagramLines, W / 2, y + 52, theme);
    y += hexH;
  }

  roundRect(ctx, POSTER_PAD, y, cardW, summaryH, 14);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fill();
  ctx.fillStyle = theme.accent;
  ctx.font = "bold 16px PingFang SC, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("卦象解读", POSTER_PAD + POSTER_CARD_PAD, y + 32);

  ctx.fillStyle = theme.text;
  ctx.font = POSTER_BODY_FONT;
  let textY = y + 32 + POSTER_BODY_TOP_GAP + 8;
  summaryLines.forEach((line) => {
    textY = wrapText(ctx, line, POSTER_PAD + POSTER_CARD_PAD, textY, cardW - POSTER_CARD_PAD * 2, POSTER_BODY_LH, 20);
    textY += POSTER_LINE_GAP;
  });

  await drawCompactPosterFooter(ctx, W, y + summaryH + POSTER_FOOTER_TOP_GAP, theme);
  return canvas.toDataURL("image/png");
}

async function drawCompactPosterFooter(
  ctx: CanvasRenderingContext2D,
  W: number,
  footerTop: number,
  theme: typeof STYLES.classic,
) {
  const qrSize = 108;
  const qrX = W / 2 - qrSize / 2;
  const downloadUrl = typeof window !== "undefined" ? window.location.origin : "https://aikline.app";
  const qrUrl = getInviteQrUrl(downloadUrl);

  ctx.strokeStyle = `${theme.gold}66`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(POSTER_PAD, footerTop);
  ctx.lineTo(W - POSTER_PAD, footerTop);
  ctx.stroke();

  try {
    const qrImg = await loadImage(qrUrl);
    roundRect(ctx, qrX - 8, footerTop + 12, qrSize + 16, qrSize + 16, 10);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.drawImage(qrImg, qrX, footerTop + 20, qrSize, qrSize);
  } catch {
    roundRect(ctx, qrX - 8, footerTop + 12, qrSize + 16, qrSize + 16, 10);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.fillStyle = "#333";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("扫码访问", W / 2, footerTop + 72);
  }

  ctx.fillStyle = theme.text;
  ctx.font = "bold 15px PingFang SC, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(BRAND_SLOGAN, W / 2, footerTop + qrSize + 42);

  ctx.fillStyle = theme.muted;
  ctx.font = "12px PingFang SC, sans-serif";
  ctx.fillText("扫码下载 · 测算你的命运", W / 2, footerTop + qrSize + 62);
  ctx.fillText(`仅供娱乐参考 · ${BRAND_NAME}`, W / 2, footerTop + qrSize + 82);
}

async function generateLifeklinePoster(data: PosterData, style: PosterStyle): Promise<string> {
  const W = POSTER_W;
  const theme = STYLES[style];
  const cardW = W - POSTER_PAD * 2;

  const charts: KlineChartBlock[] =
    data.klineCharts?.length
      ? data.klineCharts
      : data.kline?.length
        ? [{ title: "人生 K 线", data: data.kline }]
        : [];

  const dims: DimensionItem[] =
    data.dimensions ?? data.scores?.map((s) => ({ label: s.label, score: s.value })) ?? [];

  const textModules = buildLifeklineTextModules(data);

  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = W;
  measureCanvas.height = 10;
  const measureCtx = measureCanvas.getContext("2d")!;

  const heroH = measureLifeklineHeroHeight(measureCtx, data, cardW);
  const chartsH = charts.length * (POSTER_CHART_MODULE_H + POSTER_CARD_GAP);
  const textModulesH = textModules.reduce(
    (sum, mod) => sum + measureModuleHeight(measureCtx, mod, cardW) + POSTER_CARD_GAP,
    0,
  );
  const dimsH = dims.length
    ? measureDimensionsModuleHeight(measureCtx, dims, cardW) + POSTER_CARD_GAP
    : 0;

  const H =
    measurePosterHeaderHeight(data) +
    heroH +
    POSTER_CARD_GAP +
    chartsH +
    textModulesH +
    dimsH +
    POSTER_FOOTER_H;

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

  drawPosterPageHeader(ctx, W, data, theme);

  let y = measurePosterHeaderHeight(data);
  y = drawLifeklineHeroModule(ctx, POSTER_PAD, y, cardW, data, theme) + POSTER_CARD_GAP;

  for (const block of charts) {
    y = drawChartModuleCard(ctx, POSTER_PAD, y, cardW, block, theme) + POSTER_CARD_GAP;
  }

  for (const mod of textModules) {
    y = drawPosterModuleCard(ctx, POSTER_PAD, y, cardW, mod, theme) + POSTER_CARD_GAP;
  }

  if (dims.length) {
    y = drawDimensionsModuleCard(ctx, POSTER_PAD, y, cardW, dims, theme) + POSTER_CARD_GAP;
  }

  await drawCompactPosterFooter(ctx, W, y + POSTER_FOOTER_TOP_GAP, theme);

  return canvas.toDataURL("image/png");
}

function buildSpiritPetModules(data: PosterData): PosterModule[] {
  const owner = data.ownerName ?? data.userName ?? "主人";
  const modules: PosterModule[] = [];

  const archiveLines: string[] = [`守护主人：${owner}`];
  if (data.petName) archiveLines.push(`灵宠名讳：${data.petName}`);
  if (data.petLevelLabel) archiveLines.push(`觉醒阶段：${data.petLevelLabel}`);
  if (data.petReason) archiveLines.push(`匹配理由：${data.petReason}`);
  if (data.petBaziDetail || data.baziText) {
    archiveLines.push(`命盘四柱：${data.petBaziDetail ?? data.baziText}`);
  }
  if (data.petSpiritPower != null) archiveLines.push(`灵力值：${data.petSpiritPower}`);
  modules.push({ title: "灵宠档案", lines: archiveLines });

  if (data.petIntroTitle) {
    const introLines: string[] = [];
    if (data.petIntroPosition) introLines.push(`成长定位：${data.petIntroPosition}`);
    if (data.petIntroUnlocks?.length) {
      introLines.push(`本阶段解锁：${data.petIntroUnlocks.join(" · ")}`);
    }
    (data.petIntroExamples ?? []).slice(0, 3).forEach((ex) => {
      introLines.push(`• ${ex}`);
    });
    modules.push({ title: data.petIntroTitle, lines: introLines });
  }

  if (data.petDestinyInsights?.length) {
    modules.push({
      title: "命格解读",
      lines: data.petDestinyInsights.map((line) => `• ${line}`),
    });
  }

  const awakeningStages = data.petAwakeningStages?.length
    ? data.petAwakeningStages
    : data.petAwakeningSummary
      ? [{ level: data.petLevel ?? 1, name: "觉醒体系", abilities: [data.petAwakeningSummary] }]
      : [];

  if (awakeningStages.length) {
    const lines = awakeningStages.map(
      (stage) => `LV${stage.level} ${stage.name}：${stage.abilities.join(" · ")}`,
    );
    if (data.petCumulativeAbilities?.length) {
      lines.push(`已解锁累计技能：${data.petCumulativeAbilities.join(" · ")}`);
    }
    modules.push({ title: "觉醒增长体系", lines });
  } else if (data.petCumulativeAbilities?.length) {
    modules.push({
      title: "觉醒增长体系",
      lines: [`已解锁累计技能：${data.petCumulativeAbilities.join(" · ")}`],
    });
  }

  const companionLines: string[] = [];
  if (data.petRoleKeywords) companionLines.push(`陪伴角色：${data.petRoleKeywords}`);
  if (data.petTagline) companionLines.push(`成长型体系：${data.petTagline}`);
  (data.petRoleExamples ?? []).slice(0, 3).forEach((ex) => {
    companionLines.push(`• ${ex}`);
  });
  if (companionLines.length) {
    modules.push({ title: "陪伴作用 · 成长型体系", lines: companionLines });
  }

  return modules;
}

function measureHeroModuleHeight(
  ctx: CanvasRenderingContext2D,
  data: PosterData,
  cardW: number,
): number {
  const contentW = cardW - POSTER_CARD_PAD * 2;
  ctx.font = POSTER_BODY_FONT;
  const greeting = `主人您好，我是你的专属 AI 守护灵宠${data.petName ?? ""}，以后，你的命格，我来守护！`;
  const greetingLines = countWrapLines(ctx, greeting, contentW);
  let h = POSTER_CARD_PAD + 116 + greetingLines * POSTER_BODY_LH + POSTER_CARD_PAD;
  if (data.petName) h += 36;
  if (data.petLevelLabel) h += 34;
  return h;
}

function drawHeroModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  data: PosterData,
  theme: typeof STYLES.classic,
): number {
  const h = measureHeroModuleHeight(ctx, data, w);
  const contentW = w - POSTER_CARD_PAD * 2;
  const cx = x + w / 2;

  roundRect(ctx, x, y, w, h, 16);
  const heroGrad = ctx.createLinearGradient(x, y, x, y + h);
  heroGrad.addColorStop(0, `${theme.accent}33`);
  heroGrad.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = heroGrad;
  ctx.fill();
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "88px serif";
  ctx.textAlign = "center";
  ctx.fillText(data.petEmoji ?? "🦄", cx, y + POSTER_CARD_PAD + 84);

  ctx.fillStyle = theme.text;
  ctx.font = POSTER_BODY_FONT;
  ctx.textAlign = "left";
  const greeting = `主人您好，我是你的专属 AI 守护灵宠${data.petName ?? ""}，以后，你的命格，我来守护！`;
  let bodyY = drawWrappedLines(
    ctx,
    greeting,
    x + POSTER_CARD_PAD,
    y + POSTER_CARD_PAD + 116,
    contentW,
    POSTER_BODY_LH,
    3,
  );

  if (data.petName) {
    ctx.fillStyle = theme.gold;
    ctx.font = "bold 24px PingFang SC, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.petName, cx, bodyY + 10);
    bodyY += 36;
  }

  if (data.petLevelLabel) {
    const badgeW = Math.min(contentW, ctx.measureText(data.petLevelLabel).width + 28);
    const badgeX = cx - badgeW / 2;
    roundRect(ctx, badgeX, bodyY + 4, badgeW, 28, 14);
    ctx.fillStyle = `${theme.accent}44`;
    ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.font = "13px PingFang SC, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.petLevelLabel, cx, bodyY + 24);
  }

  return y + h;
}

async function generateSpiritPetPoster(data: PosterData, style: PosterStyle): Promise<string> {
  const W = SPIRIT_PET_W;
  const theme = STYLES[style];
  const cardW = W - SPIRIT_PAD * 2;
  const modules = buildSpiritPetModules(data);

  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = W;
  measureCanvas.height = 10;
  const measureCtx = measureCanvas.getContext("2d")!;

  const heroH = measureHeroModuleHeight(measureCtx, data, cardW);
  const modulesH = modules.reduce(
    (sum, mod) => sum + measureModuleHeight(measureCtx, mod, cardW) + POSTER_CARD_GAP,
    0,
  );
  const H = measurePosterHeaderHeight(data) + heroH + POSTER_CARD_GAP + modulesH + POSTER_FOOTER_H;

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

  drawPosterPageHeader(ctx, W, data, theme);

  let y = measurePosterHeaderHeight(data);
  y = drawHeroModule(ctx, POSTER_PAD, y, cardW, data, theme) + POSTER_CARD_GAP;

  for (const mod of modules) {
    y = drawPosterModuleCard(ctx, POSTER_PAD, y, cardW, mod, theme) + POSTER_CARD_GAP;
  }

  await drawCompactPosterFooter(ctx, W, y + POSTER_FOOTER_TOP_GAP, theme);

  return canvas.toDataURL("image/png");
}

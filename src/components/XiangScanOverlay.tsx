"use client";

interface XiangScanOverlayProps {
  imageUrl: string;
  label?: string;
}

/** AI 看相 · 科技感四向扫描动画（约 3 秒） */
export default function XiangScanOverlay({
  imageUrl,
  label = "AI 命理矩阵扫描中…",
}: XiangScanOverlayProps) {
  return (
    <div className="xiang-scan-frame relative mx-auto mt-4 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-cyan-400/40 bg-black/90">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="h-full w-full object-cover opacity-75" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />

      <div className="pointer-events-none absolute inset-3 border border-cyan-400/50">
        <span className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-cyan-300" />
        <span className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-cyan-300" />
        <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-cyan-300" />
        <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-cyan-300" />
      </div>

      <div className="xiang-scan-h absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#22d3ee]" />
      <div className="xiang-scan-v absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#22d3ee]" />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3 text-center">
        <p className="caption font-semibold text-cyan-200">{label}</p>
        <p className="micro mt-0.5 text-cyan-400/80">多维特征提取 · 命相矩阵运算</p>
      </div>
    </div>
  );
}

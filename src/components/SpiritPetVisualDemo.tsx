"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface SpiritBeastDemoSpec {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  glow: string;
  accent: string;
}

export const SPIRIT_BEAST_DEMOS: SpiritBeastDemoSpec[] = [
  {
    id: "jiuwei",
    name: "九尾狐",
    subtitle: "青丘灵狐 · 情感洞察",
    image: "/spirit-beasts/jiuwei.png",
    glow: "#d4a574",
    accent: "#5ec4c4",
  },
  {
    id: "baihu",
    name: "白虎",
    subtitle: "金纹灵虎 · 守护祥瑞",
    image: "/spirit-beasts/baihu.png",
    glow: "#e8c878",
    accent: "#7ec8e8",
  },
  {
    id: "qinglong",
    name: "青龙",
    subtitle: "东方神兽 · 事业气运",
    image: "/spirit-beasts/qinglong.png",
    glow: "#5ec4c4",
    accent: "#d4a574",
  },
  {
    id: "fenghuang",
    name: "凤凰",
    subtitle: "涅槃之灵 · 重启成长",
    image: "/spirit-beasts/fenghuang.png",
    glow: "#f0a040",
    accent: "#5ec4c4",
  },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  twinkle: number;
}

function createParticles(w: number, h: number, glow: string, accent: string): Particle[] {
  const count = Math.min(48, Math.floor((w * h) / 12000));
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -0.15 - Math.random() * 0.45,
    size: 1 + Math.random() * 2.5,
    alpha: 0.25 + Math.random() * 0.55,
    color: Math.random() > 0.35 ? glow : accent,
    twinkle: Math.random() * Math.PI * 2,
  }));
}

interface SpiritPetVisualDemoProps {
  beasts?: SpiritBeastDemoSpec[];
  className?: string;
}

export default function SpiritPetVisualDemo({
  beasts = SPIRIT_BEAST_DEMOS,
  className = "",
}: SpiritPetVisualDemoProps) {
  const [activeId, setActiveId] = useState(beasts[0]?.id ?? "jiuwei");
  const beast = beasts.find((b) => b.id === activeId) ?? beasts[0];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !beast) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += 0.04;
      if (p.y < -8) {
        p.y = height + 8;
        p.x = Math.random() * width;
      }
      if (p.x < -8) p.x = width + 8;
      if (p.x > width + 8) p.x = -8;

      const a = p.alpha * (0.55 + 0.45 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    frameRef.current = requestAnimationFrame(drawParticles);
  }, [beast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !beast) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);
      particlesRef.current = createParticles(rect.width, rect.height, beast.glow, beast.accent);
    };

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(drawParticles);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [beast, drawParticles]);

  if (!beast) return null;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {beasts.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveId(b.id)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${
              activeId === b.id
                ? "border-app-gold bg-app-gold/20 text-app-gold"
                : "border-app-border bg-app-card text-app-muted hover:border-app-gold/50"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div
        className="spirit-beast-stage relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-app-gold/25"
        style={{
          background: "radial-gradient(ellipse at 50% 75%, #1a1510 0%, #0a0908 55%, #050504 100%)",
        }}
      >
        {/* 水墨云雾 */}
        <div className="spirit-beast-mist spirit-beast-mist-a pointer-events-none absolute inset-0 opacity-40" />
        <div className="spirit-beast-mist spirit-beast-mist-b pointer-events-none absolute inset-0 opacity-30" />

        {/* 地面金纹 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]">
          <div className="spirit-beast-ripple absolute bottom-[18%] left-1/2 h-24 w-[88%] -translate-x-1/2 rounded-[50%] border border-app-gold/20" />
          <div className="spirit-beast-ripple spirit-beast-ripple-delay absolute bottom-[12%] left-1/2 h-32 w-[95%] -translate-x-1/2 rounded-[50%] border border-app-gold/12" />
        </div>

        {/* 主光晕 */}
        <div className="pointer-events-none absolute left-1/2 top-[42%] h-[55%] w-[85%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="spirit-beast-glow h-full w-full rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${beast.glow}55 0%, transparent 70%)` }}
          />
        </div>

        {/* 粒子层 */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" aria-hidden />

        {/* 灵兽主体 */}
        <div className="spirit-beast-float absolute inset-0 z-20 flex items-end justify-center pb-[8%]">
          <div className="relative h-[78%] w-[92%]">
            <Image
              src={beast.image}
              alt={beast.name}
              fill
              priority
              className="spirit-beast-breathe object-contain object-bottom drop-shadow-[0_0_28px_rgba(212,165,116,0.35)]"
              sizes="(max-width: 480px) 100vw, 384px"
            />
          </div>
        </div>

        {/* 底部信息 */}
        <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-10 text-center">
          <p className="block-title text-app-gold">{beast.name}</p>
          <p className="caption mt-0.5 text-white/75">{beast.subtitle}</p>
        </div>
      </div>

      <p className="caption mt-3 text-center text-app-muted">
        Demo：静态灵兽图 + 光晕脉冲 + 金粉粒子 + 云雾漂移 + 地面金纹
      </p>
    </div>
  );
}

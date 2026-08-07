"use client";

import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { UI_THEMES, type UiThemeId } from "@/lib/ui-themes";

function ThemeMock({ id, active }: { id: UiThemeId; active: boolean }) {
  const meta = UI_THEMES.find((t) => t.id === id)!;
  const p = meta.preview;

  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 transition-all ${active ? "border-app-accent ring-2 ring-app-accent/20" : "border-app-border"}`}
      style={{ background: p.bg }}
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ background: p.card, borderBottom: `1px solid ${p.bg}` }}>
        <div className="h-2 w-2 rounded-full" style={{ background: p.accent }} />
        <span className="text-[10px] font-semibold" style={{ color: p.text }}>AI 灵宠</span>
        <div className="h-4 w-4 rounded-full" style={{ background: `${p.accent}33` }} />
      </div>
      <div className="space-y-2 p-3">
        <div className="rounded-lg p-2.5" style={{ background: p.card, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p className="text-[11px] font-bold" style={{ color: p.text }}>守护灵 · 九尾狐</p>
          <p className="mt-0.5 text-[9px]" style={{ color: p.text, opacity: 0.55 }}>懂你命盘，陪你成长</p>
        </div>
        <div className="rounded-lg py-2 text-center text-[10px] font-semibold text-white" style={{ background: p.accent }}>
          领取专属灵宠
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i === 1 ? p.accent : `${p.text}18` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ThemePreviewPage() {
  const { uiTheme, setUiTheme } = useApp();

  return (
    <div className="px-4 pb-8">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-[13px] text-app-accent">
        <ChevronLeft className="h-4 w-4" /> 返回首页
      </Link>

      <header className="mb-5">
        <h1 className="page-title">选择界面风格</h1>
        <p className="page-subtitle mt-1">
          四套主题全局生效 · 简洁明亮 · 高对比易读<br />
          当前：<strong className="text-app-accent">{UI_THEMES.find((t) => t.id === uiTheme)?.name}</strong>
        </p>
      </header>

      <div className="space-y-5">
        {UI_THEMES.map((theme) => {
          const active = uiTheme === theme.id;
          return (
            <div key={theme.id} className="app-card !p-0 overflow-hidden">
              <div className="p-4 pb-3">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-bold text-app-text">
                      {theme.name}
                      {theme.id === "cloud" && (
                        <span className="ml-2 rounded-full bg-app-accent/10 px-2 py-0.5 text-[10px] font-medium text-app-accent">推荐</span>
                      )}
                    </p>
                    <p className="text-[12px] font-medium text-app-accent">{theme.tagline}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-app-muted">{theme.desc}</p>
                  </div>
                  {active && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-app-accent text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <ThemeMock id={theme.id} active={active} />
              </div>
              <button
                onClick={() => setUiTheme(theme.id)}
                className={active ? "app-btn-secondary !rounded-none !border-x-0 !border-b-0" : "app-btn !rounded-none"}
              >
                {active ? "当前使用中" : `选用「${theme.name}」风格`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[12px] text-app-muted">
        可在「我的 → 界面风格」中随时切换
      </p>
    </div>
  );
}

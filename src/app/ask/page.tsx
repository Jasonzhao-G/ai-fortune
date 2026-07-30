"use client";

import AiAskBox from "@/components/AiAskBox";
import Link from "next/link";

export default function AskPage() {
  return (
    <div className="px-4 pb-4">
      <header className="mb-4 pt-2 text-center">
        <h1 className="page-title text-2xl">问 AI</h1>
        <p className="mt-1 text-xs text-app-muted">AI 大师在线答疑 · 命理智慧随时问</p>
      </header>

      <div className="cta-banner mb-5">
        <p className="text-base font-bold text-white">有任何命理疑惑？</p>
        <p className="text-xs text-white/80">选择快捷提问或自定义输入</p>
      </div>

      <AiAskBox />

      <Link href="/lifekline" className="app-btn-outline mt-4 block text-center">
        也可以测算人生 K 线 →
      </Link>
    </div>
  );
}

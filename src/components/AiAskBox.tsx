"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles, Pencil } from "lucide-react";
import { canUse, incrementUsage, getRemaining, addHistory } from "@/lib/user-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "@/lib/record-store";
import { loadBirthInfo, saveBirthInfo, getEffectiveBirthInfo, formatBirthSummary } from "@/lib/birth-store";
import { useApp } from "@/context/AppContext";
import PaywallModal from "@/components/PaywallModal";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import BirthForm from "@/components/BirthForm";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import type { BirthInfo } from "@/lib/types";

const PROMPTS = [
  "我今年的运势如何？",
  "我今天适合穿什么颜色的衣服？",
  "我的贵人在什么方向？",
  "什么方位是我的吉位？",
  "我近期适合跳槽吗？",
  "我的桃花运什么时候来？",
];

const MOCK_ANSWERS: Record<string, string> = {
  default: "根据您的命理分析，当前运势整体平稳。建议保持积极心态，顺势而为，多行善事可助运势提升。",
  "运势": "今年整体运势中等偏上，春季和秋季为运势高峰。事业上宜稳中求进，财运以正财为主，感情方面需主动沟通。",
  "颜色": "今日宜穿红色、紫色系衣物，有助于提升气场和贵人运。避免全黑搭配，以免压制运势。",
  "贵人": "您的贵人位在西北方向，可能来自年长女性或属土、属金之人。多留意此方向的机遇与人脉。",
  "吉位": "您的吉位在东南方，办公或居家时可优先选择此方位。床头朝东南亦有助于提升睡眠质量和运势。",
  "跳槽": "当前并非最佳跳槽时机，建议再观察3-6个月。下半年运势转旺，届时机会更佳。",
  "桃花": "您的桃花运在明年春季渐入佳境，农历三月前后尤为明显。多参与社交活动，保持开放心态。",
};

function mockAnswer(q: string): string {
  for (const [key, ans] of Object.entries(MOCK_ANSWERS)) {
    if (key !== "default" && q.includes(key)) return ans;
  }
  return MOCK_ANSWERS.default;
}

export default function AiAskBox() {
  const { user } = useApp();
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [editingBirth, setEditingBirth] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);

  const remaining = getRemaining("aiAsk");

  useEffect(() => {
    const saved = getEffectiveBirthInfo() ?? loadBirthInfo();
    if (saved) {
      setBirthInfo(saved);
      setEditingBirth(false);
    } else {
      setEditingBirth(true);
    }
  }, []);

  const handleBirthSave = (info: BirthInfo) => {
    const saved = saveBirthInfo(info);
    setBirthInfo(saved);
    setEditingBirth(false);
  };

  const ask = async (q: string) => {
    if (!q.trim()) return;
    if (!birthInfo) {
      setEditingBirth(true);
      return;
    }
    if (!ensurePrimaryPersonBeforeCalc()) { setPrimaryModal(true); return; }
    if (!canUse("aiAsk")) { setPaywall(true); return; }

    setLoading(true);
    setQuestion(q);
    setAnswer("");

    await new Promise((r) => setTimeout(r, 1500));
    const calNote = birthInfo.calendar === "lunar" ? "（按农历生辰）" : "（按阳历生辰）";
    const ans = `${mockAnswer(q)}${calNote}`;
    setAnswer(ans);
    incrementUsage("aiAsk");
    addHistory({ type: "aiAsk", title: q.slice(0, 30), data: { q, ans, birthInfo } });
    const personName = birthInfo.name || user?.nickname || "我";
    saveRecord({
      type: "aiAsk",
      personKey: buildPersonKey(personName, birthInfo),
      personName,
      personLabel: buildPersonLabel(personName, birthInfo),
      title: q.slice(0, 20),
      summary: ans.slice(0, 80),
      data: { question: q, answer: ans, birthInfo },
    });
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="app-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-app-text">生辰信息</p>
          {birthInfo && !editingBirth && (
            <button onClick={() => setEditingBirth(true)} className="flex items-center gap-1 text-[10px] text-app-accent">
              <Pencil className="h-3 w-3" /> 修改
            </button>
          )}
        </div>

        {birthInfo && !editingBirth ? (
          <div className="rounded-xl border border-app-border bg-app-bg px-3 py-2">
            <p className="text-xs text-app-text">{formatBirthSummary(birthInfo)}</p>
            <p className="mt-1 text-[10px] text-app-muted">已保存，人生K线 / 八字排盘 / 问AI 将共用此信息</p>
          </div>
        ) : (
          <BirthForm
            onSubmit={handleBirthSave}
            submitLabel={birthInfo ? "保存并更新生辰" : "确认生辰信息"}
            compact
          />
        )}
      </div>

      <div className="app-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-app-accent" />
            <h3 className="text-sm font-medium text-app-text">问 AI</h3>
          </div>
          <span className="text-[10px] text-app-muted">剩余 {remaining} 次免费</span>
        </div>

        {!birthInfo && (
          <p className="mb-3 rounded-lg bg-app-accent/10 px-3 py-2 text-[11px] text-app-accent">
            请先填写并确认生辰信息，再进行提问
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-1.5">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => ask(p)} disabled={!birthInfo}
              className="rounded-full border border-app-border px-2.5 py-1 text-[10px] text-app-muted transition-colors hover:border-app-accent hover:text-app-accent disabled:opacity-40">
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="app-input flex-1"
            placeholder={birthInfo ? "输入您想问的问题..." : "请先确认生辰信息"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(question)}
            disabled={!birthInfo}
          />
          <button onClick={() => ask(question)} disabled={loading || !birthInfo}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent text-white disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <p className="mt-3 text-xs text-app-accent animate-pulse">AI 大师正在思考...</p>
        )}
        {answer && !loading && (
          <div className="mt-3 rounded-xl bg-app-bg p-3 text-xs leading-relaxed text-app-muted">
            {answer}
          </div>
        )}

        <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="问 AI" />
        <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
      </div>
    </div>
  );
}

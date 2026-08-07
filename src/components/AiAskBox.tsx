"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Sparkles } from "lucide-react";
import { canUse, incrementUsage, getRemaining, addHistory } from "@/lib/user-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "@/lib/record-store";
import { loadBirthInfo, saveBirthInfo, getEffectiveBirthInfo, formatBirthSummary } from "@/lib/birth-store";
import { useApp } from "@/context/AppContext";
import PaywallModal from "@/components/PaywallModal";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import BirthForm from "@/components/BirthForm";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import { grantSpiritPowerForTask } from "@/lib/spirit-pet-tasks";
import { getSpiritAbilityPrompt } from "@/lib/spirit-pet-ask";
import type { BirthInfo, SpiritPetProfile } from "@/lib/types";

const PROMPTS = [
  "我今年的运势如何？",
  "我今天适合穿什么颜色的衣服？",
  "我的贵人在什么方向？",
  "我近期适合跳槽吗？",
];

const MOCK_ANSWERS: Record<string, string> = {
  default: "根据您的命理分析，当前运势整体平稳。建议保持积极心态，顺势而为。",
  "运势": "今年整体运势中等偏上，春季和秋季为运势高峰。",
  "颜色": "今日宜穿红色、紫色系衣物，有助于提升气场。",
  "贵人": "您的贵人位在西北方向，多留意此方向的机遇。",
  "跳槽": "当前并非最佳跳槽时机，建议再观察3-6个月。",
};

function mockAnswer(q: string): string {
  for (const [key, ans] of Object.entries(MOCK_ANSWERS)) {
    if (key !== "default" && q.includes(key)) return ans;
  }
  return MOCK_ANSWERS.default;
}

interface AiAskBoxProps {
  spiritPetMode?: boolean;
  initialAbility?: string | null;
  pet?: SpiritPetProfile | null;
  personName?: string;
  birthInfo?: BirthInfo | null;
}

export default function AiAskBox({
  spiritPetMode = false,
  initialAbility,
  pet,
  personName: ownerName = "主人",
  birthInfo: birthInfoProp,
}: AiAskBoxProps) {
  const { user } = useApp();
  const [fromSpiritPet, setFromSpiritPet] = useState(spiritPetMode);

  useEffect(() => {
    setFromSpiritPet(
      spiritPetMode || new URLSearchParams(window.location.search).get("from") === "spirit-pet",
    );
  }, [spiritPetMode]);

  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(birthInfoProp ?? null);
  const [editingBirth, setEditingBirth] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);
  const [remaining, setRemaining] = useState(5);

  useEffect(() => {
    setRemaining(getRemaining("aiAsk"));
  }, [answer]);

  useEffect(() => {
    if (birthInfoProp) {
      setBirthInfo(birthInfoProp);
      setEditingBirth(false);
      return;
    }
    const saved = getEffectiveBirthInfo() ?? loadBirthInfo();
    if (saved) {
      setBirthInfo(saved);
      setEditingBirth(false);
    } else {
      setEditingBirth(!spiritPetMode);
    }
  }, [birthInfoProp, spiritPetMode]);

  const runAsk = useCallback(async (q: string, abilityKey?: string | null) => {
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

    await new Promise((r) => setTimeout(r, 1200));

    let ans: string;
    if (abilityKey) {
      const prompt = getSpiritAbilityPrompt(abilityKey);
      if (prompt?.isFortune) {
        setLoading(false);
        return;
      }
      ans = prompt?.answerTemplate ?? mockAnswer(q);
      if (pet) {
        ans = `${pet.emoji} ${pet.fullName}：${ans}`;
      }
    } else {
      const calNote = birthInfo.calendar === "lunar" ? "（按农历生辰）" : "（按阳历生辰）";
      ans = fromSpiritPet && pet
        ? `${pet.emoji} ${pet.fullName}：${mockAnswer(q)}${calNote}`
        : `${mockAnswer(q)}${calNote}`;
    }

    setAnswer(ans);
    incrementUsage("aiAsk");
    setRemaining(getRemaining("aiAsk"));
    addHistory({ type: "aiAsk", title: q.slice(0, 30), data: { q, ans, birthInfo } });
    const personName = birthInfo.name || user?.nickname || ownerName;
    saveRecord({
      type: "aiAsk",
      personKey: buildPersonKey(personName, birthInfo),
      personName,
      personLabel: buildPersonLabel(personName, birthInfo),
      title: q.slice(0, 20),
      summary: ans.slice(0, 80),
      data: { question: q, answer: ans, birthInfo },
    });
    if (fromSpiritPet) {
      grantSpiritPowerForTask("chat");
    }
    setLoading(false);
  }, [birthInfo, fromSpiritPet, pet, user?.nickname, ownerName]);

  useEffect(() => {
    if (!initialAbility || initialAbility.includes("灵签")) {
      if (initialAbility?.includes("灵签")) {
        setQuestion(getSpiritAbilityPrompt(initialAbility)?.question ?? "");
        setAnswer("");
      }
      return;
    }
    const prompt = getSpiritAbilityPrompt(initialAbility);
    if (prompt && birthInfo) {
      runAsk(prompt.question, initialAbility);
    }
  }, [initialAbility, birthInfo, runAsk]);

  const handleBirthSave = (info: BirthInfo) => {
    const saved = saveBirthInfo(info);
    setBirthInfo(saved);
    setEditingBirth(false);
  };

  const needsBirth = !birthInfo && !spiritPetMode;

  return (
    <div className="space-y-4">
      {!spiritPetMode && (
        <div className="app-card">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-app-text">生辰信息</p>
          </div>
          {birthInfo && !editingBirth ? (
            <div className="rounded-xl border border-app-border bg-app-bg px-3 py-2">
              <p className="text-xs text-app-text">{formatBirthSummary(birthInfo)}</p>
            </div>
          ) : (
            <BirthForm onSubmit={handleBirthSave} submitLabel={birthInfo ? "保存并更新生辰" : "确认生辰信息"} compact />
          )}
        </div>
      )}

      <div className="app-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-app-accent" />
            <h3 className="text-sm font-medium text-app-text">
              {fromSpiritPet ? "与灵宠对话" : "问AI灵宠"}
            </h3>
          </div>
          <span className="text-[10px] text-app-muted">剩余 {remaining} 次免费</span>
        </div>

        {needsBirth && (
          <p className="mb-3 rounded-lg bg-app-accent/10 px-3 py-2 text-[11px] text-app-accent">
            请先填写并确认生辰信息，再进行提问
          </p>
        )}

        {!fromSpiritPet && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PROMPTS.map((p) => (
              <button key={p} type="button" onClick={() => runAsk(p)} disabled={!birthInfo}
                className="rounded-full border border-app-border px-2.5 py-1 text-[10px] text-app-muted transition-colors hover:border-app-accent hover:text-app-accent disabled:opacity-40">
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="app-input flex-1"
            placeholder={birthInfo ? (fromSpiritPet ? "和灵宠说点什么…" : "输入您想问的问题...") : "请先确认生辰信息"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAsk(question)}
            disabled={needsBirth}
          />
          <button type="button" onClick={() => runAsk(question)} disabled={loading || needsBirth}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent text-white disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <p className="mt-3 text-xs text-app-accent animate-pulse">
            {pet ? `${pet.fullName}正在思考…` : "AI 灵宠正在思考…"}
          </p>
        )}
        {answer && !loading && (
          <div className="mt-3 rounded-xl border border-app-accent/20 bg-app-bg p-3 text-xs leading-relaxed text-app-text">
            {answer}
          </div>
        )}

        <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="问AI灵宠" />
        <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
      </div>
    </div>
  );
}

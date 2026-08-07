"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { canUse, incrementUsage, getRemaining, addHistory } from "@/lib/user-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "@/lib/record-store";
import { getEffectiveBirthInfo, loadBirthInfo } from "@/lib/birth-store";
import { useApp } from "@/context/AppContext";
import PaywallModal from "@/components/PaywallModal";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import { grantSpiritPowerForTask } from "@/lib/spirit-pet-tasks";
import { getSpiritAbilityPrompt } from "@/lib/spirit-pet-ask";
import SpiritPetDisplay from "@/components/SpiritPetDisplay";
import type { BirthInfo, SpiritPetProfile } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "pet";
  text: string;
}

const MOCK_ANSWERS: Record<string, string> = {
  default: "根据您的命理分析，当前运势整体平稳。建议保持积极心态，顺势而为。",
  运势: "今年整体运势中等偏上，春季和秋季为运势高峰。",
  颜色: "今日宜穿红色、紫色系衣物，有助于提升气场。",
  贵人: "您的贵人位在西北方向，多留意此方向的机遇。",
  跳槽: "当前并非最佳跳槽时机，建议再观察3-6个月。",
};

function mockAnswer(q: string): string {
  for (const [key, ans] of Object.entries(MOCK_ANSWERS)) {
    if (key !== "default" && q.includes(key)) return ans;
  }
  return MOCK_ANSWERS.default;
}

interface SpiritPetChatPanelProps {
  pet?: SpiritPetProfile | null;
  personName?: string;
  birthInfo?: BirthInfo | null;
  initialAbility?: string | null;
  className?: string;
  /** modal：弹层聊天；page：带区块标题 */
  variant?: "page" | "modal";
  onClose?: () => void;
}

export default function SpiritPetChatPanel({
  pet,
  personName: ownerName = "主人",
  birthInfo: birthInfoProp,
  initialAbility,
  className = "",
  variant = "page",
  onClose,
}: SpiritPetChatPanelProps) {
  const { user } = useApp();
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(birthInfoProp ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seededAbility = useRef<string | null>(null);

  useEffect(() => {
    setRemaining(getRemaining("aiAsk"));
  }, [messages.length]);

  useEffect(() => {
    if (birthInfoProp) {
      setBirthInfo(birthInfoProp);
      return;
    }
    setBirthInfo(getEffectiveBirthInfo() ?? loadBirthInfo());
  }, [birthInfoProp]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const appendPetGreeting = useCallback(() => {
    if (!pet || messages.length > 0) return;
    setMessages([
      {
        id: "welcome",
        role: "pet",
        text: `${pet.emoji} 我是${pet.fullName}，${ownerName}，有什么想问的随时跟我说～`,
      },
    ]);
  }, [pet, ownerName, messages.length]);

  useEffect(() => {
    appendPetGreeting();
  }, [appendPetGreeting]);

  const sendMessage = useCallback(
    async (q: string, abilityKey?: string | null) => {
      if (!q.trim()) return;
      if (!birthInfo) return;
      if (!ensurePrimaryPersonBeforeCalc()) {
        setPrimaryModal(true);
        return;
      }
      if (!canUse("aiAsk")) {
        setPaywall(true);
        return;
      }

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: q.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setDraft("");
      setLoading(true);

      await new Promise((r) => setTimeout(r, 900));

      let ans: string;
      if (abilityKey) {
        const prompt = getSpiritAbilityPrompt(abilityKey);
        if (prompt?.isFortune) {
          setLoading(false);
          return;
        }
        ans = prompt?.answerTemplate ?? mockAnswer(q);
      } else {
        const calNote = birthInfo.calendar === "lunar" ? "（按农历生辰）" : "（按阳历生辰）";
        ans = mockAnswer(q) + calNote;
      }

      if (pet) {
        ans = `${pet.emoji} ${pet.fullName}：${ans}`;
      }

      setMessages((prev) => [...prev, { id: `p-${Date.now()}`, role: "pet", text: ans }]);
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
      grantSpiritPowerForTask("chat");
      setLoading(false);
    },
    [birthInfo, pet, user?.nickname, ownerName],
  );

  useEffect(() => {
    if (!initialAbility || initialAbility.includes("灵签")) return;
    if (seededAbility.current === initialAbility) return;
    if (!birthInfo) return;
    const prompt = getSpiritAbilityPrompt(initialAbility);
    if (!prompt) return;
    seededAbility.current = initialAbility;
    sendMessage(prompt.question, initialAbility);
  }, [initialAbility, birthInfo, sendMessage]);

  const petEmoji = pet?.emoji ?? "🦄";

  const chatBody = (
    <div className={`app-card flex flex-col overflow-hidden !p-0 ${variant === "modal" ? "max-h-[min(78vh,560px)]" : "min-h-[320px]"}`}>
      <div className="flex items-center gap-2 border-b border-app-border px-3 py-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-accent/15 text-lg">
          {petEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-app-text">
            {pet?.fullName ?? "AI 灵宠"}
          </p>
          <p className="text-[10px] text-app-muted">一对一私信 · 命理陪伴 · 剩余 {remaining} 次</p>
        </div>
        {variant === "modal" && onClose && (
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-app-muted hover:text-app-text">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3" style={{ maxHeight: variant === "modal" ? "min(52vh, 380px)" : "min(52vh, 420px)" }}>
          {messages.map((m) => {
            const mine = m.role === "user";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && (
                  <span className="mr-1.5 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-app-accent/10 text-sm">
                    {petEmoji}
                  </span>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    mine
                      ? "rounded-br-md bg-app-accent text-white"
                      : "rounded-bl-md border border-app-border bg-app-bg text-app-text"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <span className="mr-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-app-accent/10 text-sm">
                {petEmoji}
              </span>
              <div className="rounded-2xl rounded-bl-md border border-app-border bg-app-bg px-3 py-2 text-xs text-app-muted animate-pulse">
                正在输入…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 输入区 */}
        <div className="border-t border-app-border p-3">
          {!birthInfo && (
            <p className="mb-2 text-center text-[10px] text-app-accent">
              请先在 AI 灵宠页完成收养，以便灵宠读取命格
            </p>
          )}
          <div className="flex gap-2">
            <input
              className="app-input flex-1 !py-2 text-xs"
              placeholder={birthInfo ? "和灵宠说点什么…" : "等待命格信息…"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(draft)}
              disabled={!birthInfo || loading}
            />
            <button
              type="button"
              onClick={() => sendMessage(draft)}
              disabled={loading || !draft.trim() || !birthInfo}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-app-accent text-white disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div className={`fixed inset-0 z-[75] flex items-end justify-center bg-black/50 px-3 pb-4 backdrop-blur-sm sm:items-center ${className}`}>
        <div className="flex max-h-[92vh] w-full max-w-lg flex-col gap-3 overflow-y-auto">
          {pet && (
            <SpiritPetDisplay pet={pet} personName={ownerName} compact />
          )}
          {chatBody}
        </div>
        <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="问AI灵宠" />
        <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
      </div>
    );
  }

  return (
    <section className={`page-section ${className}`}>
      {pet && (
        <div className="mb-3">
          <SpiritPetDisplay pet={pet} personName={ownerName} compact />
        </div>
      )}
      {chatBody}
      <PaywallModal open={paywall} onClose={() => setPaywall(false)} feature="问AI灵宠" />
      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
    </section>
  );
}

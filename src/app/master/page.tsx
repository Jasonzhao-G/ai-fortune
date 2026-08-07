"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { submitMasterConsult } from "@/lib/message-store";
import { saveRecord, buildPersonKey, buildPersonLabel } from "@/lib/record-store";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import type { BirthInfo } from "@/lib/types";

const TEST_MODE_FREE = true;

export default function MasterPage() {
  const { user } = useApp();
  const [name, setName] = useState("");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [primaryModal, setPrimaryModal] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !question.trim() || !user) return;
    if (!ensurePrimaryPersonBeforeCalc()) { setPrimaryModal(true); return; }
    submitMasterConsult({
      userId: user.id,
      name: name.trim(),
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      birthHour: hour,
      calendar,
      question: question.trim(),
    });
    const birth: BirthInfo = {
      year, month, day, hour, minute: 0, gender: "male", name: name.trim(),
    };
    saveRecord({
      type: "master",
      personKey: buildPersonKey(name.trim(), birth),
      personName: name.trim(),
      personLabel: buildPersonLabel(name.trim(), birth),
      title: "真人大师咨询",
      summary: question.trim().slice(0, 60),
      data: { question: question.trim(), calendar, birth, status: "pending" },
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pb-4">
        <CheckCircle className="mb-4 h-16 w-16 text-app-gold" />
        <h2 className="mb-2 text-lg font-bold text-app-text">提交成功</h2>
        <p className="mb-1 text-center text-sm text-app-muted">大师将在 24 小时之内回复</p>
        <p className="text-center text-xs text-app-muted">请留意左上角「我的 → 消息」通知，CRM 后台回复后将推送至此</p>
        {!TEST_MODE_FREE && (
          <p className="mt-4 text-xs text-app-muted">本次咨询 ¥19.9（测试期间免费）</p>
        )}
        <button onClick={() => setSubmitted(false)} className="app-btn-outline mt-6 max-w-xs">
          再次咨询
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="问真人大师"
        subtitle="资深命理师 · 一对一解答"
      />
      <div className="mb-4 text-center">
        {TEST_MODE_FREE ? (
          <Badge variant="gold">测试期间免费</Badge>
        ) : (
          <Badge variant="accent">单次咨询 ¥19.9</Badge>
        )}
      </div>

      <div className="app-card space-y-4">
        <div>
          <label className="app-label">姓名</label>
          <input className="app-input" placeholder="请输入您的姓名" value={name}
            onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="app-label">出生年月日时</label>
          <div className="grid grid-cols-4 gap-2">
            <input type="number" className="app-input !px-2 text-center" value={year}
              onChange={(e) => setYear(+e.target.value)} placeholder="年" />
            <input type="number" className="app-input !px-2 text-center" min={1} max={12} value={month}
              onChange={(e) => setMonth(+e.target.value)} placeholder="月" />
            <input type="number" className="app-input !px-2 text-center" min={1} max={31} value={day}
              onChange={(e) => setDay(+e.target.value)} placeholder="日" />
            <input type="number" className="app-input !px-2 text-center" min={0} max={23} value={hour}
              onChange={(e) => setHour(+e.target.value)} placeholder="时" />
          </div>
        </div>

        <div>
          <label className="app-label">历法</label>
          <div className="flex gap-2">
            {(["solar", "lunar"] as const).map((c) => (
              <button key={c} onClick={() => setCalendar(c)}
                className={`flex-1 rounded-xl border py-2 text-xs ${
                  calendar === c ? "border-app-accent bg-app-accent/10 text-app-accent" : "border-app-border text-app-muted"
                }`}>
                {c === "solar" ? "阳历" : "农历"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="app-label">所问何事？</label>
          <textarea className="app-input min-h-[120px] resize-none"
            placeholder="请详细描述您想咨询的问题，如事业、感情、健康等…"
            value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>

        <button onClick={handleSubmit} disabled={!name.trim() || !question.trim()} className="app-btn">
          提交咨询
        </button>
      </div>

      <p className="mt-4 text-center text-[10px] text-app-muted">
        提交后大师将在 24 小时内回复 · 回复将推送至「消息」
      </p>

      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
    </>
  );
}

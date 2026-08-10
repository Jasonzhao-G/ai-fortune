"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { submitMasterConsultWithSave } from "@/lib/submit-master-consult";
import { ensurePrimaryPersonBeforeCalc } from "@/lib/person-store";
import PrimaryPersonModal from "@/components/PrimaryPersonModal";
import BoostFortuneButton from "@/components/BoostFortuneButton";
import MasterPayModal from "@/components/MasterPayModal";
import Badge from "@/components/ui/Badge";
import { MASTER_CONSULT_PRICE } from "@/lib/master-pay-store";

export default function MasterHubPanel() {
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
  const [payModal, setPayModal] = useState(false);

  const submitConsult = () => {
    if (!name.trim() || !question.trim() || !user) return;
    submitMasterConsultWithSave({
      userId: user.id,
      name: name.trim(),
      year,
      month,
      day,
      hour,
      calendar,
      question: question.trim(),
    });
    setSubmitted(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !question.trim() || !user) return;
    if (!ensurePrimaryPersonBeforeCalc()) { setPrimaryModal(true); return; }
    setPayModal(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8">
        <CheckCircle className="mb-4 h-14 w-14 text-app-gold" />
        <h2 className="mb-2 text-lg font-bold text-app-text">提交成功</h2>
        <p className="text-center text-sm text-app-muted">大师将在 24 小时之内回复，请留意「我的 → 消息」</p>
        <p className="caption mt-2 text-app-gold">本次咨询 ¥{MASTER_CONSULT_PRICE} · 不占用灵丹次数</p>
        <div className="mt-4 max-w-xs">
          <BoostFortuneButton />
        </div>
        <button onClick={() => setSubmitted(false)} className="app-btn-outline mt-6 max-w-xs">
          再次咨询
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="caption mb-3 text-app-muted">资深命理师 · 一对一解答 · 不占用灵丹次数</p>
      <div className="mb-4 text-center">
        <Badge variant="accent">单次咨询 ¥{MASTER_CONSULT_PRICE}</Badge>
      </div>
      <div className="app-card space-y-4">
        <div>
          <label className="app-label">姓名</label>
          <input className="app-input" placeholder="请输入您的姓名" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="app-label">出生年月日时</label>
          <div className="grid grid-cols-4 gap-2">
            <input type="number" className="app-input !px-2 text-center" value={year} onChange={(e) => setYear(+e.target.value)} />
            <input type="number" className="app-input !px-2 text-center" min={1} max={12} value={month} onChange={(e) => setMonth(+e.target.value)} />
            <input type="number" className="app-input !px-2 text-center" min={1} max={31} value={day} onChange={(e) => setDay(+e.target.value)} />
            <input type="number" className="app-input !px-2 text-center" min={0} max={23} value={hour} onChange={(e) => setHour(+e.target.value)} />
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
          <textarea className="app-input min-h-[120px] resize-none" placeholder="请详细描述您想咨询的问题…"
            value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
        <button onClick={handleSubmit} disabled={!name.trim() || !question.trim()} className="app-btn">
          支付 ¥{MASTER_CONSULT_PRICE} 并提交咨询
        </button>
      </div>
      <PrimaryPersonModal open={primaryModal} onClose={() => setPrimaryModal(false)} />
      <MasterPayModal open={payModal} onClose={() => setPayModal(false)} onPaid={submitConsult} />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import type { BirthInfo } from "@/lib/types";
import { loadBirthInfo, saveBirthInfo } from "@/lib/birth-store";

interface BirthFormProps {
  onSubmit: (info: BirthInfo) => void;
  loading?: boolean;
  submitLabel?: string;
  compact?: boolean;
}

export default function BirthForm({
  onSubmit,
  loading,
  submitLabel = "生成人生 K 线",
  compact,
}: BirthFormProps) {
  const now = new Date();
  const [name, setName] = useState("");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadBirthInfo();
    if (saved) {
      setName(saved.name ?? "");
      setYear(saved.year);
      setMonth(saved.month);
      setDay(saved.day);
      setHour(saved.hour);
      setMinute(saved.minute);
      setGender(saved.gender);
      setCalendar(saved.calendar ?? "solar");
    }
    setLoaded(true);
  }, []);

  const buildInfo = (): BirthInfo => ({
    year, month, day, hour, minute, gender,
    name: name || undefined,
    calendar,
  });

  const fillDemo = () => {
    setName("演示");
    setYear(1990); setMonth(5); setDay(15); setHour(8); setMinute(30);
    setGender("male");
    setCalendar("solar");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const info = saveBirthInfo(buildInfo());
    onSubmit(info);
  };

  if (!loaded) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="app-label">姓名（选填）</label>
            <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入" />
          </div>
          <button type="button" onClick={fillDemo} className="rounded-lg border border-app-border px-3 py-2.5 text-xs text-app-accent">演示</button>
        </div>
      )}

      <div>
        <label className="app-label">历法</label>
        <div className="flex gap-2">
          {([["solar", "阳历"], ["lunar", "农历"]] as const).map(([val, label]) => (
            <button key={val} type="button" onClick={() => setCalendar(val)}
              className={`flex-1 rounded-xl border py-2 text-sm ${
                calendar === val ? "border-app-accent bg-app-accent/10 text-app-accent" : "border-app-border text-app-muted"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="app-label">性别</label>
        <div className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <button key={g} type="button" onClick={() => setGender(g)}
              className={`flex-1 rounded-xl border py-2 text-sm ${gender === g ? "border-app-accent bg-app-accent/10 text-app-accent" : "border-app-border text-app-muted"}`}>
              {g === "male" ? "男" : "女"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="app-label">出生日期{calendar === "lunar" ? "（农历）" : "（阳历）"}</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" className="app-input" min={1900} max={now.getFullYear()} value={year} onChange={(e) => setYear(+e.target.value)} />
          <input type="number" className="app-input" min={1} max={12} value={month} onChange={(e) => setMonth(+e.target.value)} />
          <input type="number" className="app-input" min={1} max={31} value={day} onChange={(e) => setDay(+e.target.value)} />
        </div>
      </div>

      <div>
        <label className="app-label">出生时辰</label>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" className="app-input" min={0} max={23} value={hour} onChange={(e) => setHour(+e.target.value)} placeholder="时" />
          <input type="number" className="app-input" min={0} max={59} value={minute} onChange={(e) => setMinute(+e.target.value)} placeholder="分" />
        </div>
      </div>

      {compact && (
        <div>
          <label className="app-label">姓名（选填）</label>
          <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入" />
        </div>
      )}

      <button type="submit" className="app-btn" disabled={loading}>
        {loading ? "分析中..." : submitLabel}
      </button>
    </form>
  );
}

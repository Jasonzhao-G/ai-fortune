"use client";

import { useState, useEffect } from "react";
import type { BirthInfo } from "@/lib/types";
import { saveBirthInfo, getEffectiveBirthInfo, loadBirthInfo } from "@/lib/birth-store";

const PERSONALITY_OPTIONS = [
  "温柔陪伴",
  "情感洞察",
  "财富行动",
  "事业进取",
  "治愈疗愈",
  "智慧指引",
  "安静陪伴",
  "积极行动",
  "重启成长",
];

interface SpiritPetClaimFormProps {
  onSubmit: (info: BirthInfo) => void;
  loading?: boolean;
}

export default function SpiritPetClaimForm({ onSubmit, loading }: SpiritPetClaimFormProps) {
  const now = new Date();
  const [name, setName] = useState("");
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [birthPlace, setBirthPlace] = useState("");
  const [personalityPreference, setPersonalityPreference] = useState("温柔陪伴");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = getEffectiveBirthInfo() ?? loadBirthInfo();
      if (saved) {
        setName(saved.name ?? "");
        setYear(saved.year);
        setMonth(saved.month);
        setDay(saved.day);
        setHour(saved.hour);
        setMinute(saved.minute);
        setGender(saved.gender);
        setCalendar(saved.calendar ?? "solar");
        setBirthPlace(saved.birthPlace ?? "");
        setPersonalityPreference(saved.personalityPreference ?? "温柔陪伴");
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const info: BirthInfo = {
      year, month, day, hour, minute, gender,
      name: name || undefined,
      calendar,
      birthPlace: birthPlace.trim() || undefined,
      personalityPreference,
    };
    saveBirthInfo(info);
    onSubmit(info);
  };

  if (!loaded) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="app-label">姓名</label>
        <input className="app-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入您的姓名" required />
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
        <label className="app-label">历法</label>
        <div className="flex gap-2">
          {([["solar", "阳历"], ["lunar", "农历"]] as const).map(([val, label]) => (
            <button key={val} type="button" onClick={() => setCalendar(val)}
              className={`flex-1 rounded-xl border py-2 text-sm ${calendar === val ? "border-app-accent bg-app-accent/10 text-app-accent" : "border-app-border text-app-muted"}`}>
              {label}
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

      <div>
        <label className="app-label">出生地点</label>
        <input className="app-input" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="如：北京、上海、广州" />
      </div>

      <div>
        <label className="app-label">性格偏好 / 陪伴需求</label>
        <div className="flex flex-wrap gap-1.5">
          {PERSONALITY_OPTIONS.map((opt) => (
            <button key={opt} type="button" onClick={() => setPersonalityPreference(opt)}
              className={`rounded-full px-2.5 py-1 text-[10px] ${personalityPreference === opt ? "bg-app-accent text-white" : "border border-app-border text-app-muted"}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="app-btn" disabled={loading}>
        {loading ? "灵宠诞生中…" : "✨ 领取专属自己的 AI 灵宠"}
      </button>
    </form>
  );
}

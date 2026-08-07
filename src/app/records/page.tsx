"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History, User, Plus, Sparkles, Check, AlertCircle } from "lucide-react";
import { getPersonGroups, type PersonGroup } from "@/lib/record-store";
import {
  getSavedPersons, addSavedPerson, addPrimaryPerson, setActivePerson, getActivePersonId,
  deleteSavedPerson, hasPrimaryPerson, getPrimaryPerson, getOtherPersons,
  PRIMARY_PERSON_NAME,
} from "@/lib/person-store";
import type { SavedPerson } from "@/lib/types";
import BirthForm from "@/components/BirthForm";
import type { BirthInfo } from "@/lib/types";
import { formatBirthSummary } from "@/lib/birth-store";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

export default function RecordsPage() {
  const [groups, setGroups] = useState<PersonGroup[]>([]);
  const [persons, setPersons] = useState<SavedPerson[]>([]);
  const [primary, setPrimary] = useState<SavedPerson | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPrimaryForm, setShowPrimaryForm] = useState(false);
  const [showAddOther, setShowAddOther] = useState(false);
  const [addName, setAddName] = useState("");
  const [deleteTip, setDeleteTip] = useState<string | null>(null);

  const refresh = () => {
    try {
      setGroups(getPersonGroups());
      setPersons(getSavedPersons());
      setPrimary(getPrimaryPerson());
      setActiveId(getActivePersonId());
      setShowPrimaryForm(!hasPrimaryPerson());
    } catch (err) {
      console.error("records refresh failed", err);
      setGroups([]);
      setPersons([]);
      setPrimary(null);
      setActiveId(null);
      setShowPrimaryForm(true);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleAddPrimary = (info: BirthInfo) => {
    addPrimaryPerson(info);
    setShowPrimaryForm(false);
    refresh();
  };

  const handleAddOther = (info: BirthInfo) => {
    const name = addName.trim() || `测算${getOtherPersons().length + 1}`;
    addSavedPerson(name, info);
    setShowAddOther(false);
    setAddName("");
    refresh();
  };

  const handleSetActive = (id: string) => {
    setActivePerson(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!deleteSavedPerson(id)) {
      setDeleteTip("主测算人「我」不可删除");
      setTimeout(() => setDeleteTip(null), 2500);
      return;
    }
    refresh();
  };

  const others = persons.filter((p) => !p.isPrimary);

  return (
    <>
      <PageHeader title="我的测算" subtitle="管理测算人 · 历史记录 · AI灵宠" />

      <section className="page-section">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app-accent text-[11px] font-bold text-white">1</span>
          <p className="subsection-title">添加主测算人 · {PRIMARY_PERSON_NAME}</p>
          <Badge variant="accent">必填</Badge>
        </div>

        <div className="app-card mb-3 border-app-accent/30 bg-app-accent/5">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-app-accent" />
            <p className="text-[11px] leading-relaxed text-app-muted">
              主测算人是<strong className="text-app-text">必填项目</strong>，否则无法按照您的命格生成守护灵宠，以及给出相关命格建议！请先填写您自己的生辰信息。
            </p>
          </div>
        </div>

        {primary ? (
          <div className={`app-card flex items-center gap-3 ${activeId === primary.id ? "border-app-accent" : "border-app-gold/40"}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-app-gold/20">
              <User className="h-5 w-5 text-app-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-app-text">{primary.name} <span className="text-[10px] text-app-gold">主测算人</span></p>
              <p className="truncate text-[10px] text-app-muted">{formatBirthSummary(primary.birthInfo)}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button onClick={() => handleSetActive(primary.id)}
                className={`rounded-lg px-2 py-1 text-[10px] ${
                  activeId === primary.id ? "bg-app-accent text-white" : "border border-app-border text-app-muted"
                }`}>
                {activeId === primary.id ? <><Check className="inline h-3 w-3" /> 测算人</> : "设为测算人"}
              </button>
              <button onClick={() => setShowPrimaryForm(true)} className="text-[10px] text-app-accent">编辑生辰</button>
            </div>
          </div>
        ) : (
          <div className="app-card py-4 text-center text-xs text-app-muted">
            尚未添加主测算人，请填写下方表单
          </div>
        )}

        {(showPrimaryForm || !primary) && (
          <div className="app-card mt-3 border-app-gold/30">
            <p className="mb-2 text-xs font-medium text-app-gold">主测算人 · {PRIMARY_PERSON_NAME} 的生辰</p>
            <BirthForm onSubmit={handleAddPrimary} submitLabel={primary ? "保存主测算人" : "添加主测算人"} compact syncActivePerson={false} />
            {primary && (
              <button onClick={() => setShowPrimaryForm(false)} className="mt-2 w-full text-[10px] text-app-muted">取消编辑</button>
            )}
          </div>
        )}
      </section>

      {/* 第二步：其他测算人 · 选填 */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app-border text-[10px] text-app-muted">2</span>
            <p className="text-xs font-medium text-app-text">其他测算人</p>
            <span className="text-[9px] text-app-muted">选填</span>
          </div>
          {hasPrimaryPerson() && (
            <button onClick={() => setShowAddOther(!showAddOther)} className="flex items-center gap-0.5 text-[10px] text-app-accent">
              <Plus className="h-3 w-3" /> 添加
            </button>
          )}
        </div>
        <p className="mb-2 text-[10px] text-app-muted">家人、好友等可选添加，不影响主测算人的灵宠与命格建议</p>

        {!hasPrimaryPerson() && (
          <div className="app-card py-4 text-center text-xs text-app-muted">请先完成主测算人「我」的添加</div>
        )}

        {hasPrimaryPerson() && showAddOther && (
          <div className="app-card mb-3">
            <input className="app-input mb-2" placeholder="名称，如：爸爸、好友A"
              value={addName} onChange={(e) => setAddName(e.target.value)} />
            <BirthForm onSubmit={handleAddOther} submitLabel="保存测算人" compact syncActivePerson={false} />
          </div>
        )}

        {hasPrimaryPerson() && others.length === 0 && !showAddOther && (
          <div className="app-card py-4 text-center text-xs text-app-muted">暂无其他测算人，可点击添加</div>
        )}

        {others.length > 0 && (
          <div className="space-y-2">
            {others.map((p) => (
              <div key={p.id} className={`app-card flex items-center gap-3 ${activeId === p.id ? "border-app-accent" : ""}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-app-accent/15">
                  <User className="h-5 w-5 text-app-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-app-text">{p.name}</p>
                  <p className="truncate text-[10px] text-app-muted">{formatBirthSummary(p.birthInfo)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button onClick={() => handleSetActive(p.id)}
                    className={`rounded-lg px-2 py-1 text-[10px] ${
                      activeId === p.id ? "bg-app-accent text-white" : "border border-app-border text-app-muted"
                    }`}>
                    {activeId === p.id ? <><Check className="inline h-3 w-3" /> 测算人</> : "设为测算人"}
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-[10px] text-app-muted">删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {deleteTip && <p className="mt-2 text-center text-[10px] text-red-400">{deleteTip}</p>}

        <Link href="/spirit-pet" className="app-card mt-3 flex items-center gap-3 border-app-gold/40 bg-gradient-to-r from-app-gold/10 to-app-accent/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-app-gold/20">
            <Sparkles className="h-5 w-5 text-app-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-app-text">AI 灵宠</p>
            <p className="text-[10px] text-app-muted">根据主测算人命格生成专属守护灵宠</p>
          </div>
          <ChevronRight className="h-4 w-4 text-app-muted" />
        </Link>
      </section>

      {/* 历史记录 */}
      <section>
        <p className="mb-2 text-xs font-medium text-app-text">测算历史</p>
        {groups.length === 0 ? (
          <div className="app-card py-8 text-center">
            <History className="mx-auto mb-3 h-10 w-10 text-app-muted" />
            <p className="text-sm text-app-muted">暂无测算记录</p>
            <Link href="/lifekline" className="app-btn mt-4 inline-block max-w-xs">去测算</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <Link key={g.personKey} href={`/records/${encodeURIComponent(g.personKey)}`}
                className="app-card flex items-center gap-3 transition-colors hover:border-app-accent/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-app-accent/15">
                  <User className="h-5 w-5 text-app-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-text">{g.personName}</p>
                  <p className="truncate text-[10px] text-app-muted">{g.personLabel}</p>
                  <p className="text-[10px] text-app-gold">{g.recordCount} 条记录</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-app-muted" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

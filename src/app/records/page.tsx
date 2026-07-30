"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History, User } from "lucide-react";
import { getPersonGroups, type PersonGroup } from "@/lib/record-store";

export default function RecordsPage() {
  const [groups, setGroups] = useState<PersonGroup[]>([]);

  useEffect(() => {
    setGroups(getPersonGroups());
  }, []);

  return (
    <div className="px-4 pb-4">
      <header className="mb-4 pt-2 text-center">
        <h1 className="page-title">我的测算</h1>
        <p className="text-xs text-app-muted">按姓名保存 · 随时回看历史记录</p>
      </header>

      {groups.length === 0 ? (
        <div className="app-card py-12 text-center">
          <History className="mx-auto mb-3 h-10 w-10 text-app-muted" />
          <p className="text-sm text-app-muted">暂无测算记录</p>
          <p className="mt-1 text-xs text-app-muted">完成人生K线、问AI、看相等测算后会自动保存</p>
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
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-app-text">{g.personName}</p>
                <p className="truncate text-[10px] text-app-muted">{g.personLabel}</p>
                <p className="text-[10px] text-app-gold">{g.recordCount} 条记录</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-app-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

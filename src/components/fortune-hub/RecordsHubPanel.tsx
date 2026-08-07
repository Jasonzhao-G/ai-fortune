"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History, User } from "lucide-react";
import { getPersonGroups, type PersonGroup } from "@/lib/record-store";

export default function RecordsHubPanel() {
  const [groups, setGroups] = useState<PersonGroup[]>([]);

  useEffect(() => {
    try {
      setGroups(getPersonGroups());
    } catch {
      setGroups([]);
    }
  }, []);

  return (
    <div>
      <p className="caption mb-3 text-app-muted">测算历史 · 按人归档</p>
      {groups.length === 0 ? (
        <div className="app-card py-8 text-center">
          <History className="mx-auto mb-3 h-10 w-10 text-app-muted" />
          <p className="text-sm text-app-muted">暂无测算记录</p>
          <p className="mt-1 text-[10px] text-app-muted">完成上方任意测算后，记录将显示在此</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <Link
              key={g.personKey}
              href={`/records/${encodeURIComponent(g.personKey)}`}
              className="app-card flex items-center gap-3 transition-colors hover:border-app-accent/40"
            >
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
      <Link href="/records" className="mt-3 block text-center text-[11px] text-app-accent">
        管理测算人 · 完整记录 →
      </Link>
    </div>
  );
}

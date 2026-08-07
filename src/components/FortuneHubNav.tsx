"use client";

import { cn } from "@/lib/utils";

export type FortuneHubTab =
  | "liuyao"
  | "lifekline"
  | "bazi"
  | "xiang"
  | "master"
  | "ask"
  | "records";

const HUB_TABS: { id: FortuneHubTab; label: string }[] = [
  { id: "liuyao", label: "AI六爻" },
  { id: "lifekline", label: "人生K线" },
  { id: "bazi", label: "八字排盘" },
  { id: "xiang", label: "AI看相" },
  { id: "master", label: "问真人大师" },
  { id: "ask", label: "问灵宠" },
  { id: "records", label: "我的测算" },
];

interface FortuneHubNavProps {
  active: FortuneHubTab;
  onChange: (tab: FortuneHubTab) => void;
}

export default function FortuneHubNav({ active, onChange }: FortuneHubNavProps) {
  return (
    <div className="sticky top-0 z-20 -mx-1 mb-4 overflow-x-auto bg-app-bg/95 px-1 pb-1 backdrop-blur-sm">
      <div className="flex w-max gap-2">
        {HUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
              active === id
                ? "border-app-accent bg-app-accent text-white"
                : "border-app-border bg-app-card text-app-muted hover:border-app-accent hover:text-app-accent",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

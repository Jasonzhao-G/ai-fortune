"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  SPIRIT_TASK_DEFS,
  isTaskDoneToday,
  grantSpiritPowerForTask,
  type SpiritDailyTaskId,
} from "@/lib/spirit-pet-tasks";
import { SPIRIT_POWER_REWARDS } from "@/lib/spirit-pet-growth";
import { getInviteLink } from "@/lib/user-store";
import SectionCard from "@/components/ui/SectionCard";
import InviteModal from "@/components/InviteModal";

interface SpiritPetTasksPanelProps {
  personKey: string;
  onPowerGained?: () => void;
}

const COMMUNITY_TASK_ROWS = [
  { label: "发帖", reward: SPIRIT_POWER_REWARDS.communityPost },
  { label: "评论", reward: SPIRIT_POWER_REWARDS.communityComment },
  { label: "点赞 · 收藏 · 转发 · 私信", reward: SPIRIT_POWER_REWARDS.communityLike },
];

export default function SpiritPetTasksPanel({ personKey, onPowerGained }: SpiritPetTasksPanelProps) {
  const router = useRouter();
  const { user } = useApp();
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [tip, setTip] = useState<string | null>(null);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const refresh = useCallback(() => {
    const map: Record<string, boolean> = {};
    SPIRIT_TASK_DEFS.forEach((t) => {
      map[t.id] = isTaskDoneToday(t.id, personKey);
    });
    setDoneMap(map);
  }, [personKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showTip = (msg: string) => {
    setTip(msg);
    setTimeout(() => setTip(null), 2200);
  };

  const handleCheckIn = () => {
    if (doneMap.checkIn) {
      showTip("今日已签到");
      return;
    }
    const result = grantSpiritPowerForTask("checkIn", personKey);
    if (result.ok) {
      refresh();
      onPowerGained?.();
      if (result.message) showTip(result.message);
    } else if (result.message) {
      showTip(result.message);
    }
  };

  const handleInviteQrDownloaded = () => {
    if (doneMap.inviteFriend) return;
    const result = grantSpiritPowerForTask("inviteFriend", personKey);
    if (result.ok) {
      refresh();
      onPowerGained?.();
      if (result.message) showTip(result.message);
    } else if (result.message) {
      showTip(result.message);
    }
  };

  const handleTaskClick = (taskId: SpiritDailyTaskId, href?: string) => {
    if (taskId === "inviteFriend") {
      if (doneMap.inviteFriend) {
        showTip("今日已完成该任务");
        return;
      }
      setInviteOpen(true);
      return;
    }
    if (href) router.push(href);
    else if (doneMap[taskId]) showTip("今日已完成该任务");
  };

  const mainTasks = SPIRIT_TASK_DEFS.filter((t) =>
    ["checkIn", "inviteFriend", "chat", "liuyao"].includes(t.id),
  );

  const communityTasks = SPIRIT_TASK_DEFS.filter((t) => t.id.startsWith("community"));
  const communityDoneCount = communityTasks.filter((t) => doneMap[t.id]).length;

  return (
    <>
      <SectionCard variant="tasks" title="去做任务" subtitle="完成真实操作后自动发放灵力 · 每类任务每日限一次">
        <p className="block-label mb-2 text-app-green">每日任务</p>
        <div className="mb-3 space-y-2">
          {mainTasks.map((task) => {
            const done = doneMap[task.id];
            const isCheckIn = task.id === "checkIn";

            if (isCheckIn) {
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={handleCheckIn}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    done ? "border-app-border/60 bg-app-bg/30 opacity-70" : "border-app-gold/30 bg-app-gold/5 hover:border-app-gold"
                  }`}
                >
                  <span className="body-text">
                    {done ? "✅ " : "▸ "}{task.label}
                  </span>
                  <span className="caption font-semibold text-app-gold">+{task.reward} 灵力</span>
                </button>
              );
            }

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => handleTaskClick(task.id, task.href)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  done ? "border-app-border/60 bg-app-bg/30 opacity-70" : "border-app-gold/30 bg-app-gold/5 hover:border-app-gold"
                }`}
              >
                <span className="body-text">
                  {done ? "✅ " : "▸ "}{task.label}
                  {!done && task.desc && <span className="micro ml-1">（{task.desc}）</span>}
                  {!done && !task.desc && task.href && <span className="micro ml-1">（完成后发放）</span>}
                </span>
                <span className="caption font-semibold text-app-gold">+{task.reward} 灵力</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-app-border/60 bg-app-bg/20">
          <button
            type="button"
            onClick={() => setCommunityOpen(!communityOpen)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
              communityDoneCount > 0 ? "opacity-90" : "hover:bg-app-gold/5"
            }`}
          >
            <span className="flex items-center gap-2 body-text">
              <Users className="h-4 w-4 text-app-accent" />
              社区互动
            </span>
            <span className="caption">
              {communityDoneCount > 0 ? `已完成 ${communityDoneCount} 项` : "查看规则 →"}
            </span>
          </button>

          {communityOpen && (
            <div className="space-y-1.5 border-t border-app-border/40 px-3 py-2.5">
              {COMMUNITY_TASK_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between caption">
                  <span className="text-app-text">{row.label}</span>
                  <span className="font-semibold text-app-gold">+{row.reward} 灵力</span>
                </div>
              ))}
              <Link
                href="/community"
                className="mt-2 block text-center text-[11px] font-semibold text-app-accent"
              >
                去社区完成任务 →
              </Link>
            </div>
          )}
        </div>

        {tip && <p className="caption mt-2 text-center text-app-accent">{tip}</p>}
      </SectionCard>

      {user?.id && (
        <InviteModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          userId={user.id}
          inviteLink={getInviteLink(user.id)}
          onQrDownloaded={handleInviteQrDownloaded}
        />
      )}
    </>
  );
}

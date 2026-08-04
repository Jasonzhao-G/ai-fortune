"use client";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export default function VerifiedBadge({ className = "", size = "sm" }: VerifiedBadgeProps) {
  const sz = size === "sm" ? "h-3.5 w-3.5 text-[8px]" : "h-4 w-4 text-[9px]";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-app-accent font-bold text-white ${sz} ${className}`}
      title="认证创作者"
    >
      V
    </span>
  );
}

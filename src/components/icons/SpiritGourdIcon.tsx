import type { ReactNode } from "react";
import { isSpiritGourdEmoji } from "@/lib/spirit-gourd-icon";

interface SpiritGourdIconProps {
  className?: string;
  title?: string;
}

/** 道家太上老君药葫芦 · 灵丹图标 */
export default function SpiritGourdIcon({ className = "h-4 w-4", title }: SpiritGourdIconProps) {
  return (
    <svg
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* 葫芦下肚 */}
      <path
        d="M16 38.5C7.5 38.5 3 30.5 3 23.5C3 16 8.5 13.5 16 16.5C23.5 13.5 29 16 29 23.5C29 30.5 24.5 38.5 16 38.5Z"
        fill="currentColor"
      />
      {/* 高光 */}
      <ellipse cx="11.5" cy="26" rx="2.8" ry="5" fill="white" fillOpacity="0.14" />
      {/* 葫芦上肚 */}
      <path
        d="M16 16.5C11 16.5 7.5 12.5 7.5 8C7.5 3.5 10.5 1 16 1C21.5 1 24.5 3.5 24.5 8C24.5 12.5 21 16.5 16 16.5Z"
        fill="currentColor"
        fillOpacity="0.92"
      />
      {/* 葫芦口 */}
      <ellipse cx="16" cy="16.2" rx="4.2" ry="2.1" fill="currentColor" fillOpacity="0.78" />
      {/* 红绳 · 太上老君葫芦 */}
      <path
        d="M9.5 15.8Q16 13.2 22.5 15.8"
        stroke="#c45c48"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="14.2" y="14.2" width="3.6" height="4.2" rx="0.8" fill="#c45c48" fillOpacity="0.85" />
      {/* 塞子 */}
      <rect x="13.2" y="0.2" width="5.6" height="2.8" rx="1.2" fill="#9a7b3c" />
      <rect x="14.4" y="0.2" width="3.2" height="1" rx="0.5" fill="#d4a574" fillOpacity="0.55" />
    </svg>
  );
}

export function ShopEmojiDisplay({
  emoji,
  className,
  iconClassName,
}: {
  emoji: string;
  className?: string;
  iconClassName?: string;
}) {
  if (isSpiritGourdEmoji(emoji)) {
    return <SpiritGourdIcon className={iconClassName ?? "h-7 w-7 text-app-gold"} title="灵丹" />;
  }
  return <span className={className}>{emoji}</span>;
}

export function SpiritGourdHeading({
  children,
  iconClassName = "h-5 w-5 text-app-gold",
  className = "inline-flex items-center gap-2",
}: {
  children: ReactNode;
  iconClassName?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      <SpiritGourdIcon className={iconClassName} title="灵丹" />
      {children}
    </span>
  );
}

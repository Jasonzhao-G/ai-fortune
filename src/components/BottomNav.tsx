"use client";

import Link from "next/link";
import { Home, TrendingUp, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "首页", icon: Home },
  { href: "/spirit-pet", label: "AI灵宠", emoji: "🦄" },
  { href: "/lifekline", label: "人生K线", icon: TrendingUp },
  { href: "/community", label: "社区", icon: Users },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/spirit-pet") {
    return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith("/ask");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-app-border bg-app-card/98 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-stretch">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = "icon" in item ? item.icon : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              scroll
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                if (active) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={cn("nav-tab", active && "nav-tab-active")}
            >
              {"emoji" in item && item.emoji ? (
                <span className={cn("text-xl leading-none", active && "scale-110")}>{item.emoji}</span>
              ) : Icon ? (
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

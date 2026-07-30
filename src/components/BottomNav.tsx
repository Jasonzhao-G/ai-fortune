"use client";

import { Home, TrendingUp, ScanEye, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "首页", icon: Home },
  { href: "/lifekline", label: "人生K线", icon: TrendingUp },
  { href: "/xiang", label: "看相", icon: ScanEye },
  { href: "/community", label: "社区", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-app-border bg-app-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
                active ? "text-app-accent" : "text-app-muted"
              )}>
              <Icon className={cn("h-[18px] w-[18px]", active && "stroke-[2.5]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

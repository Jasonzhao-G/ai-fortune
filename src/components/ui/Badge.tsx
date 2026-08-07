import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "gold" | "success" | "muted";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: "badge",
  accent: "badge badge-accent",
  gold: "badge badge-gold",
  success: "badge badge-success",
  muted: "badge badge-muted",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return <span className={cn(VARIANT_CLASS[variant], className)}>{children}</span>;
}

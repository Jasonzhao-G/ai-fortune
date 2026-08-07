import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionVariant =
  | "default"
  | "accent"
  | "gold"
  | "green"
  | "destiny"
  | "awakening"
  | "fortune"
  | "tasks";

const VARIANT_CLASS: Record<SectionVariant, string> = {
  default: "",
  accent: "panel-accent",
  gold: "panel-gold",
  green: "panel-green",
  destiny: "panel-destiny",
  awakening: "panel-awakening",
  fortune: "panel-fortune",
  tasks: "panel-tasks",
};

const TITLE_COLOR: Partial<Record<SectionVariant, string>> = {
  destiny: "text-app-gold",
  tasks: "text-app-green",
  fortune: "text-app-accent",
  accent: "text-app-accent",
  gold: "text-app-gold",
  awakening: "text-app-accent",
};

interface SectionCardProps {
  variant?: SectionVariant;
  title?: string;
  subtitle?: string;
  titleClassName?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  compact?: boolean;
}

export default function SectionCard({
  variant = "default",
  title,
  subtitle,
  titleClassName,
  action,
  children,
  className,
  id,
  compact,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "app-card",
        VARIANT_CLASS[variant],
        compact && "!p-3",
        className,
      )}
    >
      {(title || action) && (
        <div className="section-card-header">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className={cn("panel-title", TITLE_COLOR[variant], titleClassName)}>
                {title}
              </h2>
            )}
            {subtitle && <p className="panel-subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

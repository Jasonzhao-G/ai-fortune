import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  align?: "center" | "left";
  back?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  align = "center",
  back,
  actions,
  className,
  children,
}: PageHeaderProps) {
  const centered = align === "center";

  if (centered && actions && !back) {
    return (
      <header className={cn("page-header", className)}>
        <div className="page-header-balanced">
          <div className="page-header-side" aria-hidden />
          <div className="page-header-center-block">
            <h1 className="heading-1">{title}</h1>
            {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
          </div>
          <div className="page-header-actions">{actions}</div>
        </div>
        {children}
      </header>
    );
  }

  return (
    <header className={cn("page-header", centered && "page-header-center", className)}>
      {(back || actions) && (
        <div className="page-header-row">
          <div className="page-header-side">{back}</div>
          {actions && <div className="page-header-actions">{actions}</div>}
        </div>
      )}
      <div className={cn(centered && !back && !actions && "text-center")}>
        <h1 className="heading-1">{title}</h1>
        {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

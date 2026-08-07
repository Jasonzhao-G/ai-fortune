import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLinkPillProps {
  href: string;
  children: React.ReactNode;
  variant?: "accent" | "gold" | "default";
  className?: string;
}

export default function NavLinkPill({
  href,
  children,
  variant = "default",
  className,
}: NavLinkPillProps) {
  return (
    <Link
      href={href}
      className={cn(
        "nav-link-pill",
        variant === "accent" && "nav-link-pill-accent",
        variant === "gold" && "nav-link-pill-gold",
        className,
      )}
    >
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export default function BackLink({ href, onClick, label = "返回", className }: BackLinkProps) {
  const content = (
    <>
      <ChevronLeft className="h-4 w-4" />
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("back-link", className)}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn("back-link", className)}>
      {content}
    </button>
  );
}

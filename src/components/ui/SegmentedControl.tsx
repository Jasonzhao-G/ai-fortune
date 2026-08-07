"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export default function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("segmented", size === "sm" && "segmented-sm", className)} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={cn("segmented-item", value === opt.id && "segmented-item-active")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

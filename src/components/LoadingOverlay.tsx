"use client";

interface LoadingOverlayProps {
  text?: string;
}

export default function LoadingOverlay({ text = "..." }: LoadingOverlayProps) {
  return (
    <div className="app-card flex flex-col items-center justify-center py-10">
      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-app-border border-t-app-accent" />
      <p className="text-xs text-app-muted">{text}</p>
    </div>
  );
}

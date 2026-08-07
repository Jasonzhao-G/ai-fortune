"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-sm text-red-400">AI 灵宠页面加载出错</p>
      <p className="mb-4 max-w-xs text-[11px] text-app-muted">{error.message || "未知错误"}</p>
      <button onClick={reset} className="app-btn max-w-xs">重试</button>
    </div>
  );
}

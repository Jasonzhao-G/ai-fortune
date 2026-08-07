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
      <p className="mb-2 text-sm text-red-400">人生 K 线加载出错</p>
      <p className="mb-4 max-w-xs text-[11px] text-app-muted">{error.message || "未知错误"}</p>
      <p className="mb-4 max-w-xs caption text-app-muted">
        若刚更新过代码，请在终端运行 <span className="font-mono text-app-accent">npm run dev:clean</span> 后硬刷新页面。
      </p>
      <button onClick={reset} className="app-btn max-w-xs">重试</button>
    </div>
  );
}

"use client";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="block-title text-app-gold">灵宠商城加载出错</p>
      <p className="caption mt-2 max-w-xs text-app-muted">{error.message || "页面资源加载失败"}</p>
      <p className="caption mt-3 max-w-xs text-app-muted">
        请在终端运行 <span className="font-mono text-app-accent">npm run dev:clean</span>，然后硬刷新页面。
      </p>
      <button type="button" onClick={reset} className="app-btn mt-4 !mb-0 max-w-xs">
        重试
      </button>
    </div>
  );
}

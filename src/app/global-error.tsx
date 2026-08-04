"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#1c1915", color: "#f5f0e8" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <p style={{ color: "#e05555", marginBottom: 8 }}>应用加载出错</p>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>{error.message || "未知错误"}</p>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "#c45c48", color: "#fff", cursor: "pointer" }}
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}

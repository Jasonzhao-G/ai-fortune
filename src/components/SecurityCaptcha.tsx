"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

interface SecurityCaptchaProps {
  onVerified: (verified: boolean) => void;
}

export default function SecurityCaptcha({ onVerified }: SecurityCaptchaProps) {
  const [seed, setSeed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const puzzle = useMemo(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, result: a + b };
  }, [seed]);

  const verify = (value: string) => {
    setAnswer(value);
    if (!value.trim()) {
      onVerified(false);
      setError(null);
      return;
    }
    const ok = Number(value) === puzzle.result;
    onVerified(ok);
    setError(ok ? null : "验证答案不正确");
  };

  return (
    <div className="rounded-xl border border-app-border bg-app-bg/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-app-text">安全验证</p>
        <button type="button" onClick={() => { setSeed((s) => s + 1); setAnswer(""); onVerified(false); setError(null); }}
          className="text-app-muted">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mb-2 text-[11px] text-app-muted">请计算：{puzzle.a} + {puzzle.b} = ?</p>
      <input
        className="app-input !py-2 text-xs"
        inputMode="numeric"
        placeholder="输入计算结果"
        value={answer}
        onChange={(e) => verify(e.target.value.replace(/\D/g, ""))}
      />
      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
      {!error && answer && Number(answer) === puzzle.result && (
        <p className="mt-1 text-[10px] text-app-green">验证通过</p>
      )}
    </div>
  );
}

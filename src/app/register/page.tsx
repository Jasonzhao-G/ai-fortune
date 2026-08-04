"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND_NAME, BRAND_LOGO } from "@/lib/brand";
import { registerUser, hasRegisteredAccount } from "@/lib/user-store";
import { useApp } from "@/context/AppContext";
import SecurityCaptcha from "@/components/SecurityCaptcha";
import UserAgreementModal from "@/components/UserAgreementModal";

type RegMethod = "phone" | "email";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useApp();
  const [refCode, setRefCode] = useState<string | undefined>();
  const [method, setMethod] = useState<RegMethod>("phone");
  const [account, setAccount] = useState("");
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRefCode(params.get("ref") ?? undefined);
    setAlreadyRegistered(hasRegisteredAccount());
  }, []);

  const sendCode = () => {
    if (!account.trim()) {
      setError(method === "phone" ? "请输入手机号" : "请输入邮箱");
      return;
    }
    if (method === "phone" && !/^1\d{10}$/.test(account.trim())) {
      setError("请输入正确的 11 位手机号");
      return;
    }
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.trim())) {
      setError("请输入正确的邮箱地址");
      return;
    }
    setCodeSent(true);
    setError(null);
  };

  const handleRegister = () => {
    setError(null);
    if (!account.trim()) {
      setError(method === "phone" ? "请输入手机号" : "请输入邮箱");
      return;
    }
    if (!codeSent || code.length < 4) {
      setError("请输入验证码（演示模式：任意 4 位以上数字即可）");
      return;
    }
    if (!captchaOk) {
      setError("请完成安全验证");
      return;
    }
    if (!agreed) {
      setError("请阅读并同意用户服务协议");
      return;
    }
    try {
      registerUser({
        method,
        account: account.trim(),
        nickname: nickname.trim() || undefined,
        refCode,
      });
      refreshUser();
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "注册失败");
    }
  };

  if (alreadyRegistered && !success) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <span className="mb-3 text-3xl">{BRAND_LOGO}</span>
        <h1 className="page-title">您已注册</h1>
        <p className="mt-2 text-xs text-app-muted">欢迎回来，{BRAND_NAME} 已为您准备好</p>
        <Link href="/" className="app-btn mt-6 max-w-xs">进入首页</Link>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <div className="mb-6 text-center">
        <span className="text-3xl">{BRAND_LOGO}</span>
        <h1 className="page-title mt-2">注册 {BRAND_NAME}</h1>
        <p className="text-xs text-app-muted">
          {refCode ? "好友邀请您加入，注册即享灵粮礼包" : "创建账号，开启命理之旅"}
        </p>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-app-border p-0.5">
        {([["phone", "手机注册"], ["email", "邮箱注册"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => { setMethod(id); setCodeSent(false); setCode(""); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-xs ${method === id ? "bg-app-accent text-white" : "text-app-muted"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="app-card mb-4 space-y-3">
        <div>
          <label className="app-label">{method === "phone" ? "手机号" : "邮箱"}</label>
          <input
            className="app-input"
            placeholder={method === "phone" ? "请输入 11 位手机号" : "name@example.com"}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </div>

        <div>
          <label className="app-label">验证码</label>
          <div className="flex gap-2">
            <input
              className="app-input flex-1"
              placeholder="输入验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="button" onClick={sendCode}
              className="shrink-0 rounded-xl border border-app-accent px-3 text-xs text-app-accent">
              {codeSent ? "重新发送" : "获取验证码"}
            </button>
          </div>
          {codeSent && (
            <p className="mt-1 text-[10px] text-app-muted">演示模式：验证码已模拟发送，输入任意 4 位以上数字即可</p>
          )}
        </div>

        <div>
          <label className="app-label">昵称（选填）</label>
          <input className="app-input" placeholder="命理者" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </div>

        <SecurityCaptcha onVerified={setCaptchaOk} />

        <label className="flex items-start gap-2 text-[11px] text-app-muted">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
          <span>
            我已阅读并同意
            <button type="button" onClick={() => setShowAgreement(true)} className="text-app-accent underline">
              《用户服务协议》
            </button>
          </span>
        </label>
      </div>

      {error && <p className="mb-3 text-center text-xs text-red-400">{error}</p>}
      {success && <p className="mb-3 text-center text-xs text-app-green">注册成功，正在进入…</p>}

      <button onClick={handleRegister} className="app-btn">完成注册</button>

      <p className="mt-4 text-center text-[10px] text-app-muted">
        已有账号？<Link href="/" className="text-app-accent">直接进入</Link>
      </p>

      <UserAgreementModal open={showAgreement} onClose={() => setShowAgreement(false)} />
    </div>
  );
}

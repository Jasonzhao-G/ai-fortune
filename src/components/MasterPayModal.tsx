"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { MASTER_CONSULT_PRICE, getMasterPaymentQrUrl } from "@/lib/master-pay-store";

type Step = "method" | "qrcode" | "success";

interface MasterPayModalProps {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
}

export default function MasterPayModal({ open, onClose, onPaid }: MasterPayModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [payMethod, setPayMethod] = useState<"alipay" | "wechat" | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("method");
      setPayMethod(null);
      setPaying(false);
    }
  }, [open]);

  if (!open) return null;

  const qrUrl = payMethod ? getMasterPaymentQrUrl(payMethod) : "";
  const methodLabel = payMethod === "alipay" ? "支付宝" : "微信支付";

  const handleConfirmPaid = () => {
    if (!payMethod || paying) return;
    setPaying(true);
    setTimeout(() => {
      setStep("success");
      setPaying(false);
      setTimeout(() => {
        onPaid();
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-app-border bg-app-card p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-app-text">真人大师咨询 · ¥{MASTER_CONSULT_PRICE}</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-app-muted" /></button>
        </div>

        {step === "success" ? (
          <div className="py-8 text-center">
            <p className="text-4xl">✅</p>
            <p className="mt-3 text-sm text-app-accent">支付成功，正在提交咨询…</p>
          </div>
        ) : step === "method" ? (
          <>
            <p className="caption mb-4 text-app-muted">
              单次真人大师解答 · 不占用灵丹测算次数 · 24 小时内回复
            </p>
            <div className="space-y-2">
              {(["alipay", "wechat"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setPayMethod(m); setStep("qrcode"); }}
                  className="app-btn-outline w-full !py-3"
                >
                  {m === "alipay" ? "支付宝支付" : "微信支付"} · ¥{MASTER_CONSULT_PRICE}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className={`caption mb-3 text-center ${payMethod === "alipay" ? "text-blue-400" : "text-green-400"}`}>
              请使用{methodLabel}扫码支付 ¥{MASTER_CONSULT_PRICE}
            </p>
            <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-2xl border border-app-border bg-white p-2">
              {qrUrl && <img src={qrUrl} alt="支付二维码" className="h-full w-full object-contain" />}
            </div>
            <button type="button" onClick={handleConfirmPaid} disabled={paying} className="app-btn">
              {paying ? "确认中…" : "我已完成支付"}
            </button>
            <button type="button" onClick={() => setStep("method")} className="app-btn-outline mt-2 w-full">
              更换支付方式
            </button>
          </>
        )}
      </div>
    </div>
  );
}

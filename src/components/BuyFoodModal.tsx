"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import SpiritGourdIcon, { SpiritGourdHeading } from "@/components/icons/SpiritGourdIcon";
import { PET_FOOD_PLANS, purchasePetFood, getPaymentQrUrl } from "@/lib/pet-food-store";

type Step = "plans" | "method" | "qrcode" | "success";

interface BuyFoodModalProps {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}

export default function BuyFoodModal({ open, onClose, onPurchased }: BuyFoodModalProps) {
  const [step, setStep] = useState<Step>("plans");
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"alipay" | "wechat" | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("plans");
      setPendingPlan(null);
      setPayMethod(null);
      setPaying(false);
    }
  }, [open]);

  if (!open) return null;

  const selectedPlan = PET_FOOD_PLANS.find((p) => p.id === pendingPlan);
  const qrUrl = pendingPlan && payMethod ? getPaymentQrUrl(pendingPlan, payMethod) : "";

  const handleSelectPlan = (planId: string) => {
    setPendingPlan(planId);
    setPayMethod(null);
    setStep("method");
  };

  const handleSelectMethod = (method: "alipay" | "wechat") => {
    setPayMethod(method);
    setStep("qrcode");
  };

  const handleConfirmPaid = () => {
    if (!pendingPlan || !payMethod || paying) return;
    setPaying(true);
    setTimeout(() => {
      purchasePetFood(pendingPlan);
      setStep("success");
      setPaying(false);
      setTimeout(() => {
        onPurchased?.();
        onClose();
      }, 1500);
    }, 600);
  };

  const methodLabel = payMethod === "alipay" ? "支付宝" : "微信支付";
  const methodColor = payMethod === "alipay" ? "text-blue-400" : "text-green-400";

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-app-border bg-app-card p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-app-text">
            <SpiritGourdHeading>购买灵丹</SpiritGourdHeading>
          </h2>
          <button onClick={onClose}><X className="h-5 w-5 text-app-muted" /></button>
        </div>

        {step === "success" ? (
          <div className="py-8 text-center">
            <p className="text-4xl">✅</p>
            <p className="mt-3 text-sm text-app-accent">
              {methodLabel}支付成功！灵丹已到账～
            </p>
          </div>
        ) : step === "qrcode" && selectedPlan && payMethod ? (
          <div className="text-center">
            <p className={`text-sm font-medium ${methodColor}`}>
              请使用{methodLabel}扫码支付
            </p>
            <p className="mt-1 text-xs text-app-muted">{selectedPlan.label} · ¥{selectedPlan.price}</p>
            <div className="mx-auto mt-4 inline-block rounded-2xl border border-app-border bg-white p-3">
              <img src={qrUrl} alt={`${methodLabel}支付二维码`} className="h-52 w-52" />
            </div>
            <p className="mt-3 text-[10px] text-app-muted">
              打开{methodLabel}扫一扫，完成付款后点击下方按钮
            </p>
            <button
              onClick={handleConfirmPaid}
              disabled={paying}
              className="app-btn mt-4 w-full disabled:opacity-50"
            >
              {paying ? "确认支付中..." : "我已完成支付"}
            </button>
            <button
              onClick={() => { setStep("method"); setPayMethod(null); }}
              className="mt-2 w-full text-xs text-app-muted"
            >
              更换支付方式
            </button>
          </div>
        ) : step === "method" && selectedPlan ? (
          <div>
            <p className="mb-1 text-center text-xs text-app-muted">已选：{selectedPlan.label}</p>
            <p className="mb-4 text-center text-lg font-bold text-app-accent">¥{selectedPlan.price}</p>
            <p className="mb-4 text-center text-xs text-app-muted">请选择支付方式</p>
            <div className="space-y-2">
              <button
                onClick={() => handleSelectMethod("alipay")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-app-border py-3 text-sm hover:border-blue-400"
              >
                <span className="text-lg">💙</span> 支付宝
              </button>
              <button
                onClick={() => handleSelectMethod("wechat")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-app-border py-3 text-sm hover:border-green-400"
              >
                <span className="text-lg">💚</span> 微信支付
              </button>
            </div>
            <button onClick={() => { setStep("plans"); setPendingPlan(null); }} className="mt-3 w-full text-xs text-app-muted">
              返回选择灵丹
            </button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-[11px] text-app-muted">一瓶灵丹 = 5 次测算</p>
            <div className="space-y-2">
              {PET_FOOD_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-app-border px-4 py-3 text-left transition-colors hover:border-app-gold"
                >
                  <SpiritGourdIcon className="h-8 w-8 text-app-gold" title="灵丹" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-app-text">{plan.label}</p>
                    <p className="text-[10px] text-app-muted">{plan.desc}</p>
                  </div>
                  <p className="text-base font-bold text-app-accent">¥{plan.price}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

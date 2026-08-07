"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import PageHeader from "@/components/ui/PageHeader";
import {
  confirmOrderPaid,
  getOrderById,
  PAY_METHOD_LABEL,
  type PayMethod,
} from "@/lib/shop/order-store";
import { getShopPaymentQrUrl } from "@/lib/shop/payment";
import { formatPrice } from "@/lib/shop/catalog";
import { ShopEmojiDisplay } from "@/components/icons/SpiritGourdIcon";
import { useApp } from "@/context/AppContext";

type Step = "method" | "qrcode" | "success";

export default function ShopPayPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useApp();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState(() => getOrderById(orderId));
  const [step, setStep] = useState<Step>("method");
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const current = getOrderById(orderId);
    if (!current || current.status !== "pending_payment") {
      if (current?.status === "fulfilled" || current?.status === "paid") {
        setStep("success");
      } else if (!current) {
        router.replace("/shop");
      }
      setOrder(current);
      return;
    }
    setOrder(current);
  }, [orderId, router]);

  if (!order) return null;

  const qrUrl =
    payMethod && user
      ? getShopPaymentQrUrl(order.id, order.totalAmount, payMethod, user.id)
      : "";

  const handleConfirmPaid = () => {
    if (!payMethod || paying) return;
    setPaying(true);
    setTimeout(() => {
      const updated = confirmOrderPaid(order.id, payMethod);
      if (updated) {
        setOrder(updated);
        setStep("success");
        refreshUser();
      }
      setPaying(false);
    }, 600);
  };

  const methodColor = payMethod === "alipay" ? "text-blue-500" : "text-green-500";

  return (
    <>
      <BackLink href="/shop/orders" label="我的订单" className="mb-3" />
      <PageHeader title="订单支付" subtitle={`订单号 ${order.id}`} align="left" />

      <section className="page-section">
        {step === "success" ? (
          <div className="app-card panel-green text-center">
            <p className="text-5xl">✅</p>
            <p className="block-title mt-3 text-app-green">支付成功</p>
            <p className="body-text mt-2">
              {order.items[0]?.name} 已处理完成
              {order.category === "virtual" ? "，虚拟商品已到账" : ""}
            </p>
            <Link href="/shop/orders" className="app-btn mt-4 inline-flex !mb-0 w-full justify-center">
              查看订单
            </Link>
            <Link href="/spirit-pet" className="app-btn-secondary mt-2 inline-flex w-full justify-center">
              回到 AI 灵宠
            </Link>
          </div>
        ) : step === "qrcode" && payMethod ? (
          <div className="app-card text-center">
            <p className={`block-title ${methodColor}`}>
              请使用{PAY_METHOD_LABEL[payMethod]}扫码支付
            </p>
            <p className="caption mt-1 inline-flex items-center justify-center gap-1.5">
              <ShopEmojiDisplay emoji={order.items[0]?.emoji ?? ""} iconClassName="h-5 w-5 text-app-gold" />
              {order.items[0]?.name} · {formatPrice(order.totalAmount)}
            </p>
            <div className="mx-auto mt-4 inline-block rounded-2xl border border-app-border bg-white p-3">
              <img
                src={qrUrl}
                alt={`${PAY_METHOD_LABEL[payMethod]}支付二维码`}
                className="h-52 w-52"
              />
            </div>
            <p className="caption mt-3">
              打开{PAY_METHOD_LABEL[payMethod]}扫一扫，完成付款后点击下方按钮
            </p>
            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={paying}
              className="app-btn mt-4 w-full disabled:opacity-50"
            >
              {paying ? "确认支付中..." : "我已完成支付"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("method"); setPayMethod(null); }}
              className="caption mt-2 w-full text-app-muted"
            >
              更换支付方式
            </button>
          </div>
        ) : (
          <div className="app-card">
            <p className="caption mb-1 text-center">应付金额</p>
            <p className="mb-4 text-center text-2xl font-bold text-app-accent">
              {formatPrice(order.totalAmount)}
            </p>
            <p className="caption mb-4 text-center">请选择支付方式（演示）</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setPayMethod("alipay"); setStep("qrcode"); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-app-border py-3 body-text hover:border-blue-400"
              >
                <span className="text-lg">💙</span> 支付宝
              </button>
              <button
                type="button"
                onClick={() => { setPayMethod("wechat"); setStep("qrcode"); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-app-border py-3 body-text hover:border-green-400"
              >
                <span className="text-lg">💚</span> 微信支付
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

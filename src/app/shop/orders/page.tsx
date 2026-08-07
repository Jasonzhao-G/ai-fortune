"use client";

import { useMemo } from "react";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import {
  getOrdersForUser,
  ORDER_STATUS_LABEL,
  PAY_METHOD_LABEL,
} from "@/lib/shop/order-store";
import { formatPrice } from "@/lib/shop/catalog";
import { ShopEmojiDisplay } from "@/components/icons/SpiritGourdIcon";
import { useApp } from "@/context/AppContext";

export default function ShopOrdersPage() {
  const { user } = useApp();
  const orders = useMemo(() => (user ? getOrdersForUser(user.id) : []), [user]);

  return (
    <>
      <BackLink href="/shop" label="返回灵宠商城" className="mb-3" />
      <PageHeader title="我的订单" subtitle="购买记录 · 付款记录" align="left" />

      <section className="page-section">
        {orders.length === 0 ? (
          <div className="app-card text-center">
            <p className="text-4xl">📦</p>
            <p className="block-title mt-3">暂无订单</p>
            <p className="caption mt-1">去灵宠商城逛逛吧</p>
            <Link href="/shop" className="app-btn mt-4 inline-flex !mb-0 w-full justify-center">
              前往灵宠商城
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const item = order.items[0];
              const statusVariant =
                order.status === "fulfilled"
                  ? "success"
                  : order.status === "pending_payment"
                    ? "gold"
                    : "muted";

              return (
                <div key={order.id} className="app-card">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="micro text-app-muted">{order.id}</p>
                      <p className="caption mt-0.5">
                        {new Date(order.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <Badge variant={statusVariant}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-app-border/60 bg-app-bg/30 p-3">
                    <ShopEmojiDisplay emoji={item?.emoji ?? ""} iconClassName="h-7 w-7 text-app-gold" />
                    <div className="min-w-0 flex-1">
                      <p className="block-title truncate">{item?.name}</p>
                      <p className="caption">x{item?.qty ?? 1}</p>
                    </div>
                    <p className="block-title text-app-accent">{formatPrice(order.totalAmount)}</p>
                  </div>

                  {order.payMethod && order.paidAt && (
                    <div className="caption mt-2 space-y-1 rounded-lg bg-app-bg/40 px-3 py-2">
                      <p>
                        <span className="text-app-muted">支付方式：</span>
                        {PAY_METHOD_LABEL[order.payMethod]}
                      </p>
                      <p>
                        <span className="text-app-muted">支付时间：</span>
                        {new Date(order.paidAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  )}

                  {order.status === "pending_payment" && (
                    <Link
                      href={`/shop/pay/${order.id}`}
                      className="app-btn app-btn-sm mt-3 !mb-0 w-full text-center"
                    >
                      继续支付
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

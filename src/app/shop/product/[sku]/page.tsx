"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import BackLink from "@/components/ui/BackLink";
import Badge from "@/components/ui/Badge";
import { formatPrice, getProductBySku } from "@/lib/shop/catalog";
import { ShopEmojiDisplay } from "@/components/icons/SpiritGourdIcon";
import { ownsVirtualItem } from "@/lib/shop/inventory-store";
import { useApp } from "@/context/AppContext";

export default function ShopProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();
  const sku = params.sku as string;
  const product = getProductBySku(sku);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!product || product.availability !== "available") {
      router.replace("/shop");
    }
  }, [ready, product, router]);

  if (!product || product.availability !== "available") {
    return null;
  }

  const owned =
    user != null &&
    product.virtualKind !== "food" &&
    ownsVirtualItem(user.id, product.sku);

  return (
    <>
      <BackLink href="/shop" label="返回灵宠商城" className="mb-3" />
      <PageHeader title={product.name} subtitle={product.desc} align="left" />

      <section className="page-section">
        <div className="app-card panel-accent !p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-app-bg">
              <ShopEmojiDisplay emoji={product.emoji} iconClassName="h-12 w-12 text-app-gold" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1">
                {product.tags?.map((tag) => (
                  <Badge key={tag} variant="accent">{tag}</Badge>
                ))}
                {owned && <Badge variant="success">已拥有</Badge>}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="block-title text-app-accent">{formatPrice(product.price)}</p>
                <button
                  type="button"
                  disabled={owned}
                  onClick={() => router.push(`/shop/checkout?sku=${product.sku}`)}
                  className="shrink-0 rounded-xl bg-app-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {owned ? "已拥有" : "购买"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {product.detail && (
          <div className="app-card mt-2 !p-3">
            <p className="block-label mb-1 text-app-accent">商品说明</p>
            <p className="caption leading-relaxed">{product.detail}</p>
          </div>
        )}

        {product.virtualKind === "food" && (
          <p className="caption mt-2 px-1 text-app-muted">
            支付成功后灵丹立即到账，可在左上角「我的」查看余额。
          </p>
        )}
      </section>
    </>
  );
}

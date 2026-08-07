"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackLink from "@/components/ui/BackLink";
import PageHeader from "@/components/ui/PageHeader";
import ShopProductCard from "@/components/shop/ShopProductCard";
import ComingSoonModal from "@/components/shop/ComingSoonModal";
import { ShopEmojiDisplay } from "@/components/icons/SpiritGourdIcon";
import {
  COMING_SOON_MESSAGE,
  getProductsByShelf,
  getShelfById,
  type ShopShelfId,
} from "@/lib/shop/catalog";
import { ownsVirtualItem } from "@/lib/shop/inventory-store";
import { useApp } from "@/context/AppContext";

const VALID_SHELVES: ShopShelfId[] = [
  "food", "skin", "energy", "decor",
  "talisman", "bracelet", "ornament", "pendant", "experience", "doll",
];

export default function ShopCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();
  const shelfId = params.slug as ShopShelfId;
  const shelf = getShelfById(shelfId);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const products = useMemo(
    () => (shelf ? getProductsByShelf(shelf.id) : []),
    [shelf],
  );

  const invalid = !shelf || !VALID_SHELVES.includes(shelfId);

  useEffect(() => {
    if (invalid) router.replace("/shop");
  }, [invalid, router]);

  if (invalid) return null;

  const handleProductClick = (sku: string, availability: string) => {
    if (availability === "coming_soon") {
      setComingSoonOpen(true);
      return;
    }
    router.push(`/shop/product/${sku}`);
  };

  return (
    <>
      <BackLink href="/shop" label="返回灵宠商城" className="mb-3" />
      <PageHeader
        title={shelf.name}
        subtitle={shelf.desc}
        align="left"
      />

      <section className="page-section">
        <div className="app-card panel-gold mb-4 flex items-center gap-3 !py-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-app-gold/15">
            <ShopEmojiDisplay emoji={shelf.emoji} iconClassName="h-9 w-9 text-app-gold" />
          </span>
          <div className="min-w-0">
            <p className="block-title text-app-gold">{shelf.name}</p>
            <p className="caption">{products.length} 款商品 · {shelf.desc}</p>
          </div>
        </div>

        <div className="space-y-2">
          {products.map((product) => (
            <ShopProductCard
              key={product.sku}
              product={product}
              owned={
                user != null &&
                product.section === "virtual" &&
                product.virtualKind !== "food" &&
                ownsVirtualItem(user.id, product.sku)
              }
              onClick={() => handleProductClick(product.sku, product.availability)}
            />
          ))}
        </div>
      </section>

      <ComingSoonModal
        open={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        title={COMING_SOON_MESSAGE}
      />
    </>
  );
}

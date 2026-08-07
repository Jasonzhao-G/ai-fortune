"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { ShopEmojiDisplay } from "@/components/icons/SpiritGourdIcon";
import {
  getShelfPriceLabel,
  isShelfComingSoon,
  type ShopShelf,
} from "@/lib/shop/catalog";

interface ShopShelfTileProps {
  shelf: ShopShelf;
  productCount: number;
}

export default function ShopShelfTile({ shelf, productCount }: ShopShelfTileProps) {
  const comingSoon = isShelfComingSoon(shelf.id);

  return (
    <Link
      href={`/shop/category/${shelf.id}`}
      className="shop-shelf-tile group"
    >
      <div className="shop-shelf-icon">
        <ShopEmojiDisplay emoji={shelf.emoji} iconClassName="h-10 w-10 text-app-gold" />
      </div>
      <p className="shop-shelf-name">{shelf.name}</p>
      <p className="shop-shelf-desc">{shelf.desc}</p>
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
        {comingSoon ? (
          <Badge variant="gold">即将上线</Badge>
        ) : (
          <span className="micro font-semibold text-app-accent">{getShelfPriceLabel(shelf.id)}</span>
        )}
        <span className="micro text-app-muted">{productCount} 款</span>
      </div>
    </Link>
  );
}

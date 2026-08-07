"use client";

import { cn } from "@/lib/utils";
import { formatPrice, type ShopProduct } from "@/lib/shop/catalog";
import Badge from "@/components/ui/Badge";
import { ShopEmojiDisplay } from "@/components/icons/SpiritGourdIcon";

interface ShopProductCardProps {
  product: ShopProduct;
  onClick: () => void;
  compact?: boolean;
  owned?: boolean;
}

export default function ShopProductCard({
  product,
  onClick,
  compact,
  owned,
}: ShopProductCardProps) {
  const comingSoon = product.availability === "coming_soon";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col rounded-xl border border-app-border bg-app-card text-left transition-colors active:scale-[0.99]",
        compact ? "p-2.5" : "p-3",
        comingSoon ? "opacity-90 hover:border-app-gold/40" : "hover:border-app-accent/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cn("flex shrink-0 items-center justify-center rounded-xl bg-app-bg", compact ? "h-10 w-10" : "h-12 w-12")}>
          <ShopEmojiDisplay
            emoji={product.emoji}
            iconClassName={compact ? "h-6 w-6 text-app-gold" : "h-8 w-8 text-app-gold"}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("block-title truncate", compact && "text-[14px]")}>{product.name}</span>
            {comingSoon && <Badge variant="gold">即将上线</Badge>}
            {owned && <Badge variant="success">已拥有</Badge>}
          </div>
          <p className="caption mt-0.5 line-clamp-2">{product.desc}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {product.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="micro rounded-full border border-app-border px-1.5 py-0.5">{tag}</span>
            ))}
            <span className={cn("ml-auto font-bold", comingSoon ? "text-app-muted" : "text-app-accent")}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

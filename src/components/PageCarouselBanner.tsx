"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PageBannerSlide } from "@/lib/page-banners";
import { ShopEmojiDisplay } from "@/components/icons/SpiritGourdIcon";

interface PageCarouselBannerProps {
  slides: PageBannerSlide[];
  className?: string;
}

export default function PageCarouselBanner({ slides, className = "" }: PageCarouselBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index];

  const inner = (
    <div
      className="page-banner-slide relative overflow-hidden rounded-xl p-4 shadow-md transition-all"
      style={{ background: slide.bg }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/15" />
      <div className="relative z-10 flex items-center gap-3">
        {slide.emoji && (
          <ShopEmojiDisplay emoji={slide.emoji} className="text-3xl drop-shadow-md" iconClassName="h-9 w-9 text-white drop-shadow-md" />
        )}
        <div className="min-w-0 flex-1">
          <p className="heading-3 truncate text-white drop-shadow-sm">{slide.title}</p>
          <p className="caption mt-0.5 truncate text-white/95 drop-shadow-sm">{slide.subtitle}</p>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="relative z-10 mt-3 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`第 ${i + 1} 张`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className={`page-section ${className}`}>
      {slide.href ? (
        <Link href={slide.href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </section>
  );
}

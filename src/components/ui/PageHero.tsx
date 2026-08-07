import type { ReactNode } from "react";
import PageCarouselBanner from "@/components/PageCarouselBanner";
import type { PageBannerSlide } from "@/lib/page-banners";

interface PageHeroProps {
  slogan?: ReactNode;
  banners?: PageBannerSlide[];
  className?: string;
}

/** Slogan 在上，轮播 Banner 在下 */
export default function PageHero({ slogan, banners, className = "" }: PageHeroProps) {
  return (
    <div className={className}>
      {slogan}
      {banners && banners.length > 0 && (
        <PageCarouselBanner slides={banners} className="!mb-4 !pt-0" />
      )}
    </div>
  );
}

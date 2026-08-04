import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "AI 灵宠 - AI大模型驱动的灵宠陪伴K线命理可视化平台",
  description: "八字排盘、人生K线、AI看相、六爻占卜、陪伴型灵宠",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1c1915",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ai-fortune-theme");var r=document.documentElement;if(t==="light"){r.classList.remove("dark");r.classList.add("light");}else{r.classList.add("dark");r.classList.remove("light");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <Providers>
          <TopBar />
          <main className="mx-auto min-h-screen max-w-lg pb-[72px]">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

import { SPIRIT_GOURD_EMOJI } from "@/lib/spirit-gourd-icon";

export interface PageBannerSlide {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  /** 高对比渐变（避免浅色主题看不清） */
  bg: string;
  emoji?: string;
}

export type PageBannerKey = "home" | "spirit-pet" | "lifekline" | "community" | "shop" | "ask";

export const PAGE_BANNERS: Record<PageBannerKey, PageBannerSlide[]> = {
  home: [
    {
      id: "kline",
      title: "马上测算人生 K 线",
      subtitle: "命势推演 · 可视化排盘",
      href: "/lifekline",
      bg: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
      emoji: "📈",
    },
    {
      id: "pet",
      title: "收养你的第一只灵宠",
      subtitle: "AI 大模型驱动 · 命理陪伴",
      href: "/spirit-pet",
      bg: "linear-gradient(135deg, #6d28d9 0%, #be185d 100%)",
      emoji: "🦄",
    },
    {
      id: "shop",
      title: "灵宠商城上新",
      subtitle: "灵丹 · 皮肤 · 开运好物",
      href: "/shop",
      bg: "linear-gradient(135deg, #b45309 0%, #c2410c 100%)",
      emoji: "🛍️",
    },
  ],
  "spirit-pet": [
    {
      id: "awake",
      title: "觉醒你的守护灵",
      subtitle: "积累灵力 · 解锁陪伴能力",
      bg: "linear-gradient(135deg, #92400e 0%, #ca8a04 100%)",
      emoji: "✨",
    },
    {
      id: "chat",
      title: "跟灵宠聊聊天",
      subtitle: "今日灵签 · 命理翻译 · 睡前陪伴",
      href: "/ask?from=spirit-pet",
      bg: "linear-gradient(135deg, #1d4ed8 0%, #7e22ce 100%)",
      emoji: "💬",
    },
    {
      id: "shop",
      title: "灵宠商城",
      subtitle: "灵丹补给 · 皮肤装饰",
      href: "/shop",
      bg: "linear-gradient(135deg, #047857 0%, #0f766e 100%)",
      emoji: "🛍️",
    },
  ],
  lifekline: [
    {
      id: "kline",
      title: "人生 K 线推演",
      subtitle: "红涨绿跌 · 命势一目了然",
      bg: "linear-gradient(135deg, #b91c1c 0%, #9f1239 100%)",
      emoji: "📊",
    },
    {
      id: "bazi",
      title: "八字排盘",
      subtitle: "四柱命理 · 深度解读",
      bg: "linear-gradient(135deg, #78350f 0%, #a16207 100%)",
      emoji: "☯️",
    },
    {
      id: "food",
      title: "灵丹规则",
      subtitle: "1 瓶灵丹 = 5 次测算",
      href: "/shop/category/food",
      bg: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
      emoji: SPIRIT_GOURD_EMOJI,
    },
  ],
  community: [
    {
      id: "square",
      title: "命理交流广场",
      subtitle: "分享心得 · 结识同路人",
      bg: "linear-gradient(135deg, #be123c 0%, #9d174d 100%)",
      emoji: "🌐",
    },
    {
      id: "gift",
      title: "赠送灵丹",
      subtitle: "搜索用户 · 私信互动",
      bg: "linear-gradient(135deg, #a16207 0%, #b45309 100%)",
      emoji: "🎁",
    },
  ],
  shop: [
    {
      id: "virtual",
      title: "虚拟好物",
      subtitle: "灵丹 · 皮肤 · 能量棒",
      bg: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
      emoji: "✨",
    },
    {
      id: "physical",
      title: "开运实物",
      subtitle: "符咒 · 手串 · 摆件",
      bg: "linear-gradient(135deg, #854d0e 0%, #a16207 100%)",
      emoji: "📿",
    },
  ],
  ask: [
    {
      id: "fortune",
      title: "今日灵签",
      subtitle: "结合命盘 · 每日运势",
      href: "/ask?from=spirit-pet&ability=今日灵签",
      bg: "linear-gradient(135deg, #c2410c 0%, #b45309 100%)",
      emoji: "🌅",
    },
    {
      id: "chat",
      title: "与灵宠对话",
      subtitle: "命理翻译 · 人生助手",
      bg: "linear-gradient(135deg, #1e3a8a 0%, #581c87 100%)",
      emoji: "🦄",
    },
  ],
};

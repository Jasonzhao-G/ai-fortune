"use client";

interface XiangDemoDiagramProps {
  type: "palm" | "face";
}

/** 麻衣神相风格 · 手相/面相示意 */
export default function XiangDemoDiagram({ type }: XiangDemoDiagramProps) {
  if (type === "palm") {
    return (
      <svg viewBox="0 0 220 280" className="mx-auto h-44 w-auto" aria-label="手相示意">
        <defs>
          <linearGradient id="palmSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c9a8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c9956a" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {/* 手腕 */}
        <path d="M78 248 Q110 255 142 248 L138 268 Q110 275 82 268 Z" fill="url(#palmSkin)" stroke="#b8895a" strokeWidth="1.2" />
        {/* 手掌 */}
        <path
          d="M110 248 C78 245 52 215 48 175 C44 140 52 105 68 82 C82 62 98 52 110 50 C122 52 138 62 152 82 C168 105 176 140 172 175 C168 215 142 245 110 248 Z"
          fill="url(#palmSkin)" stroke="#b8895a" strokeWidth="1.5"
        />
        {/* 拇指 */}
        <path d="M48 175 C28 168 18 148 22 128 C26 108 38 98 52 102 C58 118 56 145 48 175 Z" fill="url(#palmSkin)" stroke="#b8895a" strokeWidth="1.2" />
        {/* 食指 */}
        <path d="M68 82 C62 52 64 28 72 14 C78 8 86 8 92 14 C98 28 100 52 94 82 L88 108 L74 108 Z" fill="url(#palmSkin)" stroke="#b8895a" strokeWidth="1.2" />
        {/* 中指 */}
        <path d="M98 62 C96 30 100 10 108 4 C114 0 120 0 126 4 C134 10 138 30 136 62 L132 112 L102 112 Z" fill="url(#palmSkin)" stroke="#b8895a" strokeWidth="1.2" />
        {/* 无名指 */}
        <path d="M128 72 C132 42 136 22 142 14 C148 8 154 8 158 14 C164 22 166 42 162 72 L158 110 L132 110 Z" fill="url(#palmSkin)" stroke="#b8895a" strokeWidth="1.2" />
        {/* 小指 */}
        <path d="M158 98 C168 78 174 58 172 42 C170 30 164 26 158 30 C152 38 150 58 152 78 L150 108 L148 108 Z" fill="url(#palmSkin)" stroke="#b8895a" strokeWidth="1.2" />
        {/* 掌纹 · 麻衣神相 */}
        <path d="M52 102 Q78 118 108 115 Q138 112 168 98" fill="none" stroke="#c45c48" strokeWidth="1.4" />
        <text x="170" y="96" fill="#c45c48" fontSize="8" fontFamily="serif">感情线</text>
        <path d="M58 130 Q95 108 132 138 Q148 152 158 168" fill="none" stroke="#5a8a7a" strokeWidth="1.3" />
        <text x="160" y="172" fill="#5a8a7a" fontSize="8" fontFamily="serif">智慧线</text>
        <path d="M88 108 Q102 145 98 185 Q95 215 92 240" fill="none" stroke="#8b6914" strokeWidth="1.6" />
        <text x="72" y="238" fill="#8b6914" fontSize="8" fontFamily="serif">生命线</text>
        <path d="M110 115 L110 235" fill="none" stroke="#9a8060" strokeWidth="1" strokeDasharray="3 2" />
        <text x="114" y="128" fill="#9a8060" fontSize="7" fontFamily="serif">命运线</text>
        <path d="M72 175 Q110 165 148 178" fill="none" stroke="#4a7ab8" strokeWidth="1" />
        <text x="150" y="182" fill="#4a7ab8" fontSize="7" fontFamily="serif">事业线</text>
        <text x="62" y="272" fill="#9a9088" fontSize="9" fontFamily="serif">麻衣神相 · 手相示意 · 掌心平展</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 280" className="mx-auto h-44 w-auto" aria-label="面相示意">
      <defs>
        <linearGradient id="faceSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8c9a8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c9956a" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* 脸型 · 国字脸示意 */}
      <path
        d="M110 28 C82 28 58 52 52 88 C48 118 52 148 58 178 C64 208 82 232 110 238 C138 232 156 208 162 178 C168 148 172 118 168 88 C162 52 138 28 110 28 Z"
        fill="url(#faceSkin)" stroke="#b8895a" strokeWidth="1.5"
      />
      {/* 发际 */}
      <path d="M58 88 Q110 58 162 88" fill="none" stroke="#9a8060" strokeWidth="1" strokeDasharray="4 3" />
      {/* 三庭 */}
      <line x1="52" y1="88" x2="168" y2="88" stroke="#c45c48" strokeWidth="0.8" strokeDasharray="2 2" />
      <text x="172" y="90" fill="#c45c48" fontSize="7" fontFamily="serif">上庭</text>
      <line x1="54" y1="128" x2="166" y2="128" stroke="#5a8a7a" strokeWidth="0.8" strokeDasharray="2 2" />
      <text x="172" y="130" fill="#5a8a7a" fontSize="7" fontFamily="serif">中庭</text>
      <line x1="58" y1="178" x2="162" y2="178" stroke="#8b6914" strokeWidth="0.8" strokeDasharray="2 2" />
      <text x="172" y="180" fill="#8b6914" fontSize="7" fontFamily="serif">下庭</text>
      {/* 天庭 */}
      <text x="96" y="72" fill="#c45c48" fontSize="8" fontFamily="serif">天庭</text>
      {/* 印堂 */}
      <ellipse cx="110" cy="118" rx="8" ry="5" fill="none" stroke="#5a8a7a" strokeWidth="1" />
      <text x="122" y="120" fill="#5a8a7a" fontSize="7" fontFamily="serif">印堂</text>
      {/* 眉毛 */}
      <path d="M72 108 Q84 102 96 108" fill="none" stroke="#6b5344" strokeWidth="1.5" />
      <path d="M124 108 Q136 102 148 108" fill="none" stroke="#6b5344" strokeWidth="1.5" />
      {/* 眼 · 五眼 */}
      <ellipse cx="86" cy="122" rx="14" ry="8" fill="#fff" fillOpacity="0.15" stroke="#b8895a" strokeWidth="1" />
      <ellipse cx="134" cy="122" rx="14" ry="8" fill="#fff" fillOpacity="0.15" stroke="#b8895a" strokeWidth="1" />
      <circle cx="86" cy="122" r="4" fill="#4a3728" />
      <circle cx="134" cy="122" r="4" fill="#4a3728" />
      <text x="78" y="140" fill="#9a9088" fontSize="6" fontFamily="serif">眼</text>
      <text x="130" y="140" fill="#9a9088" fontSize="6" fontFamily="serif">眼</text>
      {/* 鼻 · 准头 */}
      <path d="M110 128 L104 158 Q110 164 116 158 L110 128" fill="none" stroke="#b8895a" strokeWidth="1.2" />
      <ellipse cx="110" cy="162" rx="10" ry="6" fill="none" stroke="#c45c48" strokeWidth="1" />
      <text x="122" y="164" fill="#c45c48" fontSize="7" fontFamily="serif">准头</text>
      {/* 口 · 水星 */}
      <path d="M92 188 Q110 198 128 188" fill="none" stroke="#8b6914" strokeWidth="1.3" />
      <text x="130" y="192" fill="#8b6914" fontSize="7" fontFamily="serif">水星</text>
      {/* 地阁 */}
      <path d="M72 208 Q110 228 148 208" fill="none" stroke="#9a8060" strokeWidth="1" />
      <text x="150" y="212" fill="#9a8060" fontSize="7" fontFamily="serif">地阁</text>
      {/* 耳 */}
      <path d="M52 118 Q42 138 48 162 Q52 172 56 168" fill="none" stroke="#b8895a" strokeWidth="1" />
      <path d="M168 118 Q178 138 172 162 Q168 172 164 168" fill="none" stroke="#b8895a" strokeWidth="1" />
      <text x="62" y="272" fill="#9a9088" fontSize="9" fontFamily="serif">麻衣神相 · 面相示意 · 三庭五眼</text>
    </svg>
  );
}

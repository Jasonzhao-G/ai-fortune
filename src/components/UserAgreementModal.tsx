"use client";

import { X } from "lucide-react";

interface UserAgreementModalProps {
  open: boolean;
  onClose: () => void;
}

const AGREEMENT = `AI 灵宠用户服务协议

欢迎使用 AI 灵宠平台。注册或使用本服务即表示您同意以下条款：

1. 服务说明
本平台提供命理可视化、AI 测算、社区交流等服务，测算结果仅供娱乐与参考，不构成专业建议。

2. 账号与安全
您应妥善保管账号信息，对账号下的行为负责。请勿利用本平台从事违法违规活动。

3. 内容与社区规范
您发布的内容需合法合规，不得侵犯他人权益。平台有权对违规内容进行处理。

4. 隐私与数据
您的生辰、测算记录等数据主要存储在本地设备。我们重视隐私保护，详见隐私政策。

5. 灵粮与付费
灵粮用于测算次数消耗，购买与赠送规则以页面展示为准。

6. 协议变更
平台可能更新本协议，继续使用即视为接受更新后的条款。

如有疑问，请通过「联系客服」与我们沟通。`;

export default function UserAgreementModal({ open, onClose }: UserAgreementModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-app-border bg-app-card p-5 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X className="h-5 w-5 text-app-muted" />
        </button>
        <h2 className="mb-3 pr-8 text-sm font-semibold text-app-text">用户服务协议</h2>
        <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-app-muted">{AGREEMENT}</pre>
      </div>
    </div>
  );
}

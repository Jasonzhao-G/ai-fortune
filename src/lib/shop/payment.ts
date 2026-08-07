/** 演示用支付二维码（正式环境需对接微信/支付宝网关） */
export function getShopPaymentQrUrl(
  orderId: string,
  amount: number,
  method: "alipay" | "wechat",
  userId: string,
): string {
  const payload = [
    "ai-fortune-shop-pay",
    method,
    orderId,
    amount,
    userId,
    Date.now(),
  ].join("|");
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
}

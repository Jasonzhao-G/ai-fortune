/** 真人大师咨询单次付费（不占用灵丹次数） */

export const MASTER_CONSULT_PRICE = 99;

export function getMasterPaymentQrUrl(method: "alipay" | "wechat"): string {
  const label = encodeURIComponent(`真人大师咨询¥${MASTER_CONSULT_PRICE}`);
  if (method === "alipay") {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${label}-alipay-demo`;
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${label}-wechat-demo`;
}

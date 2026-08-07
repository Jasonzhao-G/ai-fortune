/** 灵丹 · 太上老君药葫芦图标标识（替代胶囊 💊） */
export const SPIRIT_GOURD_EMOJI = "spirit-gourd";

export function isSpiritGourdEmoji(emoji: string | undefined | null): boolean {
  return emoji === SPIRIT_GOURD_EMOJI || emoji === "💊";
}

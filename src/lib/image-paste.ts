/** 从剪贴板粘贴图片 */
export function readPastedImages(
  e: React.ClipboardEvent,
  onImage: (dataUrl: string) => void,
  maxCount: number,
  currentCount: number,
): boolean {
  const items = e.clipboardData?.items;
  if (!items) return false;
  let handled = false;
  for (const item of items) {
    if (currentCount >= maxCount) break;
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (!file) continue;
      e.preventDefault();
      handled = true;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (url) onImage(url);
      };
      reader.readAsDataURL(file);
      currentCount++;
    }
  }
  return handled;
}

export function readImageFile(file: File, onImage: (dataUrl: string) => void): void {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const url = e.target?.result as string;
    if (url) onImage(url);
  };
  reader.readAsDataURL(file);
}

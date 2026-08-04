"use client";

import { useRef } from "react";
import { ImagePlus, X, ClipboardPaste } from "lucide-react";
import { readImageFile, readPastedImages } from "@/lib/image-paste";

const MAX_IMAGES = 4;

interface CommunityMediaPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  compact?: boolean;
  /** 绑定到 textarea 的 paste 事件 */
  enablePaste?: boolean;
}

export default function CommunityMediaPicker({ images, onChange, compact, enablePaste }: CommunityMediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLDivElement>(null);

  const addImageUrl = (url: string) => {
    if (images.length >= MAX_IMAGES) return;
    onChange([...images, url]);
  };

  const addImage = (file: File) => readImageFile(file, addImageUrl);

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!enablePaste) return;
    readPastedImages(e, addImageUrl, MAX_IMAGES, images.length);
  };

  return (
    <div ref={pasteRef} onPaste={enablePaste ? handlePaste : undefined}>
      {images.length > 0 && (
        <div className={`mb-2 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {images.map((img, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-app-border">
              <img src={img} alt="" className={`w-full object-cover ${compact ? "max-h-28" : "max-h-40"}`} />
              <button type="button" onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5">
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < MAX_IMAGES && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 rounded-lg border border-dashed border-app-border px-2 py-1 text-[10px] text-app-muted">
            <ImagePlus className="h-3.5 w-3.5" /> 添加图片
          </button>
          {enablePaste && (
            <span className="flex items-center gap-0.5 text-[10px] text-app-muted">
              <ClipboardPaste className="h-3 w-3" /> 支持 Ctrl+V 粘贴图片
            </span>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );
}

export { MAX_IMAGES as COMMUNITY_MAX_IMAGES };

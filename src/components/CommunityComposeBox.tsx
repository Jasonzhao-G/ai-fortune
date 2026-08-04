"use client";

import { Send } from "lucide-react";
import CommunityMediaPicker from "@/components/CommunityMediaPicker";
import { readPastedImages } from "@/lib/image-paste";

const MAX_IMAGES = 4;

interface CommunityComposeBoxProps {
  content: string;
  images: string[];
  onContentChange: (v: string) => void;
  onImagesChange: (v: string[]) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
}

export default function CommunityComposeBox({
  content,
  images,
  onContentChange,
  onImagesChange,
  onSubmit,
  placeholder = "分享文字、图片或图文…",
  submitLabel = "发布",
  compact,
}: CommunityComposeBoxProps) {
  const canSubmit = content.trim().length > 0 || images.length > 0;

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    readPastedImages(
      e,
      (url) => { if (images.length < MAX_IMAGES) onImagesChange([...images, url]); },
      MAX_IMAGES,
      images.length,
    );
  };

  return (
    <div className="app-card">
      <textarea
        className={`app-input mb-2 resize-none ${compact ? "min-h-[60px] text-xs" : "min-h-[80px]"}`}
        placeholder={placeholder}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onPaste={handlePaste}
      />
      <CommunityMediaPicker
        images={images}
        onChange={onImagesChange}
        compact={compact}
        enablePaste
      />
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`app-btn mt-2 flex items-center justify-center gap-2 disabled:opacity-40 ${compact ? "!py-2 text-xs" : ""}`}
      >
        <Send className="h-4 w-4" /> {submitLabel}
      </button>
    </div>
  );
}

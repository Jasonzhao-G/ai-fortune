"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, X } from "lucide-react";
import { compressImageDataUrl } from "@/lib/image-compress";

interface ImageUploadProps {
  label: string;
  hint: string;
  onImageSelect: (base64: string) => void;
  preview?: string | null;
  onClear?: () => void;
}

export default function ImageUpload({ label, hint, onImageSelect, preview, onClear }: ImageUploadProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("读取失败"));
        reader.readAsDataURL(file);
      });
      const compressed = await compressImageDataUrl(dataUrl);
      onImageSelect(compressed);
    } catch {
      onImageSelect("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-card">
      <label className="app-label">{label}</label>
      <p className="mb-3 text-[11px] text-app-muted">{hint}</p>

      {preview ? (
        <div className="relative">
          <img src={preview} alt="preview" className="mx-auto max-h-56 rounded-xl object-contain" />
          {onClear && (
            <button type="button" onClick={onClear} className="absolute right-2 top-2 rounded-full bg-app-card/90 p-1 shadow-sm">
              <X className="h-4 w-4 text-app-muted" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`rounded-xl border-2 border-dashed py-8 transition-colors ${
            dragOver ? "border-app-accent bg-app-accent-light" : "border-app-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) processFile(f);
          }}
        >
          <div className="flex flex-col items-center gap-4 px-4">
            <div className="flex w-full max-w-xs gap-2">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                disabled={loading}
                className="app-btn flex flex-1 items-center justify-center gap-2 !py-3"
              >
                <Camera className="h-5 w-5" />
                拍照上传
              </button>
              <button
                type="button"
                onClick={() => albumRef.current?.click()}
                disabled={loading}
                className="app-btn-outline flex flex-1 items-center justify-center gap-2 !py-3"
              >
                <ImageIcon className="h-5 w-5" />
                本地上传
              </button>
            </div>
            <p className="text-[11px] text-app-muted">
              {loading ? "图片处理中…" : "也可拖拽图片到此处 · 支持相册选取"}
            </p>
          </div>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

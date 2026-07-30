"use client";

import { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";

interface ImageUploadProps {
  label: string;
  hint: string;
  onImageSelect: (base64: string) => void;
  preview?: string | null;
  onClear?: () => void;
}

export default function ImageUpload({ label, hint, onImageSelect, preview, onClear }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onImageSelect(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="app-card">
      <label className="app-label">{label}</label>
      <p className="mb-3 text-[11px] text-app-muted">{hint}</p>

      {preview ? (
        <div className="relative">
          <img src={preview} alt="preview" className="mx-auto max-h-56 rounded-xl object-contain" />
          {onClear && (
            <button onClick={onClear} className="absolute right-2 top-2 rounded-full bg-app-card/90 p-1 shadow-sm">
              <X className="h-4 w-4 text-app-muted" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-10 transition-colors ${
            dragOver ? "border-app-accent bg-app-accent-light" : "border-app-border"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex gap-3">
            <Camera className="h-6 w-6 text-app-accent" strokeWidth={1.5} />
            <Upload className="h-6 w-6 text-app-muted" strokeWidth={1.5} />
          </div>
          <p className="text-xs text-app-muted">Tap to upload</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
    </div>
  );
}

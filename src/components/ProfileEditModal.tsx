"use client";

import { useState } from "react";
import { X, Camera } from "lucide-react";
import { updateUser } from "@/lib/user-store";
import { isNicknameTaken, registerNickname } from "@/lib/nickname-registry";
import type { UserProfile } from "@/lib/types";

interface ProfileEditModalProps {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ProfileEditModal({ user, open, onClose, onUpdated }: ProfileEditModalProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("昵称不能为空");
      return;
    }
    if (isNicknameTaken(trimmed, user.id)) {
      setError("该名字已被注册，请更换一个吧～");
      return;
    }
    registerNickname(trimmed, user.id, user.nickname);
    updateUser({ nickname: trimmed, avatar });
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-app-border bg-app-card p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X className="h-5 w-5 text-app-muted" />
        </button>
        <h2 className="mb-4 text-base font-semibold text-app-text">编辑资料</h2>

        <div className="mb-4 flex flex-col items-center">
          <label className="relative cursor-pointer">
            <img src={avatar} alt="" className="h-20 w-20 rounded-full border-2 border-app-gold/40 object-cover" />
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-app-accent text-white">
              <Camera className="h-3.5 w-3.5" />
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
          <p className="mt-2 text-[10px] text-app-muted">点击上传头像</p>
        </div>

        <div className="mb-4">
          <label className="app-label">昵称</label>
          <input
            className="app-input"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError(null); }}
            placeholder="输入您的昵称"
            maxLength={20}
          />
          {error && <p className="mt-1 text-[11px] text-app-red">{error}</p>}
        </div>

        <button onClick={handleSubmit} className="app-btn">保存</button>
      </div>
    </div>
  );
}

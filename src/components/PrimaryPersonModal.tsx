"use client";

import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { PRIMARY_PERSON_NAME } from "@/lib/person-store";

export const PRIMARY_PERSON_PROMPT =
  `主测算人「${PRIMARY_PERSON_NAME}」是必填项目，否则无法按照您的命格生成守护灵宠，以及给出相关命格建议！\n\n请先在「我的测算」中添加主测算人。`;

interface PrimaryPersonModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrimaryPersonModal({ open, onClose }: PrimaryPersonModalProps) {
  const router = useRouter();

  return (
    <ConfirmModal
      open={open}
      title="请先添加主测算人"
      message={PRIMARY_PERSON_PROMPT}
      confirmLabel="去添加"
      cancelLabel="稍后再说"
      onConfirm={() => {
        onClose();
        router.push("/records");
      }}
      onCancel={onClose}
    />
  );
}

"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import ComingSoonModal from "@/components/ComingSoonModal";

interface SpiritPetMatchFriendsButtonProps {
  unlocked: boolean;
  className?: string;
}

export default function SpiritPetMatchFriendsButton({
  unlocked,
  className = "",
}: SpiritPetMatchFriendsButtonProps) {
  const [open, setOpen] = useState(false);

  if (!unlocked) return null;

  return (
    <>
      <section className={`page-section ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="app-btn flex w-full items-center justify-center gap-2"
        >
          <Users className="h-5 w-5" />
          去配对交友
        </button>
      </section>
      <ComingSoonModal open={open} onClose={() => setOpen(false)} title="配对交友" />
    </>
  );
}

"use client";

import Link from "next/link";
import VerifiedBadge from "@/components/VerifiedBadge";
import { isUserVerified } from "@/lib/community-store";

interface UserAvatarProps {
  userId: string;
  avatar: string;
  nickname?: string;
  size?: "sm" | "md" | "lg";
  verified?: boolean;
  linkToProfile?: boolean;
  className?: string;
}

const SIZES = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
const BADGE = { sm: "sm" as const, md: "sm" as const, lg: "md" as const };

export default function UserAvatar({
  userId,
  avatar,
  nickname,
  size = "sm",
  verified,
  linkToProfile = false,
  className = "",
}: UserAvatarProps) {
  const showV = verified ?? isUserVerified(userId);
  const img = (
    <div className={`relative shrink-0 ${SIZES[size]} ${className}`}>
      <img src={avatar} alt={nickname ?? ""} className={`${SIZES[size]} rounded-full object-cover`} />
      {showV && (
        <span className="absolute -bottom-0.5 -right-0.5">
          <VerifiedBadge size={BADGE[size]} />
        </span>
      )}
    </div>
  );

  if (linkToProfile) {
    return <Link href={`/community/user/${userId}`}>{img}</Link>;
  }
  return img;
}

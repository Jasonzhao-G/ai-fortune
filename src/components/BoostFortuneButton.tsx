import Link from "next/link";
import { Sparkles } from "lucide-react";

interface BoostFortuneButtonProps {
  className?: string;
}

/** 引导用户前往灵宠商城提升运势 */
export default function BoostFortuneButton({ className = "" }: BoostFortuneButtonProps) {
  return (
    <Link
      href="/shop"
      className={`app-btn flex items-center justify-center gap-2 ${className}`}
    >
      <Sparkles className="h-5 w-5" />
      马上提升运势
    </Link>
  );
}

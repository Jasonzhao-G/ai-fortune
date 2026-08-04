"use client";

import Link from "next/link";
import {
  Heart, Star, Share2, ChevronDown, ChevronUp,
  UserPlus, UserCheck, MessageCircle,
} from "lucide-react";
import type { CommunityPost, CommunityComment } from "@/lib/types";
import { isLiked, isFavorited, isFollowing } from "@/lib/community-store";
import CommunityMediaPicker from "@/components/CommunityMediaPicker";
import UserAvatar from "@/components/UserAvatar";
import { readPastedImages } from "@/lib/image-paste";

interface CommunityPostCardProps {
  post: CommunityPost;
  uid: string;
  expanded?: boolean;
  comments?: CommunityComment[];
  commentDraft?: string;
  commentImage?: string | null;
  onToggleComments?: () => void;
  onCommentDraftChange?: (value: string) => void;
  onCommentImageChange?: (value: string | null) => void;
  onComment?: () => void;
  onLike?: () => void;
  onFavorite?: () => void;
  onRepost?: () => void;
  onFollow?: () => void;
  timeAgo: (iso: string) => string;
}

function PostImages({ images }: { images: string[] }) {
  if (!images.length) return null;
  return (
    <div className={`mb-3 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {images.map((img, i) => (
        <img key={i} src={img} alt="" className="w-full rounded-xl border border-app-border object-cover max-h-48" />
      ))}
    </div>
  );
}

export default function CommunityPostCard({
  post,
  uid,
  expanded = false,
  comments = [],
  commentDraft = "",
  commentImage = null,
  onToggleComments,
  onCommentDraftChange,
  onCommentImageChange,
  onComment,
  onLike,
  onFavorite,
  onRepost,
  onFollow,
  timeAgo,
}: CommunityPostCardProps) {
  const liked = isLiked(post, uid);
  const favorited = isFavorited(post, uid);
  const following = isFollowing(post.userId);
  const images = post.images ?? [];

  const handleCommentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!onCommentImageChange || commentImage) return;
    readPastedImages(e, (url) => onCommentImageChange(url), 1, commentImage ? 1 : 0);
  };

  return (
    <div className="app-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Link href={`/community/user/${post.userId}`} className="flex min-w-0 flex-1 items-center gap-2">
          <UserAvatar userId={post.userId} avatar={post.avatar} nickname={post.nickname} size="sm" linkToProfile={false} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-app-text">{post.nickname}</p>
            <p className="text-[10px] text-app-muted">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {post.userId !== uid && onFollow && (
          <button
            onClick={onFollow}
            className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] ${
              following ? "border border-app-accent text-app-accent" : "border border-app-border text-app-muted"
            }`}
          >
            {following ? <><UserCheck className="h-3 w-3" /> 已关注</> : <><UserPlus className="h-3 w-3" /> 关注</>}
          </button>
        )}
        {post.isFeatured && (
          <span className="shrink-0 rounded-full bg-app-gold/20 px-2 py-0.5 text-[10px] text-app-gold">精华</span>
        )}
      </div>
      {post.content && (
        <p className="mb-3 text-sm leading-relaxed text-app-text">{post.content}</p>
      )}
      <PostImages images={images} />
      {post.repostOf && (
        <div className="mb-3 rounded-xl border border-app-border bg-app-bg/60 px-3 py-2">
          <p className="text-[10px] text-app-muted">原帖 @{post.repostOf.nickname}</p>
          <p className="text-xs text-app-muted">{post.repostOf.content}</p>
        </div>
      )}
      <div className="flex items-center gap-4 border-t border-app-border pt-2">
        {onLike && (
          <button onClick={onLike}
            className={`flex items-center gap-1 text-xs ${liked ? "text-app-red" : "text-app-muted"}`}>
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} /> {post.likes}
          </button>
        )}
        {onToggleComments && (
          <button onClick={onToggleComments} className="flex items-center gap-1 text-xs text-app-muted">
            <MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
        {onFavorite && (
          <button onClick={onFavorite}
            className={`flex items-center gap-1 text-xs ${favorited ? "text-app-gold" : "text-app-muted"}`}>
            <Star className={`h-3.5 w-3.5 ${favorited ? "fill-current" : ""}`} /> 收藏
          </button>
        )}
        {onRepost && (
          <button onClick={onRepost} className="flex items-center gap-1 text-xs text-app-muted">
            <Share2 className="h-3.5 w-3.5" /> 转发
          </button>
        )}
      </div>
      {expanded && onComment && onCommentDraftChange && (
        <div className="mt-3 border-t border-app-border pt-3">
          {comments.map((c) => (
            <div key={c.id} className="mb-2 flex gap-2">
              <UserAvatar userId={c.userId} avatar={c.avatar} size="sm" linkToProfile />
              <div className="flex-1 rounded-xl bg-app-bg px-3 py-2">
                <Link href={`/community/user/${c.userId}`} className="text-[10px] font-medium text-app-text">
                  {c.nickname}
                </Link>
                {c.content && <p className="text-xs text-app-muted">{c.content}</p>}
                {c.imageUrl && (
                  <img src={c.imageUrl} alt="" className="mt-1 max-h-32 rounded-lg border border-app-border object-cover" />
                )}
              </div>
            </div>
          ))}
          <div className="space-y-2">
            <textarea
              className="app-input min-h-[60px] resize-none text-xs"
              placeholder="写评论… 支持 Ctrl+V 粘贴图片"
              value={commentDraft}
              onChange={(e) => onCommentDraftChange(e.target.value)}
              onPaste={handleCommentPaste}
            />
            {onCommentImageChange && (
              <CommunityMediaPicker
                compact
                enablePaste
                images={commentImage ? [commentImage] : []}
                onChange={(imgs) => onCommentImageChange(imgs[0] ?? null)}
              />
            )}
            <button onClick={onComment}
              className="w-full rounded-xl border border-app-border py-2 text-xs text-app-accent">发送</button>
          </div>
        </div>
      )}
    </div>
  );
}

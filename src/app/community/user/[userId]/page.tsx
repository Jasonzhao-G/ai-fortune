"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, MessageCircle, UserPlus, UserCheck, Gift } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  getCommunityUser, getPostsByUser, getFollowers, getFollowingIds,
  toggleFollow, isFollowing, toggleLike, toggleFavorite, addComment,
  getComments, repostPost,
} from "@/lib/community-store";
import type { CommunityPost, CommunityComment } from "@/lib/types";
import CommunityPostCard from "@/components/CommunityPostCard";
import ConfirmModal from "@/components/ConfirmModal";
import GiftFoodModal from "@/components/GiftFoodModal";
import UserAvatar from "@/components/UserAvatar";

export default function UserProfilePage() {
  const params = useParams();
  const userId = decodeURIComponent(params.userId as string);
  const { user } = useApp();
  const uid = user?.id ?? "";

  const [profile, setProfile] = useState(() => getCommunityUser(userId));
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [commentImages, setCommentImages] = useState<Record<string, string | null>>({});
  const [confirm, setConfirm] = useState<{ type: "favorite" | "repost"; post: CommunityPost } | null>(null);
  const [shareTip, setShareTip] = useState<string | null>(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const [followTick, setFollowTick] = useState(0);

  const refresh = () => {
    setProfile(getCommunityUser(userId));
    setPosts(getPostsByUser(userId));
  };

  useEffect(() => { refresh(); }, [userId, followTick]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "刚刚";
    if (h < 24) return `${h}小时前`;
    return `${Math.floor(h / 24)}天前`;
  };

  const toggleComments = (postId: string) => {
    if (expandedPost === postId) setExpandedPost(null);
    else {
      setExpandedPost(postId);
      setComments((prev) => ({ ...prev, [postId]: getComments(postId) }));
    }
  };

  const handleComment = (postId: string) => {
    const text = commentDraft[postId]?.trim() ?? "";
    const img = commentImages[postId] ?? undefined;
    if (!text && !img) return;
    addComment(postId, text, img ?? undefined);
    setComments((prev) => ({ ...prev, [postId]: getComments(postId) }));
    setCommentDraft((prev) => ({ ...prev, [postId]: "" }));
    setCommentImages((prev) => ({ ...prev, [postId]: null }));
    refresh();
  };

  const onConfirm = () => {
    if (!confirm) return;
    if (confirm.type === "favorite") toggleFavorite(confirm.post.id);
    else repostPost(confirm.post);
    setConfirm(null);
    refresh();
    setShareTip(confirm.type === "repost" ? "已转发到社区广场" : "收藏成功");
    setTimeout(() => setShareTip(null), 2500);
  };

  const following = isFollowing(userId);
  const followerCount = getFollowers(userId).length;
  const followingCount = getFollowingIds(userId).length;

  const isSelf = userId === uid;

  return (
    <div className="px-4 pb-4">
      <Link href="/community" className="mb-3 inline-flex items-center gap-1 text-xs text-app-accent">
        <ChevronLeft className="h-4 w-4" /> 返回社区
      </Link>

      <div className="app-card mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar userId={profile.id} avatar={profile.avatar} nickname={profile.nickname} size="lg" verified={profile.verified} />
          <div className="min-w-0 flex-1">
            <h1 className="page-title !text-left flex items-center gap-1">
              {profile.nickname}
            </h1>
            <p className="text-[10px] text-app-muted">ID: {profile.id}</p>
            <div className="mt-2 flex gap-3 text-[10px] text-app-muted">
              <span><strong className="text-app-text">{posts.length}</strong> 帖子</span>
              <span><strong className="text-app-text">{followerCount}</strong> 粉丝</span>
              <span><strong className="text-app-text">{followingCount}</strong> 关注</span>
            </div>
          </div>
        </div>

        {!isSelf && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => { toggleFollow(userId); setFollowTick((k) => k + 1); }}
              className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs ${
                following ? "border border-app-accent text-app-accent" : "bg-app-accent text-white"
              }`}
            >
              {following ? <><UserCheck className="h-3.5 w-3.5" /> 已关注</> : <><UserPlus className="h-3.5 w-3.5" /> 关注</>}
            </button>
            <Link href={`/community/messages?with=${userId}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-app-border py-2 text-xs text-app-accent">
              <MessageCircle className="h-3.5 w-3.5" /> 私信
            </Link>
            {uid && (
              <button onClick={() => setGiftOpen(true)}
                className="rounded-xl border border-app-border px-3 py-2 text-xs text-app-gold" title="赠送灵丹">
                <Gift className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {shareTip && (
        <p className="mb-3 rounded-lg bg-app-accent/10 px-3 py-1.5 text-[11px] text-app-accent">{shareTip}</p>
      )}

      <h2 className="mb-3 text-sm font-medium text-app-text">Ta 的帖子 ({posts.length})</h2>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="py-8 text-center text-xs text-app-muted">暂无帖子</p>
        ) : posts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            uid={uid}
            expanded={expandedPost === post.id}
            comments={comments[post.id] ?? []}
            commentDraft={commentDraft[post.id] ?? ""}
            commentImage={commentImages[post.id] ?? null}
            timeAgo={timeAgo}
            onToggleComments={() => toggleComments(post.id)}
            onCommentDraftChange={(v) => setCommentDraft((prev) => ({ ...prev, [post.id]: v }))}
            onCommentImageChange={(v) => setCommentImages((prev) => ({ ...prev, [post.id]: v }))}
            onComment={() => handleComment(post.id)}
            onLike={() => { toggleLike(post.id); refresh(); }}
            onFavorite={() => {
              const favorited = (post.favoritedBy ?? []).includes(uid);
              if (favorited) { toggleFavorite(post.id); refresh(); }
              else setConfirm({ type: "favorite", post });
            }}
            onRepost={() => setConfirm({ type: "repost", post })}
            onFollow={post.userId !== uid ? () => { toggleFollow(post.userId); setFollowTick((k) => k + 1); } : undefined}
          />
        ))}
      </div>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.type === "favorite" ? "确认收藏" : "确认转发"}
        message={confirm?.type === "favorite"
          ? "确定要收藏这条帖子吗？"
          : `确定要转发 @${confirm?.post?.nickname ?? ""} 的帖子到社区广场吗？`}
        onConfirm={onConfirm}
        onCancel={() => setConfirm(null)}
      />

      {giftOpen && uid && (
        <GiftFoodModal
          open={giftOpen}
          onClose={() => setGiftOpen(false)}
          toUserId={userId}
          fromUserId={uid}
        />
      )}
    </div>
  );
}

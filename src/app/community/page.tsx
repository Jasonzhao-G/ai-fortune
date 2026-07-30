"use client";

import { useState, useEffect } from "react";
import {
  Heart, Send, MessageCircle, Star, Share2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  getPosts, addPost, toggleLike, toggleFavorite, addComment,
  getComments, isLiked, isFavorited, repostPost,
} from "@/lib/community-store";
import type { CommunityPost, CommunityComment } from "@/lib/types";

export default function CommunityPage() {
  const { user } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [content, setContent] = useState("");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const refresh = () => setPosts(getPosts());

  useEffect(() => { refresh(); }, []);

  const handlePost = () => {
    if (!content.trim()) return;
    addPost(content.trim());
    refresh();
    setContent("");
  };

  const handleLike = (id: string) => {
    toggleLike(id);
    refresh();
  };

  const handleFavorite = (id: string) => {
    toggleFavorite(id);
    refresh();
  };

  const toggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      setComments((prev) => ({ ...prev, [postId]: getComments(postId) }));
    }
  };

  const handleComment = (postId: string) => {
    const text = commentDraft[postId]?.trim();
    if (!text) return;
    addComment(postId, text);
    setComments((prev) => ({ ...prev, [postId]: getComments(postId) }));
    setCommentDraft((prev) => ({ ...prev, [postId]: "" }));
    refresh();
  };

  const [shareTip, setShareTip] = useState<string | null>(null);

  const handleRepost = (post: CommunityPost) => {
    repostPost(post);
    refresh();
    setShareTip("已转发到社区广场");
    setTimeout(() => setShareTip(null), 2500);
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "刚刚";
    if (h < 24) return `${h}小时前`;
    return `${Math.floor(h / 24)}天前`;
  };

  const uid = user?.id ?? "";

  return (
    <div className="px-4 pb-4">
      <header className="mb-4 pt-2 text-center">
        <h1 className="page-title">社区广场</h1>
        <p className="text-xs text-app-muted">分享命理心得 · 交流运势感悟</p>
        {shareTip && (
          <p className="mt-2 rounded-lg bg-app-accent/10 px-3 py-1.5 text-[11px] text-app-accent">{shareTip}</p>
        )}
      </header>

      <div className="app-card mb-4">
        <textarea
          className="app-input mb-2 min-h-[80px] resize-none"
          placeholder="分享你的命理感悟..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={handlePost} disabled={!content.trim()}
          className="app-btn flex items-center justify-center gap-2 disabled:opacity-40">
          <Send className="h-4 w-4" /> 发布
        </button>
      </div>

      <div className="space-y-3">
        {posts.map((post) => {
          const liked = isLiked(post, uid);
          const favorited = isFavorited(post, uid);
          const postComments = comments[post.id] ?? [];
          const isExpanded = expandedPost === post.id;

          return (
            <div key={post.id} className="app-card">
              <div className="mb-2 flex items-center gap-2">
                <img src={post.avatar} alt="" className="h-8 w-8 rounded-full" />
                <div>
                  <p className="text-xs font-medium text-app-text">{post.nickname}</p>
                  <p className="text-[10px] text-app-muted">{timeAgo(post.createdAt)}</p>
                </div>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-app-text">{post.content}</p>
              {post.repostOf && (
                <div className="mb-3 rounded-xl border border-app-border bg-app-bg/60 px-3 py-2">
                  <p className="text-[10px] text-app-muted">原帖 @{post.repostOf.nickname}</p>
                  <p className="text-xs text-app-muted">{post.repostOf.content}</p>
                </div>
              )}

              <div className="flex items-center gap-4 border-t border-app-border pt-2">
                <button onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 text-xs ${liked ? "text-app-red" : "text-app-muted"}`}>
                  <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
                  {post.likes}
                </button>
                <button onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1 text-xs text-app-muted">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.commentCount}
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                <button onClick={() => handleFavorite(post.id)}
                  className={`flex items-center gap-1 text-xs ${favorited ? "text-app-gold" : "text-app-muted"}`}>
                  <Star className={`h-3.5 w-3.5 ${favorited ? "fill-current" : ""}`} />
                  收藏
                </button>
                <button onClick={() => handleRepost(post)}
                  className="flex items-center gap-1 text-xs text-app-muted">
                  <Share2 className="h-3.5 w-3.5" /> 转发
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 border-t border-app-border pt-3">
                  {postComments.map((c) => (
                    <div key={c.id} className="mb-2 flex gap-2">
                      <img src={c.avatar} alt="" className="h-6 w-6 rounded-full" />
                      <div className="flex-1 rounded-xl bg-app-bg px-3 py-2">
                        <p className="text-[10px] font-medium text-app-text">{c.nickname}</p>
                        <p className="text-xs text-app-muted">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      className="app-input flex-1 !py-2 text-xs"
                      placeholder="写评论..."
                      value={commentDraft[post.id] ?? ""}
                      onChange={(e) => setCommentDraft((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                    />
                    <button onClick={() => handleComment(post.id)}
                      className="rounded-xl border border-app-border px-3 text-xs text-app-accent">
                      发送
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

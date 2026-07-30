import type { CommunityPost, CommunityComment } from "./types";
import { getOrCreateUser } from "./user-store";
import { addMessage } from "./message-store";

const POSTS_KEY = "ai-fortune-posts";
const COMMENTS_KEY = "ai-fortune-comments";
const REFERRALS_KEY = "ai-fortune-referrals";

function normalizePost(p: CommunityPost): CommunityPost {
  return {
    ...p,
    likedBy: p.likedBy ?? [],
    favoritedBy: p.favoritedBy ?? [],
    commentCount: p.commentCount ?? 0,
  };
}

const SEED_POSTS: CommunityPost[] = [
  {
    id: "seed1",
    userId: "LF88888888",
    nickname: "命理探索者",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=explorer",
    content: "人生K线真的太准了！看到自己30岁那根大阳线，瞬间有了信心 💪",
    likes: 128,
    likedBy: [],
    favoritedBy: [],
    commentCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "seed2",
    userId: "LF66666666",
    nickname: "星辰大海",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=star",
    content: "问AI说今年贵人在西北方向，准备去西安发展看看，有一起的吗？",
    likes: 56,
    likedBy: [],
    favoritedBy: [],
    commentCount: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_COMMENTS: CommunityComment[] = [
  {
    id: "c1",
    postId: "seed1",
    userId: "LF77777777",
    nickname: "云中客",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=cloud",
    content: "同感！我的峰值年也在30岁左右",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "c2",
    postId: "seed1",
    userId: "LF55555555",
    nickname: "清风明月",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=moon",
    content: "请问你是怎么测算的？",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export function getPosts(): CommunityPost[] {
  if (typeof window === "undefined") return SEED_POSTS;
  const raw = localStorage.getItem(POSTS_KEY);
  if (!raw) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(SEED_COMMENTS));
    return SEED_POSTS;
  }
  return JSON.parse(raw).map(normalizePost);
}

export function getComments(postId: string): CommunityComment[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(COMMENTS_KEY);
  const all: CommunityComment[] = raw ? JSON.parse(raw) : SEED_COMMENTS;
  return all.filter((c) => c.postId === postId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function addPost(content: string): CommunityPost {
  const user = getOrCreateUser();
  const post: CommunityPost = {
    id: Date.now().toString(36),
    userId: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    content,
    likes: 0,
    likedBy: [],
    favoritedBy: [],
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };
  const posts = [post, ...getPosts()];
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return post;
}

export function toggleLike(postId: string): void {
  const user = getOrCreateUser();
  const posts = getPosts().map((p) => {
    if (p.id !== postId) return p;
    const likedBy = p.likedBy ?? [];
    const liked = likedBy.includes(user.id);
    const nextLikedBy = liked
      ? likedBy.filter((id) => id !== user.id)
      : [...likedBy, user.id];
    if (!liked && p.userId !== user.id) {
      addMessage({
        userId: p.userId,
        type: "like",
        title: "收到新点赞",
        content: `${user.nickname} 赞了你的帖子：${p.content.slice(0, 30)}…`,
        relatedPostId: p.id,
      });
    }
    return { ...p, likedBy: nextLikedBy, likes: nextLikedBy.length };
  });
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function toggleFavorite(postId: string): void {
  const user = getOrCreateUser();
  const posts = getPosts().map((p) => {
    if (p.id !== postId) return p;
    const favoritedBy = p.favoritedBy ?? [];
    const favorited = favoritedBy.includes(user.id);
    const nextFavoritedBy = favorited
      ? favoritedBy.filter((id) => id !== user.id)
      : [...favoritedBy, user.id];
    return { ...p, favoritedBy: nextFavoritedBy };
  });
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function addComment(postId: string, content: string): CommunityComment {
  const user = getOrCreateUser();
  const comment: CommunityComment = {
    id: Date.now().toString(36),
    postId,
    userId: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    content,
    createdAt: new Date().toISOString(),
  };
  const raw = localStorage.getItem(COMMENTS_KEY);
  const all: CommunityComment[] = raw ? JSON.parse(raw) : [];
  all.push(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));

  const posts = getPosts().map((p) => {
    if (p.id !== postId) return p;
    if (p.userId !== user.id) {
      addMessage({
        userId: p.userId,
        type: "comment",
        title: "收到新评论",
        content: `${user.nickname} 评论了你的帖子：${content}`,
        relatedPostId: p.id,
      });
    }
    return { ...p, commentCount: p.commentCount + 1 };
  });
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return comment;
}

export function isLiked(post: CommunityPost, userId: string): boolean {
  return (post.likedBy ?? []).includes(userId);
}

export function isFavorited(post: CommunityPost, userId: string): boolean {
  return (post.favoritedBy ?? []).includes(userId);
}

export function getShareText(post: CommunityPost): string {
  return `${post.nickname}：${post.content}\n—— 来自 AI K线 社区`;
}

/** 社区内部转发：生成一条新帖子 */
export function repostPost(source: CommunityPost): CommunityPost {
  const user = getOrCreateUser();
  const post: CommunityPost = {
    id: Date.now().toString(36) + "r",
    userId: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    content: `转发 @${source.nickname}：${source.content}`,
    likes: 0,
    likedBy: [],
    favoritedBy: [],
    commentCount: 0,
    createdAt: new Date().toISOString(),
    repostOf: {
      postId: source.id,
      nickname: source.nickname,
      content: source.content,
    },
  };
  const posts = [post, ...getPosts()];
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

  if (source.userId !== user.id) {
    addMessage({
      userId: source.userId,
      type: "comment",
      title: "帖子被转发",
      content: `${user.nickname} 转发了你的帖子：${source.content.slice(0, 30)}…`,
      relatedPostId: source.id,
    });
  }
  return post;
}

export function getReferralCount(userId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(REFERRALS_KEY);
  const refs: Record<string, string[]> = raw ? JSON.parse(raw) : {};
  return refs[userId]?.length ?? 0;
}

export function registerReferral(inviterId: string, newUserId: string): void {
  const raw = localStorage.getItem(REFERRALS_KEY);
  const refs: Record<string, string[]> = raw ? JSON.parse(raw) : {};
  if (!refs[inviterId]) refs[inviterId] = [];
  if (!refs[inviterId].includes(newUserId)) {
    refs[inviterId].push(newUserId);
    localStorage.setItem(REFERRALS_KEY, JSON.stringify(refs));
  }
}

/** @deprecated use toggleLike */
export function likePost(id: string): void {
  toggleLike(id);
}

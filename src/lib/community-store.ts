import type { CommunityPost, CommunityComment } from "./types";
import { getOrCreateUser } from "./user-store";
import { addMessage } from "./message-store";
import { safeJsonParse, safeLocalGet, safeLocalSet } from "./safe-storage";

const POSTS_KEY = "ai-fortune-posts";
const COMMENTS_KEY = "ai-fortune-comments";
const REFERRALS_KEY = "ai-fortune-referrals";
const FOLLOWS_KEY = "ai-fortune-follows";
const REPOSTS_KEY = "ai-fortune-my-reposts";
const VERIFIED_KEY = "ai-fortune-verified-users";

function normalizePost(p: CommunityPost): CommunityPost {
  return {
    ...p,
    likedBy: p.likedBy ?? [],
    favoritedBy: p.favoritedBy ?? [],
    commentCount: p.commentCount ?? 0,
    isFeatured: p.isFeatured ?? false,
    images: p.images ?? [],
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
    isFeatured: true,
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
  const raw = safeLocalGet(POSTS_KEY);
  if (!raw) {
    safeLocalSet(POSTS_KEY, JSON.stringify(SEED_POSTS));
    safeLocalSet(COMMENTS_KEY, JSON.stringify(SEED_COMMENTS));
    return SEED_POSTS;
  }
  try {
    const parsed = safeJsonParse<CommunityPost[]>(raw, SEED_POSTS);
    return Array.isArray(parsed) ? parsed.map(normalizePost) : SEED_POSTS;
  } catch {
    return SEED_POSTS;
  }
}

export function getComments(postId: string): CommunityComment[] {
  if (typeof window === "undefined") return [];
  const raw = safeLocalGet(COMMENTS_KEY);
  const all = safeJsonParse<CommunityComment[]>(raw, SEED_COMMENTS);
  return all.filter((c) => c.postId === postId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function addPost(content: string, images?: string[]): CommunityPost {
  const user = getOrCreateUser();
  const imgs = (images ?? []).slice(0, 4);
  const post: CommunityPost = {
    id: Date.now().toString(36),
    userId: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    content: content.trim(),
    images: imgs,
    likes: 0,
    likedBy: [],
    favoritedBy: [],
    commentCount: 0,
    createdAt: new Date().toISOString(),
    isFeatured: false,
  };
  const posts = [post, ...getPosts()];
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

  // 通知粉丝
  const followers = getFollowers(user.id);
  followers.forEach((fid) => {
    addMessage({
      userId: fid,
      type: "follow_post",
      title: "关注的人发布了新帖",
      content: `${user.nickname}：${content.slice(0, 40)}…`,
      relatedPostId: post.id,
    });
  });

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

export function addComment(postId: string, content: string, imageUrl?: string): CommunityComment {
  const user = getOrCreateUser();
  const comment: CommunityComment = {
    id: Date.now().toString(36),
    postId,
    userId: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    content: content.trim(),
    imageUrl,
    createdAt: new Date().toISOString(),
  };
  const raw = safeLocalGet(COMMENTS_KEY);
  const all = safeJsonParse<CommunityComment[]>(raw, []);
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
  return `${post.nickname}：${post.content}\n—— 来自 AI 灵宠 社区`;
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
    repostSourceId: source.id,
  };
  const posts = [post, ...getPosts()];
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

  // 记录我的转发
  const raw = safeLocalGet(REPOSTS_KEY);
  const reposts = safeJsonParse<string[]>(raw, []);
  if (!reposts.includes(source.id)) {
    reposts.unshift(source.id);
    localStorage.setItem(REPOSTS_KEY, JSON.stringify(reposts.slice(0, 200)));
  }

  if (source.userId !== user.id) {
    addMessage({
      userId: source.userId,
      type: "repost",
      title: "帖子被转发",
      content: `${user.nickname} 转发了你的帖子：${source.content.slice(0, 30)}…`,
      relatedPostId: source.id,
    });
  }
  return post;
}

// ─── 关注 ───

type FollowMap = Record<string, string[]>;

function getFollowMap(): FollowMap {
  if (typeof window === "undefined") return {};
  return safeJsonParse<FollowMap>(safeLocalGet(FOLLOWS_KEY), {});
}

function saveFollowMap(map: FollowMap) {
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(map));
}

export function toggleFollow(targetUserId: string): boolean {
  const user = getOrCreateUser();
  const map = getFollowMap();
  const following = map[user.id] ?? [];
  const isNow = !following.includes(targetUserId);
  map[user.id] = isNow
    ? [...following, targetUserId]
    : following.filter((id) => id !== targetUserId);
  saveFollowMap(map);
  return isNow;
}

export function isFollowing(targetUserId: string): boolean {
  const user = getOrCreateUser();
  return (getFollowMap()[user.id] ?? []).includes(targetUserId);
}

export function getFollowingIds(userId?: string): string[] {
  const uid = userId ?? getOrCreateUser().id;
  return getFollowMap()[uid] ?? [];
}

export function getFollowers(userId: string): string[] {
  const map = getFollowMap();
  return Object.entries(map)
    .filter(([, list]) => list.includes(userId))
    .map(([fid]) => fid);
}

export function getPostsByFeed(feed: "all" | "following" | "hot", userId?: string): CommunityPost[] {
  const all = getPosts();
  const uid = userId ?? getOrCreateUser().id;
  if (feed === "hot") return all.filter((p) => p.isFeatured);
  if (feed === "following") {
    const ids = getFollowingIds(uid);
    return all.filter((p) => ids.includes(p.userId));
  }
  return all;
}

export function setPostFeatured(postId: string, featured: boolean): void {
  const posts = getPosts().map((p) => (p.id === postId ? { ...p, isFeatured: featured } : p));
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function getMyFavoritePosts(userId: string): CommunityPost[] {
  return getPosts().filter((p) => (p.favoritedBy ?? []).includes(userId));
}

export function getMyComments(userId: string): CommunityComment[] {
  if (typeof window === "undefined") return [];
  const raw = safeLocalGet(COMMENTS_KEY);
  const all = safeJsonParse<CommunityComment[]>(raw, SEED_COMMENTS);
  return all.filter((c) => c.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getMyRepostPosts(userId: string): CommunityPost[] {
  const raw = safeLocalGet(REPOSTS_KEY);
  const ids = safeJsonParse<string[]>(raw, []);
  const all = getPosts();
  return ids.map((id) => all.find((p) => p.id === id)).filter(Boolean) as CommunityPost[];
}

export function getPostsByUser(userId: string): CommunityPost[] {
  return getPosts()
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMyPosts(userId: string): CommunityPost[] {
  return getPostsByUser(userId);
}

export function getMyLikedPosts(userId: string): CommunityPost[] {
  return getPosts().filter((p) => (p.likedBy ?? []).includes(userId));
}

export function getFollowingUsers(userId: string): { id: string; nickname: string; avatar: string }[] {
  return getFollowingIds(userId).map((id) => getCommunityUser(id));
}

export function getFollowerUsers(userId: string): { id: string; nickname: string; avatar: string }[] {
  return getFollowers(userId).map((id) => getCommunityUser(id));
}

export function getVerifiedUserIds(): string[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<string[]>(safeLocalGet(VERIFIED_KEY), []);
}

export function isUserVerified(userId: string): boolean {
  return getVerifiedUserIds().includes(userId);
}

export function setUserVerified(userId: string, verified: boolean): void {
  const ids = getVerifiedUserIds();
  const next = verified ? [...new Set([...ids, userId])] : ids.filter((id) => id !== userId);
  safeLocalSet(VERIFIED_KEY, JSON.stringify(next));
}

export function getAllCommunityUsers(): { id: string; nickname: string; avatar: string; verified: boolean }[] {
  const map = new Map<string, { id: string; nickname: string; avatar: string }>();
  for (const p of getPosts()) {
    map.set(p.userId, { id: p.userId, nickname: p.nickname, avatar: p.avatar });
  }
  try {
    const me = getOrCreateUser();
    map.set(me.id, { id: me.id, nickname: me.nickname, avatar: me.avatar });
  } catch { /* ignore */ }
  const verified = new Set(getVerifiedUserIds());
  return Array.from(map.values()).map((u) => ({ ...u, verified: verified.has(u.id) }));
}

export function getCommunityUser(userId: string): { id: string; nickname: string; avatar: string; verified: boolean } {
  const post = getPosts().find((p) => p.userId === userId);
  const base = post
    ? { id: userId, nickname: post.nickname, avatar: post.avatar }
    : {
        id: userId,
        nickname: userId.slice(0, 8),
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${userId}`,
      };
  return { ...base, verified: isUserVerified(userId) };
}

export function getReferralCount(userId: string): number {
  if (typeof window === "undefined") return 0;
  return safeJsonParse<Record<string, string[]>>(safeLocalGet(REFERRALS_KEY), {})[userId]?.length ?? 0;
}

export function registerReferral(inviterId: string, newUserId: string): void {
  try {
    const refs = safeJsonParse<Record<string, string[]>>(safeLocalGet(REFERRALS_KEY), {});
    if (!refs[inviterId]) refs[inviterId] = [];
    if (!refs[inviterId].includes(newUserId)) {
      refs[inviterId].push(newUserId);
      safeLocalSet(REFERRALS_KEY, JSON.stringify(refs));
    }
  } catch { /* ignore */ }
}

export function searchCommunity(query: string): {
  users: { id: string; nickname: string; avatar: string }[];
  posts: CommunityPost[];
} {
  const q = query.trim().toLowerCase();
  if (!q) return { users: [], posts: [] };

  const posts = getPosts();
  const matchedPosts = posts.filter(
    (p) => p.content.toLowerCase().includes(q) || p.nickname.toLowerCase().includes(q)
  );

  const userMap = new Map<string, { id: string; nickname: string; avatar: string }>();
  for (const p of posts) {
    if (
      p.nickname.toLowerCase().includes(q) ||
      p.userId.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    ) {
      userMap.set(p.userId, { id: p.userId, nickname: p.nickname, avatar: p.avatar });
    }
  }
  const me = getOrCreateUser();
  if (me.nickname.toLowerCase().includes(q) || me.id.toLowerCase().includes(q)) {
    userMap.set(me.id, { id: me.id, nickname: me.nickname, avatar: me.avatar });
  }

  return {
    users: Array.from(userMap.values()).slice(0, 10),
    posts: matchedPosts.slice(0, 10),
  };
}

/** @deprecated use toggleLike */
export function likePost(id: string): void {
  toggleLike(id);
}

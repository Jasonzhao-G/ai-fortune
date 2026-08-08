/** 灵兽视频 / 头像素材映射（有素材的 breedId 会替换 emoji） */

export interface SpiritBeastAsset {
  video: string;
  avatar: string;
}

function beast(breedId: string): SpiritBeastAsset {
  return {
    video: `/spirit-beasts/videos/${breedId}.mp4`,
    avatar: `/spirit-beasts/avatars/${breedId}.png`,
  };
}

/** 十二上古灵兽 · 全部已接入视频 + 静态头像 */
export const SPIRIT_BEAST_ASSETS: Partial<Record<string, SpiritBeastAsset>> = {
  jiuwei: beast("jiuwei"),
  zhaocai: beast("zhaocai"),
  fenghuang: beast("fenghuang"),
  qinglong: beast("qinglong"),
  xuanmao: beast("xuanmao"),
  baize: beast("baize"),
  qilin: beast("qilin"),
  zhuque: beast("zhuque"),
  xuanwu: beast("xuanwu"),
  baihu: beast("baihu"),
  mengdie: beast("mengdie"),
  yuetu: beast("yuetu"),
};

export function getSpiritBeastAsset(breedId: string): SpiritBeastAsset | null {
  return SPIRIT_BEAST_ASSETS[breedId] ?? null;
}

export function hasSpiritBeastMedia(breedId: string): boolean {
  return !!SPIRIT_BEAST_ASSETS[breedId];
}

export const SPIRIT_BEAST_VIDEO_IMPORT_GUIDE: { breedId: string; name: string; file: string }[] = [
  { breedId: "jiuwei", name: "九尾狐", file: "jiuwei.mp4" },
  { breedId: "zhaocai", name: "招财猫", file: "zhaocai.mp4" },
  { breedId: "fenghuang", name: "凤凰", file: "fenghuang.mp4" },
  { breedId: "qinglong", name: "青龙", file: "qinglong.mp4" },
  { breedId: "xuanmao", name: "玄猫", file: "xuanmao.mp4" },
  { breedId: "baize", name: "白泽", file: "baize.mp4" },
  { breedId: "qilin", name: "麒麟", file: "qilin.mp4" },
  { breedId: "zhuque", name: "朱雀", file: "zhuque.mp4" },
  { breedId: "xuanwu", name: "玄武", file: "xuanwu.mp4" },
  { breedId: "baihu", name: "白虎", file: "baihu.mp4" },
  { breedId: "mengdie", name: "梦蝶", file: "mengdie.mp4" },
  { breedId: "yuetu", name: "月兔", file: "yuetu.mp4" },
];

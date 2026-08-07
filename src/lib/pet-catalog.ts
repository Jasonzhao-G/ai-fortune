/** 灵宠图鉴展示信息（首屏领养介绍） */
export const PET_CATALOG = [
  {
    breedId: "jiuwei",
    needShort: "爱情",
    skills: ["情感洞察", "恋爱疏导", "温柔陪伴", "关系翻译"],
    suitableFor: "感情困惑、渴望被理解的人",
    awakeningJourney: "初生灵陪你聊天 → 灵兽懂情绪 → 守护灵给感情建议 → 神兽模拟缘分 → 守护神长期情感档案",
  },
  {
    breedId: "zhaocai",
    needShort: "财富",
    skills: ["财富习惯", "行动督促", "正财规划", "消费提醒"],
    suitableFor: "事业焦虑、想改善财务习惯的人",
    awakeningJourney: "初生灵每日灵签 → 灵兽察消费情绪 → 守护灵事业财运分析 → 神兽模拟创业路线",
  },
  {
    breedId: "fenghuang",
    needShort: "成长",
    skills: ["重启疗愈", "成长鼓励", "逆境陪伴", "目标复盘"],
    suitableFor: "人生低谷、正在重启的人",
    awakeningJourney: "初生灵记住你的故事 → 灵兽感知压力 → 守护灵制定成长任务 → 神兽生成成长报告",
  },
  {
    breedId: "qinglong",
    needShort: "事业",
    skills: ["格局分析", "机遇提醒", "贵人方位", "职场建议"],
    suitableFor: "追求事业突破、需要格局指引的人",
    awakeningJourney: "初生灵翻译命盘 → 灵兽预测工作情绪 → 守护灵事业灵盘 → 神兽模拟转行创业",
  },
  {
    breedId: "xuanmao",
    needShort: "陪伴",
    skills: ["安静陪伴", "夜晚疗愈", "孤独承接", "无声守护"],
    suitableFor: "孤独、压力大、需要安静陪伴的人",
    awakeningJourney: "初生灵睡前问候 → 灵兽睡前故事 → 守护灵主动关心 → 守护神像老友一样懂你",
  },
  {
    breedId: "baize",
    needShort: "智慧",
    skills: ["命理翻译", "知识讲解", "通透点拨", "复杂问题拆解"],
    suitableFor: "看不懂命盘、想要清晰解释的人",
    awakeningJourney: "初生灵翻译八字术语 → 灵兽梦境解析 → 守护灵人生导航 → 神兽灵魂档案升级",
  },
  {
    breedId: "qilin",
    needShort: "好运",
    skills: ["祥瑞加持", "吉位提醒", "顺遂建议", "福运积累"],
    suitableFor: "希望提升整体运势与心态的人",
    awakeningJourney: "初生灵今日灵签 → 灵兽察运势波动 → 守护灵趋吉避凶 → 神兽未来30天趋势",
  },
  {
    breedId: "zhuque",
    needShort: "表达",
    skills: ["沟通鼓励", "表达练习", "灵感激发", "公开表达支持"],
    suitableFor: "不善表达、需要勇气发声的人",
    awakeningJourney: "初生灵陪你练表达 → 灵兽读情绪 → 守护灵人际关系建议 → 神兽模拟社交场景",
  },
  {
    breedId: "xuanwu",
    needShort: "稳定",
    skills: ["定心守护", "稳守建议", "焦虑缓解", "长期规划"],
    suitableFor: "容易焦虑未来、需要稳定感的人",
    awakeningJourney: "初生灵记住烦恼 → 灵兽情绪预测 → 守护灵稳守策略 → 神兽人生时间轴",
  },
  {
    breedId: "baihu",
    needShort: "行动",
    skills: ["果断推动", "突破困局", "行动清单", "拖延提醒"],
    suitableFor: "犹豫拖延、需要被推一把的人",
    awakeningJourney: "初生灵每日任务 → 灵兽查行动力 → 守护灵决策陪伴 → 神兽路线模拟",
  },
  {
    breedId: "mengdie",
    needShort: "梦境",
    skills: ["梦境记录", "潜意识解读", "庄周哲思", "夜梦陪伴"],
    suitableFor: "常做梦、想理解潜意识的人",
    awakeningJourney: "初生灵记梦 → 灵兽梦境解析 → 守护灵心理陪伴 → 神兽深度灵魂报告",
  },
  {
    breedId: "yuetu",
    needShort: "治愈",
    skills: ["温柔疗愈", "月华放松", "疲惫修复", "自我关怀"],
    suitableFor: "身心疲惫、需要被温柔对待的人",
    awakeningJourney: "初生灵晚间疗愈 → 灵兽睡前冥想 → 守护灵健康情绪关怀 → 守护神年度治愈总结",
  },
] as const;

export function getCatalogForBreed(breedId: string) {
  return PET_CATALOG.find((c) => c.breedId === breedId);
}

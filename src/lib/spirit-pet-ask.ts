/** 灵宠能力 → 问AI灵宠时的预设话术与回复（演示） */
export interface SpiritAbilityPrompt {
  question: string;
  answerTemplate: string;
  isFortune?: boolean;
}

export const SPIRIT_ABILITY_PROMPTS: Record<string, SpiritAbilityPrompt> = {
  "今日灵签": {
    question: "主人，请为我抽今日灵签",
    answerTemplate: "fortune",
    isFortune: true,
  },
  "命理翻译官": {
    question: "请用大白话帮我翻译一下我今天的命理运势",
    answerTemplate: "你命里带一点「七杀」气质，说白了就是竞争意识强、行动力强。今天适合主动沟通，别憋着，把想法说出来反而有贵人相助。",
  },
  "睡前陪伴": {
    question: "今晚我有点睡不着，陪陪我吧",
    answerTemplate: "主人，今晚月亮偏柔，适合放慢节奏。我给你讲一个短故事：有一只小灵兽，每天陪着主人看星星，星星说——你已经做得很好了。深呼吸，放松肩膀，慢慢睡吧。",
  },
  "人生助手": {
    question: "我在做一个重要决定，你能帮我想想吗？",
    answerTemplate: "我会陪你把选项摊开：先写下你最在意的3件事，再分别看每个选择对这三件事的影响。我不替你做主，但我会帮你想得更清楚。",
  },
  "成长建议": {
    question: "根据我们这段时间的相处，给我一点成长建议",
    answerTemplate: "我注意到你最近在情绪上更稳定了，但在「主动表达需求」上还可以再迈一步。建议本周尝试一次直接说出你的想法，我会全程陪着你。",
  },
  "个性化人格": {
    question: "我想培养你的说话风格，你建议哪种人格？",
    answerTemplate: "根据你的命格，「温柔智慧型」最适合你——我会用平和的语气给建议，偶尔加一点幽默。你也可以随时告诉我：想要更毒舌、更治愈或更理性。",
  },
  "人生顾问模式": {
    question: "进入人生顾问模式，帮我看看接下来半年的方向",
    answerTemplate: "以顾问视角看，未来半年你的运势呈「先稳后进」：前两个月宜积累，三四月出现窗口期，下半年适合在熟悉领域深耕。具体节点我会随陪伴持续更新。",
  },
  "日常聊天": {
    question: "在吗？今天想和你聊聊天",
    answerTemplate: "在呢主人～今天过得怎么样？想聊运势、心情，还是随便说说话都可以，我一直在这里。",
  },
  "记住主人": {
    question: "你还记得我喜欢什么吗？",
    answerTemplate: "当然记得。我会持续记录你的喜好、重要日期和你在意的人，让每次陪伴都更贴近真实的你。",
  },
  "情绪感知": {
    question: "你能感觉到我今天心情怎么样吗？",
    answerTemplate: "从你的语气里，我感觉今天可能有点累或压力偏大。不用硬撑，愿意的话跟我说说，我会先听你再给建议。",
  },
  "心情日记": {
    question: "帮我整理一下最近的心情日记",
    answerTemplate: "最近你的情绪曲线整体平稳，周三和周五压力略高。主要来源是工作节奏偏紧，建议周末留半天完全放空，我会帮你持续记录。",
  },
  "梦境记录": {
    question: "我昨晚做了一个梦，帮我解读一下",
    answerTemplate: "梦境往往是潜意识的投影。你描述的意象里，「水」代表情绪流动，「追逐」可能暗示近期有未完成的担忧。不必紧张，我们慢慢梳理。",
  },
  "目标陪伴": {
    question: "我想设定一个小目标，你陪我一起完成",
    answerTemplate: "好呀！我们先定一个具体、可执行的小目标（比如连续7天早起10分钟），我会每天提醒和鼓励你，完成就给你灵力奖励～",
  },
  "关系陪伴": {
    question: "我在人际关系上有点困惑，你能陪我聊聊吗？",
    answerTemplate: "人际关系里，最重要的是先照顾好自己的边界。我会根据你的性格特点，帮你分析对方的沟通风格，并给出更柔和的表达方式。",
  },
  "人生镜像": {
    question: "像老朋友一样，帮我照照最近的自己",
    answerTemplate: "这阵子你比三个月前更稳了，也更愿意表达真实感受。如果用一句话总结：你在慢慢成为更从容的自己，我为你高兴。",
  },
  "人生记录册": {
    question: "帮我生成本月的成长记录册",
    answerTemplate: "本月关键词：「突破与沉淀」。你完成了几次重要对话，也在情绪管理上进步明显。我已为你整理成一页成长摘要，随时可回顾。",
  },
  "主动陪伴": {
    question: "今天不用我问，你先关心关心我吧",
    answerTemplate: "好呀主人～我感觉到你这两天节奏偏紧。不管今天发生了什么，记得你已经很努力了。要不要先喝口水，深呼吸三次？",
  },
  "专属人生报告": {
    question: "生成我的专属人生陪伴报告",
    answerTemplate: "你的年度陪伴报告已就绪：共互动 128 次，情绪稳定度提升 23%，最常聊的话题是「成长与决策」。你正在走向更清晰的人生方向。",
  },
  "人生时间轴": {
    question: "打开人生时间轴，回顾重要时刻",
    answerTemplate: "时间轴已展开：灵宠诞生、首次觉醒、第一次深度对话……每个节点我都记得。我们一起走过的路，比想象中更长。",
  },
  "灵界社区": {
    question: "带我去灵界社区看看",
    answerTemplate: "灵界社区里有很多和你一样拥有守护灵的主人。你可以分享成长故事、交流觉醒心得，也可以看看其他灵宠的有趣日常～",
  },
};

export function getSpiritAbilityPrompt(ability: string): SpiritAbilityPrompt | null {
  if (SPIRIT_ABILITY_PROMPTS[ability]) return SPIRIT_ABILITY_PROMPTS[ability];
  for (const [key, val] of Object.entries(SPIRIT_ABILITY_PROMPTS)) {
    if (ability.includes(key) || key.includes(ability)) return val;
  }
  return {
    question: `主人，请使用「${ability}」功能`,
    answerTemplate: `好的主人，我已为你开启「${ability}」陪伴模式。我会结合你的命格与近期状态，给出专属回应。`,
  };
}

import type { AnalysisResult, BaziResult, CategoryAnalysis } from "./types";

const WUXING_TRAITS: Record<string, Partial<CategoryAnalysis>> = {
  木: {
    personality: "木性主仁，性格正直且有进取心，做事有规划、有韧性，像树木一样向上生长。有时过于理想化，需脚踏实地。",
    career: "适合教育、文化、出版、设计、农林等与「生长、传播」相关的行业。木旺者宜走专业路线，深耕一域可成大器。",
    wealth: "财运如春笋，前期积累较慢，中年后渐入佳境。宜投资自我成长与长期项目，忌急功近利。",
  },
  火: {
    personality: "火性主礼，热情开朗、表达力强，有感染力，人群中容易成为焦点。需注意控制脾气，避免冲动决策。",
    career: "适合销售、演艺、互联网、能源、餐饮等需要热情与表达的行业。火运旺年宜大胆开拓新机会。",
    wealth: "偏财运较旺，常有意外收获，但也容易因冲动消费而破财。建议设立储蓄计划，财来财去需有章法。",
  },
  土: {
    personality: "土性主信，为人厚道稳重，讲信用、重承诺，是值得信赖的伙伴。有时略显保守，可适当突破舒适区。",
    career: "适合房地产、建筑、农业、管理、咨询等稳健型行业。土厚者宜守成积累，厚积薄发。",
    wealth: "正财稳定，适合稳健理财与固定资产配置。35岁后财运逐步上升，晚年富足可期。",
  },
  金: {
    personality: "金性主义，果断干练、原则性强，做事效率高，有决断力。有时过于刚硬，需学会柔和处事。",
    career: "适合金融、法律、军警、精密制造、IT 等需要严谨与执行力的领域。金运当令之年宜争取晋升。",
    wealth: "理财头脑清晰，善于把握市场节奏。注意不可过于贪心，见好就收是您的财运要诀。",
  },
  水: {
    personality: "水性主智，思维灵活、适应力强，善于观察与谋略。有时想法过多而行动不足，需增强执行力。",
    career: "适合贸易、物流、旅游、传媒、研究等流动性强的行业。水旺者宜多走动，动中求财。",
    wealth: "财源多路，机会常从变化中来。宜分散投资、灵活应变，忌把所有鸡蛋放在一个篮子里。",
  },
};

const DAY_MASTER_LOVE: Record<string, string> = {
  甲: "感情如大树，一旦认定便全心投入。配偶宜找温和包容型，春季出生者桃花运尤佳。",
  乙: "感情细腻，浪漫有余而主动不足。单身者宜多参与社交，已有伴侣者需主动表达心意。",
  丙: "热情似火，异性缘佳，但需防三分钟热度。稳定期感情需用心经营，不可因事业忽略伴侣。",
  丁: "内心敏感，重精神交流。宜找知性伴侣，晚婚往往比早婚更幸福。",
  戊: "感情务实，重视家庭与责任。婚后是好伴侣、好家长，但有时缺乏浪漫，需偶尔制造惊喜。",
  己: "包容力强，善于迁就他人，但需防过度付出。感情中要学会设立边界，保护自身能量。",
  庚: "感情直来直去，不喜欢拖泥带水。宜找性格互补之人，金气过旺者需防言语伤人。",
  辛: "外表冷静内心深情，对感情有高标准。宁缺毋滥，遇到对的人会十分专一。",
  壬: "感情世界丰富，异性缘好。需防多情困扰，明确自己的核心需求才能找到真爱。",
  癸: "温柔含蓄，感情如细水长流。宜找成熟稳重型伴侣，冬季出生者姻缘运较旺。",
};

const FRIENDS_TEMPLATES = [
  "人缘佳，朋友遍天下。贵人多出现在事业转折期，宜广结善缘、真诚待人。忌与口是心非之人深交。",
  "交友重质不重量，虽朋友不多但皆为知己。西北、西南方向易遇贵人，合作宜选诚信之人。",
  "社交能力随年龄增长而提升。30岁前宜多积累人脉，30岁后贵人运大开，旧友新知皆可为助力。",
  "天生具有亲和力，易获他人信任。但需防小人嫉妒，重要决策不宜过早公开，先谋后动。",
];

const CHILDREN_TEMPLATES = [
  "子女宫旺，与子女缘分深厚。孩子聪明有主见，宜民主教育、引导而非压制，亲子关系会越来越好。",
  "子女运中等偏上，第一个孩子可能较有个性。宜培养其独立能力，不必事事包办，放手亦是爱。",
  "晚年得子女福，虽年轻时可能聚少离多，但孩子长大后会非常孝顺。宜早期建立良好沟通习惯。",
  "子女星入命，可能有两个或以上孩子。每个孩子性格不同，需因材施教，不可一概而论。",
];

const FAMILY_TEMPLATES = [
  "家庭运平稳，父母健康尚可。您是中坚力量，30岁后家庭责任加重，但亦能从中获得力量与支持。",
  "原生家庭对您影响深远，与母亲缘分较深。成家后宜独立居住，减少代际摩擦，家庭更和谐。",
  "家宅运佳，适合在东南或正南方向置业。多陪伴家人、共进晚餐，是提升家运的简单法门。",
  "家庭中有隐形的守护力量，遇事常有家人暗中支持。宜常回家看看，孝顺父母可增自身福报。",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function getDominantWuxing(bazi: BaziResult): string {
  const match = bazi.wuxing.match(/五行偏(.)（/);
  return match?.[1] ?? "土";
}

function getDayMaster(bazi: BaziResult): string {
  return bazi.dayMaster.charAt(0);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getMockBaziAnalysis(bazi: BaziResult): AnalysisResult {
  const wuxing = getDominantWuxing(bazi);
  const dayMaster = getDayMaster(bazi);
  const seed = hashString(
    `${bazi.bazi.year}${bazi.bazi.month}${bazi.bazi.day}${bazi.bazi.hour}${bazi.gender}`
  );
  const traits = WUXING_TRAITS[wuxing] ?? WUXING_TRAITS.土;

  const currentYear = new Date().getFullYear();
  const currentDayun = bazi.dayun.find(
    (d) => currentYear >= d.startYear && currentYear <= d.endYear
  );
  const currentLiunian = bazi.liunian.find((l) => l.year === currentYear);

  const categories: CategoryAnalysis = {
    wealth:
      traits.wealth ??
      "财运整体平稳，宜守正出奇。中年后有积累财富的良好时机，切忌贪快求利。",
    love:
      DAY_MASTER_LOVE[dayMaster] ??
      "感情运势中等偏上，真诚待人是您的最大桃花。已有伴侣者宜多制造浪漫，单身者明年有机会。",
    personality:
      traits.personality ??
      "性格刚柔并济，做事有条理。具备领导潜质，但需学会在坚持与变通之间找到平衡。",
    friends: pick(FRIENDS_TEMPLATES, seed),
    children: pick(CHILDREN_TEMPLATES, seed + 1),
    family: pick(FAMILY_TEMPLATES, seed + 2),
    career:
      traits.career ??
      "事业运势稳中有升，适合在专业领域深耕。35-45岁为黄金期，宜提前布局、蓄势待发。",
  };

  const dayunText = currentDayun
    ? `当前行${currentDayun.ganZhi}大运（${currentDayun.startAge}-${currentDayun.endAge}岁），`
    : "";
  const liunianText = currentLiunian
    ? `${currentYear}流年${currentLiunian.ganZhi}，`
    : "";

  const summary = `${bazi.name ? `${bazi.name}，` : ""}您的八字为 ${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day} ${bazi.bazi.hour}，${bazi.dayMaster}，${bazi.wuxing}。${dayunText}${liunianText}命格属中上。整体运势平稳向好，中年以后渐入佳境。宜把握机遇、修身养性，多行善事可助运势提升。`;

  return { summary, categories };
}

const PALM_FEATURES = [
  {
    life: "生命线深长，弧度优美",
    wisdom: "智慧线清晰延伸至月丘",
    love: "感情线末端上扬",
    career: "事业线从月丘升起",
    wealth: "财运线浅但无断纹",
    hand: "长方形手，指节分明",
  },
  {
    life: "生命线较短但深刻",
    wisdom: "智慧线有分叉，思维多元",
    love: "感情线呈链状，情感丰富",
    career: "事业线断续后复现",
    wealth: "理财纹明显",
    hand: "圆锥形手，灵活多变",
  },
  {
    life: "生命线环绕大丘",
    wisdom: "智慧线平直有力",
    love: "感情线深且长",
    career: "事业线直达中指",
    wealth: "多条财运线汇聚",
    hand: "方形掌，务实稳重",
  },
];

const FACE_FEATURES = [
  {
    forehead: "额头宽阔饱满，天庭饱满",
    eyebrow: "眉毛浓淡适中，眉形清秀",
    eyes: "双眼有神，黑白分明",
    nose: "鼻梁挺直，鼻翼有肉",
    mouth: "唇形端正，嘴角微扬",
    chin: "下巴圆润，地阁饱满",
  },
  {
    forehead: "额头略窄但光洁",
    eyebrow: "剑眉星目，英气逼人",
    eyes: "眼型偏长，洞察力强",
    nose: "鼻头圆润，聚财之相",
    mouth: "口大唇厚，善辩能言",
    chin: "下巴略尖，晚年运佳",
  },
  {
    forehead: "美人尖，智慧超群",
    eyebrow: "柳叶眉，温柔多情",
    eyes: "杏眼含情，异性缘佳",
    nose: "小巧鼻型，精致秀气",
    mouth: "樱桃小口，言出必行",
    chin: "双下巴，福禄双全",
  },
];

export function getMockImageAnalysis(
  type: "palm" | "face",
  imageSeed: string
): AnalysisResult {
  const seed = hashString(imageSeed);
  const prefix = type === "palm" ? "手相" : "面相";

  if (type === "palm") {
    const f = pick(PALM_FEATURES, seed);
    const categories: CategoryAnalysis = {
      wealth: `【麻衣神相·财帛】${prefix}财帛宫显示${f.wealth}，${f.hand}。正财稳健，35岁后渐入佳境，宜守正出奇。`,
      love: `${f.love}，感情专一而深沉。已有伴侣者关系稳定，单身者明年春夏桃花较旺，宜主动把握。`,
      personality: `${f.wisdom}，${f.life}。您思维敏捷、体质尚可，做事踏实有条理，具备领导潜质。`,
      friends: "人缘较好，掌心红润者易获他人信任。贵人多出现在事业转折期，宜真诚待人、广结善缘。",
      children: "子女线清晰，与子女缘分深厚。孩子可能较有主见，宜引导式教育，亲子关系会越来越好。",
      family: "家庭线无杂纹，家运平稳。您是中坚力量，多陪伴家人可增福报，30岁后家庭运势渐入佳境。",
      career: `${f.career}，事业运势中期上升。适合管理、文化、技术类工作，40岁前宜深耕专业领域。`,
    };
    return {
      summary: `【麻衣神相】据手相综合分析：${f.life}，${f.wisdom}，${f.love}。${f.hand}，掌纹清而不乱，属中上命格，宜稳中求进、厚积薄发。`,
      categories,
    };
  }

  const f = pick(FACE_FEATURES, seed);
  const categories: CategoryAnalysis = {
    wealth: `【麻衣神相·财帛宫】${f.nose}，${f.forehead}。准头有肉主聚财，40岁后偏财运渐旺，宜稳健投资。`,
    love: `${f.eyes}，${f.eyebrow}。感情运势佳，异性缘较好，已有伴侣者需防烂桃花，单身者明年有机会。`,
    personality: `${f.forehead}，${f.eyes}。您智慧较高、洞察力强，性格温和而内心坚定，具备良好的人际魅力。`,
    friends: "面相显示人缘佳，口部形态端正者善辩能言。贵人运在西北方向，合作宜选诚信之人。",
    children: "子女宫饱满，与子女缘分深厚。宜民主教育，尊重孩子个性，亲子关系会日益融洽。",
    family: `${f.chin}，家宅运佳。您孝顺父母、关爱家人，30岁后家庭责任加重，但亦能从中获得力量。`,
    career: `${f.forehead}，${f.mouth}。适合文化、管理、销售类工作，35-45岁为事业黄金期，宜提前布局。`,
  };
  return {
    summary: `【麻衣神相】据面相综合分析：${f.forehead}，${f.eyes}，${f.nose}。${f.chin}，三停匀称、五官协调，气色尚佳，属中上之相，中年后运势渐入佳境。`,
    categories,
  };
}

export const MOCK_MODE = true;

export async function simulateAnalysisDelay(ms = 1500): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

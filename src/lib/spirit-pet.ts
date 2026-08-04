import type { BirthInfo, SpiritPetAdvice, SpiritPetPeriod, SpiritPetProfile } from "./types";
import { hashBirth } from "./fortune-chart";
import { calculateBazi } from "./bazi";
import { normalizeBirthInfo } from "./birth-utils";

const PETS_KEY = "ai-fortune-spirit-pets";
const SWAPS_KEY = "ai-fortune-pet-swaps";
const DESTINED_KEY = "ai-fortune-destined-pets";

export const MAX_PET_SWAPS = 2;

type Wuxing = "金" | "木" | "水" | "火" | "土";

const WUXING_COLORS: Record<Wuxing, string> = {
  金: "#d4a574",
  木: "#5a8a7a",
  水: "#4a7ab8",
  火: "#c45c48",
  土: "#9a8060",
};

/** 灵宠品种库 · 每个品种独立，非同款换色 */
export const PET_BREEDS = [
  { breedId: "qilin", baseName: "麒麟", emoji: "🦄", category: "mythical" as const, label: "祥瑞神兽" },
  { breedId: "unicorn", baseName: "独角兽", emoji: "🦄", category: "mythical" as const, label: "西方灵兽" },
  { breedId: "linggui", baseName: "灵龟", emoji: "🐢", category: "mythical" as const, label: "长寿灵宠" },
  { breedId: "jinshe", baseName: "金蛇", emoji: "🐍", category: "zodiac" as const, zodiacAnimal: "蛇", label: "智慧灵蛇" },
  { breedId: "jinniu", baseName: "吉牛", emoji: "🐮", category: "zodiac" as const, zodiacAnimal: "牛", label: "福运灵牛" },
  { breedId: "linghu", baseName: "灵虎", emoji: "🐯", category: "zodiac" as const, zodiacAnimal: "虎", label: "威仪灵虎" },
  { breedId: "fenghuang", baseName: "凤凰", emoji: "🦚", category: "mythical" as const, label: "涅槃灵凤" },
  { breedId: "qinglong", baseName: "青龙", emoji: "🐲", category: "mythical" as const, label: "东方神龙" },
  { breedId: "baihu", baseName: "白虎", emoji: "🐅", category: "mythical" as const, label: "西方神虎" },
  { breedId: "lingfox", baseName: "灵狐", emoji: "🦊", category: "constellation" as const, constellation: "双子座", label: "灵巧灵狐" },
  { breedId: "jinshi", baseName: "金狮", emoji: "🦁", category: "constellation" as const, constellation: "狮子座", label: "王者灵狮" },
  { breedId: "linglu", baseName: "灵鹿", emoji: "🦌", category: "constellation" as const, constellation: "天秤座", label: "温柔灵鹿" },
  { breedId: "lingtu", baseName: "灵兔", emoji: "🐰", category: "zodiac" as const, zodiacAnimal: "兔", label: "月宫灵兔" },
  { breedId: "lingma", baseName: "灵马", emoji: "🐴", category: "zodiac" as const, zodiacAnimal: "马", label: "奔腾灵马" },
  { breedId: "lingyu", baseName: "灵鱼", emoji: "🐟", category: "constellation" as const, constellation: "双鱼座", label: "游龙灵鱼" },
];

export const SPIRIT_PERIODS: { id: SpiritPetPeriod; label: string }[] = [
  { id: "day", label: "本日建议" },
  { id: "month", label: "本月建议" },
  { id: "year", label: "本年建议" },
  { id: "nextYear", label: "下年度建议" },
  { id: "3y", label: "三年建议" },
  { id: "5y", label: "五年建议" },
  { id: "10y", label: "十年建议" },
  { id: "20y", label: "二十年建议" },
];

const WUXING_MAP: Record<string, Wuxing> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

const ELEMENT_TRAITS: Record<Wuxing, string> = {
  金: "刚毅果决、义薄云天，主收敛与守护",
  木: "仁厚生发、向上向善，主成长与希望",
  水: "智慧灵动、包容万象，主流通与变通",
  火: "热情光明、礼敬四方，主照耀与驱邪",
  土: "厚重稳健、信实包容，主承载与安定",
};

function getStoredPets(): Record<string, SpiritPetProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getSwapCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SWAPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDestinedPet(personKey: string, profile: SpiritPetProfile) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DESTINED_KEY);
    const all: Record<string, { fullName: string; breedId: string; baseName: string }> = raw ? JSON.parse(raw) : {};
    if (!all[personKey]) {
      all[personKey] = { fullName: profile.fullName, breedId: profile.breedId, baseName: profile.baseName };
      localStorage.setItem(DESTINED_KEY, JSON.stringify(all));
    }
  } catch { /* ignore */ }
}

export function getDestinedPet(personKey: string): { fullName: string; breedId: string; baseName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DESTINED_KEY);
    const all: Record<string, { fullName: string; breedId: string; baseName: string }> = raw ? JSON.parse(raw) : {};
    return all[personKey] ?? null;
  } catch {
    return null;
  }
}

function savePet(profile: SpiritPetProfile) {
  const all = getStoredPets();
  all[profile.personKey] = profile;
  localStorage.setItem(PETS_KEY, JSON.stringify(all));
}

export function getPersonKey(personId: string | null, info: BirthInfo): string {
  return personId ?? `birth-${hashBirth(info)}`;
}

function safeCalculateBazi(info: BirthInfo) {
  try {
    return calculateBazi(info);
  } catch {
    return null;
  }
}

function getDominantElement(info: BirthInfo, dayGan: string): Wuxing {
  const birth = normalizeBirthInfo(info);
  const bazi = safeCalculateBazi(birth);
  if (!bazi) return "木";
  const pillars = [
    bazi.bazi.year[0], bazi.bazi.month[0], bazi.bazi.day[0], bazi.bazi.hour[0],
    bazi.bazi.year[1], bazi.bazi.month[1], bazi.bazi.day[1], bazi.bazi.hour[1],
  ];
  const counts: Record<Wuxing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  for (const ch of pillars) {
    const wx = WUXING_MAP[ch];
    if (wx) counts[wx]++;
  }
  counts[WUXING_MAP[dayGan] ?? "木"] += 2;
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as Wuxing;
}

function buildDisplayName(element: Wuxing, baseName: string): string {
  if (baseName.startsWith("灵") || baseName.startsWith("金") || baseName.startsWith("吉")) {
    return baseName.startsWith(element) ? baseName : `${element}${baseName.replace(/^[金木水火土]/, "")}`;
  }
  return `${element}${baseName}`;
}

function buildReason(
  info: BirthInfo,
  element: Wuxing,
  fullName: string,
  breed: typeof PET_BREEDS[number],
): string {
  const birth = normalizeBirthInfo(info);
  const bazi = safeCalculateBazi(birth);
  if (!bazi) {
    return `按照您的命格，${breed.baseName}与${element}行陪伴能量高度契合。因此最配您命格的陪伴型守护灵宠是【${fullName}】。`;
  }
  const baziStr = `${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day}`;
  const trait = ELEMENT_TRAITS[element];
  let match = "";
  if (breed.zodiacAnimal) {
    match = `您的生肖为${breed.zodiacAnimal}，${breed.baseName}与${element}行陪伴能量高度契合`;
  } else if (breed.constellation) {
    match = `您的星座能量与${breed.baseName}（${breed.constellation}）相合`;
  } else {
    match = `您的命格与${breed.label}${breed.baseName}天然共鸣`;
  }
  return `按照您的八字（${baziStr}），${bazi.dayMaster}，五行偏${element}。${match}。因此最配您命格的陪伴型守护灵宠是【${fullName}】——${trait}，将长久守护您。`;
}

function buildSpiritPetFromBreed(personKey: string, info: BirthInfo, breedId: string): SpiritPetProfile {
  const birth = normalizeBirthInfo(info);
  const breed = PET_BREEDS.find((b) => b.breedId === breedId) ?? PET_BREEDS[0];
  const bazi = safeCalculateBazi(birth);
  const element = bazi ? getDominantElement(birth, bazi.bazi.day[0]) : "木";
  const fullName = buildDisplayName(element, breed.baseName);

  const profile: SpiritPetProfile = {
    personKey,
    breedId: breed.breedId,
    baseName: breed.baseName,
    fullName,
    emoji: breed.emoji,
    element,
    elementColor: WUXING_COLORS[element],
    category: breed.category,
    zodiacAnimal: breed.zodiacAnimal,
    constellation: breed.constellation,
    reason: buildReason(birth, element, fullName, breed),
    baziText: bazi ? `${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day} · ${bazi.dayMaster}` : "待完善生辰",
    createdAt: new Date().toISOString(),
  };
  profile.avatarDataUrl = generateSpiritPetAvatar(profile);
  return profile;
}

function normalizeStoredPet(stored: SpiritPetProfile, personKey: string, info: BirthInfo): SpiritPetProfile {
  const birth = normalizeBirthInfo(info);
  const breedId = stored.breedId ?? PET_BREEDS[hashBirth(birth) % PET_BREEDS.length].breedId;
  const breed = PET_BREEDS.find((b) => b.breedId === breedId) ?? PET_BREEDS[0];
  const bazi = safeCalculateBazi(birth);
  const element = (stored.element && WUXING_COLORS[stored.element as Wuxing]
    ? stored.element
    : bazi ? getDominantElement(birth, bazi.bazi.day[0]) : "木") as Wuxing;

  return {
    personKey,
    breedId: breed.breedId,
    baseName: stored.baseName ?? breed.baseName,
    fullName: stored.fullName ?? buildDisplayName(element, breed.baseName),
    emoji: stored.emoji ?? breed.emoji,
    element,
    elementColor: stored.elementColor ?? WUXING_COLORS[element],
    category: stored.category ?? breed.category,
    zodiacAnimal: stored.zodiacAnimal ?? breed.zodiacAnimal,
    constellation: stored.constellation ?? breed.constellation,
    reason: stored.reason ?? buildReason(birth, element, stored.fullName ?? buildDisplayName(element, breed.baseName), breed),
    baziText: stored.baziText ?? (bazi ? `${bazi.bazi.year} ${bazi.bazi.month} ${bazi.bazi.day} · ${bazi.dayMaster}` : "待完善生辰"),
    avatarDataUrl: stored.avatarDataUrl,
    createdAt: stored.createdAt ?? new Date().toISOString(),
  };
}

function createSpiritPet(personKey: string, info: BirthInfo): SpiritPetProfile {
  const birth = normalizeBirthInfo(info);
  const seed = hashBirth(birth);
  const breed = PET_BREEDS[seed % PET_BREEDS.length];
  const profile = buildSpiritPetFromBreed(personKey, birth, breed.breedId);
  savePet(profile);
  saveDestinedPet(personKey, profile);
  return profile;
}

function isCompletePet(stored: SpiritPetProfile): boolean {
  return !!(
    stored.breedId &&
    stored.fullName &&
    stored.emoji &&
    stored.element &&
    stored.elementColor &&
    stored.reason &&
    stored.baziText
  );
}

export function getOrCreateSpiritPet(personKey: string, info: BirthInfo): SpiritPetProfile {
  const birth = normalizeBirthInfo(info);
  const stored = getStoredPets()[personKey];
  if (stored) {
    if (!isCompletePet(stored)) {
      const migrated = buildSpiritPetFromBreed(personKey, birth, stored.breedId ?? PET_BREEDS[hashBirth(birth) % PET_BREEDS.length].breedId);
      savePet(migrated);
      saveDestinedPet(personKey, migrated);
      return migrated;
    }
    const normalized = normalizeStoredPet(stored, personKey, birth);
    if (!normalized.avatarDataUrl) {
      normalized.avatarDataUrl = generateSpiritPetAvatar(normalized);
      savePet(normalized);
    }
    saveDestinedPet(personKey, normalized);
    return normalized;
  }
  return createSpiritPet(personKey, birth);
}

export function getRemainingSwaps(personKey: string): number {
  const used = getSwapCounts()[personKey] ?? 0;
  return Math.max(0, MAX_PET_SWAPS - used);
}

/** 获取可更换的其他品种（最多展示 5 个不同品种） */
export function getPetAlternatives(personKey: string, info: BirthInfo): SpiritPetProfile[] {
  const birth = normalizeBirthInfo(info);
  const current = getStoredPets()[personKey];
  const currentBreedId = current?.breedId;
  const seed = hashBirth(birth);

  const others = PET_BREEDS.filter((b) => b.breedId !== currentBreedId);
  const picked: SpiritPetProfile[] = [];
  for (let i = 0; i < others.length && picked.length < 5; i++) {
    const breed = others[(seed + i * 3) % others.length];
    if (picked.some((p) => p.breedId === breed.breedId)) continue;
    try {
      picked.push(buildSpiritPetFromBreed(personKey, birth, breed.breedId));
    } catch {
      // skip invalid breed candidate
    }
  }
  return picked;
}

/** 更换灵宠品种，每人最多 2 次 */
export function changeSpiritPet(personKey: string, profile: SpiritPetProfile): { ok: boolean; pet?: SpiritPetProfile; error?: string } {
  const remaining = getRemainingSwaps(personKey);
  if (remaining <= 0) {
    return { ok: false, error: "更换次数已用完（最多 2 次）" };
  }
  const updated = { ...profile, personKey, createdAt: new Date().toISOString() };
  updated.avatarDataUrl = generateSpiritPetAvatar(updated);
  savePet(updated);

  const swaps = getSwapCounts();
  swaps[personKey] = (swaps[personKey] ?? 0) + 1;
  localStorage.setItem(SWAPS_KEY, JSON.stringify(swaps));

  return { ok: true, pet: updated };
}

export function getSpiritPetForPerson(personKey: string, info: BirthInfo): SpiritPetProfile {
  return getOrCreateSpiritPet(personKey, info);
}

const PET_GREETINGS = [
  "主人～只要您听从我的建议，有我的守护，保您无忧哦～",
  "主人，我已为您观天象、查黄历，以下是我的贴心提示～",
  "嘻嘻，主人别怕，有本灵宠在，咱们一起趋吉避凶～",
];

function petVoice(text: string, periodLabel: string, idx: number): string {
  const greeting = PET_GREETINGS[idx % PET_GREETINGS.length];
  return `主人，${periodLabel}来啦～\n${greeting}\n\n${text}`;
}

export function generateSpiritPetAdvice(
  info: BirthInfo,
  pet: SpiritPetProfile,
  period: SpiritPetPeriod,
): SpiritPetAdvice {
  const birth = normalizeBirthInfo(info);
  const seed = hashBirth(birth) + period.charCodeAt(0) * 100;
  const periodLabel = SPIRIT_PERIODS.find((p) => p.id === period)?.label ?? period;
  const dirs = ["东方", "南方", "西方", "北方", "东南", "西北"];
  const colors = ["朱红", "墨绿", "金色", "藏青", "紫色", "米白"];
  const dir = dirs[seed % dirs.length];
  const color = colors[(seed + 3) % colors.length];

  const sections = [
    { label: "穿搭", text: `${periodLabel}宜以${color}系为主，与${pet.fullName}的${pet.element}行气质相合，主人穿上一定很有气场～` },
    { label: "性情", text: seed % 2 === 0 ? "今日宜静不宜动，主人多冥想片刻，我帮您稳心神。" : "今日宜动不宜静，主人大胆行动，我在身后护您！" },
    { label: "吉位", text: `吉位在${dir}，主人办公或居家多待此方位，我帮您聚气～` },
    { label: "方向", text: `出行求财宜朝${dir}，忌与${dirs[(seed + 2) % dirs.length]}长途奔波哦。` },
    { label: "事业", text: pet.element === "木" ? "事业宜进取，贵人暗中相助，主人加油！" : "事业宜稳守，厚积薄发，我陪您慢慢来～" },
    { label: "财运", text: seed % 3 === 0 ? "偏财有小利，正财平稳，主人记得留一手～" : "财运以守为主，忌贪快，听我的准没错！" },
    { label: "桃花", text: seed % 2 === 0 ? "桃花渐显，主人宜真诚待人，缘分快到了～" : "感情宜慢热，不宜操之过急，我帮您看着呢。" },
    { label: "健康", text: "注意作息规律，主人要早点休息，我可不想您累着～" },
    { label: "平安", text: "整体平安，出行注意交通安全，我会一直护佑主人。" },
    { label: "吉祥物", text: `随身可佩${pet.fullName}意象小物，或摆放${pet.emoji}造型增运～` },
  ];

  return {
    period,
    periodLabel,
    petName: pet.fullName,
    petEmoji: pet.emoji,
    summary: petVoice(`根据您的命格与${periodLabel}流年，${pet.fullName}为您奉上以下建议：`, periodLabel, seed),
    sections,
    petGreeting: sections.map((s) => `【${s.label}】${s.text}`).join("\n"),
  };
}

export function generateSpiritPetAvatar(pet: SpiritPetProfile): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const grad = ctx.createRadialGradient(100, 80, 10, 100, 100, 100);
    grad.addColorStop(0, pet.elementColor || WUXING_COLORS[pet.element] || "#c45c48");
    grad.addColorStop(1, "#1c1915");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(100, 100, 98, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pet.elementColor || WUXING_COLORS[pet.element] || "#c45c48";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pet.emoji || "🦄", 100, 105);
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

export { WUXING_COLORS };

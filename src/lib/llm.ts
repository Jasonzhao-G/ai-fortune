import type { AnalysisResult, LLMConfig, BaziResult } from "./types";
import {
  getMockBaziAnalysis,
  getMockImageAnalysis,
  simulateAnalysisDelay,
  MOCK_MODE,
} from "./mock-analysis";

const DEFAULT_MODELS: Record<string, { baseUrl: string; model: string }> = {
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
};

export { MOCK_MODE };

function buildSystemPrompt(type: "bazi" | "palm" | "face"): string {
  const typeLabel = { bazi: "八字命理", palm: "手相", face: "面相" }[type];
  return `你是一位精通中国传统命理学的资深大师，擅长${typeLabel}分析。
请根据用户提供的信息，给出专业、详尽且积极正面的命理分析。

必须严格以 JSON 格式返回，不要包含任何 markdown 代码块或其他文字：
{
  "summary": "200字以内的总体概述",
  "categories": {
    "wealth": "财运分析，80-150字",
    "love": "爱情分析，80-150字",
    "personality": "性格分析，80-150字",
    "friends": "朋友人际分析，80-150字",
    "children": "子女分析，80-150字",
    "family": "家庭分析，80-150字",
    "career": "事业分析，80-150字"
  }
}

注意：分析要有命理依据，语言通俗易懂，给出具体建议。`;
}

function parseAnalysisResponse(content: string): AnalysisResult {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 返回格式无效");

  const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;
  if (!parsed.summary || !parsed.categories) {
    throw new Error("AI 返回内容不完整");
  }
  return parsed;
}

export function isMockMode(config?: LLMConfig): boolean {
  return MOCK_MODE || !config?.apiKey;
}

export async function analyzeBazi(
  config: LLMConfig | undefined,
  bazi: BaziResult,
  baziText: string
): Promise<{ analysis: AnalysisResult; mock: boolean }> {
  if (isMockMode(config)) {
    await simulateAnalysisDelay();
    return { analysis: getMockBaziAnalysis(bazi), mock: true };
  }

  const analysis = await analyzeWithLLM(config!, "bazi", buildBaziPrompt(baziText));
  return { analysis, mock: false };
}

export async function analyzeImage(
  config: LLMConfig | undefined,
  type: "palm" | "face",
  imageBase64: string,
  description: string
): Promise<{ analysis: AnalysisResult; mock: boolean }> {
  if (isMockMode(config)) {
    await simulateAnalysisDelay();
    return {
      analysis: getMockImageAnalysis(type, imageBase64.slice(-200)),
      mock: true,
    };
  }

  let prompt = buildImagePrompt(type, description);

  if (config?.provider === "openai") {
    const visionResult = await analyzeImageWithVision(config, type, imageBase64);
    if (visionResult) {
      prompt = buildImagePrompt(type, visionResult);
    }
  }

  const analysis = await analyzeWithLLM(config!, type, prompt);
  return { analysis, mock: false };
}

async function analyzeWithLLM(
  config: LLMConfig,
  type: "bazi" | "palm" | "face",
  userPrompt: string
): Promise<AnalysisResult> {
  const defaults = DEFAULT_MODELS[config.provider] ?? DEFAULT_MODELS.deepseek;
  const baseUrl = config.baseUrl ?? defaults.baseUrl;
  const model = config.model ?? defaults.model;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemPrompt(type) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI 接口调用失败: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI 未返回有效内容");

  return parseAnalysisResponse(content);
}

export function buildBaziPrompt(baziText: string): string {
  return `请根据以下八字信息进行详细命理分析：\n\n${baziText}`;
}

export function buildImagePrompt(type: "palm" | "face", description: string): string {
  const label = type === "palm" ? "手相" : "面相";
  return `请根据以下${label}特征描述进行详细分析：\n\n${description}`;
}

export function getImageAnalysisDescription(type: "palm" | "face"): string {
  if (type === "palm") {
    return `手相特征（基于图像识别）：
- 生命线：深长清晰，弧度适中，显示体质较好
- 智慧线：延伸至无名指下方，思维敏捷
- 感情线：较为平直，感情专一
- 事业线：中段清晰，事业运势中期上升
- 财运线：不明显但无断纹，财运平稳
- 手型：方形手，做事踏实`;
  }
  return `面相特征（基于图像识别）：
- 额头：宽阔饱满，智慧较高
- 眉毛：浓淡适中，性格温和
- 眼睛：有神，洞察力强
- 鼻子：鼻梁挺直，财运中等偏上
- 嘴巴：唇形端正，口才较好
- 下巴：圆润，晚年运势佳
- 整体：五官协调，气色红润`;
}

async function analyzeImageWithVision(
  config: LLMConfig,
  type: "palm" | "face",
  imageBase64: string
): Promise<string | null> {
  try {
    const baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
    const model = config.model ?? "gpt-4o-mini";
    const label = type === "palm" ? "手相" : "面相";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `请详细描述这张${label}照片中的特征，包括线条、形状、比例等命理相关特征，200字以内。`,
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

// Legacy export removed — use analyzeBazi / analyzeImage instead
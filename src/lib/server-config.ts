import type { LLMConfig } from "./types";

/** 服务端读取 API 配置，仅 App 所有者在部署环境配置，不对用户展示 */
export function getServerLLMConfig(): LLMConfig | undefined {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const apiKey = deepseekKey || openaiKey;

  if (!apiKey) return undefined;

  const provider =
    (process.env.LLM_PROVIDER as LLMConfig["provider"]) ||
    (deepseekKey ? "deepseek" : "openai");

  return {
    provider,
    apiKey,
    baseUrl: process.env.LLM_BASE_URL,
    model: process.env.LLM_MODEL,
  };
}

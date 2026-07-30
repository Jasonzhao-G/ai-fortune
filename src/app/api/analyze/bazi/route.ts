import { NextRequest, NextResponse } from "next/server";
import { calculateBazi, formatBaziPrompt } from "@/lib/bazi";
import { analyzeBazi } from "@/lib/llm";
import { getServerLLMConfig } from "@/lib/server-config";
import type { BirthInfo } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { birthInfo } = (await req.json()) as { birthInfo: BirthInfo };

    if (!birthInfo?.year || !birthInfo?.month || !birthInfo?.day) {
      return NextResponse.json({ error: "请填写完整的出生信息" }, { status: 400 });
    }

    const bazi = calculateBazi(birthInfo);
    const baziText = formatBaziPrompt(bazi);
    const { analysis } = await analyzeBazi(getServerLLMConfig(), bazi, baziText);

    return NextResponse.json({ bazi, analysis });
  } catch (e) {
    const message = e instanceof Error ? e.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

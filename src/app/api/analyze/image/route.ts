import { NextRequest, NextResponse } from "next/server";
import { analyzeImage, getImageAnalysisDescription } from "@/lib/llm";
import { getServerLLMConfig } from "@/lib/server-config";
import { getMockImageAnalysis } from "@/lib/mock-analysis";

export async function POST(req: NextRequest) {
  try {
    const { type, image } = (await req.json()) as {
      type: "palm" | "face";
      image: string;
    };

    if (!type || !image) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    const description = getImageAnalysisDescription(type);

    try {
      const { analysis, mock } = await analyzeImage(
        getServerLLMConfig(),
        type,
        image,
        description,
      );
      return NextResponse.json({ analysis, mock });
    } catch {
      const analysis = getMockImageAnalysis(type, image.slice(-200));
      return NextResponse.json({ analysis, mock: true });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

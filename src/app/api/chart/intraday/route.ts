import { NextRequest, NextResponse } from "next/server";
import { generateIntradayData } from "@/lib/fortune-chart";
import type { BirthInfo } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { birthInfo, year } = (await req.json()) as {
      birthInfo: BirthInfo;
      year: number;
    };

    if (!birthInfo?.year || !year) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const intraday = generateIntradayData(birthInfo, year);
    return NextResponse.json({ intraday });
  } catch (e) {
    const message = e instanceof Error ? e.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

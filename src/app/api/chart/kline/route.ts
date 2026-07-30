import { NextRequest, NextResponse } from "next/server";
import { generateKlineData } from "@/lib/fortune-chart";
import type { BirthInfo, ChartPeriod } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { birthInfo, years } = (await req.json()) as {
      birthInfo: BirthInfo;
      years: ChartPeriod;
    };

    if (!birthInfo?.year) {
      return NextResponse.json({ error: "缺少出生信息" }, { status: 400 });
    }

    const kline = generateKlineData(birthInfo, years ?? 10);
    return NextResponse.json({ kline });
  } catch (e) {
    const message = e instanceof Error ? e.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getStockData } from "@/lib/yahoo-finance";
import { calculateHealthScore } from "@/lib/health-score";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  try {
    const data = await getStockData(ticker);
    const result = calculateHealthScore(data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

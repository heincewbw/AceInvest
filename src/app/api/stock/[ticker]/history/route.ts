import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { normalizeTicker } from "@/lib/yahoo-finance";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get("period") ?? "90d";
  const days = parseInt(periodParam.replace("d", ""), 10) || 90;

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const norm = normalizeTicker(ticker);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = await (yahooFinance.chart as any)(norm, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bars = (history.quotes ?? []).filter((q: any) =>
      q.open != null && q.high != null && q.low != null && q.close != null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ).map((q: any) => ({
      time: new Date(q.date).toISOString().split("T")[0],
      open: q.open as number,
      high: q.high as number,
      low: q.low as number,
      close: q.close as number,
    }));

    return NextResponse.json(bars);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

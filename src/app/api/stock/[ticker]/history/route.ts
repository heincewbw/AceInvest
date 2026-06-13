import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
import { normalizeTicker } from "@/lib/yahoo-finance";

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}

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
    const history = await withRetry(() => (yahooFinance.chart as any)(norm, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as Promise<any>);

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

import { getStockData } from "@/lib/yahoo-finance";
import { calculateFairValue } from "@/lib/fair-value";
import { calculateHealthScore } from "@/lib/health-score";
import FairValueBreakdown from "@/components/stock/FairValueBreakdown";
import HealthScoreGauge from "@/components/stock/HealthScoreGauge";
import FundamentalsGrid from "@/components/stock/FundamentalsGrid";
import PriceChart from "@/components/stock/PriceChart";
import WatchlistButton from "@/components/stock/WatchlistButton";
import { getDb } from "@/lib/db";
import type { WatchlistItem } from "@/types/stock";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

function isInWatchlist(ticker: string): boolean {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT id FROM watchlist WHERE ticker = ?")
      .get(ticker.toUpperCase()) as WatchlistItem | undefined;
    return row != null;
  } catch {
    return false;
  }
}

export default async function StockPage({ params }: PageProps) {
  const { ticker } = await params;
  const norm = ticker.toUpperCase();

  let data;
  try {
    data = await getStockData(norm);
  } catch {
    notFound();
  }

  const [fairValueResult, healthResult] = await Promise.all([
    Promise.resolve(calculateFairValue(data)),
    Promise.resolve(calculateHealthScore(data)),
  ]);

  const inWatchlist = isInWatchlist(norm);

  const { quote } = data;

  function fmtLarge(v: number | null): string {
    if (v == null) return "—";
    if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
    if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
    return v.toFixed(0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-white">{quote.ticker}</h1>
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-md">{quote.market}</span>
              {quote.exchange && (
                <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-md">{quote.exchange}</span>
              )}
            </div>
            <div className="text-slate-400 mt-1">{quote.name}</div>
            {(quote.sector || quote.industry) && (
              <div className="text-sm text-slate-500 mt-0.5">
                {[quote.sector, quote.industry].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: quote.currency,
                  minimumFractionDigits: 2,
                }).format(quote.price)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Market Cap: {fmtLarge(quote.marketCap)} · Beta: {quote.beta?.toFixed(2) ?? "—"}
              </div>
            </div>
            <WatchlistButton
              ticker={quote.ticker}
              market={quote.market}
              name={quote.name}
              initialInWatchlist={inWatchlist}
            />
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <PriceChart ticker={quote.ticker} />

      {/* Tabs: Fair Value | Health | Fundamentals */}
      <StockTabs
        fairValueResult={fairValueResult}
        healthResult={healthResult}
        data={data}
      />
    </div>
  );
}

// Client tabs component
import StockTabs from "@/components/stock/StockTabs";

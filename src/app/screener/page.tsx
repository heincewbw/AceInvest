"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, TrendingDown, Heart, SlidersHorizontal } from "lucide-react";
import type { FairValueResult, HealthScoreResult } from "@/types/stock";

interface ScreenerResult {
  ticker: string;
  name: string;
  price: number;
  currency: string;
  market: "IDX" | "US";
  fairValue: number | null;
  upside: number | null;
  healthScore: number | null;
  healthGrade: string | null;
}

export default function ScreenerPage() {
  const [ticker, setTicker] = useState("");
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [minUpside, setMinUpside] = useState<number | "">("");
  const [minHealth, setMinHealth] = useState<number | "">("");
  const [marketFilter, setMarketFilter] = useState<"ALL" | "IDX" | "US">("ALL");

  async function analyze() {
    const tickers = ticker
      .split(/[\s,;]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    if (tickers.length === 0) return;
    setLoading(true);
    setError(null);

    const newResults: ScreenerResult[] = [];

    await Promise.allSettled(
      tickers.map(async (t) => {
        try {
          const [fv, hs] = await Promise.all([
            fetch(`/api/fair-value/${t}`).then((r) => r.json()) as Promise<FairValueResult & { error?: string }>,
            fetch(`/api/health-score/${t}`).then((r) => r.json()) as Promise<HealthScoreResult & { error?: string }>,
          ]);

          if (fv.error) throw new Error(fv.error);

          const stockRes = await fetch(`/api/stock/${t}`).then((r) => r.json()) as {
            quote: { name: string; currency: string; market: "IDX" | "US" };
          };

          newResults.push({
            ticker: t,
            name: stockRes.quote.name,
            price: fv.currentPrice,
            currency: stockRes.quote.currency,
            market: stockRes.quote.market,
            fairValue: fv.averageFairValue,
            upside: fv.upside,
            healthScore: hs.totalScore,
            healthGrade: hs.grade,
          });
        } catch {
          // skip failed tickers
        }
      })
    );

    setResults((prev) => {
      const existingTickers = new Set(prev.map((r) => r.ticker));
      const merged = [...prev, ...newResults.filter((r) => !existingTickers.has(r.ticker))];
      return merged;
    });
    setLoading(false);
    setTicker("");
  }

  const filtered = results.filter((r) => {
    if (marketFilter !== "ALL" && r.market !== marketFilter) return false;
    if (minUpside !== "" && (r.upside == null || r.upside < Number(minUpside))) return false;
    if (minHealth !== "" && (r.healthScore == null || r.healthScore < Number(minHealth))) return false;
    return true;
  }).sort((a, b) => (b.upside ?? -Infinity) - (a.upside ?? -Infinity));

  function fmtPrice(v: number, currency: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: currency === "IDR" ? 0 : 2 }).format(v);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-blue-400" />
          Stock Screener
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter multiple tickers separated by commas or spaces to analyze them.
        </p>
      </div>

      {/* Input */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="e.g. AAPL, MSFT, TLKM.JK, BBCA.JK"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={analyze}
            disabled={loading || !ticker.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 pt-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Market:</span>
            {(["ALL", "IDX", "US"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMarketFilter(m)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  marketFilter === m ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Min Upside %:</span>
            <input
              type="number"
              value={minUpside}
              onChange={(e) => setMinUpside(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 20"
              className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Min Health:</span>
            <input
              type="number"
              value={minHealth}
              onChange={(e) => setMinHealth(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 50"
              className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          {results.length > 0 && (
            <button
              onClick={() => setResults([])}
              className="ml-auto text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Results */}
      {filtered.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 text-sm text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} · sorted by upside
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Ticker</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Name</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Price</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Fair Value</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Upside</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Health</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Market</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isUnder = r.upside != null && r.upside > 0;
                return (
                  <tr key={r.ticker} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <Link href={`/stock/${r.ticker}`} className="font-mono font-bold text-blue-400 hover:underline">
                        {r.ticker}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden sm:table-cell truncate max-w-[180px]">{r.name}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmtPrice(r.price, r.currency)}</td>
                    <td className="px-4 py-3 text-right font-mono text-blue-300">
                      {r.fairValue != null ? fmtPrice(r.fairValue, r.currency) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${isUnder ? "text-green-400" : r.upside != null ? "text-red-400" : "text-slate-500"}`}>
                      {r.upside != null ? (
                        <span className="flex items-center justify-end gap-1">
                          {isUnder ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {r.upside > 0 ? "+" : ""}{r.upside.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.healthScore != null ? (
                        <span className="flex items-center justify-end gap-1 text-green-400 text-xs">
                          <Heart className="w-3 h-3" />
                          {r.healthScore} ({r.healthGrade})
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{r.market}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          Enter tickers above and click Analyze to see results.
        </div>
      )}
    </div>
  );
}

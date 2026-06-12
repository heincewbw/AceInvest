"use client";

import { useState } from "react";
import Link from "next/link";
import type { WatchlistItem, FairValueResult, HealthScoreResult } from "@/types/stock";
import { Trash2, RefreshCw, TrendingUp, TrendingDown, Heart } from "lucide-react";

interface EnrichedItem extends WatchlistItem {
  fairValue?: number | null;
  upside?: number | null;
  price?: number | null;
  healthScore?: number | null;
  healthGrade?: string | null;
  currency?: string;
  loading?: boolean;
  error?: string | null;
}

interface Props {
  initialItems: WatchlistItem[];
}

export default function WatchlistClient({ initialItems }: Props) {
  const [items, setItems] = useState<EnrichedItem[]>(initialItems);

  async function removeItem(ticker: string) {
    await fetch(`/api/watchlist?ticker=${ticker}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }

  async function refreshItem(ticker: string) {
    setItems((prev) =>
      prev.map((i) => (i.ticker === ticker ? { ...i, loading: true, error: null } : i))
    );
    try {
      const [fv, hs] = await Promise.all([
        fetch(`/api/fair-value/${ticker}`).then((r) => r.json()) as Promise<FairValueResult>,
        fetch(`/api/health-score/${ticker}`).then((r) => r.json()) as Promise<HealthScoreResult>,
      ]);
      setItems((prev) =>
        prev.map((i) =>
          i.ticker === ticker
            ? {
                ...i,
                loading: false,
                fairValue: fv.averageFairValue,
                upside: fv.upside,
                price: fv.currentPrice,
                healthScore: hs.totalScore,
                healthGrade: hs.grade,
              }
            : i
        )
      );
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.ticker === ticker ? { ...i, loading: false, error: "Failed to load" } : i
        )
      );
    }
  }

  async function refreshAll() {
    await Promise.all(items.map((i) => refreshItem(i.ticker)));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Watchlist</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} stock{items.length !== 1 ? "s" : ""}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400 mb-4">Your watchlist is empty.</p>
          <Link href="/" className="text-blue-400 hover:underline text-sm">
            Search for a stock to add
          </Link>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Ticker</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Name</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Market</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Price</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Fair Value</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Upside</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Health</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isUndervalued = item.upside != null && item.upside > 0;
                return (
                  <tr key={item.ticker} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <Link href={`/stock/${item.ticker}`} className="font-mono font-bold text-blue-400 hover:underline">
                        {item.ticker}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden sm:table-cell truncate max-w-[200px]">
                      {item.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{item.market}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {item.loading ? <span className="text-slate-500">...</span>
                        : item.price != null ? `$${item.price.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-blue-300">
                      {item.loading ? <span className="text-slate-500">...</span>
                        : item.fairValue != null ? `$${item.fairValue.toFixed(2)}` : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${isUndervalued ? "text-green-400" : item.upside != null ? "text-red-400" : "text-slate-500"}`}>
                      {item.loading ? <span className="text-slate-500">...</span>
                        : item.upside != null ? (
                          <span className="flex items-center justify-end gap-1">
                            {isUndervalued ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {item.upside > 0 ? "+" : ""}{item.upside.toFixed(1)}%
                          </span>
                        ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {item.loading ? <span className="text-slate-500">...</span>
                        : item.healthScore != null ? (
                          <span className="flex items-center justify-end gap-1 text-green-400">
                            <Heart className="w-3 h-3" />
                            {item.healthScore} ({item.healthGrade})
                          </span>
                        ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => refreshItem(item.ticker)}
                          disabled={item.loading}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                          title="Refresh"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${item.loading ? "animate-spin" : ""}`} />
                        </button>
                        <button
                          onClick={() => removeItem(item.ticker)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

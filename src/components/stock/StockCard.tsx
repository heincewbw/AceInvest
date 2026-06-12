"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Heart, Plus, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  ticker: string;
  name: string;
  price: number;
  currency: string;
  fairValue: number | null;
  upside: number | null;
  healthScore: number | null;
  healthGrade: string | null;
  market: "IDX" | "US";
  inWatchlist?: boolean;
  onWatchlistToggle?: (ticker: string, added: boolean) => void;
}

function fmtPrice(v: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(v);
}

function healthColor(score: number | null) {
  if (score == null) return "text-slate-400";
  if (score >= 80) return "text-green-400";
  if (score >= 65) return "text-lime-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 35) return "text-orange-400";
  return "text-red-400";
}

export default function StockCard({
  ticker,
  name,
  price,
  currency,
  fairValue,
  upside,
  healthScore,
  healthGrade,
  market,
  inWatchlist = false,
  onWatchlistToggle,
}: Props) {
  const [inList, setInList] = useState(inWatchlist);
  const [toggling, setToggling] = useState(false);

  async function handleWatchlist(e: React.MouseEvent) {
    e.preventDefault();
    if (toggling) return;
    setToggling(true);
    try {
      if (inList) {
        await fetch(`/api/watchlist?ticker=${ticker}`, { method: "DELETE" });
        setInList(false);
        onWatchlistToggle?.(ticker, false);
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, market, name }),
        });
        setInList(true);
        onWatchlistToggle?.(ticker, true);
      }
    } finally {
      setToggling(false);
    }
  }

  const isUndervalued = upside != null && upside > 0;

  return (
    <Link
      href={`/stock/${ticker}`}
      className="block bg-slate-800 rounded-xl p-4 hover:bg-slate-700/80 transition-colors border border-slate-700 hover:border-slate-600"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-400">{ticker}</span>
            <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
              {market}
            </span>
          </div>
          <div className="text-sm text-slate-400 truncate mt-0.5">{name}</div>
        </div>
        <button
          onClick={handleWatchlist}
          className={`shrink-0 p-1.5 rounded-lg transition-colors ${
            inList ? "bg-blue-600/20 text-blue-400" : "bg-slate-700 text-slate-500 hover:text-white"
          }`}
          title={inList ? "Remove from watchlist" : "Add to watchlist"}
        >
          {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Price</div>
          <div className="font-semibold">{fmtPrice(price, currency)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Fair Value</div>
          <div className="font-semibold text-blue-300">
            {fairValue != null ? fmtPrice(fairValue, currency) : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Upside</div>
          <div className={`flex items-center gap-1 font-semibold ${isUndervalued ? "text-green-400" : upside != null ? "text-red-400" : "text-slate-400"}`}>
            {upside != null ? (
              <>
                {isUndervalued ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {upside > 0 ? "+" : ""}{upside.toFixed(1)}%
              </>
            ) : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Health</div>
          <div className={`flex items-center gap-1 font-semibold ${healthColor(healthScore)}`}>
            <Heart className="w-3.5 h-3.5" />
            {healthScore != null ? `${healthScore}/100 (${healthGrade})` : "—"}
          </div>
        </div>
      </div>
    </Link>
  );
}

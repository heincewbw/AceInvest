"use client";

import { useState } from "react";
import { BookMarked, Check } from "lucide-react";

interface Props {
  ticker: string;
  market: "IDX" | "US";
  name: string;
  initialInWatchlist: boolean;
}

export default function WatchlistButton({ ticker, market, name, initialInWatchlist }: Props) {
  const [inList, setInList] = useState(initialInWatchlist);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      if (inList) {
        await fetch(`/api/watchlist?ticker=${ticker}`, { method: "DELETE" });
        setInList(false);
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, market, name }),
        });
        setInList(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        inList
          ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/30"
          : "bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600"
      }`}
    >
      {inList ? <Check className="w-4 h-4" /> : <BookMarked className="w-4 h-4" />}
      {inList ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}

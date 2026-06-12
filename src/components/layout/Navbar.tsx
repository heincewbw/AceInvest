"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, BookMarked, SlidersHorizontal } from "lucide-react";

interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json() as SearchResult[];
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(ticker: string) {
    setQuery("");
    setOpen(false);
    router.push(`/stock/${ticker}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/stock/${query.trim().toUpperCase()}`);
      setQuery("");
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl flex items-center gap-4 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-400 text-lg shrink-0">
          <TrendingUp className="w-5 h-5" />
          AceInvest
        </Link>

        {/* Search */}
        <div ref={wrapperRef} className="relative flex-1 max-w-md">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker or company (e.g. AAPL, BBCA.JK)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </form>
          {open && (
            <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
              {loading && (
                <div className="px-4 py-3 text-sm text-slate-400">Searching...</div>
              )}
              {!loading && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400">No results found</div>
              )}
              {results.map((r) => (
                <button
                  key={r.ticker}
                  onClick={() => handleSelect(r.ticker)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 text-left transition-colors"
                >
                  <span className="font-mono font-semibold text-blue-400 text-sm w-24 shrink-0">
                    {r.ticker}
                  </span>
                  <span className="text-sm text-slate-300 truncate">{r.name}</span>
                  <span className="text-xs text-slate-500 ml-auto shrink-0">{r.exchange}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1 ml-auto">
          <Link
            href="/screener"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Screener</span>
          </Link>
          <Link
            href="/watchlist"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <BookMarked className="w-4 h-4" />
            <span className="hidden sm:inline">Watchlist</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

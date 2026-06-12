import Link from "next/link";
import { TrendingUp, Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center py-16 space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl font-black text-white">AceInvest</h1>
        </div>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Track fair value of stocks using{" "}
          <span className="text-blue-400 font-semibold">14 valuation models</span> and{" "}
          <span className="text-green-400 font-semibold">health scoring</span>.
          Supports IDX &amp; US markets.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/stock/AAPL" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            Try AAPL
          </Link>
          <Link href="/stock/BBCA.JK" className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            Try BBCA.JK
          </Link>
          <Link href="/screener" className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            Open Screener
          </Link>
          <Link href="/watchlist" className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            My Watchlist
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-2xl font-black text-blue-400 mb-2">14</div>
          <div className="font-semibold mb-2">Valuation Models</div>
          <div className="text-sm text-slate-400 space-y-1">
            {["DCF (5Y FCF Projection)","Graham Number & Formula","Peter Lynch PEG=1","EV/EBITDA, P/E, P/B, P/S","DDM Gordon Growth","P/FCF, EV/Revenue","Residual Income, NAV, EPV"].map((m) => (
              <div key={m} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {m}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-2xl font-black text-green-400 mb-2">Health</div>
          <div className="font-semibold mb-2">Score 0–100</div>
          <div className="text-sm text-slate-400 space-y-1">
            {["Profitability — ROE, ROA, FCF Quality","Solvency — D/E, Current Ratio, Coverage","Growth — Revenue, EPS, FCF YoY","Efficiency — Asset Turnover, ROIC","Letter grade A–F"].map((m) => (
              <div key={m} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                {m}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-2xl font-black text-purple-400 mb-2">Smart</div>
          <div className="font-semibold mb-2">Features</div>
          <div className="text-sm text-slate-400 space-y-1">
            {["IDX (.JK) & US markets","Candlestick price chart","Median average of valid models","1-hour data cache (SQLite)","Watchlist management","Stock screener with filters"].map((m) => (
              <div key={m} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick search prompt */}
      <div className="text-center py-8 bg-slate-800/50 rounded-2xl border border-slate-700">
        <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">
          Use the search bar above to look up any stock.
          <br />
          <span className="text-slate-500 text-sm">
            Examples: AAPL, MSFT, TLKM.JK, BBRI.JK, TSLA
          </span>
        </p>
      </div>
    </div>
  );
}

import type { StockData } from "@/types/stock";

function fmt(v: number | null, currency = "USD"): string {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function fmtLarge(v: number | null): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toFixed(2);
}

function fmtPct(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function fmtX(v: number | null): string {
  if (v == null) return "—";
  return `${v.toFixed(2)}x`;
}

interface GridRow {
  label: string;
  value: string;
}

interface GridSection {
  title: string;
  rows: GridRow[];
}

interface Props {
  data: StockData;
}

export default function FundamentalsGrid({ data }: Props) {
  const f = data.fundamentals;
  const currency = data.quote.currency;

  const sections: GridSection[] = [
    {
      title: "Valuation",
      rows: [
        { label: "P/E (Trailing)", value: fmtX(f.trailingPE) },
        { label: "P/E (Forward)", value: fmtX(f.forwardPE) },
        { label: "P/B", value: fmtX(f.priceToBook) },
        { label: "EV/EBITDA", value: fmtX(f.enterpriseToEbitda) },
        { label: "EV/Revenue", value: fmtX(f.enterpriseToRevenue) },
        { label: "PEG Ratio", value: fmtX(f.pegRatio) },
      ],
    },
    {
      title: "Earnings & Book",
      rows: [
        { label: "EPS (Trailing)", value: fmt(f.trailingEps, currency) },
        { label: "EPS (Forward)", value: fmt(f.forwardEps, currency) },
        { label: "EPS Growth (YoY)", value: fmtPct(f.epsGrowth) },
        { label: "Book Value/Share", value: fmt(f.bookValuePerShare, currency) },
      ],
    },
    {
      title: "Revenue & Cash Flow",
      rows: [
        { label: "Total Revenue", value: fmtLarge(f.totalRevenue) },
        { label: "Revenue/Share", value: fmt(f.revenuePerShare, currency) },
        { label: "Revenue Growth", value: fmtPct(f.revenueGrowth) },
        { label: "Free Cash Flow", value: fmtLarge(f.freeCashflow) },
        { label: "Operating CF", value: fmtLarge(f.operatingCashflow) },
        { label: "EBITDA", value: fmtLarge(f.ebitda) },
      ],
    },
    {
      title: "Margins & Returns",
      rows: [
        { label: "Gross Margin", value: fmtPct(f.grossMargins) },
        { label: "Operating Margin", value: fmtPct(f.operatingMargins) },
        { label: "Net Margin", value: fmtPct(f.profitMargins) },
        { label: "ROE", value: fmtPct(f.returnOnEquity) },
        { label: "ROA", value: fmtPct(f.returnOnAssets) },
      ],
    },
    {
      title: "Balance Sheet",
      rows: [
        { label: "Total Debt", value: fmtLarge(f.totalDebt) },
        { label: "Total Cash", value: fmtLarge(f.totalCash) },
        { label: "Debt/Equity", value: f.debtToEquity != null ? f.debtToEquity.toFixed(2) : "—" },
        { label: "Current Ratio", value: f.currentRatio != null ? f.currentRatio.toFixed(2) : "—" },
        { label: "Quick Ratio", value: f.quickRatio != null ? f.quickRatio.toFixed(2) : "—" },
        { label: "Total Assets", value: fmtLarge(f.totalAssets) },
      ],
    },
    {
      title: "Dividends",
      rows: [
        { label: "Dividend Rate", value: fmt(f.dividendRate, currency) },
        { label: "Dividend Yield", value: fmtPct(f.dividendYield) },
        { label: "Payout Ratio", value: fmtPct(f.payoutRatio) },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => (
        <div key={section.title} className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            {section.title}
          </div>
          <div className="space-y-2">
            {section.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{row.label}</span>
                <span className="font-mono text-slate-200">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

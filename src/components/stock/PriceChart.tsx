"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
  type Time,
} from "lightweight-charts";

interface OHLCBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  ticker: string;
}

type PeriodKey = "1M" | "3M" | "1Y";
const PERIODS: { label: PeriodKey; days: number }[] = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
];

import { useState } from "react";

export default function PriceChart({ ticker }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("3M");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#1e293b" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#334155" },
        horzLines: { color: "#334155" },
      },
      width: containerRef.current.clientWidth,
      height: 300,
      timeScale: { borderColor: "#475569" },
      rightPriceScale: { borderColor: "#475569" },
    });

    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const days = PERIODS.find((p) => p.label === period)?.days ?? 90;
    const period2 = `${days}d`;

    setLoading(true);
    setError(null);

    fetch(`/api/stock/${ticker}/history?period=${period2}`)
      .then((r) => r.json())
      .then((data: OHLCBar[]) => {
        if (!chartRef.current) return;
        chartRef.current.removeSeries(chartRef.current.addSeries(CandlestickSeries));
        const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
          upColor: "#22c55e",
          downColor: "#ef4444",
          borderUpColor: "#22c55e",
          borderDownColor: "#ef4444",
          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
        });
        const sorted = [...data].sort((a, b) => a.time.localeCompare(b.time));
        candleSeries.setData(sorted.map((d) => ({ ...d, time: d.time as Time })));
        chartRef.current.timeScale().fitContent();
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load chart data");
        setLoading(false);
      });
  }, [ticker, period]);

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Price Chart</span>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.label)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                period === p.label
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded z-10">
            <div className="text-sm text-slate-400">Loading...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded z-10">
            <div className="text-sm text-red-400">{error}</div>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>
    </div>
  );
}

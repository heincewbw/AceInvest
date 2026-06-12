"use client";

import type { FairValueResult } from "@/types/stock";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function fmt(v: number | null, currency = "USD"): string {
  if (v == null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function fmtPct(v: number | null): string {
  if (v == null) return "N/A";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

interface Props {
  result: FairValueResult;
  currency?: string;
}

export default function FairValueBreakdown({ result, currency = "USD" }: Props) {
  const { models, averageFairValue, currentPrice, upside } = result;

  const chartData = models
    .filter((m) => m.value != null)
    .map((m) => ({
      name: m.model,
      value: Math.round(m.value! * 100) / 100,
    }))
    .sort((a, b) => a.value - b.value);

  const upsideColor =
    upside == null ? "text-slate-400"
      : upside > 20 ? "text-green-400"
      : upside > 0 ? "text-green-300"
      : upside > -20 ? "text-red-300"
      : "text-red-400";

  const UpsideIcon =
    upside == null ? Minus
      : upside > 0 ? TrendingUp
      : TrendingDown;

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 mb-1">Current Price</div>
          <div className="text-xl font-bold">{fmt(currentPrice, currency)}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 mb-1">Avg Fair Value</div>
          <div className="text-xl font-bold text-blue-400">
            {fmt(averageFairValue, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {result.modelsApplied} of {models.length} models
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 mb-1">Upside / Downside</div>
          <div className={`text-xl font-bold flex items-center justify-center gap-1 ${upsideColor}`}>
            <UpsideIcon className="w-5 h-5" />
            {fmtPct(upside)}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm font-medium text-slate-300 mb-3">Model Comparison</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <XAxis
                type="number"
                domain={["auto", "auto"]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v) => fmt(v, currency)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [fmt(v as number, currency), "Fair Value"]}
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <ReferenceLine
                x={currentPrice}
                stroke="#ef4444"
                strokeDasharray="4 2"
                label={{ value: "Price", fill: "#ef4444", fontSize: 11, position: "insideTopRight" }}
              />
              {averageFairValue != null && (
                <ReferenceLine
                  x={averageFairValue}
                  stroke="#3b82f6"
                  strokeDasharray="4 2"
                  label={{ value: "Avg FV", fill: "#3b82f6", fontSize: 11, position: "insideTopLeft" }}
                />
              )}
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.value >= currentPrice ? "#22c55e" : "#ef4444"}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">#</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Model</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Fair Value</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">vs Price</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => {
              const vs =
                m.value != null && currentPrice > 0
                  ? ((m.value - currentPrice) / currentPrice) * 100
                  : null;
              const isUndervalued = vs != null && vs > 0;
              return (
                <tr key={m.model} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{m.model}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {m.value != null ? fmt(m.value, currency) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${vs == null ? "text-slate-500" : isUndervalued ? "text-green-400" : "text-red-400"}`}>
                    {fmtPct(vs)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!m.applicable ? (
                      <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">No data</span>
                    ) : m.value == null ? (
                      <span className="text-xs bg-orange-900/40 text-orange-400 px-2 py-0.5 rounded-full">Invalid</span>
                    ) : isUndervalued ? (
                      <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Undervalued</span>
                    ) : (
                      <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">Overvalued</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { FairValueResult, HealthScoreResult, StockData } from "@/types/stock";
import FairValueBreakdown from "./FairValueBreakdown";
import HealthScoreGauge from "./HealthScoreGauge";
import FundamentalsGrid from "./FundamentalsGrid";

type Tab = "fairvalue" | "health" | "fundamentals";

interface Props {
  fairValueResult: FairValueResult;
  healthResult: HealthScoreResult;
  data: StockData;
}

export default function StockTabs({ fairValueResult, healthResult, data }: Props) {
  const [tab, setTab] = useState<Tab>("fairvalue");

  const tabs: { key: Tab; label: string }[] = [
    { key: "fairvalue", label: "Fair Value" },
    { key: "health", label: "Health Score" },
    { key: "fundamentals", label: "Fundamentals" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "fairvalue" && (
        <FairValueBreakdown result={fairValueResult} currency={data.quote.currency} />
      )}
      {tab === "health" && <HealthScoreGauge result={healthResult} />}
      {tab === "fundamentals" && <FundamentalsGrid data={data} />}
    </div>
  );
}

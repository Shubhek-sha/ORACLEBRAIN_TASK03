import React from "react";
import { RefreshCw } from "lucide-react";
import { useStock } from "../context/StockContext";

function fmt(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function Navbar() {
  const {
    totalPortfolioValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPct,
    lastUpdated,
    loading,
    refresh,
  } = useStock();

  const isGain = totalGainLoss >= 0;

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--";

  return (
    <header className="text-white px-8 py-5" style={{ background: "#1B2537" }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Row 1: Title + User */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold tracking-tight">
            Investment Portfolio Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="text-slate-400 hover:text-white transition-colors disabled:opacity-40"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
              YS
            </div>
            <div className="text-sm leading-tight">
              <p className="text-slate-400 text-xs">Hello,</p>
              <p className="font-semibold">Shubheksha Shrestha</p>
            </div>
          </div>
        </div>

        {/* Row 2: Stats */}
        <div className="flex items-end gap-10 flex-wrap">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Your Portfolio</p>
            <p className="text-xl font-bold">{fmt(totalPortfolioValue)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Total Invested</p>
            <p className="text-xl font-bold">{fmt(totalInvested)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Today's Gain/Loss</p>
            <p
              className={`text-xl font-bold ${isGain ? "text-green-400" : "text-red-400"}`}
            >
              {isGain ? "+" : ""}
              {fmt(totalGainLoss)}&nbsp;
              <span className="text-base">
                ({isGain ? "+" : ""}
                {totalGainLossPct}%)
              </span>
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Total Gain/Loss</p>
            <p
              className={`text-xl font-bold ${isGain ? "text-green-400" : "text-red-400"}`}
            >
              {isGain ? "+" : ""}
              {fmt(totalGainLoss)}
              <span className="text-base ml-1">
                ({isGain ? "+" : ""}
                {totalGainLossPct}%)
              </span>
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-slate-400 text-xs mb-0.5">Last Updated</p>
            <p className="text-xs text-slate-300">{timeStr}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

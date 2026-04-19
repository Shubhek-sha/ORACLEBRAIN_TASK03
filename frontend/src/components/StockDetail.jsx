import React from 'react';
import { X, TrendingUp, TrendingDown, BarChart2, Star } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis,
} from 'recharts';
import { useStock } from '../context/StockContext';
import { DetailSkeleton } from './LoadingSkeleton';

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtVol(vol) {
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol;
}

function MetricTile({ label, value, sub }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs shadow">
        <span className="font-mono font-semibold">{fmt(payload[0].value)}</span>
      </div>
    );
  }
  return null;
};

export default function StockDetail() {
  const { selectedStock, setSelectedStock, detailLoading, favorites, toggleFavorite } = useStock();

  if (!selectedStock && !detailLoading) return null;

  const isGain   = selectedStock?.changePct >= 0;
  const isFav    = favorites.includes(selectedStock?.symbol);
  const sparkData = selectedStock?.sparkline?.map((v, i) => ({ i, v })) ?? [];
  const chartColor = isGain ? '#10b981' : '#ef4444';

  return (
    <div className="card overflow-hidden flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Stock Detail</p>
        <button
          onClick={() => setSelectedStock(null)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {detailLoading ? (
        <DetailSkeleton />
      ) : (
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Symbol + price */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{selectedStock.symbol.slice(0,2)}</span>
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">{selectedStock.symbol}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedStock.name}</p>
                <span className="text-xs text-slate-400">{selectedStock.sector}</span>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite(selectedStock.symbol)}
              className={`p-2 rounded-xl transition-colors ${isFav ? 'text-amber-400 bg-amber-50 dark:bg-amber-950' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'}`}
            >
              <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Price block */}
          <div>
            <p className="price text-3xl font-bold tracking-tight">{fmt(selectedStock.price)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={isGain ? 'badge-gain' : 'badge-loss'}>
                {isGain ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isGain ? '+' : ''}{selectedStock.change?.toFixed(2)} ({isGain ? '+' : ''}{selectedStock.changePct?.toFixed(2)}%)
              </span>
              <span className="text-xs text-slate-400">vs prev close {fmt(selectedStock.prev_close)}</span>
            </div>
          </div>

          {/* Sparkline chart */}
          {sparkData.length > 0 && (
            <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart2 size={13} className="text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Intraday</span>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#sg)"
                    dot={false}
                    activeDot={{ r: 3, fill: chartColor }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetricTile label="Day High"    value={fmt(selectedStock.dayHigh)} />
            <MetricTile label="Day Low"     value={fmt(selectedStock.dayLow)} />
            <MetricTile label="Volume"      value={fmtVol(selectedStock.volume)} />
            <MetricTile label="Market Cap"  value={selectedStock.market_cap} />
            <MetricTile
              label="Prev Close"
              value={fmt(selectedStock.prev_close)}
            />
            <MetricTile
              label="Last Updated"
              value={new Date(selectedStock.last_updated).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit',
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

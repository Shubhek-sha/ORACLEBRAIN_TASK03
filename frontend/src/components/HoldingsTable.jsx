import React, { useMemo } from 'react';
import { useStock } from '../context/StockContext';

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n);
}

function fmtCompact(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1,
  }).format(n);
}

function generateSparkline(base, points = 14) {
  return Array.from({ length: points }, (_, i) => {
    const trend = base * (1 + (i / points) * 0.1);
    const noise = (Math.random() - 0.5) * base * 0.05;
    return trend + noise;
  });
}

function MiniSparkline({ data, positive }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const color = positive ? '#16a34a' : '#dc2626';
  return (
    <svg width={w} height={h}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HoldingsTable() {
  const { portfolio, stocks, fetchStockDetail } = useStock();

  const stockMap = useMemo(() => {
    const m = {};
    stocks.forEach((s) => { m[s.symbol] = s; });
    return m;
  }, [stocks]);

  const rows = useMemo(() =>
    portfolio.map((h) => {
      const stock = stockMap[h.symbol] || {};
      const change = parseFloat((h.current_price - h.buy_price).toFixed(2));
      const sparkData = generateSparkline(h.buy_price, 14);
      return { ...h, change, todayPct: stock.changePct ?? 0, sparkData };
    }),
    [portfolio, stockMap]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">My Holdings</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Ticker','Buy P.','Change','Price','Value','Today','Last Month'].map((col) => (
                <th
                  key={col}
                  className={`px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${col === 'Ticker' ? 'text-left' : 'text-right'}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => {
              const isPos = h.change >= 0;
              const isTodayPos = h.todayPct >= 0;
              return (
                <tr
                  key={h.id}
                  onClick={() => fetchStockDetail(h.symbol)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{h.symbol}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[110px]">{h.name}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600 text-xs">
                    {fmt(h.buy_price)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold text-xs ${isPos ? 'text-green-600' : 'text-red-500'}`}>
                    {isPos ? '+' : ''}{fmt(h.change)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800 text-xs">
                    {fmt(h.current_price)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600 text-xs">
                    {fmtCompact(h.currentVal)}
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-semibold ${isTodayPos ? 'text-green-600' : 'text-red-500'}`}>
                    {isTodayPos ? '+' : ''}{h.todayPct?.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <MiniSparkline data={h.sparkData} positive={isPos} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-2 text-xs text-gray-400 border-t border-gray-100 italic">
        Note: The data used is mere data &amp; not indicative of real prices.
      </p>
    </div>
  );
}

import React from 'react';
import { useStock } from '../context/StockContext';

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n);
}

function MoverTable({ title, data, isGain, qtyMap, fetchStockDetail }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-1.5">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <span className={`text-sm font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
          {isGain ? '▲' : '▼'}
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Ticker</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wide">Price</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wide">Return</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr
              key={s.symbol}
              onClick={() => fetchStockDetail(s.symbol)}
              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-3 py-2.5 font-semibold text-gray-800">{s.symbol}</td>
              <td className="px-3 py-2.5 text-right font-mono text-gray-600">{fmt(s.price)}</td>
              <td className={`px-3 py-2.5 text-right font-semibold ${isGain ? 'text-green-600' : 'text-red-500'}`}>
                {isGain ? '+' : ''}{s.changePct?.toFixed(1)}%
              </td>
              <td className="px-3 py-2.5 text-right text-gray-500">
                {qtyMap[s.symbol] ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TopMovers() {
  const { topGainers, topLosers, portfolio, fetchStockDetail } = useStock();

  const qtyMap = {};
  portfolio.forEach((h) => { qtyMap[h.symbol] = h.quantity; });

  return (
    <div className="space-y-4">
      <MoverTable
        title="Top Gainers"
        data={topGainers}
        isGain={true}
        qtyMap={qtyMap}
        fetchStockDetail={fetchStockDetail}
      />
      <MoverTable
        title="Top Losers"
        data={topLosers}
        isGain={false}
        qtyMap={qtyMap}
        fetchStockDetail={fetchStockDetail}
      />
    </div>
  );
}

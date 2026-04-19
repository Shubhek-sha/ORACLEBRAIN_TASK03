import React, { useEffect, useRef, useState } from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useStock } from '../context/StockContext';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price);
}

function formatVolume(vol) {
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol;
}

const SECTOR_COLORS = {
  Technology:     'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Finance:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Energy:         'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Automotive:     'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  'E-Commerce':   'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  Semiconductors: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  Entertainment:  'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  Retail:         'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'Consumer Goods': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
};

export default function StockCard({ stock }) {
  const { selectedStock, fetchStockDetail, favorites, toggleFavorite } = useStock();
  const isSelected  = selectedStock?.symbol === stock.symbol;
  const isFav       = favorites.includes(stock.symbol);
  const isGain      = stock.changePct >= 0;
  const flashClass  = stock.priceDirection === 'up' ? 'flash-gain' : stock.priceDirection === 'down' ? 'flash-loss' : '';
  const sectorColor = SECTOR_COLORS[stock.sector] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

  return (
    <div
      onClick={() => fetchStockDetail(stock.symbol)}
      className={`card p-4 cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${flashClass} ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Symbol avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {stock.symbol.slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{stock.symbol}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{stock.name}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className="price text-sm font-semibold">{formatPrice(stock.price)}</p>
          <span className={isGain ? 'badge-gain' : 'badge-loss'}>
            {isGain ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isGain ? '+' : ''}{stock.changePct?.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sectorColor}`}>
          {stock.sector}
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Vol {formatVolume(stock.volume)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(stock.symbol); }}
            className={`transition-colors ${isFav ? 'text-amber-400' : 'hover:text-amber-400'}`}
          >
            <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}

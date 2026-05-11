import React, { useState, useCallback } from 'react';
import { Star, X, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n);
}

export default function FavoritesSection() {
  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite, stocks, fetchStockDetail } = useStock();
  const [removing, setRemoving] = useState(null); // symbol being removed

  const enriched = favorites.map((fav) => {
    const live = stocks.find((s) => s.symbol === fav.symbol);
    return { ...fav, price: live?.price, changePct: live?.changePct, direction: live?.priceDirection };
  });

  const handleRemove = useCallback(async (e, fav) => {
    e.stopPropagation();
    setRemoving(fav.symbol);
    try {
      await toggleFavorite(fav.symbol, fav.name);
    } finally {
      setRemoving(null);
    }
  }, [toggleFavorite]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Star size={14} className={isAuthenticated && favorites.length > 0 ? 'text-amber-400 fill-amber-400' : 'text-amber-400'} />
        <h3 className="font-semibold text-sm">Watchlist</h3>
        {isAuthenticated && (
          <span className="ml-auto text-xs text-slate-400 tabular-nums">
            {favorites.length} {favorites.length === 1 ? 'stock' : 'stocks'}
          </span>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="py-6 text-center space-y-2">
          <LogIn size={22} className="mx-auto text-slate-300" />
          <p className="text-xs text-slate-500 font-medium">Sign in to save your watchlist</p>
          <p className="text-xs text-slate-400">Favorites sync across all your devices</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-6 text-center space-y-2">
          <Star size={22} className="mx-auto text-slate-200" />
          <p className="text-xs text-slate-500 font-medium">No favorites yet</p>
          <p className="text-xs text-slate-400">Click ⭐ on any stock to add it here</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {enriched.map((fav) => {
            const isGain = (fav.changePct ?? 0) >= 0;
            const isBeingRemoved = removing === fav.symbol;
            return (
              <div
                key={fav.id}
                onClick={() => fetchStockDetail(fav.symbol)}
                className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg
                  hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer group
                  transition-all duration-150
                  ${fav.direction === 'up'   ? 'animate-[flash-green_0.7s_ease-in-out]' : ''}
                  ${fav.direction === 'down' ? 'animate-[flash-red_0.7s_ease-in-out]'  : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                      {fav.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <span className="font-semibold text-xs">{fav.symbol}</span>
                  {fav.changePct != null && (
                    <span className={`text-xs font-medium transition-colors ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                      {isGain ? '+' : ''}{fav.changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {fav.price != null && (
                    <span className="text-xs font-mono font-medium">{fmt(fav.price)}</span>
                  )}
                  <button
                    onClick={(e) => handleRemove(e, fav)}
                    disabled={isBeingRemoved}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all p-0.5 disabled:opacity-60"
                    title="Remove from watchlist"
                  >
                    {isBeingRemoved
                      ? <Loader2 size={12} className="animate-spin" />
                      : <X size={12} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

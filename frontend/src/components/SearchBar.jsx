import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useStock } from '../context/StockContext';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, filteredStocks, stocks } = useStock();
  const inputRef = useRef(null);

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  // Press '/' anywhere to focus search
  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search symbol, name, or sector… (press / to focus)"
        className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {searchQuery ? (
          <>
            <span className="text-xs text-slate-400 tabular-nums">
              {filteredStocks.length}/{stocks.length}
            </span>
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <kbd className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">/</kbd>
        )}
      </div>
    </div>
  );
}

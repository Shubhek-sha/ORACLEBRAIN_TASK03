import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useStock } from '../context/StockContext';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, filteredStocks, stocks } = useStock();
  const inputRef = useRef(null);

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

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
        placeholder="Search symbol, name, or sector…"
        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={14} />
        </button>
      )}
      {searchQuery && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {filteredStocks.length}/{stocks.length}
        </div>
      )}
    </div>
  );
}

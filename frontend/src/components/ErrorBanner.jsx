import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useStock } from '../context/StockContext';

export default function ErrorBanner() {
  const { error, refresh } = useStock();
  if (!error) return null;

  return (
    <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm animate-fade-in">
      <AlertTriangle size={16} className="flex-shrink-0" />
      <span className="flex-1">
        <strong>API Error:</strong> {error}. Make sure the backend is running.
      </span>
      <button
        onClick={refresh}
        className="flex items-center gap-1.5 text-xs font-semibold hover:text-red-900 dark:hover:text-red-100 transition-colors"
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
}

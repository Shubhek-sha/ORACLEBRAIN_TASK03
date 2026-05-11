import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStock } from '../context/StockContext';

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(onRemove, 3000);
    return () => clearTimeout(t);
  }, [onRemove]);

  const styles = {
    success: 'bg-emerald-600 text-white',
    error:   'bg-red-600 text-white',
    info:    'bg-slate-700 text-white',
  };

  const Icon = toast.type === 'success' ? CheckCircle
             : toast.type === 'error'   ? XCircle
             : Info;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
      animate-toast-in min-w-[220px] max-w-xs ${styles[toast.type] ?? styles.info}`}>
      <Icon size={15} className="flex-shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onRemove}
        className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useStock();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

import React from 'react';

function Shimmer({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
  );
}

export function StockCardSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-2.5 w-24" />
      </div>
      <div className="text-right space-y-2">
        <Shimmer className="h-3 w-20 ml-auto" />
        <Shimmer className="h-5 w-14 ml-auto rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Shimmer className="h-3 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Shimmer className="h-3 w-28" />
      <Shimmer className="h-7 w-40" />
      <Shimmer className="h-4 w-20 rounded-full" />
    </div>
  );
}

export function ChartSkeleton({ height = 200 }) {
  return (
    <div className="card p-5">
      <Shimmer className="h-4 w-40 mb-4" />
      <Shimmer className={`w-full rounded-xl`} style={{ height }} />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Shimmer className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-3 w-32" />
        </div>
      </div>
      <Shimmer className="h-10 w-36" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-3 space-y-2">
            <Shimmer className="h-2.5 w-16" />
            <Shimmer className="h-4 w-20" />
          </div>
        ))}
      </div>
      <Shimmer className="h-28 w-full rounded-xl" />
    </div>
  );
}

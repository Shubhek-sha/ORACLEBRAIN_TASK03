import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useStock } from '../context/StockContext';
import { MetricCardSkeleton } from './LoadingSkeleton';

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    notation: 'compact', maximumFractionDigits: 2,
  }).format(n);
}

function MetricCard({ icon: Icon, label, value, badge, badgeGain, iconBg }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</p>
          <p className="price text-2xl font-bold mt-1.5 tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      {badge && (
        <div className="mt-3">
          <span className={badgeGain ? 'badge-gain' : 'badge-loss'}>
            {badgeGain ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}

export default function MetricCards() {
  const {
    loading,
    totalPortfolioValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPct,
    stocks,
  } = useStock();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <MetricCardSkeleton key={i} />)}
      </div>
    );
  }

  const gainers = stocks.filter((s) => s.changePct >= 0).length;
  const losers  = stocks.filter((s) => s.changePct < 0).length;
  const isGain  = totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={DollarSign}
        label="Portfolio Value"
        value={fmt(totalPortfolioValue)}
        badge={`${isGain ? '+' : ''}${Number(totalGainLossPct).toFixed(2)}% all time`}
        badgeGain={isGain}
        iconBg="bg-blue-500"
      />
      <MetricCard
        icon={isGain ? TrendingUp : TrendingDown}
        label="Total Gain / Loss"
        value={`${isGain ? '+' : ''}${fmt(totalGainLoss)}`}
        badge={`vs invested ${fmt(totalInvested)}`}
        badgeGain={isGain}
        iconBg={isGain ? 'bg-emerald-500' : 'bg-red-500'}
      />
      <MetricCard
        icon={TrendingUp}
        label="Today's Gainers"
        value={gainers}
        badge={`${gainers} of ${stocks.length} stocks`}
        badgeGain={true}
        iconBg="bg-emerald-500"
      />
      <MetricCard
        icon={TrendingDown}
        label="Today's Losers"
        value={losers}
        badge={`${losers} of ${stocks.length} stocks`}
        badgeGain={false}
        iconBg="bg-red-500"
      />
    </div>
  );
}

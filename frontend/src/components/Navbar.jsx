import React from 'react';
import { RefreshCw, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(n);
}

export default function Navbar() {
  const {
    totalPortfolioValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPct,
    lastUpdated,
    loading,
    socketConnected,
    refresh,
  } = useStock();
  const { user, logout } = useAuth();

  const isGain = totalGainLoss >= 0;

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : '--';

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'YS';

  return (
    <header className="text-white px-8 py-5" style={{ background: '#1B2537' }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Row 1: Title + User */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Investment Portfolio Dashboard
            </h1>
            {/* Live indicator */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold
              ${socketConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-600/40 text-slate-400 border border-slate-600/40'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 live-dot' : 'bg-slate-500'}`} />
              {socketConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="text-slate-400 hover:text-white transition-colors disabled:opacity-40 active:scale-90"
              title="Refresh data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm select-none">
              {initials}
            </div>
            <div className="text-sm leading-tight">
              <p className="text-slate-400 text-xs">Hello,</p>
              <p className="font-semibold">{user?.name ?? 'User'}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-700 active:scale-95"
              title="Sign out"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Row 2: Stats */}
        <div className="flex items-end gap-10 flex-wrap">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Your Portfolio</p>
            <p className="text-xl font-bold">{fmt(totalPortfolioValue)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Total Invested</p>
            <p className="text-xl font-bold">{fmt(totalInvested)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Today's Gain/Loss</p>
            <p className={`text-xl font-bold ${isGain ? 'text-green-400' : 'text-red-400'}`}>
              {isGain ? '+' : ''}{fmt(totalGainLoss)}&nbsp;
              <span className="text-base">({isGain ? '+' : ''}{totalGainLossPct}%)</span>
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Total Gain/Loss</p>
            <p className={`text-xl font-bold ${isGain ? 'text-green-400' : 'text-red-400'}`}>
              {isGain ? '+' : ''}{fmt(totalGainLoss)}
              <span className="text-base ml-1">({isGain ? '+' : ''}{totalGainLossPct}%)</span>
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-slate-400 text-xs mb-0.5">Last Updated</p>
            <p className="text-xs text-slate-300">{timeStr}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

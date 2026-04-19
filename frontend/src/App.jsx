import React from 'react';
import { StockProvider } from './context/StockContext';
import Navbar from './components/Navbar';
import PortfolioChart from './components/PortfolioChart';
import HoldingsTable from './components/HoldingsTable';
import TopMovers from './components/TopMovers';
import SectorChart from './components/SectorChart';
import ErrorBanner from './components/ErrorBanner';

function Dashboard() {
  return (
    <div className="min-h-screen" style={{ background: '#F3F4F6' }}>
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-6 py-6">
        <ErrorBanner />
        <div className="grid grid-cols-3 gap-5">
          {/* Left: chart + holdings */}
          <div className="col-span-2 space-y-5">
            <PortfolioChart />
            <HoldingsTable />
          </div>

          {/* Right: gainers + losers + sector */}
          <div className="col-span-1 space-y-4">
            <TopMovers />
            <SectorChart />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-200 mt-4">
        Data: Yahoo Finance &nbsp;|&nbsp; Design: Yash Sakhuja
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StockProvider>
      <Dashboard />
    </StockProvider>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { stocksApi } from '../services/api';

const StockContext = createContext(null);

const REFRESH_INTERVAL = 15000; // 15 seconds
const FAVORITES_KEY = 'stockpulse_favorites';

export function StockProvider({ children }) {
  const [stocks, setStocks]               = useState([]);
  const [portfolio, setPortfolio]         = useState([]);
  const [sectors, setSectors]             = useState([]);
  const [topGainers, setTopGainers]       = useState([]);
  const [topLosers, setTopLosers]         = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError]                 = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [darkMode, setDarkMode]           = useState(() => {
    return localStorage.getItem('stockpulse_theme') === 'dark';
  });
  const [favorites, setFavorites]         = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  });

  const prevPricesRef = useRef({});

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('stockpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('stockpulse_theme', 'light');
    }
  }, [darkMode]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const fetchStocks = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const [stocksRes, gainersRes, losersRes, portfolioRes, sectorsRes] =
        await Promise.all([
          stocksApi.getAll(),
          stocksApi.getTopGainers(),
          stocksApi.getTopLosers(),
          stocksApi.getPortfolio(),
          stocksApi.getSectors(),
        ]);

      setStocks((prev) => {
        // Track price direction for flash animation
        const prevMap = {};
        prev.forEach((s) => (prevMap[s.symbol] = s.price));
        prevPricesRef.current = prevMap;
        return stocksRes.data.map((s) => ({
          ...s,
          priceDirection:
            prevMap[s.symbol] == null
              ? null
              : s.price > prevMap[s.symbol]
              ? 'up'
              : s.price < prevMap[s.symbol]
              ? 'down'
              : null,
        }));
      });

      setTopGainers(gainersRes.data);
      setTopLosers(losersRes.data);
      setPortfolio(portfolioRes.data);
      setSectors(sectorsRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  const fetchStockDetail = useCallback(async (symbol) => {
    setDetailLoading(true);
    try {
      const res = await stocksApi.getBySymbol(symbol);
      setSelectedStock(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStocks(true);
  }, [fetchStocks]);

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(() => fetchStocks(false), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchStocks]);

  // Filtered stocks
  const filteredStocks = stocks.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.sector?.toLowerCase().includes(q)
    );
  });

  const toggleFavorite = (symbol) => {
    setFavorites((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const totalPortfolioValue = portfolio.reduce((acc, h) => acc + h.currentVal, 0);
  const totalInvested = portfolio.reduce((acc, h) => acc + h.invested, 0);
  const totalGainLoss = totalPortfolioValue - totalInvested;
  const totalGainLossPct =
    totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100).toFixed(2) : 0;

  return (
    <StockContext.Provider
      value={{
        stocks,
        filteredStocks,
        portfolio,
        sectors,
        topGainers,
        topLosers,
        selectedStock,
        searchQuery,
        loading,
        detailLoading,
        error,
        lastUpdated,
        darkMode,
        favorites,
        totalPortfolioValue,
        totalInvested,
        totalGainLoss,
        totalGainLossPct,
        setSearchQuery,
        setSelectedStock,
        fetchStockDetail,
        toggleFavorite,
        toggleDarkMode: () => setDarkMode((d) => !d),
        refresh: () => fetchStocks(false),
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error('useStock must be used inside StockProvider');
  return ctx;
};

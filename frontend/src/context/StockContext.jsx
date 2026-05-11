import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { stocksApi, favoritesApi } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [stocks, setStocks]               = useState([]);
  const [portfolio, setPortfolio]         = useState([]);
  const [sectors, setSectors]             = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError]                 = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [darkMode, setDarkMode]           = useState(() =>
    localStorage.getItem('stockpulse_theme') === 'dark'
  );
  const [favorites, setFavorites]         = useState([]);
  const [toasts, setToasts]               = useState([]);
  const toastId = useRef(0);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('stockpulse_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Toast management
  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Socket: live price pushes
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onStocksUpdate = (incoming) => {
      setStocks((prev) => {
        const prevMap = {};
        prev.forEach((s) => (prevMap[s.symbol] = s.price));
        return incoming.map((s) => ({
          ...s,
          priceDirection:
            prevMap[s.symbol] == null ? null
            : s.price > prevMap[s.symbol] ? 'up'
            : s.price < prevMap[s.symbol] ? 'down'
            : null,
        }));
      });
      setLastUpdated(new Date());
    };

    socket.on('connect',       onConnect);
    socket.on('disconnect',    onDisconnect);
    socket.on('stocks:update', onStocksUpdate);

    if (socket.connected) setSocketConnected(true);

    return () => {
      socket.off('connect',       onConnect);
      socket.off('disconnect',    onDisconnect);
      socket.off('stocks:update', onStocksUpdate);
    };
  }, []);

  // Sync favorites from API when auth state changes
  useEffect(() => {
    if (!isAuthenticated) { setFavorites([]); return; }
    favoritesApi.getAll()
      .then((res) => setFavorites(res.data))
      .catch(() => setFavorites([]));
  }, [isAuthenticated, user?.id]);

  const isFavorite = useCallback(
    (symbol) => favorites.some((f) => f.symbol === symbol),
    [favorites]
  );

  const toggleFavorite = useCallback(async (symbol, name) => {
    if (!isAuthenticated) return;
    const existing = favorites.find((f) => f.symbol === symbol);
    if (existing) {
      setFavorites((prev) => prev.filter((f) => f.symbol !== symbol));
      try {
        await favoritesApi.remove(existing.id);
        addToast(`${symbol} removed from watchlist`, 'info');
      } catch {
        setFavorites((prev) => [...prev, existing]);
        addToast('Failed to remove — try again', 'error');
      }
    } else {
      const temp = { id: '__temp__', symbol, name };
      setFavorites((prev) => [...prev, temp]);
      try {
        const res = await favoritesApi.add({ symbol, name });
        setFavorites((prev) => prev.map((f) => (f.id === '__temp__' ? res.data : f)));
        addToast(`${symbol} added to watchlist ⭐`, 'success');
      } catch (err) {
        setFavorites((prev) => prev.filter((f) => f.id !== '__temp__'));
        addToast(err.message || 'Failed to add — try again', 'error');
      }
    }
  }, [isAuthenticated, favorites, addToast]);

  // Initial data load — portfolio + sectors + seed stocks (socket takes over prices)
  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stocksRes, portfolioRes, sectorsRes] = await Promise.all([
        stocksApi.getAll(),
        stocksApi.getPortfolio(),
        stocksApi.getSectors(),
      ]);
      setStocks(stocksRes.data.map((s) => ({ ...s, priceDirection: null })));
      setPortfolio(portfolioRes.data);
      setSectors(sectorsRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

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

  // Derive gainers/losers live from socket-updated stocks
  const topGainers = useMemo(() =>
    [...stocks].sort((a, b) => b.changePct - a.changePct).slice(0, 5),
    [stocks]
  );

  const topLosers = useMemo(() =>
    [...stocks].sort((a, b) => a.changePct - b.changePct).slice(0, 5),
    [stocks]
  );

  const filteredStocks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return stocks;
    return stocks.filter((s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.sector?.toLowerCase().includes(q)
    );
  }, [stocks, searchQuery]);

  const totalPortfolioValue = useMemo(() =>
    portfolio.reduce((acc, h) => acc + h.currentVal, 0), [portfolio]
  );
  const totalInvested = useMemo(() =>
    portfolio.reduce((acc, h) => acc + h.invested, 0), [portfolio]
  );
  const totalGainLoss    = totalPortfolioValue - totalInvested;
  const totalGainLossPct = totalInvested > 0
    ? ((totalGainLoss / totalInvested) * 100).toFixed(2)
    : 0;

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
        isFavorite,
        socketConnected,
        toasts,
        totalPortfolioValue,
        totalInvested,
        totalGainLoss,
        totalGainLossPct,
        setSearchQuery,
        setSelectedStock,
        fetchStockDetail,
        toggleFavorite,
        addToast,
        removeToast,
        toggleDarkMode: () => setDarkMode((d) => !d),
        refresh: fetchInitial,
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

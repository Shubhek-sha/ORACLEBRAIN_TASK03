import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => config);

// Response interceptor — unwrap data
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const stocksApi = {
  getAll:           () => api.get('/stocks'),
  getBySymbol:      (symbol) => api.get(`/stocks/${symbol}`),
  getTopGainers:    () => api.get('/stocks/top/gainers'),
  getTopLosers:     () => api.get('/stocks/top/losers'),
  getPortfolio:     () => api.get('/stocks/portfolio'),
  getSectors:       () => api.get('/stocks/sectors'),
};

export default api;

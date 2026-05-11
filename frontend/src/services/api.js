import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// Module-level token — set by AuthContext after login/refresh
let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};

// Attach bearer token to every request
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// Auto-refresh on 401 TOKEN_EXPIRED, then retry the original request
api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const original = err.config;
    if (
      err.response?.status === 401 &&
      err.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;
      try {
        const rt = localStorage.getItem('sp_refresh');
        // Use raw axios (not api instance) to avoid infinite loop through this interceptor
        const { data: body } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: rt });
        const { accessToken, refreshToken } = body.data;
        localStorage.setItem('sp_refresh', refreshToken);
        setAccessToken(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('sp_refresh');
        localStorage.removeItem('sp_user');
        setAccessToken(null);
        window.location.reload();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }
    const message = err.response?.data?.message || err.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const stocksApi = {
  getAll:        () => api.get('/stocks'),
  getBySymbol:   (symbol) => api.get(`/stocks/${symbol}`),
  getTopGainers: () => api.get('/stocks/top/gainers'),
  getTopLosers:  () => api.get('/stocks/top/losers'),
  getPortfolio:  () => api.get('/stocks/portfolio'),
  getSectors:    () => api.get('/stocks/sectors'),
};

export const authApi = {
  signup:  (data) => api.post('/auth/signup', data),
  login:   (data) => api.post('/auth/login', data),
  refresh: (data) => api.post('/auth/refresh', data),
  logout:  ()     => api.post('/auth/logout'),
  profile: ()     => api.get('/auth/profile'),
};

export const favoritesApi = {
  getAll: ()     => api.get('/favorites'),
  add:    (data) => api.post('/favorites', data),
  remove: (id)   => api.delete(`/favorites/${id}`),
};

export default api;

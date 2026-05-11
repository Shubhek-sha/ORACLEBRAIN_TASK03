import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAccessToken as setAxiosToken } from '../services/api';

const AuthContext = createContext(null);

const REFRESH_KEY = 'sp_refresh';
const USER_KEY    = 'sp_user';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [ready, setReady] = useState(false);

  const commit = (tokens, userData) => {
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setAxiosToken(tokens.accessToken);
    setUser(userData);
  };

  const clear = () => {
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setAxiosToken(null);
    setUser(null);
  };

  // On mount: silently restore session from stored refresh token
  useEffect(() => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) { setReady(true); return; }

    authApi.refresh({ refreshToken: rt })
      .then((res) => {
        const savedUser = JSON.parse(localStorage.getItem(USER_KEY));
        commit(res.data, savedUser || res.data.user);
      })
      .catch(clear)
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    commit(res.data, res.data.user);
  };

  const signup = async (name, email, password) => {
    const res = await authApi.signup({ name, email, password });
    commit(res.data, res.data.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clear();
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1923' }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

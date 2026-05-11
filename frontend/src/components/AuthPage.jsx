import React, { useState } from 'react';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0F1923' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <TrendingUp size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white text-xl font-bold tracking-tight leading-none">StockPulse</p>
          <p className="text-slate-500 text-xs mt-0.5">Investment Portfolio Dashboard</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl p-8 shadow-2xl" style={{ background: '#1B2537' }}>
        <h2 className="text-white text-xl font-semibold mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {mode === 'login'
            ? 'Sign in to access your portfolio'
            : 'Start tracking your investments today'}
        </p>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1.5">Full Name</label>
              <input
                name="name"
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 border border-slate-700 bg-slate-800/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 border border-slate-700 bg-slate-800/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder={mode === 'signup' ? 'Minimum 8 characters' : '••••••••'}
                className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder-slate-500 border border-slate-700 bg-slate-800/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Please wait…
              </span>
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-5">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>

      <p className="text-slate-700 text-xs mt-6">© 2024 StockPulse</p>
    </div>
  );
}

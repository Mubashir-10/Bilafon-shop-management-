// frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';

const friendlyError = (err) =>
  err.response?.status === 401
    ? 'Email ya password galat hai. Meharbani karke dobara check karein.'
    : getErrorMessage(err, 'Login nahi ho saka. Dobara koshish karein.');

export default function Login({ onLogin }) {
  // Auto-fill hatane ke liye initial email aur password blank rakhe hain:
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await authService.login(loginForm.email.trim(), loginForm.password);
      onLogin(data);
    } catch (err) {
      setError(friendlyError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Bilafon Mobile Shop</h1>
          <p className="text-slate-400 text-sm mt-1">Management & Billing Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="Email address likhein"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password likhein"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-sm pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-cyan-600/20 transition duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In to Shop Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Internal Shop Management System • Bilafon Mobile
        </p>
      </div>
    </div>
  );
}
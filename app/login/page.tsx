'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, KeyRound, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Successful login -> redirect to destination
        router.push(from);
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Invalid credentials. Access denied.');
        triggerShake();
      }
    } catch (err: any) {
      setErrorMessage('Network error during authentication. Please retry.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0a0d] text-zinc-100 font-sans relative overflow-hidden selection:bg-[#ff5a1f]/30 selection:text-[#ff5a1f]">
      {/* Background glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#ff5a1f]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div
        className={`w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative transition-all ${
          isShake ? 'animate-bounce' : ''
        }`}
        style={{
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#ff5a1f] shadow-lg shadow-[#ff5a1f]/10 mb-3">
            <Lock className="w-7 h-7" />
          </div>

          <div
            className="text-[10px] font-semibold uppercase tracking-[0.4em] text-neutral-500 mb-1"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            Controlled System Gate
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            THE <span className="text-[#ff5a1f]">DROP</span>
          </h1>

          <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
            Authorized access only. Enter your approved credentials to access clipboard rooms and synchronization.
          </p>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-sm font-medium tracking-[0.02em] focus:outline-none focus:border-[#ff5a1f]/70 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-sm font-medium tracking-[0.02em] focus:outline-none focus:border-[#ff5a1f]/70 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-5 rounded-xl bg-[#ff5a1f] hover:bg-[#ff6d36] text-white text-sm font-bold tracking-[0.02em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a1f]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            <span>{isLoading ? 'Verifying...' : 'Log In to System'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

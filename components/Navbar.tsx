'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  LogOut,
  LayoutGrid,
  Github,
  ChevronDown,
  ClipboardCopy,
  MessageSquare,
} from 'lucide-react';

interface NavbarProps {
  currentRoom?: string;
  onOpenQR?: () => void;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoom, onOpenQR, isSyncing }) => {
  const [authUser, setAuthUser] = useState<{ username: string; role: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch logged in session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setAuthUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNew = async () => {
    try {
      const res = await fetch('/api/clip', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data?.slug) {
        router.push(`/clip/${data.data.slug}`);
      }
    } catch (e) {
      const fallback = `clip-${Math.random().toString(36).substring(2, 8)}`;
      router.push(`/clip/${fallback}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/75 backdrop-blur-xl text-zinc-100 select-none transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Brand Wordmark (Matching Login Page & Brand Reference) */}
        <Link href="/" className="flex items-center shrink-0 group">
          <span
            className="text-lg sm:text-xl font-black uppercase tracking-wider text-white group-hover:opacity-95 transition-opacity"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            THE <span className="text-[#ff5a1f] drop-shadow-[0_0_12px_rgba(255,90,31,0.4)]">DROP</span>
          </span>
        </Link>

        {/* Center: Floating Modern Glassmorphism Nav Pill containing [ Home | New Room | Dashboard | AKAZA | GitHub ] */}
        <nav
          className="hidden md:flex items-center gap-5 lg:gap-6 px-6 py-2 rounded-full bg-zinc-950/80 border border-zinc-800/90 text-xs sm:text-[13px] text-zinc-400 font-medium tracking-wide relative shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>

          <button
            onClick={handleCreateNew}
            className="hover:text-white transition-colors cursor-pointer"
          >
            New Room
          </button>

          {/* Dashboard Direct Link */}
          <Link
            href="/dashboard"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Dashboard</span>
            {currentRoom && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </Link>

          {/* AKAZA inside navbar */}
          <Link
            href="https://ai-code-navigator.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center hover:opacity-90 transition-opacity"
            title="AKAZA AI Code Navigator"
          >
            <img
              src="/akaza-logo.png"
              alt="AKAZA"
              className="h-4 sm:h-4.5 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
            />
          </Link>

          {/* GitHub inside navbar */}
          <Link
            href="https://github.com/kruth-s/The-Drop"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </Link>
        </nav>

        {/* Right Action Container: User Profile or Login */}
        <div className="flex items-center shrink-0">
          {authUser ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Direct Dashboard Quick Access Pill */}
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-[#ff5a1f]/50 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm group"
                title="Open Mission Control Dashboard"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#ff5a1f] group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </Link>

              {/* User Profile Pill with Interactive Dropdown Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-2 px-2.5 py-1 sm:py-1.5 rounded-full bg-zinc-950/90 hover:bg-zinc-900 border ${
                    userMenuOpen ? 'border-zinc-700 bg-zinc-900 shadow-lg' : 'border-zinc-800'
                  } text-zinc-200 text-xs font-medium transition-all cursor-pointer`}
                >
                  {/* User Avatar with Status Indicator */}
                  <div className="relative shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-[11px] font-bold text-white uppercase">
                      {authUser.username.charAt(0) || 'U'}
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-black" />
                  </div>

                  <span className="font-semibold text-zinc-100 max-w-[80px] sm:max-w-[110px] truncate">
                    {authUser.username}
                  </span>

                  {authUser.role === 'admin' && (
                    <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 uppercase">
                      Admin
                    </span>
                  )}

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Floating Glassmorphic User Profile Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0c0d13]/95 border border-zinc-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Header Summary */}
                    <div className="px-3 py-2.5 border-b border-zinc-800/70 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff5a1f]/20 to-zinc-900 border border-[#ff5a1f]/40 flex items-center justify-center text-sm font-black text-[#ff5a1f] uppercase shrink-0">
                          {authUser.username.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white truncate">
                            {authUser.username}
                          </span>
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="capitalize">{authUser.role} Account</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-0.5 py-1 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4 text-[#ff5a1f]" />
                        <span>Mission Control Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard/clipboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-colors"
                      >
                        <ClipboardCopy className="w-4 h-4 text-zinc-400" />
                        <span>Smart Clipboard</span>
                      </Link>

                      <Link
                        href="/dashboard/chat"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-zinc-400" />
                        <span>Chat Workspace (#AKA)</span>
                      </Link>

                      {authUser.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors border border-amber-500/20 my-0.5"
                        >
                          <Shield className="w-4 h-4 text-amber-400" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout Action */}
                    <div className="border-t border-zinc-800/70 pt-1 mt-1">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await fetch('/api/auth/logout', { method: 'POST' });
                          setAuthUser(null);
                          router.push('/login');
                          router.refresh();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          <span>Log Out Session</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_2px_14px_rgba(255,255,255,0.18)] hover:scale-105 active:scale-95"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

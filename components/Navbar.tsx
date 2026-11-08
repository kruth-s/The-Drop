'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Plus,
  ArrowRight,
  Home,
  Clock,
  QrCode,
  Shield,
  FolderKanban,
  Search,
  LogOut,
  LayoutGrid,
  Github,
} from 'lucide-react';

interface NavbarProps {
  currentRoom?: string;
  onOpenQR?: () => void;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoom, onOpenQR, isSyncing }) => {
  const [joinSlug, setJoinSlug] = useState('');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [authUser, setAuthUser] = useState<{ username: string; role: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Read recent rooms for dashboard dropdown
  useEffect(() => {
    try {
      const saved = localStorage.getItem('the_drop_recent_rooms') || localStorage.getItem('clipbin_recent_rooms');
      if (saved) {
        setRecentRooms(JSON.parse(saved));
      }
    } catch (e) { }
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDashboardOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinSlug.trim()) return;
    const clean = joinSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    router.push(`/clip/${clean}`);
    setJoinSlug('');
    setIsDashboardOpen(false);
  };

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

        {/* Center: Floating Modern Glassmorphism Nav Pill */}
        <nav
          ref={dropdownRef}
          className="hidden md:flex items-center gap-6 lg:gap-7 px-6 py-2 rounded-full bg-zinc-950/80 border border-zinc-800/90 text-xs sm:text-[13px] text-zinc-400 font-medium tracking-wide relative shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
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

          <Link
            href="https://ai-code-navigator.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            AKAZA
          </Link>

          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </Link>
        </nav>


        {/* Right Action container */}
        <div className="flex items-center gap-2 shrink-0">

          {authUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-full bg-[#ff5a1f]/15 hover:bg-[#ff5a1f]/25 border border-[#ff5a1f]/40 text-[#ff7a45] hover:text-[#ff9266] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Open Mission Control Dashboard"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#ff5a1f]" />
                <span>Dashboard</span>
              </Link>

              {authUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Admin Access Control Panel"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide shadow-md">
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{authUser.username}</span>
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setAuthUser(null);
                    router.push('/login');
                    router.refresh();
                  }}
                  title="Log Out"
                  className="text-zinc-500 hover:text-red-400 transition-colors ml-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="md:hidden px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#ff5a1f]" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_2px_14px_rgba(255,255,255,0.18)] hover:scale-105 active:scale-95"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

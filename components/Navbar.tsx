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
    <header className="sticky top-0 z-50 w-full bg-black text-zinc-100 select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Brand Logo & Wordmark (Hollow ring circle + text, matching reference image) */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white group-hover:border-[#ff5a1f] transition-colors flex items-center justify-center shrink-0" />
          <span className="font-extrabold tracking-wider text-sm sm:text-base text-white group-hover:text-zinc-200 transition-colors uppercase">
            THE DROP
          </span>
        </Link>

        {/* Center: Floating Unified Dark Pill */}
        <nav
          ref={dropdownRef}
          className="hidden md:flex items-center gap-6 lg:gap-7 px-6 py-2 rounded-full bg-[#121316] border border-zinc-800/90 text-xs sm:text-sm text-zinc-400 font-medium relative shadow-inner"
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

          {/* Dashboard menu trigger */}
          <div className="relative">
            <button
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Dashboard</span>
              {currentRoom && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              )}
            </button>

            {/* Dashboard Dropdown */}
            {isDashboardOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#0c0f17] border border-zinc-800 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                <div className="flex items-center justify-between px-1 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-[#ff5a1f]" />
                    Project Rooms
                  </span>
                </div>

                {/* Quick Jump Input */}
                <form onSubmit={handleJoin} className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Switch room code..."
                    value={joinSlug}
                    onChange={(e) => setJoinSlug(e.target.value)}
                    className="w-full py-1.5 pl-8 pr-7 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#ff5a1f] font-mono"
                  />
                  <button type="submit" className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-200">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Home & Recent Rooms */}
                <div className="flex flex-col gap-1 border-t border-zinc-900 pt-2">
                  <Link
                    href="/"
                    onClick={() => setIsDashboardOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-900 flex items-center gap-2 transition-colors"
                  >
                    <Home className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Home Workspace</span>
                  </Link>

                  {recentRooms.length > 0 && (
                    <div className="mt-1">
                      <span className="px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        Recent Rooms
                      </span>
                      <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
                        {recentRooms.map((room) => (
                          <button
                            key={room}
                            onClick={() => {
                              router.push(`/clip/${room}`);
                              setIsDashboardOpen(false);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs text-left font-mono flex items-center justify-between transition-colors ${
                              currentRoom === room
                                ? 'bg-[#ff5a1f]/15 text-[#ff7a45] font-semibold border border-[#ff5a1f]/30'
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                            }`}
                          >
                            <span className="truncate">{room}</span>
                            {currentRoom === room && <span className="text-[10px] text-[#ff5a1f] font-sans">Active</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    handleCreateNew();
                    setIsDashboardOpen(false);
                  }}
                  className="w-full py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ff5a1f]" />
                  <span>Create New Room</span>
                </button>
              </div>
            )}
          </div>

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
              {authUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                  title="Admin Access Control Panel"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <div className="flex items-center gap-2 bg-white text-black rounded-full px-4 py-1.5 text-xs font-bold tracking-tight shadow-md">
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{authUser.username}</span>
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setAuthUser(null);
                    router.push('/login');
                    router.refresh();
                  }}
                  title="Log Out"
                  className="text-zinc-600 hover:text-red-600 transition-colors ml-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm tracking-tight transition-all shadow-md active:scale-95"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

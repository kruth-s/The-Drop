'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  ClipboardCopy,
  MessageSquare,
  GraduationCap,
  HardDrive,
  LogOut,
  Home,
  Shield,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  ChevronRight,
  PenTool,
} from 'lucide-react';

interface AuthUser {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  allowedRooms: string[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verify authentication once on mount. Never re-trigger or kick the user out on tab switches.
  useEffect(() => {
    let isMounted = true;

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/login?from=' + encodeURIComponent(window.location.pathname));
        }
      })
      .catch(() => {
        // If fetch fails transiently, keep user on current screen if possible
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      router.push('/login');
    }
  };

  const navItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutGrid,
      exact: true,
      tag: 'Hub',
      badgeColor: 'bg-zinc-800 text-zinc-300',
    },
    {
      name: 'Smart Clipboard',
      href: '/dashboard/clipboard',
      icon: ClipboardCopy,
      tag: 'Sync',
      badgeColor: 'bg-orange-500/10 text-[#ff7a45] border border-orange-500/20',
    },
    {
      name: 'Real-Time Chat',
      href: '/dashboard/chat',
      icon: MessageSquare,
      tag: 'Redis',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    {
      name: 'UniVault Hub',
      href: '/dashboard/univault',
      icon: GraduationCap,
      tag: 'AI / Vector',
      badgeColor: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    },
    {
      name: 'ShareSphere dApp',
      href: '/dashboard/sharesphere',
      icon: HardDrive,
      tag: 'IPFS / Web3',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      name: 'TextEnd AI Suite',
      href: '/dashboard/textend',
      icon: PenTool,
      tag: 'Autonomous AI',
      badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#08090d] text-zinc-200 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#ff5a1f]/10 border border-[#ff5a1f]/30 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-[#ff5a1f]" />
        </div>
        <p className="mt-4 text-xs font-mono uppercase tracking-wider text-zinc-500">
          Authenticating Drop Ecosystem...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#08090d] text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-[#ff5a1f]/30 selection:text-[#ff5a1f]">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0c0d13]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-lg font-black tracking-wider text-white"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            THE <span className="text-[#ff5a1f]">DROP</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
            Console
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Persistent Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-0 z-50 flex flex-col bg-[#0a0b10] p-6' : 'hidden'
        } md:flex md:w-72 md:shrink-0 md:flex-col md:sticky md:top-0 md:h-screen bg-[#0a0b10] border-r border-zinc-800/60 p-5 justify-between`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand & Platform Identifier */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
            <Link href="/" className="group flex flex-col">
              <span
                className="text-xl font-black tracking-wider text-white group-hover:opacity-95 transition-opacity"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                THE <span className="text-[#ff5a1f] drop-shadow-[0_0_12px_rgba(255,90,31,0.5)]">DROP</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                Ecosystem Mission Control
              </span>
            </Link>
            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Context Pill */}
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1.5">
              <span>ACTIVE SESSION</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#ff5a1f]/15 border border-[#ff5a1f]/30 flex items-center justify-center text-xs font-bold text-[#ff5a1f] uppercase">
                  {user?.username.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
                    {user?.username}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 capitalize">
                    {user?.role} Access
                  </span>
                </div>
              </div>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-3 py-1">
              Platforms & Modules
            </div>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 text-white shadow-lg border border-zinc-700/70 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#ff5a1f]' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800/60">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-zinc-500" />
              <span>Landing Page</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Log Out Session</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col bg-[#08090d] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}


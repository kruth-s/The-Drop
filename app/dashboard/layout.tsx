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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('the_drop_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (e) {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('the_drop_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

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
    },
    {
      name: 'Smart Clipboard',
      href: '/dashboard/clipboard',
      icon: ClipboardCopy,
    },
    {
      name: 'Real-Time Chat',
      href: '/dashboard/chat',
      icon: MessageSquare,
    },
    {
      name: 'Knowledge Hub',
      href: '/dashboard/univault',
      icon: GraduationCap,
    },
    {
      name: 'IPFS Locker',
      href: '/dashboard/sharesphere',
      icon: HardDrive,
    },
    {
      name: 'TextEnd',
      href: '/dashboard/textend',
      icon: PenTool,
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
    <div className="h-screen w-full bg-[#08090d] text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-[#ff5a1f]/30 selection:text-[#ff5a1f] overflow-hidden">
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

      {/* Persistent Collapsible Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-0 z-50 flex flex-col bg-[#0a0b10] p-6' : 'hidden'
        } md:flex ${
          isCollapsed ? 'md:w-16 p-2.5' : 'md:w-[216px] p-3.5'
        } md:shrink-0 md:flex-col md:sticky md:top-0 md:h-screen bg-[#0a0b10] border-r border-zinc-800/60 justify-between transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col gap-4">
          {/* Brand & Platform Identifier + Desktop Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} pb-3 border-b border-zinc-800/60`}>
            {!isCollapsed ? (
              <Link href="/" className="group flex flex-col">
                <span
                  className="text-lg font-black tracking-wider text-white group-hover:opacity-95 transition-opacity"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  THE <span className="text-[#ff5a1f] drop-shadow-[0_0_12px_rgba(255,90,31,0.5)]">DROP</span>
                </span>
              </Link>
            ) : (
              <Link href="/" className="group flex items-center justify-center p-1" title="THE DROP">
                <span
                  className="text-xs sm:text-[13px] font-black tracking-wider text-[#ff5a1f] drop-shadow-[0_0_12px_rgba(255,90,31,0.5)] uppercase"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  DROP
                </span>
              </Link>
            )}

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#ff5a1f]" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Account Profile Card */}
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/70 transition-colors">
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 uppercase">
                  {user?.username.charAt(0) || 'U'}
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0a0b10]" />
              </div>
              <div className="flex flex-col min-w-0 flex-1 leading-tight">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-zinc-100 truncate">
                    {user?.username}
                  </span>
                  {user?.role === 'admin' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      User
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {user?.role === 'admin' ? 'Workspace Admin' : 'Active Account'}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="hidden md:flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/70 relative cursor-pointer hover:border-zinc-700 transition-colors"
              title={`${user?.username} (${user?.role})`}
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 uppercase relative">
                {user?.username.charAt(0) || 'U'}
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-[#0a0b10]" />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {!isCollapsed && (
              <div className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 px-2.5 py-1">
                Platforms & Modules
              </div>
            )}
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.name}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
                  } rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 text-white shadow-lg border border-zinc-700/70 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'gap-2.5'}`}>
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#ff5a1f]' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`flex flex-col gap-2 pt-3 border-t border-zinc-800/60 ${isCollapsed ? 'items-center' : ''}`}>
          <button
            onClick={handleLogout}
            title="Log Out Session"
            className={`flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            } rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer w-full`}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-2'}`}>
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>Log Out Session</span>}
            </div>
            {!isCollapsed && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col bg-[#08090d] h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}


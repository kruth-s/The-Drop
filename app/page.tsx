'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import dynamicModule from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast, ToastMessage } from '@/components/Toast';
import { Navbar } from '@/components/Navbar';
import {
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';

// Dynamic import with SSR disabled for Three.js Canvas
const GlobeScene = dynamicModule(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-56 h-56 rounded-full border border-zinc-800 bg-zinc-950/40 animate-pulse flex items-center justify-center">
        <span className="text-xs font-mono text-zinc-600">Loading 3D Globe...</span>
      </div>
    </div>
  ),
});

function HomeContent() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const room = searchParams.get('room');
    if (error === 'no_room_access') {
      addToast(`Access Restricted: Your account does not have permission for room '/${room}'. Ask Admin for access.`, 'error');
    } else if (error === 'forbidden') {
      addToast('Access Denied: Administrator role required.', 'error');
    }
  }, [searchParams]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-black text-zinc-100 font-sans selection:bg-[#ff5a1f]/30 selection:text-[#ff5a1f] relative">
      <Navbar />

      {/* Cloudflare-style Globe Hero Section */}
      <section className="relative z-10 flex-1 min-h-[calc(100dvh-56px)] sm:min-h-[calc(100vh-80px)] w-full max-w-[100vw] overflow-hidden flex flex-col items-center justify-center pt-1 sm:pt-4 pb-6 sm:pb-8">
        {/* Hero Content Wrapper containing Headline + 3D Globe */}
        <div className="relative w-full max-w-6xl min-h-[520px] sm:min-h-[640px] flex flex-col items-center text-center px-2 pt-1 sm:pt-2">
          {/* Small brand statement */}
          <div
            className="relative z-30 mb-1 sm:mb-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-neutral-400 sm:text-xs"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            In The Night
          </div>

          {/* Main headline */}
          <h1
            className="relative z-30 font-black uppercase leading-[0.88] tracking-[-0.035em] max-w-full pointer-events-none"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            <span className="block text-[clamp(3.1rem,11.5vw,7.5rem)] text-white">DROP</span>

            <span className="relative z-10 block text-[clamp(3.4rem,12.5vw,8.5rem)] text-[#ff5a1f]">
              THE
            </span>

            <span className="relative z-20 block text-[clamp(2.6rem,10.2vw,9.5rem)] text-white">
              UNIVERSE
            </span>
          </h1>

          {/* Small supporting line */}
          <p className="relative z-30 pointer-events-none mt-2 sm:mt-7 max-w-md text-xs leading-snug sm:leading-5 text-neutral-500 sm:text-base">
            One room. Every device.
            <span className="text-neutral-300"> Everything in sync.</span>
          </p>

          {/* Direct Ecosystem Dashboard Launch Pill */}
          <div className="relative z-30 mt-3 sm:mt-5 pointer-events-auto">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-700/80 hover:border-[#ff5a1f]/60 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl group hover:scale-105 active:scale-95"
            >
              <LayoutGrid className="w-4 h-4 text-[#ff5a1f] group-hover:scale-110 transition-transform" />
              <span>Enter Ecosystem Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#ff5a1f] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* 3D Dotted Rotating & Draggable Globe Canvas */}
          <div className="absolute left-1/2 top-[-70px] sm:top-[-60px] lg:top-[-50px] h-[520px] sm:h-[680px] lg:h-[760px] w-full max-w-[1200px] -translate-x-1/2 pointer-events-auto z-10 overflow-visible">
            <GlobeScene />
          </div>
        </div>
      </section>

      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#ff5a1f] border-t-transparent animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

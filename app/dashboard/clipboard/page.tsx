'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardCopy,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Shield,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Flame,
  Layers,
} from 'lucide-react';

export default function DashboardClipboardPage() {
  const router = useRouter();
  const [customRoom, setCustomRoom] = useState('');
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [scratchpad, setScratchpad] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('the_drop_recent_rooms') || localStorage.getItem('clipbin_recent_rooms');
      if (saved) {
        setRecentRooms(JSON.parse(saved));
      }
      const savedPad = localStorage.getItem('the_drop_dashboard_scratchpad');
      if (savedPad) {
        setScratchpad(savedPad);
      }
    } catch (e) {}
  }, []);

  const handleCreateAuto = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/clip', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data?.slug) {
        router.push(`/clip/${data.data.slug}`);
      } else {
        router.push(`/clip/room-${Math.random().toString(36).substring(2, 7)}`);
      }
    } catch (e) {
      router.push(`/clip/room-${Math.random().toString(36).substring(2, 7)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoom.trim()) return;
    const clean = customRoom.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    router.push(`/clip/${clean}`);
  };

  const handleSaveScratchpad = (text: string) => {
    setScratchpad(text);
    try {
      localStorage.setItem('the_drop_dashboard_scratchpad', text);
    } catch (e) {}
  };

  const handleCopyScratchpad = () => {
    navigator.clipboard.writeText(scratchpad);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCopy className="w-5 h-5 text-[#ff5a1f]" />
            <h1
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              The Drop <span className="text-[#ff5a1f]">Clipboard</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Zero-friction cross-device clipboard synchronization. Synchronize text, code, and links in real-time.
          </p>
        </div>

        <button
          onClick={handleCreateAuto}
          disabled={isCreating}
          className="px-5 py-2.5 rounded-xl bg-[#ff5a1f] hover:bg-[#ff7a45] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff5a1f]/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Creating Room...' : 'New Instant Room'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Room Launcher & Scratchpad */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Custom Room Card */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff5a1f]" />
                Join or Create Custom Room
              </span>
              <span className="text-[11px] font-mono text-zinc-500">Instant Activation</span>
            </div>

            <form onSubmit={handleJoinCustom} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. dev-sprint, team-notes, lab-402..."
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#ff5a1f]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Launch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Scratchpad Buffer */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">Local Quick Buffer</span>
                <p className="text-[11px] text-zinc-500">
                  Temporary scratchpad stored locally on this machine. Ready to copy into any room.
                </p>
              </div>

              <button
                onClick={handleCopyScratchpad}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Buffer'}</span>
              </button>
            </div>

            <textarea
              rows={7}
              placeholder="Paste code snippets, SSH keys, or quick links here..."
              value={scratchpad}
              onChange={(e) => handleSaveScratchpad(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#ff5a1f] resize-none"
            />
          </div>
        </div>

        {/* Right Column: Recent Rooms & AKAZA Private Vault Banner */}
        <div className="flex flex-col gap-6">
          {/* Recent Rooms Card */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ff5a1f]" />
                Recent Rooms
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{recentRooms.length} Cached</span>
            </div>

            {recentRooms.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">
                No recent rooms yet. Create or join one to see it here!
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                {recentRooms.map((slug) => (
                  <Link
                    key={slug}
                    href={`/clip/${slug}`}
                    className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-between transition-all group"
                  >
                    <span className="truncate max-w-[170px]">{slug}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#ff5a1f] transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AKAZA Anime Security Vault Portal */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120a15] to-[#1a0c10] border border-pink-900/40 shadow-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-pink-400">
              <Flame className="w-4 h-4 text-pink-500" />
              <span className="text-xs font-bold tracking-wider font-mono uppercase">
                Akaza Private Room Lock
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlock room passwords and enter encrypted private rooms guarded by Akaza’s Destructive Death compass needle lock.
            </p>
            <Link
              href="https://ai-code-navigator.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="mt-2 py-2 px-4 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-semibold flex items-center justify-between transition-all"
            >
              <span>Explore Akaza Engine</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


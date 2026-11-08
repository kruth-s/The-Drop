'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardCopy,
  MessageSquare,
  GraduationCap,
  HardDrive,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  Send,
  Database,
  ExternalLink,
  Cpu,
  PenTool,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [quickRoomCode, setQuickRoomCode] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    try {
      const saved = localStorage.getItem('the_drop_recent_rooms') || localStorage.getItem('clipbin_recent_rooms');
      if (saved) {
        setRecentRooms(JSON.parse(saved).slice(0, 4));
      }
    } catch (e) {}
  }, []);

  const handleCreateRoom = async () => {
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
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRoomCode.trim()) return;
    const clean = quickRoomCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    router.push(`/clip/${clean}`);
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Top Welcome & Mission Control Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-900/90 via-[#0d1017]/90 to-zinc-900/80 border border-zinc-800/80 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff5a1f]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#ff5a1f]/15 border border-[#ff5a1f]/30 text-[#ff7a45] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                CENTRAL HUB ACTIVATED
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                REDIS CLUSTER READY
              </span>
            </div>

            <h1
              className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              Welcome Back,{' '}
              <span className="text-[#ff5a1f]">{user?.username || 'Commander'}</span>
            </h1>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Your unified workspace seamlessly links real-time cross-device clipboard synchronization,
              low-latency team communication, AI-driven academic discovery, and Web3 decentralized IPFS file storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateRoom}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 text-[#ff5a1f]" />
              <span>Instant Room</span>
            </button>

            <Link
              href="/dashboard/chat"
              className="px-5 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/80 text-white font-medium text-xs flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-rose-400" />
              <span>Open Chat</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-zinc-800/60">
          <div className="flex flex-col p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
              <ClipboardCopy className="w-3.5 h-3.5 text-[#ff5a1f]" />
              Smart Clipboard
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">Real-Time</span>
            <span className="text-[11px] text-zinc-400 mt-0.5">Zero-account cross-device sync</span>
          </div>

          <div className="flex flex-col p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              Redis Team Chat
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">3 Channels</span>
            <span className="text-[11px] text-zinc-400 mt-0.5">Group + 1-on-1 direct channels</span>
          </div>

          <div className="flex flex-col p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
              UniVault Library
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">5+ Curated</span>
            <span className="text-[11px] text-zinc-400 mt-0.5">Semantic search & requests</span>
          </div>

          <div className="flex flex-col p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              ShareSphere IPFS
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">MetaMask Web3</span>
            <span className="text-[11px] text-zinc-400 mt-0.5">AES-256 client encryption</span>
          </div>
        </div>
      </div>

      {/* The 4 Core Integrated Pillars */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#ff5a1f]" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Integrated Ecosystem Pillars
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">4 ACTIVE MODULES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Smart Clipboard Card */}
          <div className="group relative rounded-2xl p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 hover:border-orange-500/40 transition-all flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#ff5a1f]/15 border border-[#ff5a1f]/30 flex items-center justify-center text-[#ff5a1f]">
                  <ClipboardCopy className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-orange-500/10 text-[#ff7a45] border border-orange-500/20">
                  REDIS ENGINE
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a45] transition-colors">
                  The Drop Clipboard
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Real-time cross-device text & code snippet synchronization. Featuring ephemeral room generation,
                  markdown live rendering, QR device pairing, and the private AKAZA anime security vault.
                </p>
              </div>

              {/* Quick Jump Input */}
              <form onSubmit={handleJoinRoom} className="mt-2 relative">
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. lab-sync)..."
                  value={quickRoomCode}
                  onChange={(e) => setQuickRoomCode(e.target.value)}
                  className="w-full py-2 pl-3 pr-20 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#ff5a1f]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-[#ff5a1f] hover:bg-[#ff7a45] text-white text-[11px] font-bold transition-colors"
                >
                  Join
                </button>
              </form>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link
                href="/dashboard/clipboard"
                className="text-xs font-semibold text-[#ff7a45] hover:text-[#ff9266] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Clipboard Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleCreateRoom}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                + New Auto-Room
              </button>
            </div>
          </div>

          {/* 2. Real-Time Team Chat Card */}
          <div className="group relative rounded-2xl p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 hover:border-rose-500/40 transition-all flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  TEAM PUBSUB
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
                  Real-Time Team Chat
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  High-speed team communication built on top of Redis streams. Supports group channels
                  (<code className="text-zinc-300">#general</code>, <code className="text-zinc-300">#research</code>, <code className="text-zinc-300">#dev-team</code>)
                  and direct member chat with 1-click rich snippet, CID, and academic paper sharing.
                </p>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                  #general-cohort
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                  #research-share
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                  #dev-team
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link
                href="/dashboard/chat"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Launch Chat App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] font-mono text-zinc-500">Zero External Messengers</span>
            </div>
          </div>

          {/* 3. UniVault Academic Hub Card */}
          <div className="group relative rounded-2xl p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 hover:border-sky-500/40 transition-all flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  SEMANTIC SEARCH
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                  UniVault Academic Hub
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Collaborative platform for university students and engineers to share, discover, and request academic resources.
                  Uses vector embeddings for conceptual matching across lecture notes, cheatsheets, and research papers.
                </p>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  Distributed Consensus
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  zk-SNARKs Cryptography
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  Transformer Models
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link
                href="/dashboard/univault"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Browse Academic Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] font-mono text-zinc-500">Student Request Board</span>
            </div>
          </div>

          {/* 4. ShareSphere dApp Card */}
          <div className="group relative rounded-2xl p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  IPFS + SMART CONTRACTS
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  ShareSphere Web3 Storage
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Decentralized file storage dApp built on IPFS with MetaMask smart contract verification.
                  Offers censorship-resistant file distribution, client-side AES encryption, and immutable transaction hashes.
                </p>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Pinata IPFS Gateway Connected · MetaMask Ready</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link
                href="/dashboard/sharesphere"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Open Web3 dApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] font-mono text-zinc-500">Client-Side Encrypted</span>
            </div>
          </div>

          {/* 5. TextEnd AI Suite Card */}
          <div className="md:col-span-2 group relative rounded-2xl p-6 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  AUTONOMOUS AI SUITE
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  TextEnd Autonomous AI Writing & Verification Suite
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  High-speed linguistic perturbation and content transformation platform. Includes StealthWriter-grade AI Humanizer,
                  QuillBot-grade Summarizer, Neural Paraphraser, Plagiarism Checker, Outline Elaborator, and 5-Engine AI Content Detector.
                </p>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-purple-300">
                  AI Humanizer (Bypass Detectors)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-300">
                  Smart Summarizer
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-cyan-300">
                  Neural Paraphraser
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-rose-300">
                  Plagiarism Checker
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-300">
                  5-Engine AI Detector
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <Link
                href="/dashboard/textend"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Launch TextEnd Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] font-mono text-zinc-500">Groq LLM Accelerated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Architecture Workflow Story Card (The Interview Pitch!) */}
      <div className="rounded-3xl p-6 sm:p-7 bg-zinc-950 border border-zinc-800/80 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800/60">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff5a1f]" />
              <h3 className="text-base font-bold text-white">
                How The 4 Applications Connect: The Engineer&apos;s Workflow
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Demonstrates real system integration: how a student or engineer leverages all 4 platforms in one continuous workflow.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
            End-To-End Walkthrough
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold">
              <span>01.</span>
              <GraduationCap className="w-4 h-4" />
              <span>UniVault Discovery</span>
            </div>
            <p className="text-xs text-zinc-400">
              Query semantic notes (e.g. Raft consensus & zk-SNARK algorithms) using vector search.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#ff7a45] font-mono text-xs font-bold">
              <span>02.</span>
              <ClipboardCopy className="w-4 h-4" />
              <span>Drop Clipboard Sync</span>
            </div>
            <p className="text-xs text-zinc-400">
              1-click extract algorithm code snippets or notes into your ephemeral clipboard room across phone & laptop.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <span>03.</span>
              <HardDrive className="w-4 h-4" />
              <span>ShareSphere IPFS</span>
            </div>
            <p className="text-xs text-zinc-400">
              Encrypt the finalized project artifacts with AES-256 and store them permanently onto IPFS via Pinata.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
              <span>04.</span>
              <MessageSquare className="w-4 h-4" />
              <span>Team Chat Broadcast</span>
            </div>
            <p className="text-xs text-zinc-400">
              Send the IPFS CID & decryption key into <code className="text-zinc-200">#research-share</code> for instant team verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


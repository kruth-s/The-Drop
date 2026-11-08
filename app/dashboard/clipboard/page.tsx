'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toast, ToastMessage } from '@/components/Toast';
import { PrivateRoomChallengeModal } from '@/components/PrivateRoomChallengeModal';
import { PrivateRoomCreationModal } from '@/components/PrivateRoomCreationModal';
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
  Lock,
  Box,
  Key,
  Users,
  ShieldAlert,
  KeyRound,
  X,
} from 'lucide-react';

export default function DashboardClipboardPage() {
  const router = useRouter();
  const [customRoom, setCustomRoom] = useState('');
  const [standardRoom, setStandardRoom] = useState('');
  const [privateRoom, setPrivateRoom] = useState('');
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [scratchpad, setScratchpad] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingStandard, setIsLoadingStandard] = useState(false);
  const [isLoadingPrivate, setIsLoadingPrivate] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Private challenge modal state
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeSlug, setChallengeSlug] = useState('');
  const [challengeOptions, setChallengeOptions] = useState<string[]>([]);

  // Private creation modal state
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [createdWords, setCreatedWords] = useState<string[]>([]);
  const [isUpgradedRoom, setIsUpgradedRoom] = useState(false);

  // Privacy notice warning modal
  const [showPrivacyWarningModal, setShowPrivacyWarningModal] = useState(false);
  const [privacyWarningRoom, setPrivacyWarningRoom] = useState('');
  const [privacyWarningOptions, setPrivacyWarningOptions] = useState<string[]>([]);

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

  // Standard Room submission with Private check
  const handleOpenStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardRoom.trim()) {
      addToast('Please enter a room name', 'error');
      return;
    }
    const clean = standardRoom.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setIsLoadingStandard(true);

    try {
      const res = await fetch(`/api/clip/${clean}/private`);
      const data = await res.json();

      if (data.success && data.isPrivate) {
        setPrivacyWarningRoom(clean);
        setPrivacyWarningOptions(data.options || []);
        setShowPrivacyWarningModal(true);
        return;
      }

      router.push(`/clip/${clean}`);
    } catch (e) {
      router.push(`/clip/${clean}`);
    } finally {
      setIsLoadingStandard(false);
    }
  };

  // Private Room submission (Create or Unlock)
  const handleOpenPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateRoom.trim()) {
      addToast('Please enter a private room name', 'error');
      return;
    }
    const clean = privateRoom.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setIsLoadingPrivate(true);

    try {
      // 1. Check if room exists and is already private
      const checkRes = await fetch(`/api/clip/${clean}/private`);
      const checkData = await checkRes.json();

      if (checkData.success && checkData.isPrivate) {
        setChallengeSlug(clean);
        setChallengeOptions(checkData.options || []);
        setShowChallengeModal(true);
        return;
      }

      // 2. Create or upgrade to private
      const createRes = await fetch(`/api/clip/${clean}/private`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_or_upgrade' }),
      });
      const createData = await createRes.json();

      if (createData.success && createData.words) {
        if (createData.token && typeof window !== 'undefined') {
          sessionStorage.setItem(`vault_token_${clean}`, createData.token);
        }
        setCreatedSlug(clean);
        setCreatedWords(createData.words);
        setIsUpgradedRoom(Boolean(createData.upgraded));
        setShowCreationModal(true);
      } else {
        addToast(createData.error || 'Failed to initialize private room', 'error');
      }
    } catch (e: any) {
      addToast('Error setting up private room', 'error');
    } finally {
      setIsLoadingPrivate(false);
    }
  };

  const handleChallengeSuccess = (token: string) => {
    setShowChallengeModal(false);
    router.push(`/clip/${challengeSlug}`);
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

          {/* =========================================================================
              ROOM LAUNCHERS BELOW LOCAL QUICK BUFFER: PARALLEL (SIDE-BY-SIDE)
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. STANDARD ROOM */}
            <div className="w-full bg-zinc-950/85 border border-zinc-800 rounded-2xl sm:rounded-[2rem] p-3 shadow-2xl backdrop-blur-xl transition-all flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between px-2 pt-0.5 pb-1">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span
                    className="text-xs font-bold uppercase tracking-wider text-white"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    STANDARD ROOM
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-0.5 rounded-full border border-zinc-800 uppercase">
                  INSTANT ACCESS
                </span>
              </div>

              <form
                onSubmit={handleOpenStandard}
                className="flex items-center gap-2 w-full"
              >
                <div className="relative flex-1 min-w-0">
                  <Box className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter room name"
                    value={standardRoom}
                    onChange={(e) => setStandardRoom(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm font-medium tracking-[0.02em] focus:outline-none focus:border-[#ff5a1f]/70 transition-colors"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoadingStandard}
                  className="px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#ff5a1f] hover:bg-[#ff6d36] text-white text-xs sm:text-sm font-bold tracking-[0.02em] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-[#ff5a1f]/20 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  <span>{isLoadingStandard ? 'Checking...' : 'Open room'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* 2. OPEN PRIVATE ROOM */}
            <div className="w-full bg-zinc-950/85 border border-[#00f5a0]/40 rounded-2xl sm:rounded-[2rem] p-3 shadow-2xl backdrop-blur-xl transition-all shadow-[0_0_35px_rgba(0,245,160,0.06)] flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between px-2 pt-0.5 pb-1">
                <div className="flex items-center gap-1.5 text-[#00f5a0]">
                  <Lock className="w-3.5 h-3.5" />
                  <span
                    className="text-xs font-bold uppercase tracking-wider text-[#00f5a0]"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    OPEN PRIVATE ROOM
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-0.5 rounded-full border border-zinc-800 uppercase">
                  3-PHASE CTF LOCK
                </span>
              </div>

              <form
                onSubmit={handleOpenPrivate}
                className="flex items-center gap-2 w-full"
              >
                <div className="relative flex-1 min-w-0">
                  <Box className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Private room name"
                    value={privateRoom}
                    onChange={(e) => setPrivateRoom(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-xs sm:text-sm font-medium tracking-[0.02em] focus:outline-none focus:border-[#00f5a0]/70 transition-colors"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoadingPrivate}
                  className="px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#00f5a0] hover:bg-[#00df90] text-black text-xs sm:text-sm font-extrabold tracking-[0.02em] transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-[#00f5a0]/25 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isLoadingPrivate ? 'Opening...' : 'Open Private Room'}</span>
                </button>
              </form>
            </div>
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

      {/* =========================================================================
          MODALS & ALERTS FOR PRIVATE / STANDARD ROOMS
          ========================================================================= */}

      {/* 1. Privacy Warning Modal */}
      {showPrivacyWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0e0e13] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-zinc-100">
            <button
              onClick={() => setShowPrivacyWarningModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Privacy Lock Detected</h3>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              This is a <strong className="text-amber-400">Private Room</strong>. Please use the{' '}
              <strong className="text-emerald-400">Open Private Room</strong> option and ensure you
              have the <strong className="text-white">3 Secret Phrases</strong> ready to access content.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowPrivacyWarningModal(false);
                  setChallengeSlug(privacyWarningRoom);
                  setChallengeOptions(privacyWarningOptions);
                  setShowChallengeModal(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Enter 3 Secret Phrases Now</span>
              </button>

              <button
                onClick={() => setShowPrivacyWarningModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Challenge Modal */}
      <PrivateRoomChallengeModal
        isOpen={showChallengeModal}
        slug={challengeSlug}
        options={challengeOptions}
        onClose={() => setShowChallengeModal(false)}
        onSuccess={handleChallengeSuccess}
      />

      {/* 3. Creation / Upgrade Modal */}
      <PrivateRoomCreationModal
        isOpen={showCreationModal}
        slug={createdSlug}
        words={createdWords}
        isUpgraded={isUpgradedRoom}
        onClose={() => setShowCreationModal(false)}
        onEnter={() => {
          setShowCreationModal(false);
          router.push(`/clip/${createdSlug}`);
        }}
      />

      <Toast toasts={toasts} onClose={removeToast} />
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Search,
  BookOpen,
  Download,
  Star,
  Tag,
  Share2,
  ClipboardCopy,
  Plus,
  MessageSquare,
  FileText,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { AcademicResource, AcademicRequest } from '@/lib/univault';

export default function DashboardUniVaultPage() {
  const router = useRouter();
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [requests, setRequests] = useState<AcademicRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState<'resources' | 'requests'>('resources');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Request Form State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newProgram, setNewProgram] = useState('Computer Science');
  const [newTags, setNewTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch resources
  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/univault?q=${encodeURIComponent(searchQuery)}&type=${selectedType}&mode=resources`);
      const data = await res.json();
      if (data.success && Array.isArray(data.resources)) {
        setResources(data.resources);
      }
    } catch (e) {
      console.error('Failed to fetch UniVault resources:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/univault?mode=requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchResources();
    fetchRequests();
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleCopyToClipboard = (resource: AcademicResource) => {
    const textToCopy = `[UniVault Resource] ${resource.title} (${resource.courseCode}) - ${resource.fileUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(resource.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToChat = async (resource: AcademicResource) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: 'research',
          content: `Shared from UniVault: ${resource.title} (${resource.courseCode})`,
          type: 'univault_doc',
          metadata: { docTitle: resource.title },
        }),
      });
      router.push('/dashboard/chat');
    } catch (e) {
      router.push('/dashboard/chat');
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCourseCode.trim()) return;

    setIsSubmitting(true);
    try {
      const tagList = newTags
        .split(',')
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter(Boolean);

      const res = await fetch('/api/univault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          courseCode: newCourseCode.trim(),
          courseName: newCourseName.trim(),
          program: newProgram,
          tags: tagList,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowRequestModal(false);
        setNewTitle('');
        setNewCourseCode('');
        setNewCourseName('');
        setNewTags('');
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-sky-400" />
            <h1
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              UniVault <span className="text-sky-400">Academic Hub</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Modern collaborative repository for university students & researchers. AI semantic search & request board.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Resource</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academic Resources ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Community Requests ({requests.length})</span>
        </button>
      </div>

      {activeTab === 'resources' ? (
        <>
          {/* Semantic Search Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Ask semantically, e.g. 'Raft consensus invariants', 'Attention QKV projection', 'Operating systems TLB'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-24 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500 font-sans"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'research_paper', label: 'Research Papers' },
                { id: 'notes', label: 'Lecture Notes' },
                { id: 'cheatsheet', label: 'Cheatsheets' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedType(pill.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedType === pill.id
                      ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            {resources.length === 0 ? (
              <div className="col-span-2 p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-850">
                <p className="text-zinc-400 text-sm">No resources matched your search query.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                  }}
                  className="mt-3 text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              resources.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl p-5 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 hover:border-sky-500/40 shadow-xl flex flex-col justify-between gap-4 transition-all group"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {item.courseCode} · {item.resourceType.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-mono text-zinc-500">
                      {item.downloads} downloads
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyToClipboard(item)}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Copy details to clipboard"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleShareToChat(item)}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Send to Team Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>Open Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Academic Requests Board */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Community Study Material Requests</h2>
              <p className="text-xs text-zinc-400">
                Help fellow students by fulfilling study requests or submit a request for missing course syllabus resources.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {req.courseCode}
                    </span>
                    <span className="text-xs font-bold text-white">{req.title}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Requested by <span className="text-zinc-200">@{req.requesterUsername}</span> · {req.program} ({req.courseName})
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {req.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-zinc-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    ▲ {req.upvotes} Upvotes
                  </span>
                  <Link
                    href="/dashboard/chat"
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Fulfill in Chat</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Request */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                Submit Academic Request
              </span>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">RESOURCE TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm 2024 Solution Key for CS-320"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">COURSE CODE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-320"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">COURSE NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Algorithms"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  placeholder="algorithms, dynamic-programming, graph-theory"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


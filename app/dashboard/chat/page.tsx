'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Hash,
  User,
  Users,
  Sparkles,
  ClipboardCopy,
  HardDrive,
  GraduationCap,
  Paperclip,
  Shield,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage } from '@/lib/chat';

export default function DashboardChatPage() {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attachType, setAttachType] = useState<'text' | 'clip_share' | 'sharesphere_cid' | 'univault_doc'>('text');
  const [attachMeta, setAttachMeta] = useState<{ clipSlug?: string; ipfsCid?: string; docTitle?: string }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Channels definition
  const groupChannels = [
    { id: 'general', name: 'general-cohort', desc: 'Main team discussions' },
    { id: 'research', name: 'research-share', desc: 'Papers, CIDs, & study notes' },
    { id: 'dev-team', name: 'dev-team', desc: 'Code snippets & architectural sync' },
  ];

  const teamMembers = [
    { username: 'admin', role: 'admin', status: 'online' },
    { username: 'kruth', role: 'user', status: 'online' },
    { username: 'avs', role: 'user', status: 'online' },
    { username: 'athish', role: 'user', status: 'online' },
  ];

  // Fetch logged in user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch messages function
  const fetchMessages = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/chat?channel=${encodeURIComponent(activeChannel)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Chat poll error:', e);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Switch channel and poll messages
  useEffect(() => {
    fetchMessages(false);
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() && attachType === 'text') return;

    setIsSending(true);
    const content = inputContent.trim() || `Shared ${attachType.replace('_', ' ')}`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChannel,
          content,
          type: attachType,
          metadata: attachType !== 'text' ? attachMeta : undefined,
          senderUsername: currentUser?.username || 'Guest',
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputContent('');
        setAttachType('text');
        setAttachMeta({});
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setIsSending(false);
    }
  };

  const setClipAttachment = () => {
    const slug = prompt('Enter Clipboard Room Slug to attach:', 'team-sync');
    if (slug) {
      setAttachType('clip_share');
      setAttachMeta({ clipSlug: slug });
      setInputContent(`Check out our shared clipboard room: ${slug}`);
    }
  };

  const setCidAttachment = () => {
    const cid = prompt('Enter ShareSphere IPFS CID to attach:', 'QmZtmD2qt8fJpq3CLDHtaogZbh3aqn6H7Btr78KqK2t6S6');
    if (cid) {
      setAttachType('sharesphere_cid');
      setAttachMeta({ ipfsCid: cid });
      setInputContent(`Pinned encrypted dataset to ShareSphere IPFS: ${cid}`);
    }
  };

  const setDocAttachment = () => {
    const title = prompt('Enter UniVault Paper Title:', 'Distributed Consensus: Raft vs Multi-Paxos');
    if (title) {
      setAttachType('univault_doc');
      setAttachMeta({ docTitle: title });
      setInputContent(`Referenced academic resource from UniVault: ${title}`);
    }
  };

  const getChannelDisplayName = () => {
    if (activeChannel.startsWith('dm:')) {
      const parts = activeChannel.split(':');
      const other = parts.find((p) => p !== 'dm' && p !== currentUser?.username) || parts[1];
      return `@${other}`;
    }
    return `#${activeChannel}`;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-screen bg-[#08090d] text-zinc-100 overflow-hidden">
      {/* Top Chat Bar */}
      <div className="h-14 px-6 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            {activeChannel.startsWith('dm:') ? <User className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              {getChannelDisplayName()}
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Redis Pub/Sub Active · Low Latency
            </span>
          </div>
        </div>

        <button
          onClick={() => fetchMessages(false)}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Refresh Messages"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#ff5a1f]' : ''}`} />
        </button>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Channels & DMs Sidebar */}
        <div className="w-64 border-r border-zinc-800/60 bg-[#090a0f] p-4 flex flex-col gap-6 overflow-y-auto hidden sm:flex shrink-0">
          {/* Group Channels */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-rose-400" />
              Team Channels
            </span>
            {groupChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  activeChannel === ch.id
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{ch.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 1-on-1 Direct Messages */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#ff5a1f]" />
              Direct Messages
            </span>
            {teamMembers
              .filter((m) => m.username !== currentUser?.username)
              .map((member) => {
                const dmChannelId = `dm:${[currentUser?.username || 'user', member.username].sort().join(':')}`;
                const isActive = activeChannel === dmChannelId;

                return (
                  <button
                    key={member.username}
                    onClick={() => setActiveChannel(dmChannelId)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#ff5a1f]/15 text-[#ff7a45] border border-[#ff5a1f]/30 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        {member.status === 'online' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            member.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-600'
                          }`}
                        />
                      </span>
                      <span>@{member.username}</span>
                    </div>
                    {member.role === 'admin' && (
                      <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right: Message Stream & Composer */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#08090d]">
          {/* Message List */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-400 font-medium">No messages in this channel yet.</p>
                <p className="text-[11px] text-zinc-600 mt-1">Start the conversation below!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser && msg.senderUsername === currentUser.username;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 max-w-xl ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 px-1">
                      <span className="font-semibold text-zinc-300">{msg.senderUsername}</span>
                      {msg.senderRole === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          ADMIN
                        </span>
                      )}
                      <span className="text-[10px] font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#ff5a1f] text-white rounded-br-none shadow-md shadow-[#ff5a1f]/10'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Rich Embed: Clipboard Room Share */}
                      {msg.type === 'clip_share' && msg.metadata?.clipSlug && (
                        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <ClipboardCopy className="w-4 h-4 text-orange-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">Smart Clipboard Room</span>
                              <span className="text-[11px] font-mono text-zinc-300">
                                /{msg.metadata.clipSlug}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/clip/${msg.metadata.clipSlug}`}
                            className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Rich Embed: ShareSphere IPFS CID */}
                      {msg.type === 'sharesphere_cid' && msg.metadata?.ipfsCid && (
                        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">ShareSphere Web3 IPFS File</span>
                              <span className="text-[11px] font-mono text-zinc-300 truncate max-w-[180px]">
                                {msg.metadata.ipfsCid}
                              </span>
                            </div>
                          </div>
                          <Link
                            href="/dashboard/sharesphere"
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Rich Embed: UniVault Academic Doc */}
                      {msg.type === 'univault_doc' && msg.metadata?.docTitle && (
                        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">UniVault Academic Resource</span>
                              <span className="text-[11px] text-zinc-300 truncate max-w-[180px]">
                                {msg.metadata.docTitle}
                              </span>
                            </div>
                          </div>
                          <Link
                            href="/dashboard/univault"
                            className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Attachment Pills */}
          <div className="px-5 py-2 border-t border-zinc-800/60 bg-zinc-950/40 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              Quick Attach:
            </span>

            <button
              onClick={setClipAttachment}
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-[#ff7a45] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ClipboardCopy className="w-3 h-3" />
              <span>Share Clipboard Room</span>
            </button>

            <button
              onClick={setCidAttachment}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3 h-3" />
              <span>Attach IPFS CID</span>
            </button>

            <button
              onClick={setDocAttachment}
              className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <GraduationCap className="w-3 h-3" />
              <span>Link UniVault Paper</span>
            </button>

            {attachType !== 'text' && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                Attachment Ready ({attachType})
              </span>
            )}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center gap-3"
          >
            <input
              type="text"
              placeholder={`Message ${getChannelDisplayName()} (Press Enter)...`}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#ff5a1f]"
            />

            <button
              type="submit"
              disabled={isSending || (!inputContent.trim() && attachType === 'text')}
              className="p-2.5 rounded-xl bg-[#ff5a1f] hover:bg-[#ff7a45] disabled:opacity-40 text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


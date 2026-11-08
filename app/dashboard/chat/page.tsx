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
  Plus,
  X,
  Lock,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Maximize2,
  Download,
  CheckCheck,
  Smile,
  Trash2,
  Camera,
  Reply,
} from 'lucide-react';
import { ChatMessage } from '@/lib/chat';

interface GroupChannel {
  id: string;
  name: string;
  desc: string;
  isCustom?: boolean;
}

const DEFAULT_CHANNELS: GroupChannel[] = [
  { id: 'aka', name: 'AKA', desc: 'Secure operations & Akaza vault sync' },
  { id: 'general', name: 'general-cohort', desc: 'Main team discussions' },
  { id: 'research', name: 'research-share', desc: 'Papers, CIDs, & study notes' },
  { id: 'dev-team', name: 'dev-team', desc: 'Code snippets & architectural sync' },
];

const PRESET_GIFS = [
  { label: 'Rocket Launch', url: 'https://media.giphy.com/media/mi6DsSSNKDbUY/giphy.gif' },
  { label: 'Celebrate Party', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { label: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { label: 'Hacking Code', url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif' },
  { label: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
  { label: 'LOL Laughing', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif' },
  { label: 'Fire / Lit', url: 'https://media.giphy.com/media/yr7n0u3qzO9nG/giphy.gif' },
  { label: 'Cat Vibing', url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif' },
];

export default function DashboardChatPage() {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [activeChannel, setActiveChannel] = useState<string>('aka');
  const [customChannels, setCustomChannels] = useState<GroupChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attachType, setAttachType] = useState<'text' | 'clip_share' | 'sharesphere_cid' | 'univault_doc'>('text');
  const [attachMeta, setAttachMeta] = useState<{ clipSlug?: string; ipfsCid?: string; docTitle?: string }>({});

  // WhatsApp-style Media Attachments State
  const [pendingMedia, setPendingMedia] = useState<{
    url: string;
    type: 'image' | 'video' | 'gif';
    fileName: string;
    fileSize?: string;
  } | null>(null);

  // Popups & Lightbox
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [customGifUrl, setCustomGifUrl] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // WhatsApp-style Reply State
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    senderUsername: string;
    content: string;
    mediaType?: 'image' | 'video' | 'gif';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Group Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Load custom channels from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('the_drop_custom_chat_channels');
      if (saved) {
        setCustomChannels(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const allChannels = [...DEFAULT_CHANNELS, ...customChannels];

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const cleanId = newGroupName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const cleanName = newGroupName.trim().replace(/^#/, '');

    // Check if channel already exists
    if (allChannels.some((c) => c.id === cleanId)) {
      setActiveChannel(cleanId);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      return;
    }

    const newChannel: GroupChannel = {
      id: cleanId,
      name: cleanName,
      desc: newGroupDesc.trim() || 'Custom team channel',
      isCustom: true,
    };

    const updated = [...customChannels, newChannel];
    setCustomChannels(updated);
    try {
      localStorage.setItem('the_drop_custom_chat_channels', JSON.stringify(updated));
    } catch (e) {}

    setActiveChannel(cleanId);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
  };

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file.');
      return;
    }

    const kb = (file.size / 1024).toFixed(1);
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    const formattedSize = file.size > 1024 * 1024 ? `${mb} MB` : `${kb} KB`;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        setPendingMedia({
          url: result,
          type: isVideo ? 'video' : file.type === 'image/gif' ? 'gif' : 'image',
          fileName: file.name,
          fileSize: formattedSize,
        });
        setShowAttachMenu(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result as string;
            if (result) {
              setPendingMedia({
                url: result,
                type: 'image',
                fileName: `Screenshot_${Date.now()}.png`,
                fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              });
            }
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleSelectGif = (url: string, label = 'GIF') => {
    if (!url.trim()) return;
    setPendingMedia({
      url: url.trim(),
      type: 'gif',
      fileName: `${label}.gif`,
    });
    setShowGifPicker(false);
    setShowAttachMenu(false);
    setCustomGifUrl('');
  };

  const handleStartReply = (msg: ChatMessage) => {
    setReplyingTo({
      id: msg.id,
      senderUsername: msg.senderUsername,
      content: msg.content,
      mediaType: msg.metadata?.mediaType || (msg.type === 'image' || msg.type === 'video' || msg.type === 'gif' ? msg.type : undefined),
    });
    setShowAttachMenu(false);
    setShowGifPicker(false);
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`chat-msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#ff5a1f]', 'bg-zinc-800/40', 'rounded-2xl', 'p-1', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#ff5a1f]', 'bg-zinc-800/40', 'rounded-2xl', 'p-1');
      }, 1800);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const isMedia = !!pendingMedia;
    if (!inputContent.trim() && !isMedia && attachType === 'text') return;

    setIsSending(true);
    const msgType = isMedia ? pendingMedia.type : attachType;
    const metadata = isMedia
      ? {
          mediaUrl: pendingMedia.url,
          mediaType: pendingMedia.type,
          fileName: pendingMedia.fileName,
          fileSize: pendingMedia.fileSize,
        }
      : attachType !== 'text'
      ? attachMeta
      : undefined;

    const content =
      inputContent.trim() ||
      (isMedia
        ? msgType === 'image'
          ? 'Photo'
          : msgType === 'video'
          ? 'Video'
          : 'GIF'
        : `Shared ${attachType.replace('_', ' ')}`);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChannel,
          content,
          type: msgType,
          metadata,
          senderUsername: currentUser?.username || 'Guest',
          replyTo: replyingTo || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputContent('');
        setPendingMedia(null);
        setReplyingTo(null);
        setAttachType('text');
        setAttachMeta({});
        setShowAttachMenu(false);
        setShowGifPicker(false);
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
    const cid = prompt('Enter IPFS CID to attach:', 'QmZtmD2qt8fJpq3CLDHtaogZbh3aqn6H7Btr78KqK2t6S6');
    if (cid) {
      setAttachType('sharesphere_cid');
      setAttachMeta({ ipfsCid: cid });
      setInputContent(`Pinned encrypted dataset to IPFS Locker: ${cid}`);
    }
  };

  const setDocAttachment = () => {
    const title = prompt('Enter Knowledge Hub Resource Title:', 'Distributed Consensus: Raft vs Multi-Paxos');
    if (title) {
      setAttachType('univault_doc');
      setAttachMeta({ docTitle: title });
      setInputContent(`Referenced resource from Knowledge Hub: ${title}`);
    }
  };

  const getChannelDisplayName = () => {
    if (activeChannel.startsWith('dm:')) {
      const parts = activeChannel.split(':');
      const other = parts.find((p) => p !== 'dm' && p !== currentUser?.username) || parts[1];
      return `@${other}`;
    }
    const found = allChannels.find((c) => c.id === activeChannel);
    return found ? `#${found.name}` : `#${activeChannel}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#08090d] text-zinc-100 overflow-hidden">
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
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Channels & DMs Sidebar */}
        <div className="w-64 border-r border-zinc-800/60 bg-[#090a0f] p-4 flex flex-col gap-6 overflow-y-auto hidden sm:flex shrink-0">
          {/* Group Channels */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-2 mb-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-rose-400" />
                Team Channels
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Create Group Chat"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {allChannels.map((ch) => (
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
                {ch.id === 'aka' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                    HQ
                  </span>
                )}
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
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#08090d] overflow-hidden">
          {/* Message List */}
          <div className="flex-1 min-h-0 p-5 overflow-y-auto flex flex-col gap-4">
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
                    id={`chat-msg-${msg.id}`}
                    className={`group/msg relative flex flex-col gap-1 max-w-xl transition-all ${
                      isMe ? 'self-end items-end' : 'self-start items-start'
                    }`}
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

                      {/* WhatsApp Reply Button */}
                      <button
                        type="button"
                        onClick={() => handleStartReply(msg)}
                        className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer flex items-center gap-1 text-[10px]"
                        title="Reply to this message"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#ff5a1f] text-white rounded-br-none shadow-md shadow-[#ff5a1f]/10'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-md'
                      }`}
                    >
                      {/* Quoted Replying Card (WhatsApp Style) */}
                      {msg.replyTo && (
                        <div
                          onClick={() => msg.replyTo?.id && scrollToMessage(msg.replyTo.id)}
                          className="mb-2.5 p-2 rounded-xl bg-black/35 border-l-4 border-white/80 flex flex-col gap-0.5 cursor-pointer hover:bg-black/50 transition-colors"
                          title="Click to jump to quoted message"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/95">
                            <Reply className="w-3 h-3 rotate-180" />
                            <span>@{msg.replyTo.senderUsername}</span>
                          </div>
                          <p className="text-[11px] text-white/80 line-clamp-1 truncate">
                            {msg.replyTo.mediaType ? `[${msg.replyTo.mediaType.toUpperCase()}] ` : ''}
                            {msg.replyTo.content || 'Media attachment'}
                          </p>
                        </div>
                      )}
                      {/* WhatsApp-Style Render: Photo Attachment */}
                      {msg.metadata?.mediaUrl && (msg.type === 'image' || msg.metadata.mediaType === 'image') && (
                        <div className="relative group/media overflow-hidden rounded-xl cursor-pointer mb-2 border border-black/20 bg-black/40">
                          <img
                            src={msg.metadata.mediaUrl}
                            alt={msg.metadata.fileName || 'Attached photo'}
                            className="w-full max-h-80 object-cover rounded-xl transition-transform hover:scale-[1.01]"
                            onClick={() => msg.metadata?.mediaUrl && setLightboxUrl(msg.metadata.mediaUrl)}
                          />
                          <div
                            onClick={() => msg.metadata?.mediaUrl && setLightboxUrl(msg.metadata.mediaUrl)}
                            className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/70 rounded-lg p-1.5 backdrop-blur-sm text-white flex items-center gap-1 text-[10px] cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Enlarge</span>
                          </div>
                          {msg.metadata.fileName && (
                            <div className="px-2 py-1 bg-black/50 text-[10px] font-mono text-zinc-300 truncate">
                              {msg.metadata.fileName} {msg.metadata.fileSize ? `· ${msg.metadata.fileSize}` : ''}
                            </div>
                          )}
                        </div>
                      )}

                      {/* WhatsApp-Style Render: Video Attachment */}
                      {msg.metadata?.mediaUrl && (msg.type === 'video' || msg.metadata.mediaType === 'video') && (
                        <div className="relative overflow-hidden rounded-xl mb-2 border border-black/20 bg-black">
                          <video
                            src={msg.metadata.mediaUrl}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full max-h-80 rounded-xl"
                          />
                          {msg.metadata.fileName && (
                            <div className="px-2 py-1 bg-zinc-950 text-[10px] font-mono text-zinc-400 truncate">
                              🎥 {msg.metadata.fileName} {msg.metadata.fileSize ? `· ${msg.metadata.fileSize}` : ''}
                            </div>
                          )}
                        </div>
                      )}

                      {/* WhatsApp-Style Render: GIF Attachment */}
                      {msg.metadata?.mediaUrl && (msg.type === 'gif' || msg.metadata.mediaType === 'gif') && (
                        <div className="relative group/gif overflow-hidden rounded-xl mb-2 border border-black/20 bg-black/40">
                          <img
                            src={msg.metadata.mediaUrl}
                            alt="Attached GIF"
                            className="w-full max-h-72 object-cover rounded-xl"
                          />
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-white border border-white/20 backdrop-blur-sm">
                            GIF
                          </span>
                        </div>
                      )}

                      {/* Text content / Caption */}
                      {msg.content &&
                        msg.content !== 'Photo' &&
                        msg.content !== 'Video' &&
                        msg.content !== 'GIF' &&
                        msg.content !== 'Media attachment' && (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}

                      {/* Message Footer: Time + WhatsApp Double Checkmark */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-75">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                      </div>

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
                              <span className="text-xs font-bold text-white">IPFS Locker File</span>
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

                      {/* Rich Embed: Knowledge Hub Doc */}
                      {msg.type === 'univault_doc' && msg.metadata?.docTitle && (
                        <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">Knowledge Hub Resource</span>
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

          {/* WhatsApp-Style Pending Media Attachment Preview */}
          {pendingMedia && (
            <div className="mx-4 mb-2 p-3 rounded-2xl bg-zinc-900/95 border border-zinc-800 flex items-center justify-between gap-3 shadow-2xl shrink-0 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-black/60 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-700">
                  {pendingMedia.type === 'video' ? (
                    <VideoIcon className="w-7 h-7 text-rose-400" />
                  ) : (
                    <img src={pendingMedia.url} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate max-w-xs">{pendingMedia.fileName}</span>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                    {pendingMedia.type} {pendingMedia.fileSize ? `· ${pendingMedia.fileSize}` : ''} Ready to Send
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingMedia(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* WhatsApp-Style Replying Banner */}
          {replyingTo && (
            <div className="mx-4 mb-2 p-3 rounded-2xl bg-zinc-900/95 border-l-4 border-rose-500 border border-zinc-800 flex items-center justify-between gap-3 shadow-2xl shrink-0 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Reply className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-rose-400">
                    Replying to @{replyingTo.senderUsername}
                  </span>
                  <span className="text-[11px] text-zinc-300 truncate max-w-sm">
                    {replyingTo.mediaType ? `[${replyingTo.mediaType.toUpperCase()}] ` : ''}
                    {replyingTo.content}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* WhatsApp-Style Message Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-zinc-800/80 bg-zinc-950/95 flex items-center gap-2 sm:gap-3 shrink-0 relative"
          >
            {/* Attachment Popover Trigger (Paperclip) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(!showAttachMenu);
                  setShowGifPicker(false);
                }}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  showAttachMenu ? 'bg-zinc-800 text-[#ff5a1f]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                title="Attach Media or Link"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* WhatsApp-Style Attachment Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-14 left-0 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-30 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-left text-xs font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Photos & Videos</span>
                      <span className="text-[10px] text-zinc-500">Attach PNG, JPG, MP4, GIF</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGifPicker(true);
                      setShowAttachMenu(false);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-left text-xs font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">GIF Reactions</span>
                      <span className="text-[10px] text-zinc-500">Pick animated reaction GIFs</span>
                    </div>
                  </button>

                  <div className="my-1 border-t border-zinc-800/80" />

                  <button
                    type="button"
                    onClick={() => {
                      setClipAttachment();
                      setShowAttachMenu(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-[#ff7a45] flex items-center justify-center">
                      <ClipboardCopy className="w-3.5 h-3.5" />
                    </div>
                    <span>Share Clipboard Room</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCidAttachment();
                      setShowAttachMenu(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <HardDrive className="w-3.5 h-3.5" />
                    </div>
                    <span>Attach IPFS CID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocAttachment();
                      setShowAttachMenu(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 text-left text-xs text-zinc-300 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <span>Knowledge Hub Doc</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Input for Image/Video Selection */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* 1-Click Camera / Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer hidden sm:flex"
              title="Upload Photo or Video"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* 1-Click GIF Reaction Button */}
            <button
              type="button"
              onClick={() => {
                setShowGifPicker(!showGifPicker);
                setShowAttachMenu(false);
              }}
              className={`p-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                showGifPicker ? 'bg-purple-500/20 text-purple-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title="Choose GIF Reaction"
            >
              GIF
            </button>

            {/* Main Text / Caption Input with Paste Support */}
            <input
              ref={chatInputRef}
              type="text"
              placeholder={
                replyingTo
                  ? `Replying to @${replyingTo.senderUsername}...`
                  : pendingMedia
                  ? 'Add a caption to your media (Press Enter to send)...'
                  : `Message ${getChannelDisplayName()} (or paste image)...`
              }
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onPaste={handlePaste}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#ff5a1f]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSending || (!inputContent.trim() && !pendingMedia && attachType === 'text')}
              className="p-2.5 rounded-xl bg-[#ff5a1f] hover:bg-[#ff7a45] disabled:opacity-40 text-white transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-[#ff5a1f]/20"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>

            {/* GIF Reactions Picker Drawer */}
            {showGifPicker && (
              <div className="absolute bottom-20 left-4 sm:left-14 w-80 max-w-[calc(100vw-2rem)] bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-2xl z-30 flex flex-col gap-3 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    GIF Reactions
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGifPicker(false)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Custom GIF URL input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Paste custom GIF link..."
                    value={customGifUrl}
                    onChange={(e) => setCustomGifUrl(e.target.value)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectGif(customGifUrl, 'Custom GIF')}
                    disabled={!customGifUrl.trim()}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold text-xs cursor-pointer"
                  >
                    Use
                  </button>
                </div>

                {/* Popular Reaction Presets Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {PRESET_GIFS.map((gif) => (
                    <button
                      key={gif.label}
                      type="button"
                      onClick={() => handleSelectGif(gif.url, gif.label)}
                      className="group relative rounded-xl overflow-hidden border border-zinc-800 hover:border-purple-500/60 aspect-video cursor-pointer"
                    >
                      <img
                        src={gif.url}
                        alt={gif.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white backdrop-blur-sm">
                        {gif.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <a
                href={lightboxUrl}
                download="photo"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-zinc-900/80 text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Open Original"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setLightboxUrl(null)}
                className="p-2 rounded-xl bg-zinc-900/80 text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxUrl}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-zinc-800"
            />
          </div>
        </div>
      )}

      {/* Modal: Create Custom Group Channel */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                Create New Group Channel
              </span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  CHANNEL NAME
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm">#</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AKA or dev-sprint"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full py-2.5 pl-8 pr-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  CHANNEL TOPIC (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated discussion and vault sync"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


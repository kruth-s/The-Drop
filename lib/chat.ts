import { Redis } from '@upstash/redis';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export interface ChatMessage {
  id: string;
  channelId: string; // e.g. "general", "research", or "dm:alice:bob"
  senderUsername: string;
  senderRole?: 'admin' | 'user';
  content: string;
  type?: 'text' | 'clip_share' | 'sharesphere_cid' | 'univault_doc' | 'image' | 'video' | 'gif' | 'media';
  metadata?: {
    clipSlug?: string;
    ipfsCid?: string;
    docTitle?: string;
    fileName?: string;
    fileSize?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'gif';
    caption?: string;
  };
  replyTo?: {
    id: string;
    senderUsername: string;
    content: string;
    mediaType?: 'image' | 'video' | 'gif';
  };
  timestamp: number;
}

// In-memory fallback message store with global persistence across Next.js reloads
const globalForChat = globalThis as unknown as {
  memoryChatMessages?: Record<string, ChatMessage[]>;
};

export const memoryChatMessages: Record<string, ChatMessage[]> =
  globalForChat.memoryChatMessages || {
    aka: [
      {
        id: 'msg-aka-1',
        channelId: 'aka',
        senderUsername: 'system',
        senderRole: 'admin',
        content: 'Welcome to #AKA! Secure operations, Akaza vault keys, and priority team sync channel.',
        type: 'text',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'msg-aka-2',
        channelId: 'aka',
        senderUsername: 'admin',
        senderRole: 'admin',
        content: 'Channel #AKA initialized. All cryptographic sync and private vault records are monitored here.',
        type: 'text',
        timestamp: Date.now() - 1200000,
      },
      {
        id: 'msg-aka-3',
        channelId: 'aka',
        senderUsername: 'admin',
        senderRole: 'admin',
        content: 'System architecture diagram preview for the team:',
        type: 'image',
        metadata: {
          mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          mediaType: 'image',
          fileName: 'Architecture-Blueprint.png',
          fileSize: '1.2 MB',
        },
        timestamp: Date.now() - 600000,
      },
      {
        id: 'msg-aka-4',
        channelId: 'aka',
        senderUsername: 'kruth',
        senderRole: 'user',
        content: 'Deployment completed on time! 🚀',
        type: 'gif',
        metadata: {
          mediaUrl: 'https://media.giphy.com/media/mi6DsSSNKDbUY/giphy.gif',
          mediaType: 'gif',
          fileName: 'Rocket.gif',
        },
        timestamp: Date.now() - 180000,
      },
      {
        id: 'msg-aka-5',
        channelId: 'aka',
        senderUsername: 'avs',
        senderRole: 'user',
        content: 'Looks ultra clean. Approved for production! 🔥',
        type: 'text',
        replyTo: {
          id: 'msg-aka-3',
          senderUsername: 'admin',
          content: 'System architecture diagram preview for the team:',
          mediaType: 'image',
        },
        timestamp: Date.now() - 60000,
      },
    ],
    general: [
      {
        id: 'msg-init-1',
        channelId: 'general',
        senderUsername: 'system',
        senderRole: 'admin',
        content: 'Welcome to The Drop Real-Time Chat! Connect with your team without leaving the workspace.',
        type: 'text',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'msg-init-2',
        channelId: 'general',
        senderUsername: 'admin',
        senderRole: 'admin',
        content: 'I shared the project synchronization room. Click to open and sync your local clipboard:',
        type: 'clip_share',
        metadata: { clipSlug: 'lab-sync' },
        timestamp: Date.now() - 1800000,
      },
    ],
    research: [
      {
        id: 'msg-init-3',
        channelId: 'research',
        senderUsername: 'system',
        senderRole: 'admin',
        content: 'Academic papers from Knowledge Hub and decentralized IPFS Locker artifacts are linked here.',
        type: 'text',
        timestamp: Date.now() - 7200000,
      },
    ],
    'dev-team': [
      {
        id: 'msg-init-4',
        channelId: 'dev-team',
        senderUsername: 'system',
        senderRole: 'admin',
        content: 'Dev channel ready for Redis pub/sub streams and code snippet sharing.',
        type: 'text',
        timestamp: Date.now() - 5400000,
      },
    ],
  };

globalForChat.memoryChatMessages = memoryChatMessages;

export async function getChannelMessages(channelId: string, limit = 200): Promise<ChatMessage[]> {
  const cleanId = channelId.toLowerCase().trim();

  // Potential channel aliases from earlier iterations to guarantee backward compatibility
  const aliasMap: Record<string, string[]> = {
    general: ['general', 'general-cohort'],
    research: ['research', 'research-share'],
    aka: ['aka', 'aka-chat', 'akaza'],
    'dev-team': ['dev-team', 'dev', 'engineering'],
  };

  const channelCandidates = aliasMap[cleanId] || [cleanId];

  if (redis) {
    try {
      for (const ch of channelCandidates) {
        // Check primary and legacy key variants
        const keyVariants = [
          `chat:channel:${ch}`,
          `chat:${ch}`,
          `chat:${ch}:messages`,
        ];

        for (const key of keyVariants) {
          const rawMessages = await redis.lrange<any>(key, -limit, -1);
          if (rawMessages && rawMessages.length > 0) {
            // Safely parse in case raw JSON strings were stored in previous deployments
            const parsed = rawMessages.map((m) => {
              if (typeof m === 'string') {
                try {
                  return JSON.parse(m);
                } catch {
                  return {
                    id: `legacy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    channelId: cleanId,
                    senderUsername: 'User',
                    content: m,
                    timestamp: Date.now(),
                  };
                }
              }
              return m;
            });
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Redis chat read error:', e);
    }
  }

  // Fallback to memory
  return memoryChatMessages[cleanId] || [];
}

export async function sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
  const cleanId = message.channelId.toLowerCase().trim();
  const fullMessage: ChatMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    channelId: cleanId,
    timestamp: Date.now(),
  };

  if (redis) {
    try {
      await redis.rpush(`chat:channel:${cleanId}`, fullMessage);
      // Retain up to 1,000 messages per channel so previous chats are preserved
      await redis.ltrim(`chat:channel:${cleanId}`, -1000, -1);
    } catch (e) {
      console.error('Redis chat push error:', e);
    }
  }

  // Always update memory
  if (!memoryChatMessages[cleanId]) {
    memoryChatMessages[cleanId] = [];
  }
  memoryChatMessages[cleanId].push(fullMessage);
  if (memoryChatMessages[cleanId].length > 1000) {
    memoryChatMessages[cleanId].shift();
  }

  return fullMessage;
}


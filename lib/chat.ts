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
  type?: 'text' | 'clip_share' | 'sharesphere_cid' | 'univault_doc';
  metadata?: {
    clipSlug?: string;
    ipfsCid?: string;
    docTitle?: string;
    fileName?: string;
  };
  timestamp: number;
}

// In-memory fallback message store
const memoryChatMessages: Record<string, ChatMessage[]> = {
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
      content: 'Academic papers from UniVault and decentralized ShareSphere artifacts are linked here.',
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

export async function getChannelMessages(channelId: string, limit = 50): Promise<ChatMessage[]> {
  const cleanId = channelId.toLowerCase().trim();

  if (redis) {
    try {
      const messages = await redis.lrange<ChatMessage>(`chat:channel:${cleanId}`, -limit, -1);
      if (messages && messages.length > 0) {
        return messages;
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
      // Keep last 200 messages per channel
      await redis.ltrim(`chat:channel:${cleanId}`, -200, -1);
    } catch (e) {
      console.error('Redis chat push error:', e);
    }
  }

  // Always update memory
  if (!memoryChatMessages[cleanId]) {
    memoryChatMessages[cleanId] = [];
  }
  memoryChatMessages[cleanId].push(fullMessage);
  if (memoryChatMessages[cleanId].length > 200) {
    memoryChatMessages[cleanId].shift();
  }

  return fullMessage;
}


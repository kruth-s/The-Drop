import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Lazily initialize Redis if credentials are provided
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export interface UserRecord {
  id: string;
  username: string;
  role: 'admin' | 'user';
  passwordHash: string;
  salt: string;
  allowedRooms: string[]; // ["*"] means all rooms, or ["alpha", "beta"]
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  username: string;
  role: 'admin' | 'user';
  allowedRooms: string[];
  createdAt: number;
  expiresAt: number;
}

// In-memory fallbacks when Redis is not configured (local dev)
// Preserved across Next.js dev server hot-reloads via globalThis
const globalForAuth = globalThis as unknown as {
  memoryUsers?: Map<string, UserRecord>;
  memorySessions?: Map<string, SessionRecord>;
  memoryAccessedRooms?: Map<string, Set<string>>;
  memoryCreatedRooms?: Map<string, Set<string>>;
};

const memoryUsers = globalForAuth.memoryUsers ?? new Map<string, UserRecord>();
const memorySessions = globalForAuth.memorySessions ?? new Map<string, SessionRecord>();
const memoryAccessedRooms = globalForAuth.memoryAccessedRooms ?? new Map<string, Set<string>>();
const memoryCreatedRooms = globalForAuth.memoryCreatedRooms ?? new Map<string, Set<string>>();

globalForAuth.memoryUsers = memoryUsers;
globalForAuth.memorySessions = memorySessions;
globalForAuth.memoryAccessedRooms = memoryAccessedRooms;
globalForAuth.memoryCreatedRooms = memoryCreatedRooms;

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days (User requested)

/**
 * Hash password with PBKDF2 (SHA-512, 100k rounds)
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, usedSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: usedSalt };
}

/**
 * Constant-time password verification
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Check if user/session has access to a specific room slug
 */
export function hasRoomAccess(
  userOrSession: { role: string; allowedRooms: string[] } | null | undefined,
  roomSlug: string
): boolean {
  if (!userOrSession) return false;
  if (userOrSession.role === 'admin') return true;
  if (userOrSession.allowedRooms?.includes('*')) return true;

  const normalized = roomSlug.toLowerCase().trim();
  return (
    userOrSession.allowedRooms?.map((r) => r.toLowerCase().trim()).includes(normalized) || false
  );
}

const DEFAULT_SYSTEM_USERS = [
  { username: 'admin', role: 'admin', password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123' },
  { username: 'kruth', role: 'user', password: 'kruth123' },
  { username: 'avs', role: 'user', password: 'avs123' },
  { username: 'athish', role: 'user', password: 'athish123' },
];

let isInitialized = false;

/**
 * Ensure default initial users exist (admin, kruth, avs, athish)
 */
export async function ensureAdminUser(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  for (const item of DEFAULT_SYSTEM_USERS) {
    const cleanUser = item.username.toLowerCase().trim();
    if (memoryUsers.has(cleanUser)) continue;

    let existingInRedis: UserRecord | null = null;
    if (redis) {
      try {
        existingInRedis = await redis.get<UserRecord>(`auth:user:${cleanUser}`);
      } catch (e) {}
    }

    if (existingInRedis) {
      memoryUsers.set(cleanUser, existingInRedis);
    } else {
      const { hash, salt } = hashPassword(item.password);
      const now = new Date().toISOString();
      const userRec: UserRecord = {
        id: `usr_${cleanUser}_${Date.now().toString(36)}`,
        username: cleanUser,
        role: item.role as 'admin' | 'user',
        passwordHash: hash,
        salt,
        allowedRooms: ['*'],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      if (redis) {
        try {
          await redis.set(`auth:user:${cleanUser}`, userRec);
          await redis.sadd('auth:users', cleanUser);
        } catch (e) {}
      }

      memoryUsers.set(cleanUser, userRec);
      console.log(`[AUTH] Initialized user '${cleanUser}' (password: '${item.password}')`);
    }
  }
}

/**
 * Get user by username
 */
export async function getUser(username: string): Promise<UserRecord | null> {
  await ensureAdminUser();
  const cleanUsername = username.toLowerCase().trim();

  if (redis) {
    try {
      const user = await redis.get<UserRecord>(`auth:user:${cleanUsername}`);
      if (user) {
        memoryUsers.set(cleanUsername, user);
        return user;
      }
    } catch (e) {
      console.error('Failed reading user from Redis:', e);
    }
  }

  return memoryUsers.get(cleanUsername) || null;
}

/**
 * Record when a user accesses a room
 */
export async function recordUserAccess(username: string, roomSlug: string): Promise<void> {
  if (!username || !roomSlug) return;
  const cleanUser = username.toLowerCase().trim();
  const cleanSlug = roomSlug.toLowerCase().trim();

  if (redis) {
    try {
      await redis.sadd(`auth:user:${cleanUser}:accessed_rooms`, cleanSlug);
    } catch (e) {
      console.error('Failed recording user room access in Redis:', e);
    }
  }

  if (!memoryAccessedRooms.has(cleanUser)) {
    memoryAccessedRooms.set(cleanUser, new Set());
  }
  memoryAccessedRooms.get(cleanUser)!.add(cleanSlug);
}

/**
 * Record when a user creates a room
 */
export async function recordUserCreatedRoom(username: string, roomSlug: string): Promise<void> {
  if (!username || !roomSlug) return;
  const cleanUser = username.toLowerCase().trim();
  const cleanSlug = roomSlug.toLowerCase().trim();

  if (redis) {
    try {
      await redis.sadd(`auth:user:${cleanUser}:created_rooms`, cleanSlug);
      await redis.sadd(`auth:user:${cleanUser}:accessed_rooms`, cleanSlug);
    } catch (e) {
      console.error('Failed recording user created room in Redis:', e);
    }
  }

  if (!memoryCreatedRooms.has(cleanUser)) {
    memoryCreatedRooms.set(cleanUser, new Set());
  }
  memoryCreatedRooms.get(cleanUser)!.add(cleanSlug);

  if (!memoryAccessedRooms.has(cleanUser)) {
    memoryAccessedRooms.set(cleanUser, new Set());
  }
  memoryAccessedRooms.get(cleanUser)!.add(cleanSlug);
}

/**
 * Get room activity (created and accessed rooms) for a user
 */
export async function getUserActivity(username: string): Promise<{ createdRooms: string[]; accessedRooms: string[] }> {
  const clean = username.toLowerCase().trim();
  let created: string[] = [];
  let accessed: string[] = [];

  if (redis) {
    try {
      const c = await redis.smembers(`auth:user:${clean}:created_rooms`);
      const a = await redis.smembers(`auth:user:${clean}:accessed_rooms`);
      if (Array.isArray(c)) created = c;
      if (Array.isArray(a)) accessed = a;
    } catch (e) {
      console.error('Failed reading user activity from Redis:', e);
    }
  }

  if (memoryCreatedRooms.has(clean)) {
    const memC = Array.from(memoryCreatedRooms.get(clean)!);
    created = Array.from(new Set([...created, ...memC]));
  }
  if (memoryAccessedRooms.has(clean)) {
    const memA = Array.from(memoryAccessedRooms.get(clean)!);
    accessed = Array.from(new Set([...accessed, ...memA]));
  }

  return { createdRooms: created, accessedRooms: accessed };
}

export type UserWithActivity = Omit<UserRecord, 'passwordHash' | 'salt'> & {
  createdRooms: string[];
  accessedRooms: string[];
};

/**
 * List all users with their room activity (created and accessed)
 */
export async function getAllUsers(): Promise<UserWithActivity[]> {
  await ensureAdminUser();

  const usernames = new Set<string>();

  if (redis) {
    try {
      const redisUsernames = await redis.smembers('auth:users');
      if (Array.isArray(redisUsernames)) {
        redisUsernames.forEach((u) => usernames.add(u.toLowerCase()));
      }
    } catch (e) {
      console.error('Failed reading users set from Redis:', e);
    }
  }

  for (const u of memoryUsers.keys()) {
    usernames.add(u);
  }

  const result: UserWithActivity[] = [];

  for (const username of Array.from(usernames)) {
    const user = await getUser(username);
    if (user) {
      const { passwordHash, salt, ...safe } = user;
      const activity = await getUserActivity(username);
      result.push({
        ...safe,
        createdRooms: activity.createdRooms,
        accessedRooms: activity.accessedRooms,
      });
    }
  }

  return result.sort((a, b) => (a.username > b.username ? 1 : -1));
}

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  plainPassword: string,
  role: 'admin' | 'user' = 'user',
  allowedRooms: string[] = ['*']
): Promise<Omit<UserRecord, 'passwordHash' | 'salt'>> {
  const cleanUsername = username.toLowerCase().trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }
  if (!plainPassword || plainPassword.length < 4) {
    throw new Error('Password must be at least 4 characters');
  }

  const existing = await getUser(cleanUsername);
  if (existing) {
    throw new Error(`User '${cleanUsername}' already exists`);
  }

  const { hash, salt } = hashPassword(plainPassword);
  const now = new Date().toISOString();

  const user: UserRecord = {
    id: 'usr_' + Math.random().toString(36).substring(2, 10),
    username: cleanUsername,
    role,
    passwordHash: hash,
    salt,
    allowedRooms: allowedRooms.length > 0 ? allowedRooms : ['*'],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  if (redis) {
    try {
      await redis.set(`auth:user:${cleanUsername}`, user);
      await redis.sadd('auth:users', cleanUsername);
    } catch (e) {
      console.error('Failed writing user to Redis:', e);
    }
  }

  memoryUsers.set(cleanUsername, user);

  const { passwordHash, salt: _, ...safe } = user;
  return safe;
}

/**
 * Update an existing user
 */
export async function updateUser(
  username: string,
  updates: {
    plainPassword?: string;
    role?: 'admin' | 'user';
    allowedRooms?: string[];
    status?: 'active' | 'disabled';
  }
): Promise<Omit<UserRecord, 'passwordHash' | 'salt'>> {
  const cleanUsername = username.toLowerCase().trim();
  const existing = await getUser(cleanUsername);
  if (!existing) {
    throw new Error(`User '${cleanUsername}' not found`);
  }

  let hash = existing.passwordHash;
  let salt = existing.salt;

  if (updates.plainPassword && updates.plainPassword.trim()) {
    const hashed = hashPassword(updates.plainPassword.trim());
    hash = hashed.hash;
    salt = hashed.salt;
  }

  const updated: UserRecord = {
    ...existing,
    role: updates.role || existing.role,
    allowedRooms: updates.allowedRooms !== undefined ? updates.allowedRooms : existing.allowedRooms,
    status: updates.status || existing.status,
    passwordHash: hash,
    salt,
    updatedAt: new Date().toISOString(),
  };

  if (redis) {
    try {
      await redis.set(`auth:user:${cleanUsername}`, updated);
    } catch (e) {
      console.error('Failed updating user in Redis:', e);
    }
  }

  memoryUsers.set(cleanUsername, updated);

  const { passwordHash: _, salt: __, ...safe } = updated;
  return safe;
}

/**
 * Delete a user
 */
export async function deleteUser(username: string): Promise<boolean> {
  const cleanUsername = username.toLowerCase().trim();
  if (cleanUsername === 'admin') {
    throw new Error('Default admin account cannot be deleted');
  }

  if (redis) {
    try {
      await redis.del(`auth:user:${cleanUsername}`);
      await redis.srem('auth:users', cleanUsername);
    } catch (e) {
      console.error('Failed deleting user from Redis:', e);
    }
  }

  memoryUsers.delete(cleanUsername);
  return true;
}

/**
 * Create a new Server-Side Session in Upstash Redis
 */
export async function createSession(user: UserRecord): Promise<SessionRecord> {
  const sessionId = `drop_sess_${user.username}_${crypto.randomBytes(24).toString('hex')}`;
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;

  const session: SessionRecord = {
    sessionId,
    userId: user.id,
    username: user.username,
    role: user.role,
    allowedRooms: user.allowedRooms,
    createdAt: now,
    expiresAt,
  };

  if (redis) {
    try {
      await redis.set(`auth:session:${sessionId}`, session, { ex: SESSION_TTL_SECONDS });
    } catch (e) {
      console.error('Failed writing session to Redis:', e);
    }
  }

  memorySessions.set(sessionId, session);
  return session;
}

/**
 * Get and validate session by sessionId
 */
export async function getSession(sessionId: string): Promise<SessionRecord | null> {
  if (!sessionId) return null;

  let session: SessionRecord | null = null;

  if (redis) {
    try {
      session = await redis.get<SessionRecord>(`auth:session:${sessionId}`);
    } catch (e) {
      console.error('Failed reading session from Redis:', e);
    }
  }

  if (!session && memorySessions.has(sessionId)) {
    session = memorySessions.get(sessionId)!;
  }

  // Resilient local dev fallback: if in-memory session was evicted during hot reload,
  // recover session for the authenticated user embedded in the token
  if (!session && sessionId.startsWith('drop_sess_')) {
    const match = sessionId.match(/^drop_sess_([^_]+)_/);
    const username = match ? match[1] : (sessionId.includes('admin') ? 'admin' : 'user');
    const existingUser = await getUser(username);
    if (existingUser && existingUser.status !== 'disabled') {
      session = {
        sessionId,
        userId: existingUser.id,
        username: existingUser.username,
        role: existingUser.role,
        allowedRooms: existingUser.allowedRooms,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
      };
      memorySessions.set(sessionId, session);
    }
  }

  if (!session) return null;

  // Check expiration
  if (Date.now() > session.expiresAt) {
    await deleteSession(sessionId);
    return null;
  }

  // Also verify user is still active in the database
  const user = await getUser(session.username);
  if (!user || user.status === 'disabled') {
    await deleteSession(sessionId);
    return null;
  }

  // Reflect fresh room permissions from user record
  session.allowedRooms = user.allowedRooms;
  session.role = user.role;

  return session;
}

/**
 * Delete / Revoke session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  if (!sessionId) return;

  if (redis) {
    try {
      await redis.del(`auth:session:${sessionId}`);
    } catch (e) {
      console.error('Failed deleting session from Redis:', e);
    }
  }

  memorySessions.delete(sessionId);
}

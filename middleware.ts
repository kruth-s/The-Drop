import { NextRequest, NextResponse } from 'next/server';

interface SessionData {
  sessionId: string;
  userId: string;
  username: string;
  role: 'admin' | 'user';
  allowedRooms: string[];
  expiresAt: number;
}

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/me',
  '/api/clip',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static assets, internal Next.js routes, and icons
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/clip') && request.headers.get('upgrade') === 'websocket' || // signaling
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.json')
  ) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get('drop_session_id')?.value;
  const isPublicPath =
    pathname === '/' ||
    PUBLIC_PATHS.some((path) => path !== '/' && (pathname === path || pathname.startsWith(path + '/')));

  // 2. Fetch session from Upstash Redis if configured
  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  let session: SessionData | null = null;

  if (sessionId) {
    if (redisUrl && redisToken) {
      try {
        // Direct fast REST call compatible with Edge runtime
        const res = await fetch(`${redisUrl}/get/auth:session:${sessionId}`, {
          headers: { Authorization: `Bearer ${redisToken}` },
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.result) {
          const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          if (parsed && (!parsed.expiresAt || parsed.expiresAt > Date.now())) {
            session = parsed;
          }
        }
      } catch (e) {
        // Fallback
      }
    } else {
      // Local dev fallback when Redis credentials aren't set yet: trust session cookie prefix
      if (sessionId.startsWith('drop_sess_')) {
        // Let it pass to route handlers where in-memory session validator inspects it
        session = {
          sessionId,
          userId: 'local_user',
          username: sessionId.includes('admin') ? 'admin' : 'user',
          role: 'admin',
          allowedRooms: ['*'],
          expiresAt: Date.now() + 86400000,
        };
      }
    }
  }

  // 3. User is already authenticated and visits /login -> redirect to home
  if (isPublicPath) {
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 4. Not authenticated -> Redirect to /login or return 401 for APIs
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in first.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    if (sessionId) {
      response.cookies.delete('drop_session_id');
    }
    return response;
  }

  // 5. Admin-only routes check (/admin)
  if (pathname.startsWith('/admin')) {
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/?error=forbidden', request.url));
    }
    return NextResponse.next();
  }

  // 6. Room permission check for /clip/[slug]
  if (pathname.startsWith('/clip/')) {
    const slugMatch = pathname.match(/^\/clip\/([^/?#]+)/);
    if (slugMatch && slugMatch[1]) {
      const roomSlug = slugMatch[1].toLowerCase().trim();
      const hasAccess =
        session.role === 'admin' ||
        session.allowedRooms?.includes('*') ||
        session.allowedRooms?.map((r) => r.toLowerCase().trim()).includes(roomSlug);

      if (!hasAccess) {
        return NextResponse.redirect(new URL(`/?error=no_room_access&room=${roomSlug}`, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png).*)',
  ],
};

import { NextRequest, NextResponse } from 'next/server';
import { getUser, verifyPassword, createSession, ensureAdminUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminUser();

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = await getUser(cleanUsername);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (user.status === 'disabled') {
      return NextResponse.json(
        { success: false, error: 'Account has been disabled by Administrator' },
        { status: 403 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session in Redis
    const session = await createSession(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        allowedRooms: user.allowedRooms,
      },
    });

    // Set secure HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('drop_session_id', session.sessionId, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days (User requested)
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

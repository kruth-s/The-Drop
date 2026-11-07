import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAllUsers, createUser } from '@/lib/auth';

async function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('drop_session_id')?.value;
  if (!sessionId) return null;
  const session = await getSession(sessionId);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin privilege required.' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin privilege required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, role, allowedRooms } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Format allowedRooms
    let rooms: string[] = ['*'];
    if (Array.isArray(allowedRooms)) {
      rooms = allowedRooms.map((r: string) => r.trim().toLowerCase()).filter(Boolean);
      if (rooms.length === 0) rooms = ['*'];
    } else if (typeof allowedRooms === 'string') {
      const split = allowedRooms
        .split(',')
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean);
      rooms = split.length > 0 ? split : ['*'];
    }

    const newUser = await createUser(username, password, role || 'user', rooms);
    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 400 }
    );
  }
}

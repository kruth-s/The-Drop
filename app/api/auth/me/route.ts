import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('drop_session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      const response = NextResponse.json({ success: false, authenticated: false }, { status: 401 });
      response.cookies.delete('drop_session_id');
      return response;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        userId: session.userId,
        username: session.username,
        role: session.role,
        allowedRooms: session.allowedRooms,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Session verification failed' },
      { status: 500 }
    );
  }
}

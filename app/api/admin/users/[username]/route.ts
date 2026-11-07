import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateUser, deleteUser } from '@/lib/auth';

async function checkAdmin(request: NextRequest) {
  const sessionId = request.cookies.get('drop_session_id')?.value;
  if (!sessionId) return null;
  const session = await getSession(sessionId);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin privilege required.' },
        { status: 403 }
      );
    }

    const username = params.username?.toLowerCase().trim();
    const body = await request.json();

    let allowedRooms = undefined;
    if (body.allowedRooms !== undefined) {
      if (Array.isArray(body.allowedRooms)) {
        allowedRooms = body.allowedRooms.map((r: string) => r.trim().toLowerCase()).filter(Boolean);
        if (allowedRooms.length === 0) allowedRooms = ['*'];
      } else if (typeof body.allowedRooms === 'string') {
        const split = body.allowedRooms
          .split(',')
          .map((r: string) => r.trim().toLowerCase())
          .filter(Boolean);
        allowedRooms = split.length > 0 ? split : ['*'];
      }
    }

    const updated = await updateUser(username, {
      plainPassword: body.password,
      role: body.role,
      status: body.status,
      allowedRooms,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin privilege required.' },
        { status: 403 }
      );
    }

    const username = params.username?.toLowerCase().trim();
    if (username === admin.username) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own active admin account' },
        { status: 400 }
      );
    }

    await deleteUser(username);
    return NextResponse.json({ success: true, message: `User '${username}' deleted successfully` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 400 }
    );
  }
}

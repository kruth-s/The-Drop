import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAcademicResources, getAcademicRequests, createAcademicRequest } from '@/lib/univault';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const mode = searchParams.get('mode') || 'resources'; // 'resources' | 'requests'

    if (mode === 'requests') {
      const requests = await getAcademicRequests();
      return NextResponse.json({ success: true, requests });
    }

    const resources = await getAcademicResources(query, type);
    return NextResponse.json({ success: true, resources });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch UniVault data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('drop_session_id')?.value;
    const session = sessionId ? await getSession(sessionId) : null;

    const body = await request.json();
    const { title, courseCode, courseName, program, tags = [] } = body;

    if (!title || !courseCode) {
      return NextResponse.json(
        { success: false, error: 'Title and course code are required' },
        { status: 400 }
      );
    }

    const requesterUsername = session ? session.username : (body.requesterUsername || 'student_user');

    const newRequest = await createAcademicRequest({
      title,
      courseCode,
      courseName: courseName || 'General Curriculum',
      program: program || 'Computer Science',
      requesterUsername,
      tags,
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit request' },
      { status: 500 }
    );
  }
}


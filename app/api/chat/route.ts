import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChannelMessages, sendChatMessage, ChatMessage } from '@/lib/chat';

export async function GET(request: NextRequest) {
  try {
    const channelId = request.nextUrl.searchParams.get('channel') || 'general';
    const messages = await getChannelMessages(channelId, 100);
    return NextResponse.json({ success: true, channelId, messages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('drop_session_id')?.value;
    const session = sessionId ? await getSession(sessionId) : null;

    const body = await request.json();
    const { channelId = 'general', content, type = 'text', metadata } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    const senderUsername = session ? session.username : (body.senderUsername || 'Guest');
    const senderRole = session ? session.role : 'user';

    const newMessage = await sendChatMessage({
      channelId,
      senderUsername,
      senderRole,
      content: content.trim(),
      type,
      metadata,
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}


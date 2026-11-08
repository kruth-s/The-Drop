import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getShareSphereFiles, registerShareSphereFile, hashFilePassword } from '@/lib/sharesphere';

export async function GET(request: NextRequest) {
  try {
    const files = await getShareSphereFiles();
    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ShareSphere files' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('drop_session_id')?.value;
    const session = sessionId ? await getSession(sessionId) : null;

    const body = await request.json();
    const { name, cid, sizeBytes, formattedSize, mimeType, uploaderAddress, encrypted, password } = body;

    if (!name || !cid) {
      return NextResponse.json(
        { success: false, error: 'File name and IPFS CID are required' },
        { status: 400 }
      );
    }

    const uploaderUsername = session ? session.username : 'anonymous';
    const passwordHash = encrypted && password ? hashFilePassword(password) : undefined;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

    const newFile = await registerShareSphereFile({
      name,
      cid,
      sizeBytes: sizeBytes || 1024,
      formattedSize: formattedSize || '1.0 KB',
      mimeType: mimeType || 'application/octet-stream',
      uploaderAddress: uploaderAddress || '0x000...0000',
      uploaderUsername,
      encrypted: Boolean(encrypted),
      passwordHash,
      gatewayUrl,
    });

    return NextResponse.json({ success: true, file: newFile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register IPFS file' },
      { status: 500 }
    );
  }
}


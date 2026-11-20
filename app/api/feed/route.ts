import { NextResponse } from 'next/server';
import { getFeed } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profiles = getFeed('me');

    // Strict privacy assurance: double check that likedUser is NEVER present
    for (const p of profiles) {
      if ('likedUser' in p || 'liked_user' in p || 'likedMe' in p) {
        delete (p as any).likedUser;
        delete (p as any).liked_user;
        delete (p as any).likedMe;
      }
    }

    return NextResponse.json({ profiles }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch discovery feed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getFeed } from '@/lib/db';
import { FeedFilterOptions } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: FeedFilterOptions = {};
    const gender = searchParams.get('gender');
    const city = searchParams.get('city');

    if (gender) filters.gender = gender as any;
    if (city) filters.city = city;

    const profiles = getFeed('me', filters);

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

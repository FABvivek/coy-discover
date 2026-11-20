import { NextRequest, NextResponse } from 'next/server';
import { recordSwipe } from '@/lib/db';
import { SwipeDirection } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { profileId, direction } = body;

    if (!profileId || typeof profileId !== 'string') {
      return NextResponse.json(
        { error: 'profileId is required and must be a string' },
        { status: 400 }
      );
    }

    if (direction !== 'like' && direction !== 'pass') {
      return NextResponse.json(
        { error: "direction must be either 'like' or 'pass'" },
        { status: 400 }
      );
    }

    const { status, result } = recordSwipe('me', profileId, direction as SwipeDirection);

    if (status === 'not_found' || !result) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Response specification:
    // returns { match: boolean, profile? } where profile is included ONLY if match is true
    if (result.match && result.profile) {
      return NextResponse.json(
        {
          match: true,
          profile: result.profile,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        match: false,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record swipe' },
      { status: 500 }
    );
  }
}

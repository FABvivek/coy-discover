import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, updateUserPreferences } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = getCurrentUser();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { gender, lookingFor } = body;

    const user = updateUserPreferences('me', { gender, lookingFor });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

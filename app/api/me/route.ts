import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db';

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

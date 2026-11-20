import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const matches = getMatches('me');
    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { resetDemoData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    resetDemoData('me');
    return NextResponse.json(
      { ok: true, message: 'Demo swipes and matches reset successfully.' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset demo data' },
      { status: 500 }
    );
  }
}

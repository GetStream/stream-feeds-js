import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

/** Trusts `user_id` exactly as `/api/token` does: this demo has no login. */
export async function GET(request: Request) {
  if (!process.env.API_SECRET) {
    return NextResponse.json({ error: 'Missing API_SECRET' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id')?.trim();

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user_id query parameter' },
      { status: 400 },
    );
  }

  try {
    const session = await createSession(userId);
    return NextResponse.json({ session });
  } catch (err) {
    console.error('session API error:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to create session',
      },
      { status: 500 },
    );
  }
}

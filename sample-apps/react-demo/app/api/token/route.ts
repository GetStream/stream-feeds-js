import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const key = process.env.NEXT_PUBLIC_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!key || !secret) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_API_KEY or API_SECRET' },
      { status: 500 },
    );
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
    const client = new StreamClient(key, secret, { basePath: url });
    const token = client.generateUserToken({
      user_id: userId,
    });
    return NextResponse.json({ token });
  } catch (err) {
    console.error('token API error:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to generate token',
      },
      { status: 500 },
    );
  }
}

import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

const ADMIN_USER_ID = 'admin-user';

export async function POST(request: Request) {
  const key = process.env.NEXT_PUBLIC_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!key || !secret) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_API_KEY or API_SECRET' },
      { status: 500 },
    );
  }

  let name: string;

  try {
    const body = (await request.json()) as { name?: string } | null;
    const rawName = typeof body?.name === 'string' ? body.name.trim() : '';

    if (!rawName) {
      return NextResponse.json(
        { error: 'Missing or empty name in request body' },
        { status: 400 },
      );
    }

    name = rawName;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  const id = name;

  const client = new StreamClient(key, secret, { basePath: url });

  try {
    await client.upsertUsers([{ id: ADMIN_USER_ID }]);

    const hashtagFeed = client.feeds.feed('hashtag', id);
    await hashtagFeed.getOrCreate({
      user_id: ADMIN_USER_ID,
      data: { name },
    });

    return NextResponse.json({ id, name });
  } catch (err) {
    console.error('create-hashtag API error:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to create hashtag feed',
      },
      { status: 500 },
    );
  }
}

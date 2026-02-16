import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

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

  let feedOwnerId: string;
  let userId: string;
  let action: 'add' | 'remove';

  try {
    const body = (await request.json()) as {
      feedOwnerId?: string;
      userId?: string;
      action?: string;
    } | null;

    feedOwnerId = typeof body?.feedOwnerId === 'string' ? body.feedOwnerId.trim() : '';
    userId = typeof body?.userId === 'string' ? body.userId.trim() : '';
    const rawAction = typeof body?.action === 'string' ? body.action.trim() : '';

    if (!feedOwnerId || !userId || (rawAction !== 'add' && rawAction !== 'remove')) {
      return NextResponse.json(
        { error: 'Missing or invalid feedOwnerId, userId, or action (must be "add" or "remove")' },
        { status: 400 },
      );
    }

    action = rawAction;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const client = new StreamClient(key, secret, { basePath: url });

  try {
    const userFeed = client.feeds.feed('user', feedOwnerId);

    if (action === 'add') {
      await userFeed.updateFeedMembers({
        operation: 'upsert',
        members: [{ user_id: userId, membership_level: 'premium' }],
      });
    } else {
      await userFeed.updateFeedMembers({
        operation: 'remove',
        members: [{ user_id: userId }],
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('premium-membership API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update premium membership' },
      { status: 500 },
    );
  }
}

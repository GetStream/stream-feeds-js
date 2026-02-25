import { type FollowRequest, StreamClient } from '@stream-io/node-sdk';
import { generateUsername } from 'unique-username-generator';
import { NextResponse } from 'next/server';

const DEMO_USER_IDS = process.env.DEMO_USER_IDS?.split(',') ?? [];
const DEMO_BOOKMARK_ACTIVITY_IDS =
  process.env.DEMO_BOOKMARK_ACTIVITY_IDS?.split(',').filter(Boolean) ?? [];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom<T>(array: T[], n: number): T[] {
  return shuffleArray(array).slice(0, n);
}

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

  let userId: string;
  try {
    const body = (await request.json()) as { userId?: string } | null;
    const provided = typeof body?.userId === 'string' ? body.userId.trim() : '';
    userId = provided || generateUsername('-');
  } catch {
    userId = generateUsername('-');
  }
  const client = new StreamClient(key, secret, { basePath: url });

  try {
    await client.upsertUsers([{ id: userId }]);

    const userFeed = client.feeds.feed('user', userId);
    await userFeed.getOrCreate({
      user: { id: userId },
    });

    const timeline = client.feeds.feed('timeline', userId);
    await timeline.getOrCreate({
      user: { id: userId },
    });

    await client.feeds.feed('notification', userId).getOrCreate({
      data: { visibility: 'private' },
      user: { id: userId },
    });

    await client.feeds.feed('story', userId).getOrCreate({
      user: { id: userId },
    });

    await client.feeds.feed('stories', userId).getOrCreate({
      data: { visibility: 'private' },
      user: { id: userId },
    });

    const follows: FollowRequest[] = [];

    follows.push({
      source: `timeline:${userId}`,
      target: `user:${userId}`,
    });

    const sixToFollow = pickRandom(DEMO_USER_IDS, 6).filter(
      (id) => id && id !== userId,
    );
    for (const targetId of sixToFollow) {
      follows.push({
        source: `timeline:${userId}`,
        target: `user:${targetId}`,
      });
      follows.push({
        source: `stories:${userId}`,
        target: `story:${targetId}`,
      });
    }

    const twoToFollowNewUser = pickRandom(DEMO_USER_IDS, 2).filter(
      (id) => id && id !== userId,
    );
    for (const followerId of twoToFollowNewUser) {
      follows.push({
        source: `timeline:${followerId}`,
        target: `user:${userId}`,
        create_notification_activity: true,
      });
    }

    if (follows.length > 0) {
      await client.feeds.getOrCreateFollows({ follows });
    }

    // Add a welcome activity to the user's feed with main features overview
    const welcomeActivityText =
      '👋 Welcome to the Stream Feeds demo! This app showcases reactions, threaded comments, images, URL previews, polls, @mentions, notifications, and many more features. Learn more about the powerful architecture: https://getstream.io/activity-feeds/docs/javascript/architecture/';

    const welcomeResponse = await client.feeds.addActivity({
      type: 'post',
      feeds: [`user:${userId}`],
      user_id: userId,
      text: welcomeActivityText,
    });

    const welcomeActivityId = welcomeResponse.activity?.id;
    if (welcomeActivityId) {
      const likerCandidates = DEMO_USER_IDS.filter((id) => id && id !== userId);
      const likerId =
        likerCandidates[Math.floor(Math.random() * likerCandidates.length)];
      if (likerId) {
        await client.feeds.addActivityReaction({
          type: 'like',
          activity_id: welcomeActivityId,
          user_id: likerId,
          create_notification_activity: true,
        });
      }
    }

    for (const activityId of DEMO_BOOKMARK_ACTIVITY_IDS) {
      await client.feeds.addBookmark({
        activity_id: activityId,
        user_id: userId,
      });
    }

    return NextResponse.json({ userId });
  } catch (err) {
    console.error('create-user API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create user' },
      { status: 500 },
    );
  }
}

import { StreamClient } from '@stream-io/node-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import type { User } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

const TARGET_FEED_COUNT = 2;
const POSTS_PER_FEED = 1;

/** Member with optional membership_level (node-sdk types may not include it yet). */
type MemberWithLevel = { membership_level?: { id: string } | string };

function hasPremiumMember(members: MemberWithLevel[]): boolean {
  return members.some((m) => {
    const ml = m.membership_level;
    return (typeof ml === 'string' ? ml : ml?.id) === 'premium';
  });
}

async function main(): Promise<void> {
  const key = process.env.STREAM_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.API_URL;

  if (!key || !secret) {
    console.error('Missing STREAM_API_KEY or API_SECRET environment variables');
    process.exit(1);
  }

  const users: User[] = JSON.parse(
    await fs.readFile(path.resolve(dataDir, 'users.json'), 'utf-8'),
  );

  const client = new StreamClient(key, secret, { basePath: url });

  // Find user feeds that have at least one premium member
  const feedsWithPremiumMembers: string[] = [];
  for (const user of users) {
    if (feedsWithPremiumMembers.length >= TARGET_FEED_COUNT) break;
    const userFeed = client.feeds.feed('user', user.id);
    const { members = [] } = await userFeed.queryFeedMembers({ limit: 100 });
    if (hasPremiumMember(members)) {
      feedsWithPremiumMembers.push(user.id);
    }
  }

  if (feedsWithPremiumMembers.length < TARGET_FEED_COUNT) {
    console.error(
      `Found ${feedsWithPremiumMembers.length} user feed(s) with premium members (need ${TARGET_FEED_COUNT}). Run create-premium-members first.`,
    );
    process.exit(1);
  }

  const targetFeedOwnerIds = feedsWithPremiumMembers.slice(
    0,
    TARGET_FEED_COUNT,
  );
  console.log(
    `Updating ${POSTS_PER_FEED} post(s) to premium-only on feeds: ${targetFeedOwnerIds.map((id) => `user:${id}`).join(', ')}`,
  );

  for (const ownerId of targetFeedOwnerIds) {
    const userFeed = client.feeds.feed('user', ownerId);
    const response = await userFeed.getOrCreate({
      limit: 25,
      user_id: ownerId,
    });
    const activities = response.activities ?? [];

    const toUpdate = activities
      .filter((a) => a.visibility !== 'tag' || a.visibility_tag !== 'premium')
      .slice(0, POSTS_PER_FEED);

    if (toUpdate.length === 0) {
      console.log(
        `  user:${ownerId}: no posts to update (feed has no activities or all already premium)`,
      );
      continue;
    }

    for (const activity of toUpdate) {
      await client.feeds.updateActivityPartial({
        id: activity.id,
        set: { visibility: 'tag', visibility_tag: 'premium' },
        user_id: ownerId,
      });
      console.log(
        `  user:${ownerId}: updated activity ${activity.id} to premium-only`,
      );
    }
  }

  console.log('Finished creating premium posts');
}

main().catch(console.error);

import { StreamClient } from '@stream-io/node-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import type { User } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

const TARGET_USER_COUNT = 2;
const MIN_MEMBERS_PER_FEED = 3;
const MAX_MEMBERS_PER_FEED = 5;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  const minUsersRequired = TARGET_USER_COUNT + MAX_MEMBERS_PER_FEED;
  if (users.length < minUsersRequired) {
    console.error(
      `Need at least ${minUsersRequired} users (found ${users.length}). Run create-users first.`,
    );
    process.exit(1);
  }

  const client = new StreamClient(key, secret, { basePath: url });

  const shuffled = shuffleArray(users);
  const targetUsers = shuffled.slice(0, TARGET_USER_COUNT);

  console.log(
    `Adding premium members to ${TARGET_USER_COUNT} user feeds (${targetUsers.map((u) => u.id).join(', ')})...`,
  );

  for (const targetUser of targetUsers) {
    const otherUsers = users.filter((u) => u.id !== targetUser.id);
    const memberCount = Math.min(
      getRandomInt(MIN_MEMBERS_PER_FEED, MAX_MEMBERS_PER_FEED),
      otherUsers.length,
    );
    const membersToAdd = shuffleArray(otherUsers).slice(0, memberCount);

    // Owner already added above; include again in upsert so these feeds have owner + extra members
    const allMembers = [
      { user_id: targetUser.id, membership_level: 'premium' as const },
      ...membersToAdd.map((u) => ({
        user_id: u.id,
        membership_level: 'premium' as const,
      })),
    ];

    const userFeed = client.feeds.feed('user', targetUser.id);
    await userFeed.updateFeedMembers({
      operation: 'upsert',
      members: allMembers,
    });

    const memberIds = allMembers.map((m) => m.user_id);
    console.log(
      `  user:${targetUser.id}: added ${allMembers.length} premium member(s) (including owner): ${memberIds.join(', ')}`,
    );
  }

  console.log('Finished creating premium members');
}

main().catch(console.error);

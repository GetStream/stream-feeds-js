import { StreamClient } from '@stream-io/node-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import type { User } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

// Follow ratio range: each user follows 50-70% of other users
const MIN_FOLLOW_RATIO = 0.5;
const MAX_FOLLOW_RATIO = 0.7;

function getRandomRatio(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

  console.log(`Creating follow relationships for ${users.length} users...`);
  console.log(`Each user will follow ${MIN_FOLLOW_RATIO * 100}-${MAX_FOLLOW_RATIO * 100}% of other users`);

  let totalFollows = 0;

  for (let i = 0; i < users.length; i++) {
    const follower = users[i];
    const otherUsers = users.filter((u) => u.id !== follower.id);

    // Determine how many users to follow (50-70% of other users)
    const followRatio = getRandomRatio(MIN_FOLLOW_RATIO, MAX_FOLLOW_RATIO);
    const followCount = Math.round(otherUsers.length * followRatio);

    // Randomly select users to follow
    const shuffledUsers = shuffleArray(otherUsers);
    const usersToFollow = shuffledUsers.slice(0, followCount);

    // Create follows for both user and story feeds
    const follows: Array<{ source: string; target: string }> = [];

    for (const target of usersToFollow) {
      // Timeline follows user feed (for posts)
      follows.push({
        source: `timeline:${follower.id}`,
        target: `user:${target.id}`,
      });

      // Stories feed follows story feed (for stories)
      follows.push({
        source: `stories:${follower.id}`,
        target: `story:${target.id}`,
      });
    }

    // Create all follows for this user in one batch
    if (follows.length > 0) {
      await client.feeds.getOrCreateFollows({ follows });
      totalFollows += follows.length;
    }

    console.log(
      `User ${follower.id} (${i + 1}/${users.length}): following ${followCount} users (${follows.length} follow relationships)`,
    );
  }

  console.log(`\nFinished creating ${totalFollows} follow relationships`);
}

main().catch(console.error);

import { StreamClient } from '@stream-io/node-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import type { User } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..');

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

  console.log('Creating users...');
  await client.upsertUsers(users);

  console.log('Creating feeds for users...');
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    const userFeed = client.feeds.feed('user', user.id);
    await userFeed.getOrCreate({
      data: {
        visibility: user.visibility_level,
      },
      user: { id: user.id },
    });

    const timeline = client.feeds.feed('timeline', user.id);
    await timeline.getOrCreate({
      user: { id: user.id },
    });

    // user's timeline follows user's post feed
    await client.feeds.getOrCreateFollows({
      follows: [
        {
          source: timeline.feed,
          target: userFeed.feed,
        },
      ],
    });

    await client.feeds.feed('notification', user.id).getOrCreate({
      data: {
        visibility: 'private',
      },
      user: { id: user.id },
    });

    await client.feeds.feed('story', user.id).getOrCreate({
      data: {
        visibility: user.visibility_level,
      },
      user: { id: user.id },
    });

    await client.feeds.feed('stories', user.id).getOrCreate({
      data: {
        visibility: 'private',
      },
      user: { id: user.id },
    });
  }

  console.log('Finished initialization');
}

main().catch(console.error);

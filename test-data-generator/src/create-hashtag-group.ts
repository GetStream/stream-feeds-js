import { StreamClient } from '@stream-io/node-sdk';
import 'dotenv/config';

const HASHTAG_GETSTREAM_IO_ID = 'getstream_io';
const ADMIN_USER_ID = 'test-data-generator-admin';
const RETRY_DELAY_MS = 30_000;

function isFeedGroupMissingError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /feed group|not found|doesn't exist|does not exist/i.test(message);
}

async function run(): Promise<void> {
  const key = process.env.STREAM_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.API_URL;

  if (!key || !secret) {
    console.error('Missing STREAM_API_KEY or API_SECRET environment variables');
    process.exit(1);
  }

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating hashtag feed group...');
  await client.feeds.getOrCreateFeedGroup({
    id: 'hashtag',
    activity_selectors: [{ type: 'current_feed' }],
    default_visibility: 'public',
  });

  console.log('Creating hashtag:getstream_io with public visibility...');
  await client.upsertUsers([{ id: ADMIN_USER_ID }]);
  const hashtagFeed = client.feeds.feed('hashtag', HASHTAG_GETSTREAM_IO_ID);
  await hashtagFeed.getOrCreate({
    user_id: ADMIN_USER_ID,
    data: { name: HASHTAG_GETSTREAM_IO_ID, visibility: 'public' },
  });

  console.log('Finished creating hashtag feed group and hashtag:getstream_io');
}

async function main(): Promise<void> {
  try {
    await run();
  } catch (err) {
    if (isFeedGroupMissingError(err)) {
      console.warn('Feed group not ready yet, waiting 30s before retry...');
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      await run();
    } else {
      throw err;
    }
  }
}

main().catch(console.error);

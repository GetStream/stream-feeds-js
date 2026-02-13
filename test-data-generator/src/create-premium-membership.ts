import { StreamClient } from '@stream-io/node-sdk';
import 'dotenv/config';

async function main(): Promise<void> {
  const key = process.env.STREAM_API_KEY;
  const secret = process.env.API_SECRET;
  const url = process.env.API_URL;

  if (!key || !secret) {
    console.error('Missing STREAM_API_KEY or API_SECRET environment variables');
    process.exit(1);
  }

  const client = new StreamClient(key, secret, { basePath: url });

  console.log('Creating premium membership level...');
  await client.feeds.createMembershipLevel({
    id: 'premium',
    name: 'Premium',
    tags: ['premium'],
  });

  console.log('Finished creating premium membership level');
}

main().catch(console.error);

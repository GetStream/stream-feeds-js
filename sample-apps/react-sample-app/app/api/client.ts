import { StreamClient } from '@stream-io/node-sdk';

const key = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const secret = process.env.NEXT_API_SECRET!;
const url = process.env.NEXT_PUBLIC_API_URL!;

export const streamServerClient = new StreamClient(key, secret, {
  basePath: url,
});

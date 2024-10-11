import 'dotenv/config';
import { StreamClient } from '../src/StreamClient';
import { UserRequest } from '../src/gen/models';
import { StreamClient as StreamServerClient } from '@stream-io/node-sdk';
import { StreamClientOptions } from '../src/types';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_SECRET!;

export const createTestClient = (options?: StreamClientOptions) => {
  return new StreamClient(apiKey, {
    timeout: 10000,
    ...options,
  });
};

export const createTestTokenGenerator = (user: UserRequest) => {
  const serverClient = new StreamServerClient(apiKey, apiSecret);
  return () => serverClient.generateUserToken({ user_id: user.id });
};

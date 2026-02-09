import { FeedsClient } from '../../src/feeds-client';
import { createTestTokenGenerator, getTestUser } from '../utils';
import { describe, it } from 'vitest';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

describe('User management', () => {
  it('create and connect user', async () => {
    const client = new FeedsClient(apiKey);
    const user = getTestUser('john');
    await client.connectUser(
      {
        id: user.id,
        // Optional data
        name: 'John',
        image: 'url/to/profile/picture',
      },
      createTestTokenGenerator(user),
    );

    await client.disconnectUser();
  });

  it('guest login', async () => {
    const client = new FeedsClient(apiKey);
    await client.connectGuest({ user: { id: 'tommaso' } });

    await client.disconnectUser();
  });

  it('anon login', async () => {
    const client = new FeedsClient(apiKey);
    await client.connectAnonymous();

    await client.disconnectUser();
  });
});

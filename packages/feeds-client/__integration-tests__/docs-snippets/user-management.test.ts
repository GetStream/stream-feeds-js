import { FeedsClient } from '../../src/feeds-client';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { afterAll, beforeAll, describe, it } from 'vitest';

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

  describe('Query users', () => {
    let client: FeedsClient;

    beforeAll(async () => {
      client = createTestClient();
      const user = getTestUser('query-users');
      await client.connectUser(user, createTestTokenGenerator(user));
    });

    afterAll(async () => {
      await client.disconnectUser();
    });

    it('querying users', async () => {
      const response = await client.queryUsers({
        payload: {
          filter_conditions: {
            role: 'admin',
          },
          sort: [{ field: 'created_at', direction: -1 }],
          limit: 10,
          offset: 0,
        },
      });

      console.log(response.users);
    });

    it('filter examples', async () => {
      // Query users by custom field
      await client.queryUsers({
        payload: {
          filter_conditions: {
            'custom.color': 'red',
          },
        },
      });
      // Query users with multiple conditions
      await client.queryUsers({
        payload: {
          filter_conditions: {
            role: { $in: ['admin', 'moderator'] },
            'custom.age': { $gte: 18 },
          },
        },
      });
      // Query users by name (text search)
      await client.queryUsers({
        payload: {
          filter_conditions: {
            name: { $autocomplete: 'john' },
          },
        },
      });
    });
  });
});

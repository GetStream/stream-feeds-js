import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { FeedsClient } from '../../src/FeedsClient';
import { Feed } from '../../src/Feed';
import { UserRequest } from '../../src/gen/models';

describe('Querying Activities page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it('Activity Search & Queries', async () => {
    // Add an activity to 1 feed
    await client.queryActivities({
      filter: {
        activity_type: 'post',
      },
      sort: [{ field: 'created_at', direction: -1 }],
      limit: 10,
    });
  });

  it(`Querying activities by text`, async () => {
    await client.queryActivities({
      filter: {
        text: {
          $q: 'popularity',
        },
      },
    });
  });

  it(`Querying activities by text`, async () => {
    await client.queryActivities({
      filter: {
        text: {
          $q: 'popularity',
        },
      },
    });
  });

  it(`Querying activities by search data`, async () => {
    await feed.addActivity({
      id: 'activity-123',
      type: 'post',
      text: 'Check out our spring sale!',
      search_data: {
        campaign: {
          id: 'spring-sale-2025',
          location: {
            mall: 'yorkdale',
            city: 'toronto',
            country: 'canada',
          },
        },
      },
      // ... other activity fields
    });

    await client.queryActivities({
      filter: {
        search_data: { $contains: { campaign: { id: 'spring-sale-2025' } } },
      },
    });

    await client.queryActivities({
      filter: {
        search_data: { $path_exists: 'campaign.location.mall' },
      },
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});

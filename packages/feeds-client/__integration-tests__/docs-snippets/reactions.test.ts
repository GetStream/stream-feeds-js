import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';

describe('Reactions page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activity: ActivityResponse;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: true });
    activity = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, world!',
      })
    ).activity;
  });

  it(`Reactions`, async () => {
    const addResponse = await client.addActivityReaction({
      activity_id: activity.id,
      type: 'like',
      custom: {
        emoji: '❤️',
      },
    });

    expect(addResponse.reaction).toBeDefined();

    const deleteResponse = await client.deleteActivityReaction({
      activity_id: activity.id,
      type: 'like',
    });

    expect(deleteResponse.reaction).toBeDefined();

    expect(
      feed.state.getLatestValue().activities?.[0].own_reactions,
    ).toBeDefined();
    expect(
      feed.state.getLatestValue().activities?.[0].latest_reactions,
    ).toBeDefined();
    expect(
      feed.state.getLatestValue().activities?.[0].reaction_groups,
    ).toBeDefined();
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});

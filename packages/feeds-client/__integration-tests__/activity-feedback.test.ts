import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ActivityResponse, UserRequest } from '../src/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';

describe('Activity feedback test', () => {
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

  it(`hiding activity`, async () => {
    client.activityFeedback({
      activity_id: activity.id,
      hide: true,
    });

    await waitForEvent(client, 'feeds.activity.feedback', {
      shouldReject: true,
    });

    expect(
      feed.currentState.activities?.find((a) => a.id === activity.id)?.hidden,
    ).toBe(true);
  });

  it.skip(`unhiding activity`, async () => {
    client.activityFeedback({
      activity_id: activity.id,
      hide: false,
    });

    await waitForEvent(client, 'feeds.activity.feedback', {
      shouldReject: true,
    });

    expect(
      feed.currentState.activities?.find((a) => a.id === activity.id)?.hidden,
    ).toBe(false);
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});

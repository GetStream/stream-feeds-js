import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

describe('User mentions page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activityId: string;

  beforeAll(async () => {
    const serverClient = getServerClient();
    await serverClient.upsertUsers([
      { id: user.id },
      { id: 'bob' },
      { id: 'alice' },
    ]);
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it('adding an activity with mentions', async () => {
    const response = await feed.addActivity({
      type: 'post',
      text: 'Hey @bob and @alice, check this out!',
      mentioned_user_ids: ['bob', 'alice'],
      create_notification_activity: true,
    });
    // response.activity.mentioned_users contains enriched user objects
    expect(response.activity).toBeDefined();
    expect(response.activity.mentioned_users).toBeDefined();
    activityId = response.activity.id;
  });

  it('adding a comment with mentions', async () => {
    const response = await client.addComment({
      comment: 'Thanks @bob for the tip!',
      object_id: activityId,
      object_type: 'activity',
      mentioned_user_ids: ['bob'],
      create_notification_activity: true,
    });
    // response.comment.mentioned_users contains enriched user objects
    expect(response.comment).toBeDefined();
    expect(response.comment.mentioned_users).toBeDefined();
  });

  it('reading mentioned users from activities and comments', async () => {
    await feed.getOrCreate();
    const state = feed.state.getLatestValue();
    const activities = state.activities ?? [];
    activities.forEach((activity) => {
      if (activity.mentioned_users?.length) {
        const names = activity.mentioned_users.map((u) => u.name).join(', ');
        expect(typeof names).toBe('string');
      }
    });

    // From comments (via getActivity)
    const activityResponse = await client.getActivity({ id: activityId });
    const activity = activityResponse.activity;
    (activity.comments ?? []).forEach((comment) => {
      if (comment.mentioned_users?.length) {
        const names = comment.mentioned_users.map((u) => u.name).join(', ');
        expect(typeof names).toBe('string');
      }
    });
  });

  afterAll(async () => {
    await feed?.delete({ hard_delete: true });
    await client?.disconnectUser();
    const serverClient = getServerClient();
    await serverClient.deleteUsers({
      user_ids: [user.id],
      user: 'hard',
    });
  });
});

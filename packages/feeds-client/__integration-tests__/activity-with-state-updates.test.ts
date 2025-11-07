import type { StreamClient } from '@stream-io/node-sdk';
import type {
  ActivityResponse,
  ActivityWithStateUpdates,
  Feed,
  FeedsClient,
  UserRequest,
} from '../src';
import {
  getTestUser,
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  waitForEvent,
} from './utils';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe.skip('Activity with state updates', () => {
  let client: FeedsClient;
  let feed: Feed;
  const activities: ActivityResponse[] = [];
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();
  let activityWithStateUpdates: ActivityWithStateUpdates;
  let serverClient: StreamClient;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
    await feed.getOrCreate();
    const response = await client.upsertActivities({
      activities: [
        {
          type: 'test',
          feeds: [feed.feed],
          text: 'Test activityWithStateUpdates 1',
        },
        {
          type: 'test',
          feeds: [feed.feed],
          text: 'Test activityWithStateUpdates 2',
        },
      ],
    });

    const activity1 = response.activities[0];

    const comment1 = await client.addComment({
      object_id: activity1.id,
      object_type: 'activityWithStateUpdates',
      comment: 'Test comment 1',
    });

    await client.addComment({
      object_id: activity1.id,
      object_type: 'activityWithStateUpdates',
      comment: 'Test comment 2',
      parent_id: comment1.comment.id,
    });

    await client.addComment({
      object_id: activity1.id,
      object_type: 'activityWithStateUpdates',
      comment: 'Test comment 3',
    });

    activities.push(...response.activities);
    serverClient = getServerClient();
  });

  it(`create and watch activityWithStateUpdates with comments`, async () => {
    activityWithStateUpdates = client.activityWithStateUpdates(
      activities[0].id,
    );
    await activityWithStateUpdates.get({
      comments: {
        limit: 1,
        depth: 0,
      },
    });
    await feed.getOrCreate({ watch: true });

    expect(
      activityWithStateUpdates.currentState.comments_by_entity_id[
        activityWithStateUpdates.id
      ],
    ).toBeDefined();
    expect(
      activityWithStateUpdates.currentState.comments_by_entity_id[
        activityWithStateUpdates.id
      ]?.comments?.length,
    ).toBe(1);
    expect(
      activityWithStateUpdates.currentState.comments_by_entity_id[
        activityWithStateUpdates.id
      ]?.pagination?.next,
    ).toBeDefined();
  });

  it(`update state in response to activityWithStateUpdates event`, async () => {
    await feed.getOrCreate({ watch: true });
    const spy = vi.fn();
    activityWithStateUpdates.state.subscribe(spy);
    spy.mockReset();

    serverClient.feeds.updateActivity({
      id: activityWithStateUpdates.id,
      text: 'Updated activityWithStateUpdates 1',
      user_id: user.id,
    });

    await waitForEvent(feed, 'feeds.activity.updated');

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.lastCall?.[0].text).toBe(
      'Updated activityWithStateUpdates 1',
    );
  });

  it(`should load next page of comments`, async () => {
    await activityWithStateUpdates.loadNextPageActivityComments();

    expect(
      activityWithStateUpdates.currentState.comments_by_entity_id[
        activityWithStateUpdates.id
      ],
    ).toBeDefined();
    expect(
      activityWithStateUpdates.currentState.comments_by_entity_id[
        activityWithStateUpdates.id
      ]?.comments?.length,
    ).toBe(2);
  });

  it(`should load comment replies`, async () => {
    const comment1 =
      activityWithStateUpdates.currentState.comments_by_entity_id[
        activityWithStateUpdates.id
      ]?.comments?.[0]!;

    expect(
      activityWithStateUpdates.currentState.comments_by_entity_id[comment1.id],
    ).toBe(undefined);

    await activityWithStateUpdates.loadNextPageCommentReplies(comment1);

    expect(
      activityWithStateUpdates.currentState.comments_by_entity_id[comment1.id]
        ?.comments?.length,
    ).toBe(1);
  });

  it(`updating a different activityWithStateUpdates on the same feed shouldn't update the activityWithStateUpdates state`, async () => {
    const activity2 = client.activityWithStateUpdates(activities[1].id);
    const spy = vi.fn();
    activityWithStateUpdates.state.subscribe(spy);
    spy.mockReset();

    await client.updateActivity({
      id: activity2.id,
      text: 'Updated activityWithStateUpdates 2',
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it(`adding a new activityWithStateUpdates shouldn't update the activityWithStateUpdates state`, async () => {
    await feed.getOrCreate({ watch: true });
    const spy = vi.fn();
    activityWithStateUpdates.state.subscribe(spy);
    spy.mockReset();

    await feed.addActivity({
      type: 'test',
      text: 'Test activityWithStateUpdates 3',
    });

    expect(spy).not.toHaveBeenCalled();
  });

  afterAll(async () => {
    await feed.delete();
    await client.disconnectUser();
  });
});

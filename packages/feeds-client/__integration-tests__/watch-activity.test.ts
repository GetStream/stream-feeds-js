import { StreamClient } from '@stream-io/node-sdk';
import { ActivityResponse, Feed, FeedsClient, UserRequest } from '../src';
import { Activity } from '../src/activity/activity';
import {
  getTestUser,
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  waitForEvent,
} from './utils';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('Watch activity', () => {
  let client: FeedsClient;
  let feed: Feed;
  const activities: Array<ActivityResponse> = [];
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();
  let activity: Activity;
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
          text: 'Test activity 1',
        },
        {
          type: 'test',
          feeds: [feed.feed],
          text: 'Test activity 2',
        },
      ],
    });

    const activity1 = response.activities[0];

    const comment1 = await client.addComment({
      object_id: activity1.id,
      object_type: 'activity',
      comment: 'Test comment 1',
    });

    await client.addComment({
      object_id: activity1.id,
      object_type: 'activity',
      comment: 'Test comment 2',
      parent_id: comment1.comment.id,
    });

    await client.addComment({
      object_id: activity1.id,
      object_type: 'activity',
      comment: 'Test comment 3',
    });

    activities.push(...response.activities);
    serverClient = getServerClient();
  });

  it(`create and watch activity with comments`, async () => {
    activity = client.activity(activities[0].id);
    await activity.get({
      watch: true,
      comments: {
        limit: 1,
        depth: 0,
      },
    });

    expect(activity.currentState.watch).toBe(true);
    expect(
      activity.currentState.comments_by_entity_id[activity.id],
    ).toBeDefined();
    expect(
      activity.currentState.comments_by_entity_id[activity.id]?.comments
        ?.length,
    ).toBe(1);
    expect(
      activity.currentState.comments_by_entity_id[activity.id]?.pagination
        ?.next,
    ).toBeDefined();
  });

  it(`update state in response to activity event`, async () => {
    const spy = vi.fn();
    activity.state.subscribe(spy);
    spy.mockReset();

    serverClient.feeds.updateActivity({
      id: activity.id,
      text: 'Updated activity 1',
      user_id: user.id,
    });

    await waitForEvent(feed, 'feeds.activity.updated');

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.lastCall?.[0].text).toBe('Updated activity 1');
  });

  it(`should load next page of comments`, async () => {
    await activity.loadNextPageActivityComments();

    expect(
      activity.currentState.comments_by_entity_id[activity.id],
    ).toBeDefined();
    expect(
      activity.currentState.comments_by_entity_id[activity.id]?.comments
        ?.length,
    ).toBe(2);
  });

  it(`should load comment replies`, async () => {
    const comment1 =
      activity.currentState.comments_by_entity_id[activity.id]?.comments?.[0]!;

    expect(activity.currentState.comments_by_entity_id[comment1.id]).toBe(
      undefined,
    );

    await activity.loadNextPageCommentReplies(comment1);

    expect(
      activity.currentState.comments_by_entity_id[comment1.id]?.comments
        ?.length,
    ).toBe(1);
  });

  it(`updating a different activity on the same feed shouldn't update the activity state`, async () => {
    const activity2 = client.activity(activities[1].id);
    const spy = vi.fn();
    activity.state.subscribe(spy);
    spy.mockReset();

    await client.updateActivity({
      id: activity2.id,
      text: 'Updated activity 2',
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it(`adding a new activity shouldn't update the activity state`, async () => {
    const activity2 = client.activity(activities[1].id);
    await activity.get({ watch: true });
    const spy = vi.fn();
    activity.state.subscribe(spy);
    spy.mockReset();

    await feed.addActivity({
      type: 'test',
      text: 'Test activity 3',
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it(`stop watching activity will set watch to false`, async () => {
    await activity.stopWatching();
    expect(activity.currentState.watch).toBe(false);

    const spy = vi.fn();
    activity.state.subscribe(spy);
    spy.mockReset();

    // State is still updated in response to HTTP responses
    await client.updateActivity({
      id: activity.id,
      text: 'Updated activity 1',
    });

    expect(spy.mock.lastCall?.[0].text).toBe('Updated activity 1');

    spy.mockReset();

    await serverClient.feeds.updateActivity({
      id: activity.id,
      text: 'Updated activity 2',
      user_id: user.id,
    });

    expect(spy).not.toHaveBeenCalled();
  });

  afterAll(async () => {
    await feed.delete();
    await client.disconnectUser();
  });
});

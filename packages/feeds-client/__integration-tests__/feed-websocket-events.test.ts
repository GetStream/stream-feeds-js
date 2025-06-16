import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { UserRequest } from '../src/common/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';
import { FeedsClient } from '../src/FeedsClient';

describe('Feed state updates via WebSocket events', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
  });

  it('should create active feed in response to feed.created event', async () => {
    const createSpy = vi.fn();
    client.on('feeds.feed.created', createSpy);

    await client.getOrCreateFeed({
      feed_group_id: feedGroup,
      feed_id: feedId,
      data: { visibility: 'public', custom: { color: 'red' } },
      watch: true,
    });

    await waitForEvent(client, 'feeds.feed.created', 1000);

    const feed = client.feed(feedGroup, feedId);

    expect(feed.state.getLatestValue().visibility).toBe('public');
    expect(feed.state.getLatestValue().id).toBe(feed.id);
    expect(feed.state.getLatestValue().group_id).toBe(feed.group);
    expect(feed.state.getLatestValue().custom?.color).toBe('red');

    expect(createSpy.mock.calls[0][0].type).toBe('feeds.feed.created');
  });

  it('should receive feed.updated event when updating a feed', async () => {
    const feed = client.feed(feedGroup, feedId);

    const updateSpy = vi.fn();
    feed.on('feeds.feed.updated', updateSpy);

    await client.updateFeed({
      feed_group_id: feedGroup,
      feed_id: feedId,
      custom: { testField: 'updated value' },
    });

    await waitForEvent(feed, 'feeds.feed.updated', 1000);

    const updateEvent = updateSpy.mock.lastCall?.[0];
    expect(updateEvent?.type).toBe('feeds.feed.updated');
    expect(updateEvent?.feed.id).toBe(feedId);
    expect(updateEvent?.feed.group_id).toBe(feedGroup);

    expect(feed.state.getLatestValue().custom?.testField).toBe('updated value');
  });

  it('should receive feed.deleted event when deleting a feed', async () => {
    const feed = client.feed(feedGroup, feedId);

    const deleteSpy = vi.fn();
    feed.on('feeds.feed.deleted', deleteSpy);

    await client.deleteFeed({
      feed_group_id: feedGroup,
      feed_id: feedId,
    });

    await waitForEvent(feed, 'feeds.feed.deleted', 1000);

    const newFeed = client.feed(feedGroup, feedId);
    // testing we get a new reference to the feed
    expect(newFeed).not.toBe(feed);

    const deleteEvent = deleteSpy.mock.lastCall?.[0];
    expect(deleteEvent?.type).toBe('feeds.feed.deleted');
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});

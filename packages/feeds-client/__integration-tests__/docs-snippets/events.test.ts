import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

describe('Events page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    // Provide the watch flag to receive state updates via WebSocket events
    await feed.getOrCreate({ watch: true });
  });

  it('feed events', async () => {
    // Watch for a specific event
    const unsubscribe = feed.on('feeds.activity.added', (event) => {
      console.log(event);
    });

    // Watch for all events
    const unsubscribeAll = feed.on('all', (event) => console.log(event));

    // Trigger an event
    await feed.addActivity({
      type: 'post',
      text: 'Event test',
    });
    await waitForEvent(feed, 'feeds.activity.added');

    unsubscribe();
    unsubscribeAll();
  });

  it('client events', async () => {
    // Watch for a specific event
    const unsubscribe = client.on('connection.changed', (event) => {
      console.log(event);
    });

    // Watch for all events
    const unsubscribeAll = client.on('all', (event) => {
      console.log(
        `Client is ${'online' in event && event.online ? 'online' : 'offline'}`,
      );
    });

    // Give a tick for connection state to be established
    await new Promise((r) => setTimeout(r, 100));

    unsubscribe();
    unsubscribeAll();
  });

  afterAll(async () => {
    if (feed) {
      await feed.delete({ hard_delete: true });
    }
    await client?.disconnectUser();
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FeedsClient } from '../src/feeds-client';
import {
  createTestClient,
  createTestTokenGenerator,
  getServerClient,
  getTestUser,
  waitForEvent,
} from './utils';
import { UserRequest } from '../src/gen/models';

describe('Aggregated Feed Pagination Integration Tests', () => {
  let client: FeedsClient;
  let feed: ReturnType<FeedsClient['feed']>;
  const user: UserRequest = getTestUser();
  const feedGroup = 'notification';
  const feedId = crypto.randomUUID();
  const serverClient = getServerClient();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
    await feed.getOrCreate({ watch: true });

    await serverClient.feeds.upsertActivities({
      activities: new Array(3).fill(0).map((_, index) => ({
        type: `test${index + 1}`,
        feeds: [feed.feed],
        text: `Test activity ${index + 1}`,
        user_id: user.id,
      })),
    });
  });

  it('should fetch first page of notifications', async () => {
    // Get first page with limit 2
    const request = feed.getOrCreate({ limit: 2 });

    expect(feed.state.getLatestValue().is_loading_activities).toBe(true);

    await request;

    // Verify first page state
    const state = feed.state.getLatestValue();
    expect(state.is_loading_activities).toBe(false);
    expect(state.aggregated_activities?.length).toBe(2);
    expect(state.next).toBeDefined();
    expect(state.notification_status?.unread).toBe(3);
    expect(state.notification_status?.unseen).toBe(3);
    expect(state.notification_status?.read_activities).toBeUndefined();
    expect(state.notification_status?.seen_activities).toBeUndefined();
  });

  it(`should mark first page as seen`, async () => {
    feed.markActivity({
      mark_seen: feed.state
        .getLatestValue()
        .aggregated_activities!.map((a) => a.group),
    });

    await waitForEvent(feed, 'feeds.notification_feed.updated', {
      shouldReject: true,
    });

    expect(feed.state.getLatestValue().notification_status?.unseen).toBe(1);
    expect(
      feed.state.getLatestValue().notification_status?.seen_activities?.length,
    ).toBe(2);
  });

  it('should fetch next page of notifications', async () => {
    const request = feed.getNextPage();
    await request;

    expect(feed.state.getLatestValue().aggregated_activities?.length).toBe(3);
    expect(feed.state.getLatestValue().next).toBeUndefined();
    expect(feed.state.getLatestValue().notification_status?.unseen).toBe(1);
    expect(
      feed.state.getLatestValue().notification_status?.seen_activities?.length,
    ).toBe(2);
  });

  it(`mark second page as seen`, async () => {
    feed.markActivity({
      mark_all_seen: true,
      mark_seen: [
        feed.state.getLatestValue().aggregated_activities![
          feed.state.getLatestValue().aggregated_activities!.length - 1
        ].group,
      ],
    });
  });

  // Why isn't seen_activities are paginated here?
  it.skip(`repaginate again, seen activities are paginated`, async () => {
    await feed.getOrCreate({ limit: 2 });

    expect(feed.currentState.notification_status?.seen_activities?.length).toBe(
      2,
    );

    await feed.getNextPage();

    expect(feed.currentState.notification_status?.seen_activities?.length).toBe(
      3,
    );
  });

  afterAll(async () => {
    await feed.delete();
    await client.disconnectUser();
  });
});

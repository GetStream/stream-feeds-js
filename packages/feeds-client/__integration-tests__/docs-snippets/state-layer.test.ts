import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { UserRequest } from '../../src/gen/models';

describe('State layer page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it(`client state`, async () => {
    // Subscribe to changes
    const unsubscribe = client.state.subscribe((state) => {
      // It will return undefined if there is no connected user
      console.log(state.connected_user);
    });
    // Unsibscribe when you no longer need/want to receive updates
    unsubscribe();

    // Read current state
    expect(client.state.getLatestValue().connected_user).toBeDefined();
  });

  it(`feed state`, async () => {
    // Intialize feed state (will create feed, if it doesn't exist yet)
    // Provide the watch flag to receive state updates via WebSocket events
    await feed.getOrCreate({ watch: true });
    // Query multiple feeds using a filter
    await client.queryFeeds({
      filter: {
        // Your query
      },
      // Provide the watch flag to receive state updates via WebSocket events
      watch: true,
    });

    const unsubscribe = feed.state.subscribe((state) => {
      // Called everytime the state changes
      console.log(state);
    });
    // or if you only want to observe part of the state
    const unsubscribe2 = feed.state.subscribeWithSelector(
      (state) => ({
        activities: state.activities,
      }),
      (state, prevState) => {
        console.log(state.activities, prevState?.activities);
      },
    );
    // Unsibscribe when you no longer need/want to receive updates
    unsubscribe();
    unsubscribe2();
    // Current state
    console.log(feed.state.getLatestValue());
  });

  it('poll state', async () => {
    const response = await client.createPoll({
      name: 'Where should we host our next company event?',
      options: [
        { text: 'Amsterdam, The Netherlands' },
        { text: 'Boulder, CO' },
      ],
    });

    // Or query polls
    await client.queryPolls({
      filter: {
        is_closed: true,
      },
      sort: [{ field: 'created_at', direction: -1 }],
    });

    await feed.addActivity({
      type: 'post',
      poll_id: response.poll.id,
    });

    await waitForEvent(feed, 'feeds.activity.added');

    // pollResponse object won't receive state updates
    const pollResponse = feed.state.getLatestValue().activities?.[0].poll!;
    // poll object has a state store which can notify about state changes

    const poll = client.pollFromState(pollResponse.id)!;

    const unsubscribe = poll.state.subscribe((state) => {
      // Called everytime the state changes
      console.log(state);
    });
    // or if you only want to observe part of the state
    const unsubscribe2 = poll.state.subscribeWithSelector(
      (state) => ({
        ownAnswer: state.own_answer,
      }),
      (state, prevState) => {
        console.log(state.ownAnswer, prevState?.ownAnswer);
      },
    );
    // Unsibscribe when you no longer need/want to receive updates
    unsubscribe();
    unsubscribe2();

    // Current state
    expect(poll.state.getLatestValue()).toBeDefined();

    await client.deletePoll({
      poll_id: response.poll.id,
    });
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});

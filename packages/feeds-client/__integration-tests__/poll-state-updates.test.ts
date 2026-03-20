import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { UserRequest } from '../src/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';
import type { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';

describe('Poll state updates from HTTP responses', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activityId: string;
  let pollId: string;
  let optionIds: string[];

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: false });

    const pollResponse = await client.createPoll({
      name: 'Test poll for state updates',
      options: [{ text: 'Option A' }, { text: 'Option B' }],
      allow_answers: true,
    });
    pollId = pollResponse.poll.id;
    optionIds = pollResponse.poll.options.map((o) => o.id);

    const activityResponse = await feed.addActivity({
      type: 'post',
      poll_id: pollId,
    });
    activityId = activityResponse.activity.id;

    // Re-read feed to hydrate poll cache
    await feed.getOrCreate({ watch: false });
  });

  it('castPollVote updates poll state without watch', async () => {
    await client.castPollVote({
      activity_id: activityId,
      poll_id: pollId,
      vote: { option_id: optionIds[0] },
    });

    const poll = client.pollFromState(pollId);
    const state = poll!.data;
    expect(state.own_votes_by_option_id[optionIds[0]]).toBeDefined();
    expect(state.vote_count).toBeGreaterThanOrEqual(1);
  });

  it('deletePollVote updates poll state without watch', async () => {
    const poll = client.pollFromState(pollId);
    const voteId = poll!.data.own_votes_by_option_id[optionIds[0]]!.id;

    await client.deletePollVote({
      activity_id: activityId,
      poll_id: pollId,
      vote_id: voteId,
    });

    const state = poll!.data;
    expect(state.own_votes_by_option_id[optionIds[0]]).toBeUndefined();
  });

  it('castPollVote with answer updates poll state without watch', async () => {
    await client.castPollVote({
      activity_id: activityId,
      poll_id: pollId,
      vote: { answer_text: 'My custom answer' },
    });

    const poll = client.pollFromState(pollId);
    const state = poll!.data;
    expect(state.own_answer).toBeDefined();
    expect(state.own_answer!.answer_text).toBe('My custom answer');
  });

  it('updatePollPartial updates poll state without watch', async () => {
    await client.updatePollPartial({
      poll_id: pollId,
      set: { name: 'Updated poll name' },
    });

    const poll = client.pollFromState(pollId);
    expect(poll!.data.name).toBe('Updated poll name');
  });

  // closePoll must be last since closing prevents further updates
  it('closePoll updates poll state without watch', async () => {
    await client.closePoll({ poll_id: pollId });

    const poll = client.pollFromState(pollId);
    expect(poll!.data.is_closed).toBe(true);
  });

  afterAll(async () => {
    await client.deletePoll({ poll_id: pollId });
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});

describe('Poll state with watched feed', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activityId: string;
  let pollId: string;
  let optionIds: string[];

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    // Watch this feed so the client receives real-time events for activities on it.
    await feed.getOrCreate({ watch: true });

    const pollResponse = await client.createPoll({
      name: 'Test poll for dedup',
      options: [{ text: 'Option A' }, { text: 'Option B' }],
      allow_answers: true,
    });
    pollId = pollResponse.poll.id;
    optionIds = pollResponse.poll.options.map((o) => o.id);

    const activityResponse = await feed.addActivity({
      type: 'post',
      poll_id: pollId,
    });
    activityId = activityResponse.activity.id;

    // Re-fetch under watch so poll cache hydrates with the same subscription.
    await feed.getOrCreate({ watch: true });
  });

  describe('deduplicates WebSocket echoes after HTTP poll updates', () => {
    it('castPollVote state update happens only once when watched', async () => {
      const poll = client.pollFromState(pollId)!;
      const spy = vi.fn();
      const unsubscribe = poll.state.subscribe(spy);

      // Reset spy after subscription's initial call
      spy.mockReset();

      await client.castPollVote({
        activity_id: activityId,
        poll_id: pollId,
        vote: { option_id: optionIds[0] },
      });

      // HTTP update should have been applied
      expect(spy).toHaveBeenCalledTimes(1);
      expect(poll.data.own_votes_by_option_id[optionIds[0]]).toBeDefined();

      await waitForEvent(feed, 'feeds.poll.vote_casted');

      // Spy should still have been called only once (WS echo was deduplicated)
      expect(spy).toHaveBeenCalledTimes(1);

      // Final state should be correct
      expect(poll.data.own_votes_by_option_id[optionIds[0]]).toBeDefined();
      expect(poll.data.vote_count).toBeGreaterThanOrEqual(1);

      unsubscribe();
    });

    it('deletePollVote state update happens only once when watched', async () => {
      const poll = client.pollFromState(pollId)!;
      const voteId = poll.data.own_votes_by_option_id[optionIds[0]]!.id;

      const spy = vi.fn();
      const unsubscribe = poll.state.subscribe(spy);
      spy.mockReset();

      await client.deletePollVote({
        activity_id: activityId,
        poll_id: pollId,
        vote_id: voteId,
      });

      // HTTP update should have been applied
      expect(spy).toHaveBeenCalledTimes(1);
      expect(poll.data.own_votes_by_option_id[optionIds[0]]).toBeUndefined();

      await waitForEvent(feed, 'feeds.poll.vote_removed');

      // Spy should still have been called only once (WS echo was deduplicated)
      expect(spy).toHaveBeenCalledTimes(1);

      // Final state should be correct
      expect(poll.data.own_votes_by_option_id[optionIds[0]]).toBeUndefined();

      unsubscribe();
    });

    it('updatePollPartial state update happens only once when watched', async () => {
      const poll = client.pollFromState(pollId)!;
      const spy = vi.fn();
      const unsubscribe = poll.state.subscribe(spy);
      spy.mockReset();

      const request = client.updatePollPartial({
        poll_id: pollId,
        set: { name: 'Dedup updated name' },
      });

      await Promise.all([request, waitForEvent(feed, 'feeds.poll.updated')]);

      // Spy should still have been called only once (WS echo was deduplicated)
      expect(spy).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    // closePoll must be last since closing prevents further updates
    it('closePoll state update happens only once when watched', async () => {
      const poll = client.pollFromState(pollId)!;
      const spy = vi.fn();
      const unsubscribe = poll.state.subscribe(spy);
      spy.mockReset();

      await client.closePoll({ poll_id: pollId });

      // HTTP update should have been applied
      expect(spy).toHaveBeenCalledTimes(1);
      expect(poll.data.is_closed).toBe(true);

      await waitForEvent(feed, 'feeds.poll.closed');

      // Spy should still have been called only once (WS echo was deduplicated)
      expect(spy).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });

  afterAll(async () => {
    await client.deletePoll({ poll_id: pollId });
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});

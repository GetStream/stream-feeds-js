import { beforeEach, describe, expect, it } from 'vitest';
import type { FollowResponse } from '../../../gen/models';
import { shouldUpdateState } from '../../../utils/state-update-queue';
import { handleFollowUpdated } from './handle-follow-updated';
import { Feed, handleFollowCreated, handleFollowDeleted } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import {
  generateFeedResponse,
  generateFollowResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils';

describe(`Follow ${shouldUpdateState.name} integration`, () => {
  let feed: Feed;
  let client: FeedsClient;
  let follow: FollowResponse;
  let otherFollow: FollowResponse;
  let ownFollow: FollowResponse;
  let userId: string;

  beforeEach(() => {
    userId = getHumanId();
    client = new FeedsClient('mock-api-key');

    client.state.partialNext({
      connected_user: generateOwnUser({ id: userId }),
    });

    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
      created_by: { id: userId },
    });
    feed = new Feed(client, 'user', 'main', feedResponse);
    // Setup follows
    follow = generateFollowResponse({
      source_feed: generateFeedResponse({
        id: 'main',
        group_id: 'user',
        created_by: { id: userId },
      }),
      target_feed: generateFeedResponse({
        id: 'target',
        group_id: 'user',
      }),
    });

    otherFollow = generateFollowResponse({
      source_feed: generateFeedResponse({
        id: 'other',
        group_id: 'user',
        created_by: { id: getHumanId() },
      }),
      target_feed: generateFeedResponse({
        id: 'main',
        group_id: 'user',
      }),
    });

    ownFollow = generateFollowResponse({
      source_feed: generateFeedResponse({
        id: 'other',
        group_id: 'user',
        created_by: { id: userId },
      }),
      target_feed: generateFeedResponse({
        id: 'main',
        group_id: 'user',
      }),
    });
    // Set up initial state
    feed.state.next((currentState) => ({
      ...currentState,
      following: [follow],
      followers: [otherFollow],
      own_follows: [ownFollow],
    }));
  });

  describe.each(
    [
      {
        handler: handleFollowCreated,
        state: {
          status: 'accepted',
        },
        count: 2,
      },
      {
        handler: handleFollowUpdated,
        state: {
          status: 'accepted',
        },
        count: 1,
      },
      { handler: handleFollowDeleted, state: undefined, count: 0 },
    ].map(({ handler, state, count }) => [
      handler.name,
      handler,
      state as Partial<FollowResponse>,
      count,
    ]),
  )(`%s`, (_name, handler, state, count) => {
    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // Prepare feed, set as watched
      feed.state.partialNext({ watch: true });

      const updatedFollow: FollowResponse = { ...follow, status: 'pending' };

      // 1. HTTP and then WS event

      // Call once as HTTP response to populate the queue
      handler.call(
        feed,
        {
          follow: { ...updatedFollow, ...state },
        },
        false,
      );

      // Call again as WS event, should be skipped
      let stateBefore = feed.currentState;
      handler.call(feed, { follow: updatedFollow });

      // State should not change
      let stateAfter = feed.currentState;
      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and then HTTP

      // Call once as WS event to populate the queue
      handler.call(
        feed,
        {
          follow: { ...updatedFollow, ...state },
        },
      );

      // Call again as HTTP response, should be skipped
      stateBefore = feed.currentState;
      handler.call(feed, { follow: updatedFollow }, false);

      // State should not change
      stateAfter = feed.currentState;
      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      const updatedFollow: FollowResponse = { ...follow, status: 'pending' };

      handler.call(feed, { follow: updatedFollow });

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handler.call(feed, {
        follow: { ...updatedFollow, ...state },
      });

      const following = feed.currentState.following!;
      const [updatedFollowAfter] = following;

      expect(following.length).toEqual(count);
      expect(updatedFollowAfter).toMatchObject(state!);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      const updatedFollow: FollowResponse = { ...follow, status: 'pending' };

      handler.call(feed, { follow: updatedFollow }, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handler.call(
        feed,
        {
          follow: { ...updatedFollow, ...state },
        },
        false,
      );

      const following = feed.currentState.following!;
      const [updatedFollowAfter] = following;

      expect(following.length).toEqual(count);
      expect(updatedFollowAfter).toMatchObject(state!);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the follow', () => {
      const updatedFollow: FollowResponse = {
        ...otherFollow,
        status: 'pending',
      };

      handler.call(feed, { follow: updatedFollow });

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handler.call(feed, {
        follow: { ...updatedFollow, ...state },
      });

      const following = feed.currentState.following!;
      const [updatedFollowAfter] = following;

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(following.length).toEqual(1);
      expect(updatedFollowAfter).toMatchObject(follow);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleFollowUpdated } from './handle-follow-updated';
import {
  generateFollowResponse,
  generateFeedResponse,
  getHumanId,
  generateOwnUser,
} from '../../../test-utils/response-generators';
import { FollowResponse } from '../../../gen/models';
import { shouldUpdateState } from '../../../utils';

describe(handleFollowUpdated.name, () => {
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

  it('updates a follow in following when this feed is the source', () => {
    const updatedFollow: FollowResponse = { ...follow, status: 'pending' };

    handleFollowUpdated.call(feed, { follow: updatedFollow });

    const [updatedFollowAfter] = feed.currentState.following!;

    expect(updatedFollowAfter).toBe(updatedFollow);
  });

  it('updates a follow in followers when this feed is the target', () => {
    const updatedOtherFollow: FollowResponse = {
      ...otherFollow,
      status: 'rejected',
    };

    handleFollowUpdated.call(feed, { follow: updatedOtherFollow });

    const [updatedOtherFollowAfter] = feed.currentState.followers!;

    expect(updatedOtherFollowAfter).toBe(updatedOtherFollow);
  });

  it('updates a follow in own_follows when connected user is the creator', () => {
    const updatedOwnFollow: FollowResponse = {
      ...ownFollow,
      status: 'pending',
    };

    handleFollowUpdated.call(feed, { follow: updatedOwnFollow });

    const [ownFollowAfter] = feed.currentState.own_follows!;

    expect(ownFollowAfter).toBe(updatedOwnFollow);
  });

  it('does not update if follow is not found', () => {
    const unrelatedFollow = generateFollowResponse();

    const stateBefore = feed.currentState;

    handleFollowUpdated.call(feed, { follow: unrelatedFollow });

    const stateAfter = feed.currentState;

    expect(stateAfter.own_follows).toBe(stateBefore.own_follows);
    expect(stateAfter.followers).toBe(stateBefore.followers);
    expect(stateAfter.follower_count).toBe(stateBefore.follower_count);
    expect(stateAfter.following).toBe(stateBefore.following);
    expect(stateAfter.following_count).toBe(stateBefore.following_count);
  });

  describe(`${shouldUpdateState.name} integration`, () => {
    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // Prepare feed, set as watched
      feed.state.partialNext({ watch: true });

      const updatedFollow: FollowResponse = { ...follow, status: 'pending' };

      // Call once to populate queue
      handleFollowUpdated.call(feed, { follow: updatedFollow });

      // Call again, should be skipped
      const stateBefore = feed.currentState;
      handleFollowUpdated.call(feed, {
        follow: { ...updatedFollow, status: 'accepted' },
      });

      // State should not change
      const stateAfter = feed.currentState;
      expect(stateAfter).toBe(stateBefore);
    });

    it('allows update again after clearing stateUpdateQueue', () => {
      const updatedFollow: FollowResponse = { ...follow, status: 'pending' };

      handleFollowUpdated.call(feed, { follow: updatedFollow });

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed
      handleFollowUpdated.call(feed, {
        follow: { ...updatedFollow, status: 'accepted' },
      });

      const [updatedFollowAfter] = feed.currentState.following!;

      expect(updatedFollowAfter).toMatchObject({
        status: 'accepted',
      });
    });
  });
});

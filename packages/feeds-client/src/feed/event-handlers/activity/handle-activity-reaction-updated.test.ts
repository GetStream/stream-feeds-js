import { describe, it, expect, beforeEach } from 'vitest';
import { Feed, handleActivityReactionUpdated } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateActivityReactionUpdatedEvent,
  generateFeedReactionResponse,
} from '../../../test-utils';
import { shouldUpdateState } from '../../../utils';
import type { EventPayload } from '../../../types-internal';

describe(handleActivityReactionUpdated.name, () => {
  let feed: Feed;
  let client: FeedsClient;
  let currentUserId: string;
  let activityId: string;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    currentUserId = getHumanId();
    activityId = getHumanId();
    client.state.partialNext({
      connected_user: generateOwnUser({ id: currentUserId }),
    });
    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
      created_by: { id: currentUserId },
    });
    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it('updates the reaction in the correct activity for current user & updates activities with event.activity', () => {
    const event = generateActivityReactionUpdatedEvent({
      reaction: {
        user: { id: currentUserId },
        type: 'downvote',
        activity_id: activityId,
      },
      activity: {
        reaction_count: 1,
        latest_reactions: [],
        reaction_groups: {},
      },
    });

    const existingReaction = generateFeedReactionResponse({
      user: { id: currentUserId },
      type: 'like',
      activity_id: activityId,
    });

    const activity = generateActivityResponse({
      id: event.activity.id,
      reaction_count: 1,
      own_reactions: [existingReaction],
      latest_reactions: [],
      reaction_groups: {},
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;

    expect(stateBefore.activities![0].reaction_count).toBe(1);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toBe(1);

    handleActivityReactionUpdated.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.activities![0].own_reactions).toContain(event.reaction);
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toContain(
      event.reaction,
    );
    expect(stateAfter.activities![0].own_bookmarks).toBe(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toBe(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(stateAfter.activities![0].reaction_count).toBe(1);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toBe(1);
  });

  it('does not update own_reactions if the reaction is from another user but still updates activity', () => {
    const event = generateActivityReactionUpdatedEvent({
      reaction: {
        user: { id: 'other-user-id' },
        type: 'downvote',
        activity_id: activityId,
      },
      activity: {
        reaction_count: 2,
      },
    });

    const existingReaction = generateFeedReactionResponse({
      user: { id: currentUserId },
      type: 'like',
      activity_id: activityId,
    });

    const activity = generateActivityResponse({
      id: event.activity.id,
      reaction_count: 1,
      own_reactions: [existingReaction],
      latest_reactions: [],
      reaction_groups: {},
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;

    expect(stateBefore.activities![0].reaction_count).toBe(1);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toBe(1);

    handleActivityReactionUpdated.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.activities![0].own_reactions).toHaveLength(1);
    expect(
      stateAfter.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(1);
    expect(stateAfter.activities![0].reaction_count).toBe(2);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toBe(2);
    expect(stateAfter.activities![0].own_bookmarks).toBe(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toBe(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(stateAfter.activities![0].own_reactions).toBe(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toBe(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
  });

  it('does nothing if activity is not found', () => {
    const event = generateActivityReactionUpdatedEvent({
      reaction: { user: { id: currentUserId } },
    });
    const activity = generateActivityResponse({
      id: 'unrelated',
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;

    handleActivityReactionUpdated.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Activity reaction updated ${shouldUpdateState.name} integration`, () => {
    let currentUserPayload: EventPayload<'feeds.activity.reaction.updated'>;

    beforeEach(() => {
      currentUserPayload = generateActivityReactionUpdatedEvent({
        reaction: { user: { id: currentUserId }, activity_id: activityId },
        activity: { id: activityId },
      });

      feed.state.partialNext({ activities: [currentUserPayload.activity] });
      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP and then WS

      handleActivityReactionUpdated.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleActivityReactionUpdated.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleActivityReactionUpdated.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleActivityReactionUpdated.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleActivityReactionUpdated.call(feed, currentUserPayload);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleActivityReactionUpdated.call(feed, currentUserPayload);

      const activities = feed.currentState.activities!;
      const activity = activities.find((a) => a.id === activityId);
      const [latestReaction] = activity?.own_reactions ?? [];

      expect(activity?.own_reactions.length).toEqual(1);
      expect(latestReaction).toMatchObject(currentUserPayload.reaction);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleActivityReactionUpdated.call(feed, currentUserPayload, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleActivityReactionUpdated.call(feed, currentUserPayload, false);

      const activities = feed.currentState.activities!;
      const activity = activities.find((a) => a.id === activityId);
      const [latestReaction] = activity?.own_reactions ?? [];

      expect(activity?.own_reactions.length).toEqual(1);
      expect(latestReaction).toMatchObject(currentUserPayload.reaction);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the reaction', () => {
      const otherUserPayload = generateActivityReactionUpdatedEvent({
        reaction: { user: { id: getHumanId() }, activity_id: activityId },
        activity: { id: activityId },
      });

      handleActivityReactionUpdated.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleActivityReactionUpdated.call(feed, otherUserPayload);

      const activities = feed.currentState.activities!;
      const activity = activities.find((a) => a.id === activityId);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(activity?.own_reactions.length).toEqual(0);
    });
  });
});

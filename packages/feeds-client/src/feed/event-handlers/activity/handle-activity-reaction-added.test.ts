import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityReactionAdded } from './handle-activity-reaction-added';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  generateActivityReactionAddedEvent,
  getHumanId,
} from '../../../test-utils';
import { shouldUpdateState } from '../../../utils';
import { EventPayload } from '../../../types-internal';

describe(handleActivityReactionAdded.name, () => {
  let feed: Feed;
  let client: FeedsClient;
  let currentUserId: string;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    currentUserId = getHumanId();
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

  it('adds a reaction to the correct activity for current user & updates activities with event.activity', () => {
    const event = generateActivityReactionAddedEvent({
      reaction: {
        user: { id: currentUserId },
      },
      activity: {
        reaction_count: 1,
      },
    });
    const activity = generateActivityResponse({
      id: event.activity.id,
      reaction_count: 0,
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;

    expect(stateBefore.activities![0].reaction_count).toBe(0);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toBe(
      0,
    );

    handleActivityReactionAdded.call(feed, event);

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

  it('does not add to own_reactions if reaction is from another user but still updates activity', () => {
    const event = generateActivityReactionAddedEvent({
      reaction: { user: { id: 'other-user-id' } },
      activity: {
        reaction_count: 1,
      },
    });
    const activity = generateActivityResponse({
      id: event.activity.id,
      reaction_count: 0,
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;

    expect(stateBefore.activities![0].reaction_count).toBe(0);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toBe(
      0,
    );

    handleActivityReactionAdded.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.activities![0].own_reactions).toHaveLength(0);
    expect(
      stateAfter.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(0);
    expect(stateAfter.activities![0].reaction_count).toBe(1);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toBe(1);
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
    const event = generateActivityReactionAddedEvent({
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

    handleActivityReactionAdded.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Activity reaction added ${shouldUpdateState.name} integration`, () => {
    const activityId = 'reacted-activity';
    let currentUserPayload: EventPayload<'feeds.activity.reaction.added'>;

    beforeEach(() => {
      currentUserPayload = generateActivityReactionAddedEvent({
        reaction: { user: { id: currentUserId }, activity_id: activityId },
        activity: { id: activityId }
      });

      feed.state.partialNext({ activities: [currentUserPayload.activity]});
      feed.state.partialNext({ watch: true });
    })

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP and then WS

      handleActivityReactionAdded.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleActivityReactionAdded.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleActivityReactionAdded.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleActivityReactionAdded.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    })

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleActivityReactionAdded.call(feed, currentUserPayload);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleActivityReactionAdded.call(feed, currentUserPayload);

      const activities = feed.currentState.activities!;
      const activity = activities.find((a) => a.id === activityId);
      const [latestReaction] = activity?.own_reactions ?? [];

      expect(activity?.own_reactions.length).toEqual(2);
      expect(latestReaction).toMatchObject(currentUserPayload.reaction);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleActivityReactionAdded.call(feed, currentUserPayload, false);

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleActivityReactionAdded.call(feed, currentUserPayload, false);

      const activities = feed.currentState.activities!;
      const activity = activities.find((a) => a.id === activityId);
      const [latestReaction] = activity?.own_reactions ?? [];

      expect(activity?.own_reactions.length).toEqual(2);
      expect(latestReaction).toMatchObject(currentUserPayload.reaction);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the reaction', () => {
      const otherUserPayload = generateActivityReactionAddedEvent({
        reaction: { user: { id: getHumanId() }, activity_id: activityId },
        activity: { id: activityId }
      });

      handleActivityReactionAdded.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleActivityReactionAdded.call(feed, otherUserPayload);

      const activities = feed.currentState.activities!;
      const activity = activities.find((a) => a.id === activityId);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(activity?.own_reactions.length).toEqual(0);
    });
  })
});

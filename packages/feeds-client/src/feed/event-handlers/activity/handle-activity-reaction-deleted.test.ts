import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityReactionDeleted } from './handle-activity-reaction-deleted';
import { handleActivityReactionAdded } from './handle-activity-reaction-added';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedReactionResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateActivityReactionDeletedEvent,
} from '../../../test-utils';
import { shouldUpdateState } from '../../../utils';
import { EventPayload } from '../../../types-internal';

describe(handleActivityReactionDeleted.name, () => {
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

  it('removes a reaction from the correct activity for current user & updates activities with event.activity', () => {
    const event = generateActivityReactionDeletedEvent({
      activity: {
        reaction_count: 0,
      },
      reaction: {
        type: 'like',
        user: { id: currentUserId },
      },
      user: { id: currentUserId },
    });

    const activity = generateActivityResponse({
      reaction_count: 1,
      own_reactions: [
        generateFeedReactionResponse({
          type: 'like',
          user: { id: currentUserId },
          activity_id: event.activity.id,
        }),
      ],
      id: event.activity.id,
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.activities![0].own_reactions).toHaveLength(1);
    expect(
      stateBefore.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(1);
    expect(stateBefore.activities![0].reaction_count).toBe(1);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toBe(
      1,
    );

    handleActivityReactionDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_reactions).toHaveLength(0);
    expect(
      stateAfter.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(0);
    expect(stateAfter.activities![0].reaction_count).toBe(0);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toBe(0);
    expect(stateAfter.activities![0].own_bookmarks).toBe(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toBe(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
  });

  it('does not remove from own_reactions if reaction is from another user but still updates activity', () => {
    const event = generateActivityReactionDeletedEvent({
      activity: {
        reaction_count: 0,
      },
      reaction: {
        type: 'like',
        user: { id: 'other-user-id' },
      },
      user: { id: 'other-user-id' },
    });

    const activity = generateActivityResponse({
      reaction_count: 1,
      own_reactions: [
        generateFeedReactionResponse({
          type: 'like',
          user: { id: currentUserId },
          activity_id: event.activity.id,
        }),
      ],
      id: event.activity.id,
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;
    expect(stateBefore.activities![0].own_reactions).toHaveLength(1);
    expect(
      stateBefore.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(1);
    expect(stateBefore.activities![0].reaction_count).toBe(1);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toBe(
      1,
    );

    handleActivityReactionDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_reactions).toHaveLength(1);
    expect(stateAfter.activities![0].own_reactions).toBe(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toBe(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].own_bookmarks).toBe(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toBe(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(
      stateAfter.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(1);
    expect(stateAfter.activities![0].reaction_count).toBe(0);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toBe(0);
  });

  it('does nothing if activity is not found', () => {
    const event = generateActivityReactionDeletedEvent({
      activity: {
        reaction_count: 0,
      },
      reaction: {
        type: 'like',
        user: { id: currentUserId },
      },
      user: { id: currentUserId },
    });

    const activity = generateActivityResponse({
      reaction_count: 1,
      own_reactions: [
        generateFeedReactionResponse({
          type: 'like',
          user: { id: currentUserId },
          activity_id: 'activity1',
        }),
      ],
      id: 'activity1',
    });
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const stateBefore = feed.currentState;

    handleActivityReactionDeleted.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Activity reaction deleted ${shouldUpdateState.name} integration`, () => {
    const activityId = 'reacted-activity';
    let currentUserPayload: EventPayload<'feeds.activity.reaction.deleted'>;
    let otherUserPayload: EventPayload<'feeds.activity.reaction.deleted'>;

    beforeEach(() => {
      currentUserPayload = generateActivityReactionDeletedEvent({
        reaction: { user: { id: currentUserId }, activity_id: activityId },
        activity: { id: activityId }
      });

      otherUserPayload = generateActivityReactionDeletedEvent({
        reaction: { user: { id: getHumanId() }, activity_id: activityId },
        activity: { id: activityId }
      });

      feed.state.partialNext({ activities: [currentUserPayload.activity]});
      feed.state.partialNext({ watch: true });

      handleActivityReactionAdded.call(feed, currentUserPayload, false);
      handleActivityReactionAdded.call(feed, otherUserPayload, false);

      (feed as any).stateUpdateQueue.clear();
    })

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP and then WS

      handleActivityReactionDeleted.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleActivityReactionDeleted.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleActivityReactionDeleted.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleActivityReactionDeleted.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    })

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleActivityReactionDeleted.call(feed, currentUserPayload);

      let activities = feed.currentState.activities!;
      let activity = activities.find((a) => a.id === activityId);

      expect(activity?.own_reactions.length).toEqual(0);

      // Clear the queue and reinitialize the state
      handleActivityReactionAdded.call(feed, currentUserPayload, false);
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleActivityReactionDeleted.call(feed, currentUserPayload);

      activities = feed.currentState.activities!;
      activity = activities.find((a) => a.id === activityId);

      expect(activity?.own_reactions.length).toEqual(0);
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleActivityReactionDeleted.call(feed, currentUserPayload, false);

      let activities = feed.currentState.activities!;
      let activity = activities.find((a) => a.id === activityId);

      expect(activity?.own_reactions.length).toEqual(0);

      // Clear the queue and reinitialize the state
      handleActivityReactionAdded.call(feed, currentUserPayload, false);
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another HTTP response
      handleActivityReactionDeleted.call(feed, currentUserPayload, false);

      activities = feed.currentState.activities!;
      activity = activities.find((a) => a.id === activityId);

      expect(activity?.own_reactions.length).toEqual(0);
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the reaction', () => {
      handleActivityReactionDeleted.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleActivityReactionDeleted.call(feed, otherUserPayload);

      const activities = feed.currentState.activities!;
      const activity = activities.find((a) => a.id === activityId);
      const [latestOwnReaction] = activity?.own_reactions ?? [];

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(activity?.own_reactions.length).toEqual(1);
      expect(latestOwnReaction).toMatchObject(currentUserPayload.reaction);
    });
  })
});

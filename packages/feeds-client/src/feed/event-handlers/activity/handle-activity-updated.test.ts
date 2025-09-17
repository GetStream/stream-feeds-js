import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityUpdated } from './handle-activity-updated';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateActivityUpdatedEvent,
  generateBookmarkResponse,
  generateFeedReactionResponse,
  generateFeedResponse,
  generateOwnUser,
  generateUserResponseCommonFields,
  getHumanId,
} from '../../../test-utils';
import { EventPayload } from '../../../types-internal';
import { shouldUpdateState } from '../../../utils';
import { ActivityResponse } from '../../../gen/models';

describe(handleActivityUpdated.name, () => {
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

  it('updates the correct activity in state when event matches, preserves own_reactions & own_bookmarks', () => {
    const activity = generateActivityResponse({
      id: 'activity-1',
      text: 'original text',
      own_reactions: [generateFeedReactionResponse()],
      own_bookmarks: [generateBookmarkResponse()],
    });

    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });

    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const event = generateActivityUpdatedEvent({
      activity: {
        ...activity,
        text: 'updated text',
        own_reactions: [],
        own_bookmarks: [],
      },
    });

    const stateBefore = feed.currentState;

    handleActivityUpdated.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.activities![0]).toMatchObject({
      id: 'activity-1',
      text: 'updated text',
    });
    expect(stateAfter.pinned_activities![0].activity).toMatchObject({
      id: 'activity-1',
      text: 'updated text',
    });
    expect(stateAfter.activities![0].own_reactions).toBe(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.activities![0].own_bookmarks).toBe(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toBe(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toBe(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
  });

  it('does nothing if activity is not found in activities or pinned_activities', () => {
    const activity = generateActivityResponse({});
    const activityPin = generateActivityPinResponse({
      activity: { ...activity },
    });
    feed.state.partialNext({
      activities: [activity],
      pinned_activities: [activityPin],
    });

    const event = generateActivityUpdatedEvent({
      activity: {
        id: 'not-found-id',
      },
    });

    const stateBefore = feed.currentState;
    handleActivityUpdated.call(feed, event);
    const stateAfter = feed.currentState;
    expect(stateAfter).toBe(stateBefore);
  });

  describe(`Activity updated ${shouldUpdateState.name} integration`, () => {
    const activityId = 'reacted-activity';
    const updatedText = 'updated-text';
    let existingActivity: ActivityResponse;
    let currentUserPayload: EventPayload<'feeds.activity.updated'>;

    beforeEach(() => {
      existingActivity = generateActivityResponse({
        id: activityId,
        text: 'original-text',
      });
      currentUserPayload = generateActivityUpdatedEvent({
        activity: { ...existingActivity, text: updatedText },
        user: generateUserResponseCommonFields({ id: currentUserId }),
      });

      feed.state.partialNext({ activities: [existingActivity] });
      feed.state.partialNext({ watch: true });
    });

    it(`skips update if ${shouldUpdateState.name} returns false`, () => {
      // 1. HTTP and then WS

      handleActivityUpdated.call(feed, currentUserPayload, false);

      let stateBefore = feed.currentState;

      handleActivityUpdated.call(feed, currentUserPayload);

      let stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);

      // 2. WS and the HTTP

      handleActivityUpdated.call(feed, currentUserPayload);

      stateBefore = feed.currentState;

      handleActivityUpdated.call(feed, currentUserPayload, false);

      stateAfter = feed.currentState;

      expect(stateAfter).toBe(stateBefore);
      // @ts-expect-error Using Feed internals for tests only
      expect(feed.stateUpdateQueue.size).toEqual(0);
    });

    it('allows update again from WS after clearing the stateUpdateQueue', () => {
      handleActivityUpdated.call(feed, currentUserPayload);

      expect(feed.currentState.activities?.[0]).toMatchObject({
        ...existingActivity,
        text: updatedText,
      });

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleActivityUpdated.call(feed, {
        ...currentUserPayload,
        activity: {
          ...currentUserPayload.activity,
          text: 'updated-again-text',
        },
      });

      expect(feed.currentState.activities?.[0]).toMatchObject({
        ...existingActivity,
        text: 'updated-again-text',
      });
    });

    it('allows update again from HTTP response after clearing the stateUpdateQueue', () => {
      handleActivityUpdated.call(feed, currentUserPayload, false);

      expect(feed.currentState.activities?.[0]).toMatchObject({
        ...existingActivity,
        text: updatedText,
      });

      // Clear the queue
      (feed as any).stateUpdateQueue.clear();

      // Now update should be allowed from another WS event
      handleActivityUpdated.call(
        feed,
        {
          ...currentUserPayload,
          activity: {
            ...currentUserPayload.activity,
            text: 'updated-again-text',
          },
        },
        false,
      );

      expect(feed.currentState.activities?.[0]).toMatchObject({
        ...existingActivity,
        text: 'updated-again-text',
      });
    });

    it('should not insert anything into the stateUpdateQueue if the connected_user did not trigger the reaction', () => {
      const otherUserPayload = {
        ...currentUserPayload,
        user: generateUserResponseCommonFields({ id: getHumanId() }),
      };

      handleActivityUpdated.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());

      handleActivityUpdated.call(feed, otherUserPayload);

      expect((feed as any).stateUpdateQueue).toEqual(new Set());
      expect(feed.currentState.activities?.[0]).toMatchObject({
        ...existingActivity,
        text: updatedText,
      });
    });
  });
});

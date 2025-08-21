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
  getHumanId,
} from '../../../test-utils/response-generators';

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
});

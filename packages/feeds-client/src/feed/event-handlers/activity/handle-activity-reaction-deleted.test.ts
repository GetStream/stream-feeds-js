import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityReactionDeleted } from './handle-activity-reaction-deleted';
import {
  generateActivityPinResponse,
  generateActivityResponse,
  generateFeedReactionResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
  generateActivityReactionDeletedEvent,
} from '../../../test-utils/response-generators';

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
    expect(stateBefore.activities![0].reaction_count).toEqual(1);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toEqual(
      1,
    );

    handleActivityReactionDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_reactions).toHaveLength(0);
    expect(
      stateAfter.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(0);
    expect(stateAfter.activities![0].reaction_count).toEqual(0);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toEqual(0);
    expect(stateAfter.activities![0].own_bookmarks).toEqual(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toEqual(
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
    expect(stateBefore.activities![0].reaction_count).toEqual(1);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toEqual(
      1,
    );

    handleActivityReactionDeleted.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities![0].own_reactions).toHaveLength(1);
    expect(stateAfter.activities![0].own_reactions).toEqual(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toEqual(
      stateBefore.pinned_activities![0].activity.own_reactions,
    );
    expect(stateAfter.activities![0].own_bookmarks).toEqual(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toEqual(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(
      stateAfter.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(1);
    expect(stateAfter.activities![0].reaction_count).toEqual(0);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toEqual(0);
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
});

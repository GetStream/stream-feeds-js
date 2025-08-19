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
} from '../../../test-utils/response-generators';

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

    expect(stateBefore.activities![0].reaction_count).toEqual(0);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toEqual(
      0,
    );

    handleActivityReactionAdded.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.activities![0].own_reactions).toContain(event.reaction);
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toContain(
      event.reaction,
    );
    expect(stateAfter.activities![0].own_bookmarks).toEqual(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toEqual(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(stateAfter.activities![0].reaction_count).toEqual(1);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toEqual(1);
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

    expect(stateBefore.activities![0].reaction_count).toEqual(0);
    expect(stateBefore.pinned_activities![0].activity.reaction_count).toEqual(
      0,
    );

    handleActivityReactionAdded.call(feed, event);

    const stateAfter = feed.currentState;

    expect(stateAfter.activities![0].own_reactions).toHaveLength(0);
    expect(
      stateAfter.pinned_activities![0].activity.own_reactions,
    ).toHaveLength(0);
    expect(stateAfter.activities![0].reaction_count).toEqual(1);
    expect(stateAfter.pinned_activities![0].activity.reaction_count).toEqual(1);
    expect(stateAfter.activities![0].own_bookmarks).toEqual(
      stateBefore.activities![0].own_bookmarks,
    );
    expect(stateAfter.pinned_activities![0].activity.own_bookmarks).toEqual(
      stateBefore.pinned_activities![0].activity.own_bookmarks,
    );
    expect(stateAfter.activities![0].own_reactions).toEqual(
      stateBefore.activities![0].own_reactions,
    );
    expect(stateAfter.pinned_activities![0].activity.own_reactions).toEqual(
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

    expect(stateAfter).toEqual(stateBefore);
  });
});

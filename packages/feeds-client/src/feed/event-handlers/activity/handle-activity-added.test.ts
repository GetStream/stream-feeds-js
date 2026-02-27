import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityAdded } from './handle-activity-added';
import {
  generateActivityAddedEvent,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  generateUserResponse,
  getHumanId,
} from '../../../test-utils';

describe(handleActivityAdded.name, () => {
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

  it('if activities are not initialized, it does nothing', () => {
    const event = generateActivityAddedEvent();

    const stateBefore = feed.currentState;
    expect(stateBefore.activities).toBeUndefined();

    const hydrateSpy = vi.spyOn(client, 'hydratePollCache');

    handleActivityAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities).toBeUndefined();
    expect(hydrateSpy).not.toHaveBeenCalled();
  });

  it('prepends new activity when activities already exist (default: current user + no filter)', () => {
    const existing = generateActivityResponse();
    feed.state.partialNext({
      activities: [existing],
      last_get_or_create_request_config: {},
    });
    const event = generateActivityAddedEvent({
      activity: { user: generateUserResponse({ id: currentUserId }) },
    });

    handleActivityAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities).toHaveLength(2);
    expect(stateAfter.activities?.[0]).toBe(event.activity);
    expect(stateAfter.activities?.[1]).toBe(existing);
  });

  it('does not duplicate if activity already exists', () => {
    const existing = generateActivityResponse();
    feed.state.partialNext({ activities: [existing] });
    const newActivitiesAddedSpy = vi.spyOn(feed, 'newActivitiesAdded' as any);

    const event = generateActivityAddedEvent({
      activity: { id: existing.id },
    });

    const stateBefore = feed.currentState;
    handleActivityAdded.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
    expect(stateAfter.activities).toHaveLength(1);
    expect(stateAfter.activities?.[0]).toBe(existing);
    expect(newActivitiesAddedSpy).not.toHaveBeenCalled();

    vi.resetAllMocks();
  });

  it('onNewActivity returning ignore does not add activity', () => {
    feed.state.partialNext({ activities: [] });
    feed.onNewActivity = () => 'ignore';
    const event = generateActivityAddedEvent();
    handleActivityAdded.call(feed, event);
    expect(feed.currentState.activities).toHaveLength(0);
  });

  it('onNewActivity returning add-to-end adds activity at end', () => {
    const existing = generateActivityResponse();
    feed.state.partialNext({ activities: [existing] });
    feed.onNewActivity = () => 'add-to-end';
    const event = generateActivityAddedEvent();
    handleActivityAdded.call(feed, event);
    expect(feed.currentState.activities).toHaveLength(2);
    expect(feed.currentState.activities?.[0]).toBe(existing);
    expect(feed.currentState.activities?.[1]).toBe(event.activity);
  });

  it('onNewActivity returning add-to-start adds activity at start', () => {
    const existing = generateActivityResponse();
    feed.state.partialNext({ activities: [existing] });
    feed.onNewActivity = () => 'add-to-start';
    const event = generateActivityAddedEvent();
    handleActivityAdded.call(feed, event);
    expect(feed.currentState.activities).toHaveLength(2);
    expect(feed.currentState.activities?.[0]).toBe(event.activity);
    expect(feed.currentState.activities?.[1]).toBe(existing);
  });

  it('default behavior adds current user activity matching feed filter to start', () => {
    feed.state.partialNext({
      activities: [],
      last_get_or_create_request_config: {
        filter: { filter_tags: ['blue'] },
      },
    });
    const event = generateActivityAddedEvent({
      activity: {
        ...generateActivityResponse(),
        filter_tags: ['blue'],
        user: generateUserResponse({ id: currentUserId }),
      },
    });
    handleActivityAdded.call(feed, event);
    expect(feed.currentState.activities).toHaveLength(1);
    expect(feed.currentState.activities?.[0]).toBe(event.activity);
  });
});

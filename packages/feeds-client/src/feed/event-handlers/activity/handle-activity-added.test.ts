import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityAdded } from './handle-activity-added';
import {
  generateActivityAddedEvent,
  generateActivityResponse,
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

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

  it('initializes activities when state is empty and adds new activity to the start', () => {
    const event = generateActivityAddedEvent();

    const stateBefore = feed.currentState;
    expect(stateBefore.activities).toBeUndefined();

    const hydrateSpy = vi.spyOn(client, 'hydratePollCache');

    handleActivityAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities).toBeDefined();
    expect(stateAfter.activities).toHaveLength(1);
    expect(stateAfter.activities?.[0]).toBe(event.activity);
    expect(hydrateSpy).toHaveBeenCalledWith([event.activity]);
  });

  it('prepends new activity when activities already exist', () => {
    const existing = generateActivityResponse();
    feed.state.partialNext({ activities: [existing] });

    const event = generateActivityAddedEvent();

    handleActivityAdded.call(feed, event);

    const stateAfter = feed.currentState;
    expect(stateAfter.activities).toHaveLength(2);
    expect(stateAfter.activities?.[0]).toBe(event.activity);
    expect(stateAfter.activities?.[1]).toBe(existing);
  });

  it('does not duplicate if activity already exists', () => {
    const existing = generateActivityResponse();
    feed.state.partialNext({ activities: [existing] });

    const event = generateActivityAddedEvent({
      activity: { id: existing.id },
    });

    const stateBefore = feed.currentState;
    handleActivityAdded.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
    expect(stateAfter.activities).toHaveLength(1);
    expect(stateAfter.activities?.[0]).toBe(existing);
  });
});

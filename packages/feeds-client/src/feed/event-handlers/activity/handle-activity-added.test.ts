import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleActivityAdded } from './handle-activity-added';
import { handleActivityDeleted } from './handle-activity-deleted';
import type { ActivityResponse } from '../../../gen/models';
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
    const activitiesAddedOrUpdatedSpy = vi.spyOn(
      feed,
      'activitiesAddedOrUpdated' as any,
    );

    const event = generateActivityAddedEvent({
      activity: { id: existing.id },
    });

    const stateBefore = feed.currentState;
    handleActivityAdded.call(feed, event);
    const stateAfter = feed.currentState;

    expect(stateAfter).toBe(stateBefore);
    expect(stateAfter.activities).toHaveLength(1);
    expect(stateAfter.activities?.[0]).toBe(existing);
    expect(activitiesAddedOrUpdatedSpy).not.toHaveBeenCalled();

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

  describe('HTTP + WS deduplication (watch)', () => {
    let watchedFeed: Feed;

    beforeEach(() => {
      const feedResponse = generateFeedResponse({
        id: 'watched',
        group_id: 'user',
        created_by: { id: currentUserId },
      });
      watchedFeed = new Feed(
        client,
        feedResponse.group_id,
        feedResponse.id,
        feedResponse,
        true,
      );
      watchedFeed.state.partialNext({
        activities: [],
        last_get_or_create_request_config: {},
      });
    });

    const generateOwnActivity = () =>
      generateActivityResponse({
        user: generateUserResponse({ id: currentUserId }),
      });

    // simulates client.addActivity applying its HTTP response to the feed
    const applyHttpResponse = (activity: ActivityResponse) =>
      watchedFeed['addActivityFromHTTPResponse'](activity);

    it('skips the WS broadcast of an add already applied from the HTTP response', () => {
      const activity = generateOwnActivity();

      applyHttpResponse(activity);
      expect(watchedFeed.currentState.activities).toHaveLength(1);

      const stateAfterHttp = watchedFeed.currentState;
      handleActivityAdded.call(watchedFeed, { activity });

      expect(watchedFeed.currentState).toBe(stateAfterHttp);
      expect(watchedFeed.currentState.activities).toHaveLength(1);
    });

    it('skips the HTTP response when the WS broadcast arrived first', () => {
      const activity = generateOwnActivity();

      handleActivityAdded.call(watchedFeed, { activity });
      expect(watchedFeed.currentState.activities).toHaveLength(1);

      const stateAfterWs = watchedFeed.currentState;
      applyHttpResponse(activity);

      expect(watchedFeed.currentState).toBe(stateAfterWs);
      expect(watchedFeed.currentState.activities).toHaveLength(1);
    });

    it('does not re-add an activity deleted before its delayed WS broadcast arrives', () => {
      const activity = generateOwnActivity();

      // add, applied from the HTTP response; the WS broadcast is still in flight
      applyHttpResponse(activity);
      expect(watchedFeed.currentState.activities).toHaveLength(1);

      // the activity is deleted before the add is broadcast
      handleActivityDeleted.call(watchedFeed, { activity }, false);
      expect(watchedFeed.currentState.activities).toHaveLength(0);

      // the delayed add broadcast must not resurrect it
      handleActivityAdded.call(watchedFeed, { activity });
      expect(watchedFeed.currentState.activities).toHaveLength(0);

      // ...and the delete broadcast is still deduplicated against its HTTP response
      handleActivityDeleted.call(watchedFeed, { activity });
      expect(watchedFeed.currentState.activities).toHaveLength(0);
    });
  });
});

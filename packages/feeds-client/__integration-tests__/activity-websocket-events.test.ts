import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { UserRequest } from '../src/common/gen/models';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
  waitForEvent,
} from './utils';
import { FeedsClient } from '../src/FeedsClient';
import {
  ActivityAddedEvent,
  ActivityUpdatedEvent,
  ActivityDeletedEvent,
} from '../src/gen/models';
import { FlatFeed } from '../src/FlatFeed';

describe('Activity state updates via WebSocket events', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  const feedGroup = 'user';
  const feedId = crypto.randomUUID();
  let feed: FlatFeed;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed(feedGroup, feedId);
    await feed.getOrCreate({
      watch: true,
      member_pagination: { limit: 25 },
      limit: 25,
    });
  });

  it('should add activity to feed in response to activity.added event', async () => {
    // Initial state has no activities
    expect(feed.state.getLatestValue().activities?.length).toBe(0);

    // Create a spy for the activity.added event
    const addSpy = vi.fn();
    feed.on('activity.added', addSpy);

    // Create an activity
    const activityData = {
      type: 'test',
      fids: [feed.fid],
      text: 'Test activity',
    };
    const response = await client.addActivity(activityData);
    const activity = response.activity;

    // Wait for the activity.added event
    await waitForEvent(feed, 'activity.added', 1000);

    // Verify the event was received
    const addEvent = addSpy.mock.lastCall?.[0] as ActivityAddedEvent;
    expect(addEvent?.type).toBe('activity.added');
    expect(addEvent?.activity.id).toBe(activity.id);
    expect(addEvent?.fid).toBe(feed.fid);

    // Verify the state was updated
    const feedActivities = feed.state.getLatestValue().activities;
    expect(feedActivities).toBeDefined();
    expect(feedActivities?.length).toBe(1);
    expect(feedActivities?.[0].id).toBe(activity.id);
    expect(feedActivities?.[0].text).toBe('Test activity');
  });

  it('should update activity in feed in response to activity.updated event', async () => {
    // Create a spy for the activity.updated event
    const updateSpy = vi.fn();
    feed.on('activity.updated', updateSpy);

    // Get the existing activity from the state
    const feedActivities = feed.state.getLatestValue().activities;
    expect(feedActivities).toBeDefined();
    expect(feedActivities?.length).toBe(1);
    const activityId = feedActivities![0].id;

    // Update the activity
    const updatedText = 'Updated activity text';
    await client.updateActivity({
      activity_id: activityId,
      text: updatedText,
    });

    // Wait for the activity.updated event
    await waitForEvent(feed, 'activity.updated', 1000);

    // Verify the event was received
    const updateEvent = updateSpy.mock.lastCall?.[0] as ActivityUpdatedEvent;
    expect(updateEvent?.type).toBe('activity.updated');
    expect(updateEvent?.activity.id).toBe(activityId);
    expect(updateEvent?.activity.text).toBe(updatedText);

    // Verify the state was updated
    const updatedActivities = feed.state.getLatestValue().activities;
    expect(updatedActivities).toBeDefined();
    expect(updatedActivities?.length).toBe(1);
    expect(updatedActivities?.[0].id).toBe(activityId);
    expect(updatedActivities?.[0].text).toBe(updatedText);
  });

  it('should remove activity from feed in response to activity.deleted event', async () => {
    // Create a spy for the activity.deleted event
    const deleteSpy = vi.fn();
    feed.on('activity.deleted', deleteSpy);

    // Get the existing activity from the state
    const feedActivities = feed.state.getLatestValue().activities;
    expect(feedActivities).toBeDefined();
    expect(feedActivities?.length).toBe(1);
    const activityId = feedActivities![0].id;

    // Delete the activity
    await client.deleteActivity({
      activity_id: activityId,
    });

    // Wait for the activity.deleted event
    await waitForEvent(feed, 'activity.deleted', 1000);

    // Verify the event was received
    const deleteEvent = deleteSpy.mock.lastCall?.[0] as ActivityDeletedEvent;
    expect(deleteEvent?.type).toBe('activity.deleted');
    expect(deleteEvent?.activity.id).toBe(activityId);

    // Verify the state was updated
    const updatedActivities = feed.state.getLatestValue().activities;
    expect(updatedActivities).toBeDefined();
    expect(updatedActivities?.length).toBe(0);
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});

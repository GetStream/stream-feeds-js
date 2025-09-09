import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import { FeedsClient } from '../../src/feeds-client';
import { UserRequest } from '../../src/gen/models';

describe.skip('Push preferences page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
  });

  it(`User-Level Feeds Preferences`, async () => {
    await client.updatePushNotificationPreferences({
      preferences: [
        {
          feeds_level: 'all', // "all" or "none"
        },
      ],
    });
  });

  it(`Event-Specific Feeds Preferences`, async () => {
    await client.updatePushNotificationPreferences({
      preferences: [
        {
          feeds_level: 'all', // Global feeds level
          feeds_preferences: {
            reaction: 'all', // Receive notifications for reactions
            comment: 'all', // Receive notifications for activity comments
            comment_reaction: 'all', // Receive notifications for comment reactions
            follow: 'none', // Don't receive notifications for new followers
            mention: 'all', // Receive notifications for mentions
          },
        },
      ],
    });
  });

  it(`Temporarily Disable Feeds Notifications`, async () => {
    // Disable feeds notifications for 2 hours
    const twoHoursFromNow = new Date();
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

    await client.updatePushNotificationPreferences({
      preferences: [
        {
          feeds_level: 'all',
          // @ts-expect-error API spec issue https://getstream.slack.com/archives/C06RK9WCR09/p1757335586873509?thread_ts=1757077886.530269&cid=C06RK9WCR09
          disabled_until: twoHoursFromNow.toISOString(),
        },
      ],
    });
  });

  it(`Client-Side Usage`, async () => {
    // Client-side: user_id is automatically set to the current user
    await client.updatePushNotificationPreferences({
      preferences: [
        {
          // user_id not needed - automatically set to current user
          feeds_level: 'all',
          feeds_preferences: {
            reaction: 'none',
            comment: 'all',
          },
        },
      ],
    });
  });

  it(`Complete Feeds Preferences Setup`, async () => {
    // Set comprehensive feeds preferences
    await client.updatePushNotificationPreferences({
      preferences: [
        {
          feeds_level: 'all', // Enable feeds notifications globally
          feeds_preferences: {
            // Built-in event preferences
            reaction: 'all', // Get notified of all activity reactions
            comment: 'all', // Get notified of all comments
            comment_reaction: 'all', // Get notified of all comment reactions
            follow: 'none', // Don't notify for new followers
            mention: 'all', // Get notified when mentioned
            // Custom activity type preferences
            custom_activity_types: {
              milestone: 'all', // Allow milestone notifications
              achievement: 'all', // Allow achievement notifications
              system_maintenance: 'none', // Block maintenance notifications
              promotional_offer: 'none', // Block promotional notifications
            },
          },
        },
      ],
    });
  });

  it(`Do Not Disturb Mode for Feeds`, async () => {
    // Enable "Do Not Disturb" for feeds until tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow

    await client.updatePushNotificationPreferences({
      preferences: [
        {
          feeds_level: 'none',
          // @ts-expect-error  API spec issue https://getstream.slack.com/archives/C06RK9WCR09/p1757335586873509?thread_ts=1757077886.530269&cid=C06RK9WCR09
          disabled_until: tomorrow.toISOString(),
        },
      ],
    });
  });

  it(`Minimal Feeds Notifications`, async () => {
    // Only get notified for comments and mentions
    await client.updatePushNotificationPreferences({
      preferences: [
        {
          feeds_level: 'all',
          feeds_preferences: {
            reaction: 'none', // Skip reaction notifications
            comment: 'all', // Keep comment notifications
            follow: 'none', // Skip follower notifications
            mention: 'all', // Keep mention notifications
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await client.disconnectUser();
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import { createTestClient, createTestTokenGenerator } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamNotificationFeedClient } from '../src/StreamNotificationFeedClient';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Feeds API - notification feed', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;
  let notificationFeed: StreamNotificationFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));
    emilyFeed = emilyClient.feed('user', uuidv4());
    await emilyFeed.getOrCreate();
  });

  it(`create a notification feed`, async () => {
    notificationFeed = emilyClient.notificationFeed('notification', uuidv4());
    await notificationFeed.getOrCreate();
    await notificationFeed.follow({
      target_group: emilyFeed.group,
      target_id: emilyFeed.id,
    });

    const response = await notificationFeed.read({
      limit: 20,
      offset: 0,
    });

    expect(response.groups.length).toBe(0);
  });

  it(`add a bunch of activities to emily's feed`, async () => {
    await Promise.all(
      new Array(5).fill(null).map((_, i) =>
        emilyFeed.addActivity({
          verb: 'post',
          object: `Post:${i}`,
        }),
      ),
    );

    await Promise.all(
      new Array(4).fill(null).map((_) =>
        emilyFeed.addActivity({
          verb: 'like',
          object: `Post:other-0`,
        }),
      ),
    );

    await Promise.all(
      new Array(3).fill(null).map((_, i) =>
        emilyFeed.addActivity({
          verb: 'comment',
          object: `Post:other-${i}`,
        }),
      ),
    );
  });

  it(`list notification groups`, async () => {
    let response = await notificationFeed.read({
      limit: 2,
      offset: 0,
      mark_seen: 'all',
      mark_read: 'current',
    });

    expect(response.unread).toBe(3);
    expect(response.unseen).toBe(3);
    expect(response.groups.length).toBe(2);

    const commentGroup = response.groups[0];

    expect(commentGroup.activity_count).toBe(3);
    expect(commentGroup.seen).toBe(false);
    expect(commentGroup.read).toBe(false);
    expect(commentGroup.actor_count).toBe(1);

    response = await notificationFeed.read({
      limit: 2,
      offset: 2,
    });

    expect(response.unread).toBe(1);
    expect(response.unseen).toBe(0);
    expect(response.groups.length).toBe(1);

    const postGroup = response.groups[0];

    expect(postGroup.activity_count).toBe(5);
    expect(postGroup.seen).toBe(true);
    expect(postGroup.read).toBe(false);
    expect(postGroup.actor_count).toBe(1);
  });

  afterAll(async () => {
    await emilyFeed.delete();
    await notificationFeed.delete();
  });
});

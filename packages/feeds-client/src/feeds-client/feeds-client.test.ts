import { beforeEach, describe, expect, it } from 'vitest';
import { FeedsClient } from './feeds-client';
import { generateActivityResponse } from '../test-utils';

describe('Feeds client tests', () => {
  let client: FeedsClient;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
  });

  it(`should find feeds to update for user events`, async () => {
    const feedA = client.feed('user', 'feedA');
    const feedB = client.feed('user', 'feedB');
    const feedC = client.feed('user', 'feedC');
    const activity1 = generateActivityResponse({ id: 'activity1' });

    feedA.state.partialNext({ activities: [activity1] });
    feedB.state.partialNext({ activities: [] });
    feedC.state.partialNext({
      // @ts-expect-error - we're not passing all the required fields
      pinned_activities: [{ activity: activity1 }],
    });

    const feeds = client['findActiveFeedsByActivityId'](activity1.id);
    expect(feeds).toHaveLength(2);
    expect(feeds).toContain(feedA);
    expect(feeds).toContain(feedC);
    expect(feeds).not.toContain(feedB);
  });
});

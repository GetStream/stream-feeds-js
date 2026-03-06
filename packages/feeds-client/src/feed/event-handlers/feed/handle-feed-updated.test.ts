import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleFeedUpdated } from './handle-feed-updated';
import {
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleFeedUpdated.name, () => {
  let feed: Feed;
  let client: FeedsClient;

  beforeEach(() => {
    client = new FeedsClient('mock-api-key');
    client.state.partialNext({
      connected_user: generateOwnUser({ id: getHumanId() }),
    });

    const feedResponse = generateFeedResponse({
      id: 'main',
      group_id: 'user',
    });

    feed = new Feed(
      client,
      feedResponse.group_id,
      feedResponse.id,
      feedResponse,
    );
  });

  it('applies update when updated_at is newer', () => {
    const now = new Date();
    feed.state.partialNext({ updated_at: now, name: 'Old Name' });

    const newerDate = new Date(now.getTime() + 1000);
    handleFeedUpdated.call(feed, {
      feed: { updated_at: newerDate, name: 'New Name' },
    } as Parameters<typeof handleFeedUpdated>[0]);

    expect(feed.currentState.name).toBe('New Name');
    expect(feed.currentState.updated_at).toBe(newerDate);
  });

  it('skips update when updated_at is older', () => {
    const now = new Date();
    feed.state.partialNext({ updated_at: now, name: 'Current Name' });

    const olderDate = new Date(now.getTime() - 1000);
    const stateBefore = feed.currentState;

    handleFeedUpdated.call(feed, {
      feed: { updated_at: olderDate, name: 'Stale Name' },
    } as Parameters<typeof handleFeedUpdated>[0]);

    expect(feed.currentState).toBe(stateBefore);
    expect(feed.currentState.name).toBe('Current Name');
  });

  it('skips update when updated_at is equal', () => {
    const now = new Date();
    feed.state.partialNext({ updated_at: now, name: 'Current Name' });

    const stateBefore = feed.currentState;

    handleFeedUpdated.call(feed, {
      feed: { updated_at: new Date(now.getTime()), name: 'Same Time Name' },
    } as Parameters<typeof handleFeedUpdated>[0]);

    expect(feed.currentState).toBe(stateBefore);
  });

  it('applies update when current updated_at is undefined', () => {
    feed.state.partialNext({ updated_at: undefined });

    const newDate = new Date();
    handleFeedUpdated.call(feed, {
      feed: { updated_at: newDate, name: 'First Update' },
    } as Parameters<typeof handleFeedUpdated>[0]);

    expect(feed.currentState.name).toBe('First Update');
    expect(feed.currentState.updated_at).toBe(newDate);
  });
});

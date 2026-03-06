import { describe, it, expect, beforeEach } from 'vitest';
import { Feed } from '../../../feed';
import { FeedsClient } from '../../../feeds-client';
import { handleFeedDeleted } from './handle-feed-deleted';
import {
  generateFeedResponse,
  generateOwnUser,
  getHumanId,
} from '../../../test-utils/response-generators';

describe(handleFeedDeleted.name, () => {
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

  it('sets deleted_at when not already set', () => {
    expect(feed.currentState.deleted_at).toBeUndefined();

    const now = new Date();
    handleFeedDeleted.call(feed, { created_at: now });

    expect(feed.currentState.deleted_at).toBe(now);
  });

  it('skips when deleted_at is already set', () => {
    const existingDate = new Date('2024-01-01');
    feed.state.partialNext({ deleted_at: existingDate });

    const stateBefore = feed.currentState;

    handleFeedDeleted.call(feed, { created_at: new Date() });

    expect(feed.currentState).toBe(stateBefore);
    expect(feed.currentState.deleted_at).toBe(existingDate);
  });
});

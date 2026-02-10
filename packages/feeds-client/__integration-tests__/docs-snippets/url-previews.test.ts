import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { Attachment, UserRequest } from '../../src/gen/models';
import { StreamApiError } from '../../src/common/types';

describe('URL previews page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activityId: string;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate();
  });

  it('activity with URL enrichment', async () => {
    const response = await feed.addActivity({
      type: 'post',
      text: 'Check this out: https://example.com/article',
    });
    // response.activity.attachments may include OG preview when enrichment completes

    activityId = response.activity.id;
  });

  it('comment with URL enrichment', async () => {
    const response = await client.addComment({
      comment: 'See also: https://example.com/related',
      object_id: activityId,
      object_type: 'activity',
    });
    expect(response.comment).toBeDefined();
  });

  it('skipping URL enrichment for activity and comment', async () => {
    const activityResponse = await feed.addActivity({
      type: 'post',
      text: 'https://example.com/page',
      skip_enrich_url: true,
    });
    expect(activityResponse.activity).toBeDefined();

    const commentResponse = await client.addComment({
      comment: 'https://example.com/page',
      object_id: activityResponse.activity.id,
      object_type: 'activity',
      skip_enrich_url: true,
    });
    expect(commentResponse.comment).toBeDefined();
  });

  it('reading URL preview attachments from activity and comment', async () => {
    const activityResponse = await client.getActivity({ id: activityId });
    const activity = activityResponse.activity;
    (activity.attachments || []).forEach((a) => {
      expect(a).toBeDefined();
      // use a.title, a.image_url, a.og_scrape_url, etc.
    });

    const comment = activity.comments?.[0];
    (comment?.attachments || []).forEach((a) => {
      expect(a).toBeDefined();
    });
  });

  it('getOG endpoint and activity/comment with pre-fetched OG', async () => {
    const url = 'https://example.com/article';
    const attachments: Attachment[] = [];

    try {
      const ogResponse = await client.getOG({ url });
      const { duration: _d, metadata: _m, ...ogData } = ogResponse;
      attachments.push(ogData);
    } catch (error) {
      // OG may not be fetched for all URLs
      if (!(error instanceof StreamApiError && error.code === 4)) {
        throw error;
      }
    }

    const activityResponse = await feed.addActivity({
      type: 'post',
      text: `Check this out: ${url}`,
      skip_enrich_url: true,
      attachments: attachments,
    });
    expect(activityResponse.activity).toBeDefined();

    const commentResponse = await client.addComment({
      comment: `See also: ${url}`,
      object_id: activityResponse.activity.id,
      object_type: 'activity',
      skip_enrich_url: true,
      attachments: attachments,
    });
    expect(commentResponse.comment).toBeDefined();
  });

  afterAll(async () => {
    await feed?.delete({ hard_delete: true });
    await client?.disconnectUser();
  });
});

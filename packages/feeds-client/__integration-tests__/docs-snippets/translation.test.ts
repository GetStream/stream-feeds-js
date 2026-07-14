import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from '../utils';
import type { FeedsClient } from '../../src/feeds-client';
import type { Feed } from '../../src/feed';
import type { ActivityResponse, UserRequest } from '../../src/gen/models';

describe('Translation page', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let feed: Feed;
  let activity: ActivityResponse;

  beforeAll(async () => {
    client = createTestClient();
    await client.connectUser(user, createTestTokenGenerator(user));
    feed = client.feed('user', crypto.randomUUID());
    await feed.getOrCreate({ watch: true });
    activity = (
      await feed.addActivity({
        type: 'post',
        text: 'Hello, I would like to know more about your product.',
      })
    ).activity;
  });

  it('Translate an activity', async () => {
    const response = await client.translateActivity({
      id: activity.id,
      language: 'fr',
    });

    expect(response.activity?.i18n?.fr_text).toBeDefined();
  });

  it('Reading translated content with language projection', async () => {
    const response = await feed.getOrCreate({
      language: 'es',
    });

    expect(response.activities?.[0]?.text).toBeDefined();
    expect(response.activities?.[0]?.i18n?.es_text).toBeDefined();
  });

  it('Substitute text with translate_text', async () => {
    const response = await feed.getOrCreate({
      language: 'es',
      translate_text: true,
    });

    expect(response.activities?.[0]?.text).toBeDefined();
    expect(response.activities?.[0]?.i18n?.language).toBeDefined();
  });

  it('Set user language', async () => {
    await client.upsertUsers([
      { id: user.id, language: 'en', name: user.name ?? 'Jane' },
    ]);
  });

  afterAll(async () => {
    await feed.delete({ hard_delete: true });
    await client.disconnectUser();
  });
});

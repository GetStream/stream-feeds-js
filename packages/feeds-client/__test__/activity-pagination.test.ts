import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StreamFeedsClient } from '../src/StreamFeedsClient';
import { createTestClient, createTestTokenGenerator } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { StreamFlatFeedClient } from '../src/StreamFlatFeedClient';

describe('Activity pagination', () => {
  const emily = { id: 'emily' };
  let emilyClient: StreamFeedsClient;
  let emilyFeed: StreamFlatFeedClient;

  beforeAll(async () => {
    emilyClient = createTestClient();
    await emilyClient.connectUser(emily, createTestTokenGenerator(emily));

    emilyFeed = emilyClient.feed('user', uuidv4());

    await emilyFeed.getOrCreate({ watch: false });
  });

  it('add activities', async () => {
    for (let i = 0; i < 25; i++) {
      await emilyFeed.addActivity({
        object: `post:${i}`,
        verb: 'create',
      });
    }
  });

  it('read first page', async () => {
    let state = emilyFeed.state.getLatestValue();

    expect(state.activities).toBeUndefined();
    expect(state.offset).toBe(0);
    expect(state.limit).toBe(0);
    expect(state.has_next_page).toBe(true);

    await emilyFeed.read({ offset: 0, limit: 10 });

    state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(10);
    expect(state.offset).toBe(0);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
  });

  it('read next page', async () => {
    await emilyFeed.readNextPage();

    let state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(20);
    expect(state.offset).toBe(10);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
  });

  it(`reading the same page twice shouldn't mess up state`, async () => {
    await emilyFeed.read({ offset: 10, limit: 10 });

    let state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(20);
    expect(state.offset).toBe(10);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
  });

  it('read last page', async () => {
    await emilyFeed.readNextPage();

    let state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(25);
    expect(state.offset).toBe(20);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(false);
  });

  it(`read with offset 0 should reset state`, async () => {
    await emilyFeed.read({ offset: 0, limit: 10 });

    const state = emilyFeed.state.getLatestValue();

    expect(state.activities?.length).toBe(10);
    expect(state.offset).toBe(0);
    expect(state.limit).toBe(10);
    expect(state.has_next_page).toBe(true);
  });

  afterAll(async () => {
    await emilyFeed.delete();
  });
});

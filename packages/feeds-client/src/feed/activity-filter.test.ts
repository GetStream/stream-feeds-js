import { describe, it, expect } from 'vitest';
import { activityFilter } from './activity-filter';
import type { GetOrCreateFeedRequest } from '../gen/models';
import { generateActivityResponse } from '../test-utils';

describe('activityFilter', () => {
  it('returns true when requestConfig is undefined', () => {
    const activity = generateActivityResponse();
    expect(activityFilter(activity, undefined)).toBe(true);
  });

  it('returns true when requestConfig has no filter', () => {
    const activity = generateActivityResponse();
    const requestConfig: GetOrCreateFeedRequest = { limit: 10 };
    expect(activityFilter(activity, requestConfig)).toBe(true);
  });

  it('returns true when filter is empty object', () => {
    const activity = generateActivityResponse({ filter_tags: ['blue'] });
    expect(activityFilter(activity, { filter: {} })).toBe(true);
  });

  it('returns true when activity matches filter_tags', () => {
    const activity = generateActivityResponse({
      filter_tags: ['blue', 'green'],
    });
    expect(
      activityFilter(activity, { filter: { filter_tags: ['blue'] } }),
    ).toBe(true);
  });

  it('returns false when activity does not match filter_tags', () => {
    const activity = generateActivityResponse({
      filter_tags: ['red', 'green'],
    });
    expect(
      activityFilter(activity, { filter: { filter_tags: ['blue'] } }),
    ).toBe(false);
  });

  it('returns true when activity matches activity_type (maps to type)', () => {
    const activity = generateActivityResponse({ type: 'hike' });
    expect(
      activityFilter(activity, { filter: { activity_type: 'hike' } }),
    ).toBe(true);
  });

  it('returns false when activity does not match activity_type', () => {
    const activity = generateActivityResponse({ type: 'post' });
    expect(
      activityFilter(activity, { filter: { activity_type: 'hike' } }),
    ).toBe(false);
  });

  it('returns true when activity location is within_bounds', () => {
    const activity = generateActivityResponse({
      location: { lat: 52.38, lng: 4.87 },
    });
    expect(
      activityFilter(activity, {
        filter: {
          within_bounds: {
            $eq: {
              ne_lat: 52.43017,
              ne_lng: 4.924821,
              sw_lat: 52.334272,
              sw_lng: 4.822116,
            },
          },
        },
      }),
    ).toBe(true);
  });

  it('returns false when activity has no location and filter has within_bounds', () => {
    const activity = generateActivityResponse();
    expect(
      activityFilter(activity, {
        filter: {
          within_bounds: {
            $eq: {
              ne_lat: 52.43017,
              ne_lng: 4.924821,
              sw_lat: 52.334272,
              sw_lng: 4.822116,
            },
          },
        },
      }),
    ).toBe(false);
  });

  it('combines filter_tags and activity_type with $and', () => {
    const matchingActivity = generateActivityResponse({
      type: 'hike',
      filter_tags: ['blue'],
    });
    const requestConfig: GetOrCreateFeedRequest = {
      filter: {
        $and: [{ filter_tags: ['blue'] }, { activity_type: 'hike' }],
      },
    };
    expect(activityFilter(matchingActivity, requestConfig)).toBe(true);

    const wrongType = generateActivityResponse({
      type: 'post',
      filter_tags: ['blue'],
    });
    expect(activityFilter(wrongType, requestConfig)).toBe(false);

    const wrongTags = generateActivityResponse({
      type: 'hike',
      filter_tags: ['red'],
    });
    expect(activityFilter(wrongTags, requestConfig)).toBe(false);
  });

  const springSaleActivity = generateActivityResponse({
    id: 'activity-123',
    type: 'post',
    text: 'Check out our spring sale!',
    search_data: {
      campaign: {
        id: 'spring-sale-2025',
        location: {
          mall: 'yorkdale',
          city: 'toronto',
          country: 'canada',
        },
      },
    },
  });

  it('returns true when activity search_data matches $contains (nested campaign id)', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: {
            $contains: { campaign: { id: 'spring-sale-2025' } },
          },
        },
      }),
    ).toBe(true);
  });

  it('returns false when activity search_data does not match $contains (wrong campaign id)', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: {
            $contains: { campaign: { id: 'winter-sale-2025' } },
          },
        },
      }),
    ).toBe(false);
  });

  it('returns true when activity search_data has path for $path_exists (campaign.location.mall)', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: { $path_exists: 'campaign.location.mall' },
        },
      }),
    ).toBe(true);
  });

  it('returns false when activity search_data lacks path for $path_exists', () => {
    expect(
      activityFilter(springSaleActivity, {
        filter: {
          search_data: { $path_exists: 'campaign.location.region' },
        },
      }),
    ).toBe(false);
  });
});

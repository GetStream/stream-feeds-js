import { StateStore } from '@stream-io/common';
import { StreamFeedApi } from './gen/feeds/FeedApi';
import { Feed, GetOrCreateFeedRequest } from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';

export type FeedBaseState = Partial<Omit<Feed, 'group' | 'id'>>;

export abstract class StreamBaseFeed extends StreamFeedApi {
  protected readonly baseState: StateStore<FeedBaseState>;

  constructor(client: StreamFeedsClient, group: string, id: string) {
    super(client, group, id);
    this.baseState = new StateStore<FeedBaseState>({
      created_at: undefined,
      follower_count: undefined,
      following_count: undefined,
      type: undefined,
      updated_at: undefined,
      visibility_level: undefined,
      members: undefined,
      created_by: undefined,
    });
  }

  async get() {
    const response = await super.get();
    this.baseState.next(response.feed);

    return response;
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    this.baseState.next(response.feed);

    return response;
  }

  async create(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    this.baseState.next(response.feed);

    return response;
  }
}

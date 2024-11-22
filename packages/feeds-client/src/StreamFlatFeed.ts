import { StateStore } from '@stream-io/common';
import {
  Feed,
  GetOrCreateFeedRequest,
  ReadFlatFeedResponse,
} from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';
import { StreamFeedApi } from './gen/feeds/FeedApi';

type FlatFeed = Feed & Omit<ReadFlatFeedResponse, 'duration'>;

export type StreamFlatFeedState = Partial<{
  [key in keyof FlatFeed]: FlatFeed[key];
}>;

export class StreamFlatFeed extends StreamFeedApi {
  readonly state: StateStore<StreamFlatFeedState>;

  constructor(
    client: StreamFeedsClient,
    group: string,
    id: string,
    feed?: Feed,
  ) {
    super(client, group, id);
    const defaultState: StreamFlatFeedState = {
      created_at: undefined,
      follower_count: undefined,
      following_count: undefined,
      group: undefined,
      id: undefined,
      type: undefined,
      updated_at: undefined,
      visibility_level: undefined,
      invites: undefined,
      members: undefined,
      created_by: undefined,
      deleted_at: undefined,
      custom: undefined,
      activities: undefined,
    };
    this.state = new StateStore({ ...feed, ...defaultState });
  }

  read = this.readFlat;

  async get() {
    const response = await super.get();
    this.state.partialNext(response.feed);

    return response;
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    this.state.partialNext(response.feed);

    return response;
  }
}

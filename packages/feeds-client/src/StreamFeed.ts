import { StateStore } from '@stream-io/common';
import { StreamFeedApi } from './gen/feeds/FeedApi';
import { Activity, Feed, GetOrCreateFeedRequest } from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';

export type FeedState = Omit<Feed, 'group' | 'id'> & {
  isStateStale: boolean;
  activities: Activity[];
};

export class StreamFeed extends StreamFeedApi {
  readonly state: StateStore<FeedState>;

  constructor(client: StreamFeedsClient, group: string, id: string) {
    super(client, group, id);
    this.state = new StateStore<FeedState>({
      isStateStale: true,
      activities: [],
      created_at: new Date(),
      follower_count: 0,
      following_count: 0,
      type: '',
      updated_at: new Date(),
      visibility_level: '',
      members: [],
      created_by: {
        banned: false,
        created_at: new Date(),
        id: '',
        language: '',
        online: false,
        role: '',
        updated_at: new Date(),
        blocked_user_ids: [],
        teams: [],
        custom: {},
      },
    });
  }

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

  async create(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    this.state.partialNext(response.feed);

    return response;
  }
}

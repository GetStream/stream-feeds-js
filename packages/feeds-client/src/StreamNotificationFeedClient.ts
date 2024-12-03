import { StateStore } from '@stream-io/common';
import {
  Feed,
  GetOrCreateFeedRequest,
  ReadNotificationFeedResponse,
} from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';
import { StreamFeedApi } from './gen/feeds/FeedApi';

type NotificationFeed = Feed & Omit<ReadNotificationFeedResponse, 'duration'>;

export type StreamNotificationFeedState = Partial<{
  [key in keyof NotificationFeed]: NotificationFeed[key];
}>;

export class StreamNotificationFeedClient extends StreamFeedApi {
  readonly state: StateStore<StreamNotificationFeedState>;

  constructor(
    client: StreamFeedsClient,
    group: string,
    id: string,
    feed?: Feed,
  ) {
    super(client, group, id);
    const defaultState: StreamNotificationFeedState = {
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
      groups: undefined,
    };
    this.state = new StateStore({ ...feed, ...defaultState });
  }

  read = this.readNotification;

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

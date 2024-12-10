import {
  ActivityAddedEvent,
  Feed,
  ReadNotificationFeedResponse,
} from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';
import { StreamBaseFeed } from './StreamBaseFeed';

type NotificationFeed = Feed & Omit<ReadNotificationFeedResponse, 'duration'>;

export type StreamNotificationFeedState = Partial<{
  [key in keyof NotificationFeed]: NotificationFeed[key];
}> & {
  offset: number;
  limit: number;
  has_next_page: boolean;
};

export class StreamNotificationFeedClient extends StreamBaseFeed<StreamNotificationFeedState> {
  constructor(
    client: StreamFeedsClient,
    group: string,
    id: string,
    feed?: Feed,
  ) {
    super(client, group, id, feed);
  }

  read = async (request: {
    limit: number;
    offset: number;
    mark_seen?: string;
    mark_read?: string;
  }) => {
    const response = await this.readNotification(request);
    let groups = this.state.getLatestValue().groups ?? [];
    const newGrpoups = [...(request.offset === 0 ? [] : groups)];
    newGrpoups.push(...response.groups);
    this.state.partialNext({
      unread: response.unread,
      unseen: response.unseen,
      groups: newGrpoups,
      limit: request.limit,
      offset: request.offset,
      has_next_page: response.groups.length === request.limit,
    });

    return response;
  };

  readNextPage = async () => {
    const offset = this.state.getLatestValue().offset;
    const limit = this.state.getLatestValue().limit ?? 30;

    if (!this.state.getLatestValue().has_next_page) {
      return Promise.resolve();
    } else {
      return this.read({ offset: offset + limit, limit });
    }
  };

  protected getInitialState(feed?: Feed) {
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
      unread: undefined,
      unseen: undefined,
      limit: 0,
      offset: 0,
      has_next_page: true,
    };
    return { ...feed, ...defaultState };
  }

  protected updateFromFeedResponse(feed: Feed): void {
    this.state.partialNext(feed);
  }

  protected newActivityReceived(event: ActivityAddedEvent): void {
    // TODO: implement me
  }
}

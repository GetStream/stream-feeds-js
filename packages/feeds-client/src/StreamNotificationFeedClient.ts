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
}>;

export class StreamNotificationFeedClient extends StreamBaseFeed<StreamNotificationFeedState> {
  constructor(
    client: StreamFeedsClient,
    group: string,
    id: string,
    feed?: Feed,
  ) {
    super(client, group, id, feed);
  }

  read = this.readNotification;

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

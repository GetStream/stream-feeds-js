import { StateStore } from '@stream-io/common';
import { ReadNotificationFeedResponse } from './gen/models';
import { FeedBaseState, StreamBaseFeed } from './StreamBaseFeed';
import { StreamFeedsClient } from './StreamFeedsClient';

export type NotificationFeedState = {
  [key in keyof FeedBaseState]: FeedBaseState[key];
} & Partial<Omit<ReadNotificationFeedResponse, 'duration'>>;

export class StreamNotificationFeed extends StreamBaseFeed {
  readonly state: StateStore<NotificationFeedState>;

  constructor(client: StreamFeedsClient, group: string, id: string) {
    super(client, group, id);
    this.state = new StateStore<NotificationFeedState>({
      ...this.baseState.getLatestValue(),
      unread: undefined,
      unseen: undefined,
      groups: undefined,
    });
    this.baseState.subscribe((state) => this.state.partialNext(state));
  }

  read = this.readNotification;
}

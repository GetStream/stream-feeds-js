import { BaseFeed, BaseFeedState } from './BaseFeed';
import { Feed } from './gen/models';

export type NotificationFeedState = BaseFeedState;

export class NotificationFeed extends BaseFeed<{
  [key in keyof NotificationFeedState]: NotificationFeedState[key];
}> {
  type = 'notification' as const;

  protected getInitialState(feed?: Feed) {
    const defaultState: NotificationFeedState = {};
    return { ...defaultState, ...feed };
  }

  protected feedUpdated(feed: Partial<Feed>): void {
    this.state.partialNext(feed);
  }
}

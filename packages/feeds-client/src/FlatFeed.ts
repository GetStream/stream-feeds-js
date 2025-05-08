import { Feed } from './gen/models';
import { BaseFeed, BaseFeedState } from './BaseFeed';

export type FlatFeedState = BaseFeedState;

export class FlatFeed extends BaseFeed<{
  [key in keyof FlatFeedState]: FlatFeedState[key];
}> {
  type = 'flat' as const;
  protected getInitialState(feed?: Feed) {
    const defaultState: FlatFeedState = {};

    return { ...defaultState, ...feed };
  }

  protected feedUpdated(feed: Partial<Feed>): void {
    this.state.partialNext({ ...feed });
  }
}

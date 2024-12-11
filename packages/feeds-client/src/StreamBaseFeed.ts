import { EventDispatcher, StateStore } from '@stream-io/common';
import { StreamFeedApi } from './gen/feeds/FeedApi';
import {
  Activity,
  ActivityAddedEvent,
  Feed,
  GetOrCreateFeedRequest,
  WSEvent,
} from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';

export type StreamBaseFeedState = Partial<Feed> & {
  offset: number;
  limit: number;
  has_next_page: boolean;
  is_loading_next_page: boolean;
};

export abstract class StreamBaseFeed<
  T extends {
    [key in keyof StreamBaseFeedState]: StreamBaseFeedState[key];
  } = StreamBaseFeedState,
> extends StreamFeedApi {
  readonly state: StateStore<T>;

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  constructor(
    client: StreamFeedsClient,
    group: string,
    id: string,
    feed?: Feed,
  ) {
    super(client, group, id);
    this.state = new StateStore<T>(this.getInitialState(feed));
  }

  async get() {
    const response = await super.get();
    this.updateFromFeedResponse(response.feed);

    return response;
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    this.updateFromFeedResponse(response.feed);

    return response;
  }

  readNextPage = async () => {
    const offset = this.state.getLatestValue().offset;
    const limit = this.state.getLatestValue().limit ?? 30;

    if (!this.state.getLatestValue().has_next_page) {
      return await Promise.resolve();
    } else {
      this.setLoadingState(true);
      try {
        const response = await this.read({ offset: offset + limit, limit });
        return response;
      } finally {
        this.setLoadingState(false);
      }
    }
  };

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  /**
   * internal
   * @param event
   */
  handleWSEvent(event: WSEvent) {
    if (event.type === 'feeds.activity_added') {
      this.newActivityReceived(event);
    }
    this.eventDispatcher.dispatch(event);
  }

  protected addActivitiesToState(
    newActivities: Activity[],
    activities: Activity[],
  ) {
    // TODO: this should be more performant
    newActivities.forEach((newActivity) => {
      const index = activities.findIndex((a) => a.id === newActivity.id);
      if (index === -1) {
        activities.push(newActivity);
      } else {
        activities[index] = newActivity;
      }
    });
    activities.sort((a1, a2) => {
      return a2.created_at.getTime() - a1.created_at.getTime();
    });
  }

  public abstract read(request: {
    limit: number;
    offset: number;
  }): Promise<any>;

  protected abstract getInitialState(feed?: Feed): T;

  protected abstract setLoadingState(state: boolean): void;

  protected abstract updateFromFeedResponse(feed: Feed): void;

  protected abstract newActivityReceived(event: ActivityAddedEvent): void;
}

import { EventDispatcher, StateStore } from '@stream-io/common';
import { StreamFeedApi } from './gen/feeds/FeedApi';
import {
  ActivityAddedEvent,
  ActivityRemovedEvent,
  ActivityUpdatedEvent,
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
  abstract type: Feed['type'];

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

  get fid() {
    return `${this.group}:${this.id}`;
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
    switch (event.type) {
      case 'feeds.activity_added':
        this.newActivityReceived(event);
        break;
      case 'feeds.activity_updated':
        this.activityUpdated(event);
        break;
      case 'feeds.activity_removed':
        this.activityRemoved(event);
        break;
    }
    this.eventDispatcher.dispatch(event);
  }

  public abstract read(request: {
    limit: number;
    offset: number;
  }): Promise<any>;

  protected abstract getInitialState(feed?: Feed): T;

  protected abstract setLoadingState(state: boolean): void;

  protected abstract updateFromFeedResponse(feed: Feed): void;

  protected abstract newActivityReceived(event: ActivityAddedEvent): void;

  protected abstract activityUpdated(event: ActivityUpdatedEvent): void;

  protected abstract activityRemoved(event: ActivityRemovedEvent): void;
}

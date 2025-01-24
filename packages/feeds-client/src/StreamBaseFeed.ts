import { EventDispatcher, StateStore } from '@stream-io/common';
import { StreamFeedApi } from './gen/feeds/FeedApi';
import {
  ActivityAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityReactionNewEvent,
  ActivityReactionUpdatedEvent,
  ActivityRemovedEvent,
  ActivityUpdatedEvent,
  Feed,
  FollowEvent,
  FollowRequestEvent,
  GetOrCreateFeedRequest,
  UnfollowEvent,
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

  private readonly eventHandlers: {
    [key in WSEvent['type']]: (event: Extract<WSEvent, { type: key }>) => void;
  } = {
    'feeds.activity_added': (event) => this.newActivityReceived(event),
    'feeds.activity_reaction_deleted': (event) =>
      this.activityReactionRemoved(event),
    'feeds.activity_reaction_new': (event) =>
      this.reactionAddedToActivity(event),
    'feeds.activity_reaction_updated': (event) =>
      this.activityReactionUpdated(event),
    'feeds.activity_removed': (event) => this.activityRemoved(event),
    'feeds.activity_updated': (event) => this.activityUpdated(event),
    'feeds.follow': (event) => this.updateFeedFromFollowEvent(event),
    'feeds.follow_request_created': (event) =>
      this.updateFeedFromFollowEvent(event),
    'feeds.follow_request_updated': (event) =>
      this.updateFeedFromFollowEvent(event),
    'feeds.unfollow': (event) => this.updateFeedFromFollowEvent(event),
  };

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
    // @ts-expect-error TODO solve this
    this.eventHandlers[event.type](event);
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

  protected abstract reactionAddedToActivity(
    event: ActivityReactionNewEvent,
  ): void;

  protected abstract activityReactionUpdated(
    event: ActivityReactionUpdatedEvent,
  ): void;

  protected abstract activityReactionRemoved(
    event: ActivityReactionDeletedEvent,
  ): void;

  private updateFeedFromFollowEvent(
    event: FollowRequestEvent | FollowEvent | UnfollowEvent,
  ) {
    const sourceFeed = event.source_feed;
    const targetFeed = event.target_feed;
    if (`${sourceFeed.group}:${sourceFeed.id}` === this.fid) {
      this.updateFromFeedResponse({
        ...sourceFeed,
        members: this.state.getLatestValue().members ?? [],
      });
    } else if (`${targetFeed.group}:${targetFeed.id}` === this.fid) {
      this.updateFromFeedResponse({
        ...targetFeed,
        members: this.state.getLatestValue().members ?? [],
      });
    }
  }
}

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

export abstract class StreamBaseFeed<
  T extends Partial<{ [key in keyof Feed]: Feed[key] }> = Partial<Feed>,
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
    activities.sort(
      (a1, a2) => a1.created_at.getTime() - a2.created_at.getTime(),
    );
  }

  protected abstract getInitialState(feed?: Feed): T;

  protected abstract updateFromFeedResponse(feed: Feed): void;

  protected abstract newActivityReceived(event: ActivityAddedEvent): void;
}

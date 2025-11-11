import { StateStore } from '@stream-io/state-store';
import type { Feed, FeedState } from '../feed';
import type { FeedsClient } from '../feeds-client';
import type { ActivityResponse } from '../gen/models';
import {
  connectActivityToFeed,
  disconnectActivityFromFeed,
  isAnyFeedWatched,
} from '../feeds-client/active-activity';
import type { GetCommentsRequest } from '@self';
import { deepEqual } from '../utils/deep-equal';

type GetActivityConfig = {
  comments?: Partial<
    Omit<GetCommentsRequest, 'object_id' | 'object_type' | 'next'>
  >;
};

export type ActivityState = { activity?: ActivityResponse } & Pick<
  FeedState,
  'comments_by_entity_id'
> & {
    /**
     * True when state is being fetched from API
     */
    is_loading: boolean;
    /**
     * @internal
     */
    last_get_request_config?: GetActivityConfig;
  };

export class ActivityWithStateUpdates {
  readonly state: StateStore<ActivityState>;
  protected feed: Feed | undefined;
  private unsubscribeFromFeedState?: () => void;
  private inProgressGet?: {
    request?: GetActivityConfig;
    promise: Promise<ActivityResponse>;
  };

  constructor(
    public readonly id: string,
    private readonly feedsClient: FeedsClient,
  ) {
    this.state = new StateStore<ActivityState>({
      activity: undefined,
      comments_by_entity_id: {},
      is_loading: false,
    });
  }

  get currentState() {
    return this.state.getLatestValue();
  }

  get feeds() {
    return this.currentState.activity?.feeds ?? [];
  }

  /**
   * Fetch activity and load it into state
   * @param watch - Whether to watch the feed the activity belongs to for real-time updates
   * @param feed - The feed to watch. Use only if the activity belongs to multiple feeds and you want to specify the feed explicitly.
   * @param feedSelector - A function to select the feed from the activity response. Use only if the activity belongs to multiple feeds and you want to specify the feed explicitly.
   */
  async get(request: GetActivityConfig = {}) {
    if (this.inProgressGet && deepEqual(this.inProgressGet.request, request)) {
      return this.inProgressGet.promise;
    }

    const { comments } = request;

    this.state.partialNext({
      is_loading: true,
      last_get_request_config: request,
    });

    const getActivityRequest = this.feedsClient
      .getActivity({
        id: this.id,
      })
      .then((response) => response.activity);
    this.inProgressGet = { request, promise: getActivityRequest };
    const activityResponse = await getActivityRequest;

    this.feedsClient.hydratePollCache([activityResponse]);

    this.setFeed({
      // We set feed to first containing feed
      // But in WS event handler we match events by any of the containing feeds, so as long as any of the containing feeds are watched, we'll do a state update
      // This is a bit hacky, proper solution would be to refactor all activity event handlers and detach them from feed instance
      fid: activityResponse.feeds[0],
      initialState: activityResponse,
    });

    if (this.feed) {
      this.feed.activityAddedEventFilter = () => false;
    }

    if (comments) {
      await this.loadNextPageActivityComments(comments);
    }

    this.subscribeToFeedState();

    this.inProgressGet = undefined;

    return activityResponse;
  }

  loadNextPageActivityComments(
    request?: Partial<
      Omit<GetCommentsRequest, 'object_id' | 'object_type' | 'next'>
    >,
  ) {
    const activity = this.feed?.currentState.activities?.[0];
    if (!activity || !this.feed) {
      throw new Error('Initialize activity first');
    }
    if (!this.currentState.last_get_request_config?.comments) {
      this.state.partialNext({
        last_get_request_config: {
          ...this.currentState.last_get_request_config,
          comments: request,
        },
      });
    }
    return this.feed.loadNextPageActivityComments(activity, request);
  }

  loadNextPageCommentReplies(
    ...params: Parameters<Feed['loadNextPageCommentReplies']>
  ) {
    if (!this.feed) {
      throw new Error('Initialize activity first');
    }
    return this.feed.loadNextPageCommentReplies(...params);
  }

  disconnect() {
    console.log('itt - disconnect - disconnectActivityFromFeed', this.id);
    this.unsubscribeFromFeedState?.();
    disconnectActivityFromFeed.call(this.feedsClient, this.id);
  }

  /**
   * @internal
   */
  async synchronize() {
    const allFids = this.currentState.activity?.feeds ?? [];
    if (!isAnyFeedWatched.call(this.feedsClient, allFids)) {
      return;
    }
    this.inProgressGet = undefined;
    return this.get(this.currentState.last_get_request_config);
  }

  private setFeed({
    fid,
    initialState,
  }: {
    fid: string;
    initialState: ActivityResponse;
  }) {
    this.feed = connectActivityToFeed.call(this.feedsClient, { fid });

    this.feed.state.partialNext({
      activities: [initialState],
    });
  }

  private subscribeToFeedState() {
    this.unsubscribeFromFeedState?.();
    this.unsubscribeFromFeedState = this.feed?.state.subscribeWithSelector(
      (state) => ({
        activity: state.activities?.find((activity) => activity.id === this.id),
        comments_by_entity_id: state.comments_by_entity_id,
      }),
      (state) => {
        if (state.activity) {
          this.state.partialNext({
            activity: state.activity,
            comments_by_entity_id: state.comments_by_entity_id,
            is_loading: false,
          });
        }
      },
    );
  }
}

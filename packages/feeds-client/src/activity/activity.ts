import { StateStore } from '@stream-io/state-store';
import { Feed, type FeedState } from '../feed';
import type { FeedsClient } from '../feeds-client';
import type { ActivityResponse } from '../gen/models';
import {
  connectActivityToFeed,
  isAnyFeedWatched,
} from '../feeds-client/active-activity';
import type { GetCommentsRequest } from '@self';

type GetActivityConfig = {
  comments?: Partial<
    Omit<GetCommentsRequest, 'object_id' | 'object_type' | 'next'>
  >;
};

export type ActivityState = (
  | (Partial<ActivityResponse> & { is_inited: false })
  | ({ [key in keyof ActivityResponse]: ActivityResponse[key] } & {
      is_inited: true;
    })
) &
  Pick<FeedState, 'comments_by_entity_id'> & {
    /**
     * True when state is being fetched from API
     */
    is_loading: boolean;
    /**
     * @internal
     */
    last_get_request_config?: GetActivityConfig;
  };

export class Activity {
  readonly state: StateStore<ActivityState>;
  public feed: Feed | undefined;

  constructor(
    public readonly id: string,
    private readonly feedsClient: FeedsClient,
  ) {
    this.state = new StateStore<ActivityState>({
      comments_by_entity_id: {},
      is_loading: false,
      watch: false,
      is_inited: false,
    });
  }

  get currentState() {
    return this.state.getLatestValue();
  }

  /**
   * Fetch activity and load it into state
   * @param watch - Whether to watch the feed the activity belongs to for real-time updates
   * @param feed - The feed to watch. Use only if the activity belongs to multiple feeds and you want to specify the feed explicitly.
   * @param feedSelector - A function to select the feed from the activity response. Use only if the activity belongs to multiple feeds and you want to specify the feed explicitly.
   */
  async get(request: GetActivityConfig = {}) {
    const { comments } = request;

    this.state.partialNext({
      is_loading: true,
      last_get_request_config: request,
    });

    const activityResponse = (
      await this.feedsClient.getActivity({
        id: this.id,
      })
    ).activity;

    this.setFeed({
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

  /**
   * @internal
   */
  async synchronize() {
    const allFids = this.currentState.feeds ?? [];
    if (!isAnyFeedWatched.call(this.feedsClient, allFids)) {
      return;
    }
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
    this.feed?.state.subscribeWithSelector(
      (state) => ({
        activity: state.activities?.find((activity) => activity.id === this.id),
        comments_by_entity_id: state.comments_by_entity_id,
        is_loading: state.is_loading,
      }),
      (state) => {
        if (state.activity) {
          this.state.partialNext({
            ...state.activity,
            comments_by_entity_id: state.comments_by_entity_id,
            is_loading: state.is_loading,
            is_inited: true,
          });
        }
      },
    );
  }
}

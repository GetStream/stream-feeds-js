import { StateStore } from '@stream-io/state-store';
import type { Feed, FeedState } from '../feed';
import type { FeedsClient } from '../feeds-client';
import type { ActivityResponse } from '../gen/models';
import { connectActivityToFeed } from '../feeds-client/connect-activity-to-feed';

export type ActivityState = Partial<ActivityResponse> &
  Pick<FeedState, 'comments_by_entity_id'> & {
    /**
     * True when being synchronized after connection recovered
     */
    is_loading: boolean;
    /**
     * True when the activity is being watched and receives real-time updates
     */
    watch: boolean;
    /**
     * @internal
     *
     * The last request config used to load comments for this activity.
     */
    last_get_comments_request?: Parameters<
      Feed['loadNextPageActivityComments']
    >;
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
    });
  }

  async get({
    comments,
    watch,
    feed,
    feedSelector,
  }: {
    comments: Parameters<Feed['loadNextPageActivityComments']>;
    watch?: boolean;
    feed?: string;
    feedSelector?: (activityResponse: ActivityResponse) => string;
  }) {
    const activityResponse = (
      await this.feedsClient.getActivity({
        id: this.id,
      })
    ).activity;

    const fid = feedSelector
      ? feedSelector(activityResponse)
      : (feed ??
        activityResponse.current_feed?.feed ??
        activityResponse.feeds[0]);

    await this.setFeed({
      fid: fid,
      watch: watch ?? false,
      initialState: activityResponse,
    });
  }

  stopWatching() {
    return this.feed?.stopWatching();
  }

  /**
   * @internal
   */
  async synchronize() {
    // TODO
  }

  private async setFeed({
    fid,
    watch,
    initialState,
  }: {
    fid: string;
    watch: boolean;
    initialState: ActivityResponse;
  }) {
    this.feed = await connectActivityToFeed.bind(this.feedsClient, {
      fid,
      watch,
    })();

    this.feed.state.partialNext({
      activities: [initialState],
    });

    this.feed.state.subscribeWithSelector(
      (state) => ({
        activity: state.activities?.find((activity) => activity.id === this.id),
        comments_by_entity_id: state.comments_by_entity_id,
        watch: state.watch,
      }),
      (state) => {
        if (state.activity) {
          this.state.partialNext({
            ...state.activity,
            comments_by_entity_id: state.comments_by_entity_id,
            watch: state.watch,
          });
        }
      },
    );
  }
}

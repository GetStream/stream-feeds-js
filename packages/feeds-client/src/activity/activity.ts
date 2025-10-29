import { StateStore } from '@stream-io/state-store';
import type { Feed, FeedState } from '../feed';
import type { FeedsClient } from '../feeds-client';
import type { ActivityResponse } from '../gen/models';
import { connectActivityToFeed } from '../feeds-client/active-activity';

export type ActivityState = Partial<ActivityResponse> &
  Pick<FeedState, 'comments_by_entity_id'> & {
    /**
     * True when state is being fetched from API
     */
    is_loading: boolean;
    /**
     * True when the activity is being watched and receives real-time updates
     */
    watch: boolean;
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

  get currentState() {
    return this.state.getLatestValue();
  }

  /**
   * Fetch activity and load it into state
   * @param watch - Whether to watch the feed the activity belongs to for real-time updates
   * @param feed - The feed to watch. Use only if the activity belongs to multiple feeds and you want to specify the feed explicitly.
   * @param feedSelector - A function to select the feed from the activity response. Use only if the activity belongs to multiple feeds and you want to specify the feed explicitly.
   */
  async get({
    watch,
    feed,
    feedSelector,
  }: {
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

    if (!activityResponse.feeds.includes(fid)) {
      throw new Error(
        `Activity ${this.id} does not belong to feed ${fid}. Please provide a valid feed parameter.`,
      );
    }

    await this.setFeed({
      fid: fid,
      watch: watch ?? false,
      initialState: activityResponse,
    });
  }

  /**
   * Stop receiving real-time updates for the activity by stopping the watch on the feed the activity belongs to.
   *
   * Only call this method if you don't have any component in your application that needs to receive real-time updates for the given feed.
   *
   * @returns
   */
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
    this.feed = await connectActivityToFeed.bind(this.feedsClient)({
      fid,
      watch,
    });

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

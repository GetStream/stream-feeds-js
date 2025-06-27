import {
  ActivityRequest,
  AppUpdatedEvent,
  FeedResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  QueryFollowsRequest,
  HealthCheckEvent,
  UserBannedEvent,
  UserDeactivatedEvent,
  UserMutedEvent,
  UserReactivatedEvent,
  UserUpdatedEvent,
  WSEvent,
} from './gen/models';
import { StateStore } from './common/StateStore';
import { EventDispatcher } from './common/EventDispatcher';
import { FeedApi } from './gen/feeds/FeedApi';
import { FeedsClient } from './FeedsClient';
import {
  addActivitiesToState,
  updateActivityInState,
  removeActivityFromState,
} from './state-updates/activity-utils';
import {
  addReactionToActivities,
  removeReactionFromActivities,
} from './state-updates/activity-reaction-utils';
import { StreamResponse } from './gen-imports';
import { capitalize } from './common/utils';

export type FeedState = Partial<
  Omit<GetOrCreateFeedResponse, 'duration' | 'feed'>
> &
  Partial<FeedResponse> & {
    /**
     * True when loading state using `getOrCreate`
     */
    is_loading: boolean;
    /**
     * True when loading activities using `getOrCreate` or `getNextPage`
     */
    is_loading_activities: boolean;

    followers_pagination?: {
      loading_next_page?: boolean;
    };

    following_pagination?: {
      loading_next_page?: boolean;
    };
  };

const END_OF_LIST = 'eol' as const;

type EventHandlerByEventType = {
  [Key in NonNullable<WSEvent['type']>]: Key extends Extract<
    WSEvent,
    { type: Key }
  >['type']
    ? ((event: Extract<WSEvent, { type: Key }>) => void) | undefined
    : never;
};

export class Feed extends FeedApi {
  readonly state: StateStore<FeedState>;
  private static readonly noop = () => {};

  private readonly eventHandlers: EventHandlerByEventType = {
    'feeds.activity.added': (event) => {
      const currentActivities = this.state.getLatestValue().activities;
      const result = addActivitiesToState(
        [event.activity],
        currentActivities,
        'start',
      );
      if (result.changed) {
        this.state.partialNext({ activities: result.activities });
      }
    },
    'feeds.activity.deleted': (event) => {
      const currentActivities = this.state.getLatestValue().activities;
      if (currentActivities) {
        const result = removeActivityFromState(
          event.activity,
          currentActivities,
        );
        if (result.changed) {
          this.state.partialNext({ activities: result.activities });
        }
      }
    },
    'feeds.activity.reaction.added': (event) => {
      const currentActivities = this.state.getLatestValue().activities;
      const connectedUser = this.client.state.getLatestValue().connectedUser;
      const isCurrentUser = Boolean(
        connectedUser && event.reaction.user.id === connectedUser.id,
      );

      const result = addReactionToActivities(
        event,
        currentActivities,
        isCurrentUser,
      );
      if (result.changed) {
        this.state.partialNext({ activities: result.activities });
      }
    },
    'feeds.activity.reaction.deleted': (event) => {
      const currentActivities = this.state.getLatestValue().activities;
      const connectedUser = this.client.state.getLatestValue().connectedUser;
      const isCurrentUser = Boolean(
        connectedUser && event.reaction.user.id === connectedUser.id,
      );

      const result = removeReactionFromActivities(
        event,
        currentActivities,
        isCurrentUser,
      );
      if (result.changed) {
        this.state.partialNext({ activities: result.activities });
      }
    },
    'feeds.activity.removed_from_feed': Feed.noop,
    'feeds.activity.updated': (event) => {
      const currentActivities = this.state.getLatestValue().activities;
      if (currentActivities) {
        const result = updateActivityInState(event.activity, currentActivities);
        if (result.changed) {
          this.state.partialNext({ activities: result.activities });
        }
      }
    },
    'feeds.bookmark.added': Feed.noop,
    'feeds.bookmark.deleted': Feed.noop,
    'feeds.bookmark.updated': Feed.noop,
    'feeds.comment.added': Feed.noop,
    'feeds.comment.deleted': Feed.noop,
    'feeds.comment.updated': Feed.noop,
    'feeds.feed.created': Feed.noop,
    'feeds.feed.deleted': Feed.noop,
    'feeds.feed.updated': (event) => {
      this.state.partialNext({ ...event.feed });
    },
    'feeds.feed_group.changed': Feed.noop,
    'feeds.feed_group.deleted': Feed.noop,
    'feeds.follow.created': (event) => {
      // TODO: consider followers and followings not loaded (if not loaded, skip adding)
      // TODO: followers and followings should be extended only with accepted follows (same for counts)
      // if (event.follow.status !== 'accepted') return;

      if (event.follow.source_feed.fid === this.fid) {
        // this feed followed someone
        if (this.followingInitialized) {
          this.state.next((currentState) => ({
            ...currentState,
            following_count: (currentState.following_count ?? 0) + 1,
            following: currentState.following
              ? currentState.following.concat(event.follow)
              : [event.follow],
          }));
        }

        // add own follow to the target feed
        const target = event.follow.target_feed;
        const feed = this.client.feed(target.group_id, target.id);

        feed.state.next((currentState) => ({
          ...currentState,
          own_follows: currentState.own_follows
            ? currentState.own_follows.concat(event.follow)
            : [event.follow],
        }));
      } else if (
        event.follow.target_feed.fid === this.fid &&
        this.followersInitialized
      ) {
        // someone followed this feed
        this.state.next((currentState) => ({
          ...currentState,
          follower_count: (currentState.follower_count ?? 0) + 1,
          followers: currentState.followers
            ? currentState.followers.concat(event.follow)
            : [event.follow],
        }));
      }
    },
    'feeds.follow.deleted': (event) => {
      if (event.follow.source_feed.fid === this.fid) {
        // this feed unfollowed someone
        this.state.next((currentState) => {
          return {
            ...currentState,
            following_count: currentState.following_count
              ? currentState.following_count - 1
              : 0,
            following: currentState.following?.filter(
              (follow) =>
                follow.target_feed.fid !== event.follow.target_feed.fid,
            ),
          };
        });

        const target = event.follow.target_feed;
        const feed = this.client.feed(target.group_id, target.id);

        feed.state.next((currentState) => ({
          ...currentState,
          own_follows: currentState.own_follows?.filter(
            (follow) => follow.target_feed.fid !== event.follow.target_feed.fid,
          ),
        }));
      } else if (event.follow.target_feed.fid === this.fid) {
        // someone unfollowed this feed
        this.state.next((currentState) => ({
          ...currentState,
          follower_count: currentState.follower_count
            ? currentState.follower_count - 1
            : 0,
          followers: currentState.followers?.filter(
            (follow) => follow.source_feed.fid !== event.follow.source_feed.fid,
          ),
        }));
      }
    },
    'feeds.follow.updated': Feed.noop,
    'feeds.comment.reaction.added': Feed.noop,
    'feeds.comment.reaction.deleted': Feed.noop,
    'feeds.feed_member.added': Feed.noop,
    'feeds.feed_member.removed': Feed.noop,
    'feeds.feed_member.updated': Feed.noop,
    'feeds.poll.closed': Feed.noop,
    'feeds.poll.deleted': Feed.noop,
    'feeds.poll.updated': Feed.noop,
    'feeds.poll.vote_casted': Feed.noop,
    'feeds.poll.vote_changed': Feed.noop,
    'feeds.poll.vote_removed': Feed.noop,
    'feeds.activity.pinned': Feed.noop,
    'feeds.activity.unpinned': Feed.noop,
    'feeds.activity.marked': Feed.noop,
    'moderation.custom_action': Feed.noop,
    'moderation.flagged': Feed.noop,
    'moderation.mark_reviewed': Feed.noop,
    'health.check': function (
      _: { type: 'health.check' } & HealthCheckEvent & { type: 'health.check' },
    ): void {
      throw new Error('Function not implemented.');
    },
    'app.updated': function (
      _: { type: 'app.updated' } & AppUpdatedEvent & { type: 'app.updated' },
    ): void {
      throw new Error('Function not implemented.');
    },
    'user.banned': function (
      _: { type: 'user.banned' } & UserBannedEvent & { type: 'user.banned' },
    ): void {
      throw new Error('Function not implemented.');
    },
    'user.deactivated': function (
      _: { type: 'user.deactivated' } & UserDeactivatedEvent & {
          type: 'user.deactivated';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'user.muted': function (
      _: { type: 'user.muted' } & UserMutedEvent & { type: 'user.muted' },
    ): void {
      throw new Error('Function not implemented.');
    },
    'user.reactivated': function (
      _: { type: 'user.reactivated' } & UserReactivatedEvent & {
          type: 'user.reactivated';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'user.updated': function (
      _: { type: 'user.updated' } & UserUpdatedEvent & { type: 'user.updated' },
    ): void {
      throw new Error('Function not implemented.');
    },
  };

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  constructor(
    client: FeedsClient,
    groupId: 'user' | 'timeline' | (string & {}),
    id: string,
    data?: FeedResponse,
  ) {
    super(client, groupId, id);
    this.state = new StateStore<FeedState>({
      fid: `${groupId}:${id}`,
      group_id: groupId,
      id,
      ...(data ?? {}),
      is_loading: false,
      is_loading_activities: false,
    });
    this.client = client;
  }

  private readonly client: FeedsClient;

  get fid() {
    return `${this.group}:${this.id}`;
  }

  get currentState() {
    return this.state.getLatestValue();
  }

  private get followersInitialized() {
    const followersPagination = this.currentState.followers_pagination;

    if (!followersPagination) return false;

    return Object.hasOwn(followersPagination, 'next');
  }

  private get followingInitialized() {
    const followingPagination = this.currentState.following_pagination;

    if (!followingPagination) return false;

    return Object.hasOwn(followingPagination, 'next');
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    if (this.state.getLatestValue().is_loading_activities) {
      throw new Error('Only one getOrCreate call is allowed at a time');
    }

    this.state.partialNext({
      is_loading: !request?.next,
      is_loading_activities: true,
    });

    try {
      const response = await super.getOrCreate(request);
      if (request?.next) {
        const { activities: currentActivities = [] } =
          this.state.getLatestValue();

        const result = addActivitiesToState(
          response.activities,
          currentActivities,
          'end',
        );

        if (result.changed) {
          this.state.partialNext({
            activities: result.activities,
            next: response.next,
            prev: response.prev,
          });
        }
      } else {
        const responseCopy: Partial<
          StreamResponse<GetOrCreateFeedResponse>['feed'] &
            StreamResponse<GetOrCreateFeedResponse>
        > = {
          ...response,
          ...response.feed,
        };

        delete responseCopy.feed;
        delete responseCopy.metadata;

        const nextState: FeedState = {
          ...responseCopy,
          is_loading: false,
          is_loading_activities: false,
        };

        if (!request?.follower_pagination?.limit) {
          delete nextState.followers;
        }
        if (!request?.following_pagination?.limit) {
          delete nextState.following;
        }

        this.state.next({ ...nextState });
      }

      return response;
    } finally {
      this.state.partialNext({
        is_loading: false,
        is_loading_activities: false,
      });
    }
  }

  private async loadNextPageFollows(
    type: 'followers' | 'following',
    request: Pick<QueryFollowsRequest, 'limit'>,
  ) {
    const paginationKey = `${type}_pagination` as const;
    const method = `query${capitalize(type)}` as const;

    const currentNextCursor = this.currentState[paginationKey]?.next;
    const isLoading = this.currentState[paginationKey]?.loading_next_page;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isLoading || currentNextCursor === END_OF_LIST) return;

    try {
      this.state.next((currentState) => {
        return {
          ...currentState,
          [paginationKey]: {
            ...currentState[paginationKey],
            loading_next_page: true,
          },
        };
      });

      const { next: newNextCursor = END_OF_LIST, follows } = await this[method](
        {
          ...request,
          next: currentNextCursor,
        },
      );

      this.state.next((currentState) => ({
        ...currentState,
        [type]: currentState[type]
          ? currentState[type].concat(follows)
          : follows,
        [paginationKey]: {
          ...currentState[paginationKey],
          next: newNextCursor,
        },
      }));
    } catch (error) {
      console.error(error);
      // TODO: figure out how to handle errorss
    } finally {
      this.state.next((currentState) => {
        return {
          ...currentState,
          [paginationKey]: {
            ...currentState[paginationKey],
            loading_next_page: false,
          },
        };
      });
    }
  }

  async loadNextPageFollowers(request: Pick<QueryFollowsRequest, 'limit'>) {
    await this.loadNextPageFollows('followers', request);
  }

  async loadNextPageFollowing(request: Pick<QueryFollowsRequest, 'limit'>) {
    await this.loadNextPageFollows('following', request);
  }

  /**
   * Method which queries followers of this feed (feeds which target this feed).
   *
   * _Note: Useful only for feeds with `groupId` of `user` value._
   */
  async queryFollowers(request: Omit<QueryFollowsRequest, 'filter'>) {
    const filter: QueryFollowsRequest['filter'] = {
      target_feed: this.fid,
    };

    const response = await this.client.queryFollows({
      filter,
      ...request,
    });

    return response;
  }

  /**
   * Method which queries following of this feed (target feeds of this feed).
   *
   * _Note: Useful only for feeds with `groupId` of `timeline` value._
   */
  async queryFollowing(request: Omit<QueryFollowsRequest, 'filter'>) {
    const filter: QueryFollowsRequest['filter'] = {
      source_feed: this.fid,
    };

    const response = await this.client.queryFollows({
      filter,
      ...request,
    });

    return response;
  }

  async follow(feedOrFid: Feed | string) {
    const fid = typeof feedOrFid === 'string' ? feedOrFid : feedOrFid.fid;

    const response = await this.client.follow({
      source: this.fid,
      target: fid,
    });

    return response;
  }

  async unfollow(feedOrFid: Feed | string) {
    const fid = typeof feedOrFid === 'string' ? feedOrFid : feedOrFid.fid;

    const response = await this.client.unfollow({
      source: this.fid,
      target: fid,
    });

    return response;
  }

  async getNextPage() {
    const currentState = this.state.getLatestValue();
    const response = await this.getOrCreate({
      member_pagination: {
        limit: 0,
      },
      follower_pagination: {
        limit: 0,
      },
      following_pagination: {
        limit: 0,
      },
      next: currentState.next,
    });

    return response;
  }

  addActivity(request: Omit<ActivityRequest, 'fids'>) {
    return this.feedsApi.addActivity({
      ...request,
      fids: [this.fid],
    });
  }

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  handleWSEvent(event: WSEvent) {
    const eventHandler = this.eventHandlers[event.type];

    // no need to run noop function
    if (typeof eventHandler === 'function' && eventHandler !== Feed.noop) {
      // @ts-expect-error eventHandler's event parameter is not "never", TS is having a seizure for some reason
      eventHandler(event);
    } else if (typeof eventHandler !== 'function') {
      console.warn(`Received unknown event type: ${event.type}`, event);
    }

    this.eventDispatcher.dispatch(event);
  }
}

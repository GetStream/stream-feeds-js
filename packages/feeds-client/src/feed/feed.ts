import {
  ActivityRequest,
  FeedResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  QueryFollowsRequest,
  WSEvent,
  ActivityResponse,
  CommentResponse,
  PagerResponse,
  QueryFeedMembersRequest,
  SortParamRequest,
  ThreadedCommentResponse,
  FollowRequest,
  QueryCommentsRequest,
} from '../gen/models';
import { StreamResponse } from '../gen-imports';
import { StateStore } from '../common/StateStore';
import { EventDispatcher } from '../common/EventDispatcher';
import { FeedApi } from '../gen/feeds/FeedApi';
import { FeedsClient } from '../feeds-client';
import {
  handleFollowUpdated,
  handleFollowCreated,
  handleFollowDeleted,
  handleCommentAdded,
  handleCommentDeleted,
  handleCommentUpdated,
  handleBookmarkDeleted,
  handleBookmarkUpdated,
  handleActivityAdded,
  addActivitiesToState,
  handleActivityUpdated,
  handleFeedMemberAdded,
  handleFeedMemberRemoved,
  handleFeedMemberUpdated,
  handleCommentReaction,
  handleBookmarkAdded,
  handleActivityDeleted,
  handleActivityRemovedFromFeed,
  handleActivityReactionDeleted,
  handleActivityReactionAdded,
  handleFeedUpdated,
  handleNotificationFeedUpdated,
  handleActivityMarked,
} from './event-handlers';
import { capitalize } from '../common/utils';
import type {
  ActivityIdOrCommentId,
  GetCommentsRepliesRequest,
  GetCommentsRequest,
  LoadingStates,
  PagerResponseWithLoadingStates,
} from '../types';
import { checkHasAnotherPage, Constants, uniqueArrayMerge } from '../utils';

export type FeedState = Omit<
  Partial<GetOrCreateFeedResponse & FeedResponse>,
  'feed' | 'duration'
> & {
  /**
   * True when loading state using `getOrCreate`
   */
  is_loading: boolean;
  /**
   * True when loading activities using `getOrCreate` or `getNextPage`
   */
  is_loading_activities: boolean;

  comments_by_entity_id: Record<
    ActivityIdOrCommentId,
    | {
        pagination?: PagerResponseWithLoadingStates & {
          // registered on first pagination attempt and then used for real-time updates & subsequent pagination calls
          sort?: QueryCommentsRequest['sort'] | (string & {});
        };
        /**
         * Id of the "store" where the actual parent is stored in the comments array.
         *
         * Example:
         * ```
         * // top-level comment:
         * const comment1 = {
         *   id: 'comment-1',
         *   object_id: 'activity-1',
         * }
         * // child comment:
         * const comment2 = {
         *   id: 'comment-2',
         *   object_id: 'activity-1',
         *   parent_id: 'comment-1',
         * }
         * ```
         * When these comments are loaded, they're stored in the state like this:
         * ```
         * {
         *   comments_by_entity_id: {
         *     'activity-1': {
         *       comments: [comment1],
         *       entity_parent_id: undefined,
         *     },
         *     'comment-1': {
         *       comments: [comment2],
         *       entity_parent_id: 'activity-1', // parent store where "comment-1" is located in "comments" array
         *     }
         *   }
         * }
         * ```
         */
        entity_parent_id?: ActivityIdOrCommentId;
        comments?: CommentResponse[];
      }
    | undefined
  >;

  followers_pagination?: LoadingStates & { sort?: SortParamRequest[] };

  following_pagination?: LoadingStates & { sort?: SortParamRequest[] };

  member_pagination?: LoadingStates & { sort?: SortParamRequest[] };

  last_get_or_create_request_config?: GetOrCreateFeedRequest;

  /**
   * `true` if the feed is receiving real-time updates via WebSocket
   */
  watch: boolean;
};

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
  protected indexedActivityIds: Set<string> = new Set();
  protected readonly stateUpdateQueue: Set<string> = new Set();

  private readonly eventHandlers: EventHandlerByEventType = {
    'feeds.activity.added': handleActivityAdded.bind(this),
    'feeds.activity.deleted': handleActivityDeleted.bind(this),
    'feeds.activity.reaction.added': Feed.noop,
    'feeds.activity.reaction.deleted': Feed.noop,
    'feeds.activity.reaction.updated': Feed.noop,
    'feeds.activity.removed_from_feed':
      handleActivityRemovedFromFeed.bind(this),
    'feeds.activity.updated': handleActivityUpdated.bind(this),
    'feeds.bookmark.added': handleBookmarkAdded.bind(this),
    'feeds.bookmark.deleted': handleBookmarkDeleted.bind(this),
    'feeds.bookmark.updated': handleBookmarkUpdated.bind(this),
    'feeds.bookmark_folder.deleted': Feed.noop,
    'feeds.bookmark_folder.updated': Feed.noop,
    'feeds.comment.added': handleCommentAdded.bind(this),
    'feeds.comment.deleted': handleCommentDeleted.bind(this),
    'feeds.comment.updated': handleCommentUpdated.bind(this),
    'feeds.feed.created': Feed.noop,
    'feeds.feed.deleted': Feed.noop,
    'feeds.feed.updated': handleFeedUpdated.bind(this),
    'feeds.feed_group.changed': Feed.noop,
    'feeds.feed_group.deleted': Feed.noop,
    'feeds.follow.created': handleFollowCreated.bind(this),
    'feeds.follow.deleted': handleFollowDeleted.bind(this),
    'feeds.follow.updated': handleFollowUpdated.bind(this),
    'feeds.comment.reaction.added': handleCommentReaction.bind(this),
    'feeds.comment.reaction.deleted': handleCommentReaction.bind(this),
    'feeds.comment.reaction.updated': Feed.noop,
    'feeds.feed_member.added': handleFeedMemberAdded.bind(this),
    'feeds.feed_member.removed': handleFeedMemberRemoved.bind(this),
    'feeds.feed_member.updated': handleFeedMemberUpdated.bind(this),
    'feeds.notification_feed.updated': handleNotificationFeedUpdated.bind(this),
    // the poll events should be removed from here
    'feeds.poll.closed': Feed.noop,
    'feeds.poll.deleted': Feed.noop,
    'feeds.poll.updated': Feed.noop,
    'feeds.poll.vote_casted': Feed.noop,
    'feeds.poll.vote_changed': Feed.noop,
    'feeds.poll.vote_removed': Feed.noop,
    'feeds.activity.pinned': Feed.noop,
    'feeds.activity.unpinned': Feed.noop,
    'feeds.activity.marked': handleActivityMarked.bind(this),
    'moderation.custom_action': Feed.noop,
    'moderation.flagged': Feed.noop,
    'moderation.mark_reviewed': Feed.noop,
    'health.check': Feed.noop,
    'app.updated': Feed.noop,
    'user.banned': Feed.noop,
    'user.deactivated': Feed.noop,
    'user.muted': Feed.noop,
    'user.reactivated': Feed.noop,
    'user.updated': Feed.noop,
  };

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  constructor(
    client: FeedsClient,
    groupId: 'user' | 'timeline' | (string & {}),
    id: string,
    data?: FeedResponse,
    watch = false,
  ) {
    super(client, groupId, id);
    this.state = new StateStore<FeedState>({
      feed: `${groupId}:${id}`,
      group_id: groupId,
      id,
      ...(data ?? {}),
      is_loading: false,
      is_loading_activities: false,
      comments_by_entity_id: {},
      watch,
    });
    this.client = client;
    // if (this.group === 'timeline') {
    //   // used purely for debugging the state update queue, will remove
    //   setInterval(() => {
    //     console.log('Q: ', this.stateUpdateQueue);
    //   }, 2000);
    // }

    this.state.subscribeWithSelector(
      (nextState) => ({ activities: nextState.activities }),
      (nextState) => {
        const { activities: nextActivities = [] } = nextState;

        if (this.indexedActivityIds.size !== nextActivities?.length) {
          this.indexedActivityIds = new Set(
            nextActivities.map((activity) => activity.id),
          );
        }
      },
    );
  }

  protected readonly client: FeedsClient;

  get feed() {
    return `${this.group}:${this.id}`;
  }

  get currentState() {
    return this.state.getLatestValue();
  }

  hasActivity(activity_id: string) {
    return this.indexedActivityIds.has(activity_id);
  }

  protected addActivityToIndex(activity_id: string) {
    this.indexedActivityIds.add(activity_id);
  }

  protected removeActivityFromIndex(activity_id: string) {
    this.indexedActivityIds.delete(activity_id);
  }

  async synchronize() {
    const { last_get_or_create_request_config } = this.state.getLatestValue();
    if (last_get_or_create_request_config?.watch) {
      await this.getOrCreate(last_get_or_create_request_config);
    }
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    if (this.currentState.is_loading_activities) {
      throw new Error('Only one getOrCreate call is allowed at a time');
    }

    this.state.partialNext({
      is_loading: !request?.next,
      is_loading_activities: true,
    });

    // TODO: pull comments/comment_pagination from activities and comment_sort from request
    // and pre-populate comments_by_entity_id (once comment_sort and comment_limit are supported)

    try {
      const response = await super.getOrCreate(request);
      if (request?.next) {
        const { activities: currentActivities = [] } = this.currentState;

        const result = addActivitiesToState.bind(this)(
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
        // Empty queue when reinitializing the state
        this.stateUpdateQueue.clear();
        const responseCopy: Partial<
          StreamResponse<GetOrCreateFeedResponse>['feed'] &
            StreamResponse<Omit<GetOrCreateFeedResponse, 'feed'>>
        > = {
          ...response,
          ...response.feed,
        };

        delete responseCopy.feed;
        delete responseCopy.metadata;
        delete responseCopy.duration;

        // recreate the caches so that they are updated on the next state update
        this.indexedActivityIds = new Set();

        // TODO: lazy-load comments from activities when comment_sort and comment_pagination are supported

        this.state.next((currentState) => {
          const nextState: FeedState = {
            ...currentState,
            ...responseCopy,
          };

          if (!request?.followers_pagination?.limit) {
            delete nextState.followers;
          }
          if (!request?.following_pagination?.limit) {
            delete nextState.following;
          }
          if (response.members.length === 0 && response.feed.member_count > 0) {
            delete nextState.members;
          }

          nextState.last_get_or_create_request_config = request;
          nextState.watch = request?.watch ? request.watch : currentState.watch;

          return nextState;
        });
      }

      this.client.hydratePollCache(response.activities);

      return response;
    } finally {
      this.state.partialNext({
        is_loading: false,
        is_loading_activities: false,
      });
    }
  }

  /**
   * Returns index of the provided comment object.
   */
  protected getCommentIndex(
    comment: Pick<CommentResponse, 'object_id' | 'parent_id' | 'id'>,
    state?: FeedState,
  ) {
    const { comments_by_entity_id = {} } = state ?? this.currentState;

    const currentComments =
      comments_by_entity_id[comment.parent_id ?? comment.object_id]?.comments;

    if (!currentComments?.length) {
      return -1;
    }

    // @ts-expect-error this will just fail if the comment is not object from state
    let commentIndex = currentComments.indexOf(comment);

    // fast lookup failed, try slower approach
    if (commentIndex === -1) {
      commentIndex = currentComments.findIndex(
        (comment_) => comment_.id === comment.id,
      );
    }

    return commentIndex;
  }

  /**
   * Load child comments of entity (activity or comment) into the state, if the target entity is comment,
   * `entityParentId` should be provided (`CommentResponse.parent_id ?? CommentResponse.object_id`).
   */
  private loadCommentsIntoState(data: {
    entityParentId?: string;
    entityId: string;
    comments: Array<CommentResponse & ThreadedCommentResponse>;
    next?: string;
    sort: string;
  }) {
    // add initial (top level) object for processing
    const traverseArray = [
      {
        entityId: data.entityId,
        entityParentId: data.entityParentId,
        comments: data.comments,
        next: data.next,
      },
    ];

    this.state.next((currentState) => {
      const newCommentsByEntityId = {
        ...currentState.comments_by_entity_id,
      };

      while (traverseArray.length) {
        const item = traverseArray.pop()!;

        const entityId = item.entityId;

        // go over entity comments and generate new objects
        // for further processing if there are any replies
        item.comments.forEach((comment) => {
          if (!comment.replies?.length) return;

          traverseArray.push({
            entityId: comment.id,
            entityParentId: entityId,
            comments: comment.replies,
            next: comment.meta?.next_cursor,
          });
        });

        // omit replies & meta from the comments (transform ThreadedCommentResponse to CommentResponse)
        // this is somehow faster than copying the whole
        // object and deleting the desired properties
        const newComments: CommentResponse[] = item.comments.map(
          ({ replies: _r, meta: _m, ...restOfTheCommentResponse }) =>
            restOfTheCommentResponse,
        );

        const existingComments = newCommentsByEntityId[entityId]?.comments;

        newCommentsByEntityId[entityId] = {
          ...newCommentsByEntityId[entityId],
          entity_parent_id: item.entityParentId,
          pagination: {
            ...newCommentsByEntityId[entityId]?.pagination,
            next: item.next,
            sort: data.sort,
          },
          comments: existingComments
            ? uniqueArrayMerge(
                existingComments,
                newComments,
                (comment) => comment.id,
              )
            : newComments,
        };
      }

      return {
        ...currentState,
        comments_by_entity_id: newCommentsByEntityId,
      };
    });
  }

  private async loadNextPageComments({
    entityId,
    base,
    sort,
    entityParentId,
  }: {
    entityParentId?: string;
    entityId: string;
    sort: string;
    base: () => Promise<
      PagerResponse & {
        comments: Array<CommentResponse & ThreadedCommentResponse>;
      }
    >;
  }) {
    let error: unknown;

    try {
      this.state.next((currentState) => ({
        ...currentState,
        comments_by_entity_id: {
          ...currentState.comments_by_entity_id,
          [entityId]: {
            ...currentState.comments_by_entity_id[entityId],
            pagination: {
              ...currentState.comments_by_entity_id[entityId]?.pagination,
              loading_next_page: true,
            },
          },
        },
      }));

      const { next, comments } = await base();

      this.loadCommentsIntoState({
        entityId,
        comments,
        entityParentId,
        next,
        sort,
      });
    } catch (e) {
      error = e;
    } finally {
      this.state.next((currentState) => ({
        ...currentState,
        comments_by_entity_id: {
          ...currentState.comments_by_entity_id,
          [entityId]: {
            ...currentState.comments_by_entity_id[entityId],
            pagination: {
              ...currentState.comments_by_entity_id[entityId]?.pagination,
              loading_next_page: false,
            },
          },
        },
      }));
    }

    if (error) {
      throw error;
    }
  }

  public async loadNextPageActivityComments(
    activity: ActivityResponse,
    request?: Partial<
      Omit<GetCommentsRequest, 'object_id' | 'object_type' | 'next'>
    >,
  ) {
    const currentEntityState =
      this.currentState.comments_by_entity_id[activity.id];
    const currentPagination = currentEntityState?.pagination;
    const currentNextCursor = currentPagination?.next;
    const currentSort = currentPagination?.sort;
    const isLoading = currentPagination?.loading_next_page;

    const sort =
      currentSort ?? request?.sort ?? Constants.DEFAULT_COMMENT_PAGINATION;

    if (
      isLoading ||
      !checkHasAnotherPage(currentEntityState?.comments, currentNextCursor)
    ) {
      return;
    }

    await this.loadNextPageComments({
      entityId: activity.id,
      base: () =>
        this.client.getComments({
          ...request,
          sort,
          object_id: activity.id,
          object_type: 'activity',
          next: currentNextCursor,
        }),
      sort,
    });
  }

  public async loadNextPageCommentReplies(
    comment: CommentResponse,
    request?: Partial<Omit<GetCommentsRepliesRequest, 'comment_id' | 'next'>>,
  ) {
    const currentEntityState =
      this.currentState.comments_by_entity_id[comment.id];
    const currentPagination = currentEntityState?.pagination;
    const currentNextCursor = currentPagination?.next;
    const currentSort = currentPagination?.sort;
    const isLoading = currentPagination?.loading_next_page;

    const sort =
      currentSort ?? request?.sort ?? Constants.DEFAULT_COMMENT_PAGINATION;

    if (
      isLoading ||
      !checkHasAnotherPage(currentEntityState?.comments, currentNextCursor)
    ) {
      return;
    }

    await this.loadNextPageComments({
      entityId: comment.id,
      base: () =>
        this.client.getCommentReplies({
          ...request,
          id: comment.id,
          // use known sort first (prevents broken pagination)
          sort,
          next: currentNextCursor,
        }),
      entityParentId: comment.parent_id ?? comment.object_id,
      sort,
    });
  }

  private async loadNextPageFollows(
    type: 'followers' | 'following',
    request: Pick<QueryFollowsRequest, 'limit' | 'sort'>,
  ) {
    const paginationKey = `${type}_pagination` as const;
    const method = `query${capitalize(type)}` as const;

    const currentFollows = this.currentState[type];
    const currentNextCursor = this.currentState[paginationKey]?.next;
    const isLoading = this.currentState[paginationKey]?.loading_next_page;
    const sort = this.currentState[paginationKey]?.sort ?? request.sort;
    let error: unknown;

    if (isLoading || !checkHasAnotherPage(currentFollows, currentNextCursor)) {
      return;
    }

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

      const { next: newNextCursor, follows } = await this[method]({
        ...request,
        next: currentNextCursor,
        sort,
      });

      this.state.next((currentState) => {
        return {
          ...currentState,
          [type]:
            currentState[type] === undefined
              ? follows
              : uniqueArrayMerge(
                  currentState[type],
                  follows,
                  (follow) =>
                    `${follow.source_feed.feed}-${follow.target_feed.feed}`,
                ),
          [paginationKey]: {
            ...currentState[paginationKey],
            next: newNextCursor,
            sort,
          },
        };
      });
    } catch (e) {
      error = e;
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

    if (error) {
      throw error;
    }
  }

  async loadNextPageFollowers(
    request: Pick<QueryFollowsRequest, 'limit' | 'sort'>,
  ) {
    await this.loadNextPageFollows('followers', request);
  }

  async loadNextPageFollowing(
    request: Pick<QueryFollowsRequest, 'limit' | 'sort'>,
  ) {
    await this.loadNextPageFollows('following', request);
  }

  async loadNextPageMembers(
    request: Omit<QueryFeedMembersRequest, 'next' | 'prev'>,
  ) {
    const currentMembers = this.currentState.members;
    const currentNextCursor = this.currentState.member_pagination?.next;
    const isLoading = this.currentState.member_pagination?.loading_next_page;
    const sort = this.currentState.member_pagination?.sort ?? request.sort;
    let error: unknown;

    if (isLoading || !checkHasAnotherPage(currentMembers, currentNextCursor)) {
      return;
    }

    try {
      this.state.next((currentState) => ({
        ...currentState,
        member_pagination: {
          ...currentState.member_pagination,
          loading_next_page: true,
        },
      }));

      const { next: newNextCursor, members } =
        await this.client.queryFeedMembers({
          ...request,
          sort,
          feed_id: this.id,
          feed_group_id: this.group,
          next: currentNextCursor,
        });

      this.state.next((currentState) => ({
        ...currentState,
        members: currentState.members
          ? uniqueArrayMerge(
              currentState.members,
              members,
              ({ user }) => user.id,
            )
          : members,
        member_pagination: {
          ...currentState.member_pagination,
          next: newNextCursor,
          // set sort if not defined yet
          sort: currentState.member_pagination?.sort ?? request.sort,
        },
      }));
    } catch (e) {
      error = e;
    } finally {
      this.state.next((currentState) => ({
        ...currentState,
        member_pagination: {
          ...currentState.member_pagination,
          loading_next_page: false,
        },
      }));
    }

    if (error) {
      throw error;
    }
  }

  /**
   * Method which queries followers of this feed (feeds which target this feed).
   *
   * _Note: Useful only for feeds with `groupId` of `user` value._
   */
  async queryFollowers(request: Omit<QueryFollowsRequest, 'filter'>) {
    const filter: QueryFollowsRequest['filter'] = {
      target_feed: this.feed,
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
      source_feed: this.feed,
    };

    const response = await this.client.queryFollows({
      filter,
      ...request,
    });

    return response;
  }

  async follow(
    feedOrFid: Feed | string,
    options?: Omit<FollowRequest, 'source' | 'target'>,
  ) {
    const fid = typeof feedOrFid === 'string' ? feedOrFid : feedOrFid.feed;

    const response = await this.client.follow({
      ...options,
      source: this.feed,
      target: fid,
    });

    return response;
  }

  async unfollow(feedOrFid: Feed | string) {
    const fid = typeof feedOrFid === 'string' ? feedOrFid : feedOrFid.feed;

    const response = await this.client.unfollow({
      source: this.feed,
      target: fid,
    });

    return response;
  }

  async getNextPage() {
    const currentState = this.currentState;

    return await this.getOrCreate({
      member_pagination: {
        limit: 0,
      },
      followers_pagination: {
        limit: 0,
      },
      following_pagination: {
        limit: 0,
      },
      next: currentState.next,
      limit: currentState.last_get_or_create_request_config?.limit ?? 20,
    });
  }

  addActivity(request: Omit<ActivityRequest, 'feeds'>) {
    return this.feedsApi.addActivity({
      ...request,
      feeds: [this.feed],
    });
  }

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  handleWSEvent(event: WSEvent) {
    const eventHandler = this.eventHandlers[event.type];

    // no need to run noop function
    if (eventHandler !== Feed.noop) {
      // @ts-expect-error intersection of handler arguments results to never
      eventHandler?.(event);
    }

    if (typeof eventHandler === 'undefined') {
      console.warn(`Received unknown event type: ${event.type}`, event);
    }

    this.eventDispatcher.dispatch(event);
  }
}

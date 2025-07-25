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
  SingleFollowRequest,
  CommentReactionAddedEvent,
  CommentReactionDeletedEvent,
  BookmarkAddedEvent,
  BookmarkDeletedEvent,
  BookmarkUpdatedEvent,
  QueryFeedMembersRequest,
  SortParamRequest,
  FollowResponse,
  ThreadedCommentResponse,
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
import {
  addBookmarkToActivities,
  removeBookmarkFromActivities,
  updateBookmarkInActivities,
} from './state-updates/bookmark-utils';
import {
  handleFollowCreated,
  handleFollowDeleted,
  handleFollowUpdated,
} from './state-updates/follow-utils';
import { StreamResponse } from './gen-imports';
import { capitalize } from './common/utils';
import type {
  ActivityIdOrCommentId,
  GetCommentsRepliesRequest,
  GetCommentsRequest,
  LoadingStates,
  PagerResponseWithLoadingStates,
} from './types';
import { checkHasAnotherPage, Constants, uniqueArrayMerge } from './utils';
import {
  getStateUpdateQueueIdForFollow,
  getStateUpdateQueueIdForUnfollow,
  shouldUpdateState,
} from './state-updates/state-update-queue';

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
          sort?: string;
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
  private readonly stateUpdateQueue: Set<string> = new Set();

  private readonly eventHandlers: EventHandlerByEventType = {
    'feeds.activity.added': (event) => {
      const currentActivities = this.currentState.activities;
      const result = addActivitiesToState(
        [event.activity],
        currentActivities,
        'start',
      );
      if (result.changed) {
        this.client.hydratePollCache([event.activity]);
        this.state.partialNext({ activities: result.activities });
      }
    },
    'feeds.activity.deleted': (event) => {
      const currentActivities = this.currentState.activities;
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
      const currentActivities = this.currentState.activities;
      const connectedUser = this.client.state.getLatestValue().connected_user;
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
      const currentActivities = this.currentState.activities;
      const connectedUser = this.client.state.getLatestValue().connected_user;
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
    'feeds.activity.reaction.updated': Feed.noop,
    'feeds.activity.removed_from_feed': (event) => {
      const currentActivities = this.currentState.activities;
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
    'feeds.activity.updated': (event) => {
      const currentActivities = this.currentState.activities;
      if (currentActivities) {
        const result = updateActivityInState(event.activity, currentActivities);
        if (result.changed) {
          this.client.hydratePollCache([event.activity]);
          this.state.partialNext({ activities: result.activities });
        }
      }
    },
    'feeds.bookmark.added': this.handleBookmarkAdded.bind(this),
    'feeds.bookmark.deleted': this.handleBookmarkDeleted.bind(this),
    'feeds.bookmark.updated': this.handleBookmarkUpdated.bind(this),
    'feeds.bookmark_folder.deleted': Feed.noop,
    'feeds.bookmark_folder.updated': Feed.noop,
    'feeds.comment.added': (event) => {
      const { comment } = event;
      const entityId = comment.parent_id ?? comment.object_id;

      this.state.next((currentState) => {
        const entityState = currentState.comments_by_entity_id[entityId];
        const newComments = entityState?.comments
          ? [...entityState.comments]
          : [];

        if (entityState?.pagination?.sort === 'last') {
          newComments.unshift(comment);
        } else {
          // 'first' and other sort options
          newComments.push(comment);
        }

        return {
          ...currentState,
          comments_by_entity_id: {
            ...currentState.comments_by_entity_id,
            [entityId]: {
              ...currentState.comments_by_entity_id[entityId],
              comments: newComments,
            },
          },
        };
      });
    },
    'feeds.comment.deleted': ({ comment }) => {
      const entityId = comment.parent_id ?? comment.object_id;

      this.state.next((currentState) => {
        const newCommentsByEntityId = {
          ...currentState.comments_by_entity_id,
          [entityId]: {
            ...currentState.comments_by_entity_id[entityId],
          },
        };

        const index = this.getCommentIndex(comment, currentState);

        if (
          newCommentsByEntityId?.[entityId]?.comments?.length &&
          index !== -1
        ) {
          newCommentsByEntityId[entityId].comments = [
            ...newCommentsByEntityId[entityId].comments,
          ];

          newCommentsByEntityId[entityId]?.comments?.splice(index, 1);
        }

        delete newCommentsByEntityId[comment.id];

        return {
          ...currentState,
          comments_by_entity_id: newCommentsByEntityId,
        };
      });
    },
    'feeds.comment.updated': (event) => {
      const { comment } = event;
      const entityId = comment.parent_id ?? comment.object_id;

      this.state.next((currentState) => {
        const entityState = currentState.comments_by_entity_id[entityId];

        if (!entityState?.comments?.length) return currentState;

        const index = this.getCommentIndex(comment, currentState);

        if (index === -1) return currentState;

        const newComments = [...entityState.comments];

        newComments[index] = comment;

        return {
          ...currentState,
          comments_by_entity_id: {
            ...currentState.comments_by_entity_id,
            [entityId]: {
              ...currentState.comments_by_entity_id[entityId],
              comments: newComments,
            },
          },
        };
      });
    },
    'feeds.feed.created': Feed.noop,
    'feeds.feed.deleted': Feed.noop,
    'feeds.feed.updated': (event) => {
      this.state.partialNext({ ...event.feed });
    },
    'feeds.feed_group.changed': Feed.noop,
    'feeds.feed_group.deleted': Feed.noop,
    'feeds.follow.created': (event) => {
      this.handleFollowCreated(event.follow);
    },
    'feeds.follow.deleted': (event) => {
      this.handleFollowDeleted(event.follow);
    },
    'feeds.follow.updated': (_event) => {
      const result = handleFollowUpdated(this.currentState);
      if (result.changed) {
        this.state.next(result.data);
      }
    },
    'feeds.comment.reaction.added': this.handleCommentReactionEvent.bind(this),
    'feeds.comment.reaction.deleted':
      this.handleCommentReactionEvent.bind(this),
    'feeds.comment.reaction.updated': Feed.noop,
    'feeds.feed_member.added': (event) => {
      const { connected_user: connectedUser } =
        this.client.state.getLatestValue();

      this.state.next((currentState) => {
        let newState: FeedState | undefined;

        if (typeof currentState.members !== 'undefined') {
          newState ??= {
            ...currentState,
          };

          newState.members = [event.member, ...currentState.members];
        }

        if (connectedUser?.id === event.member.user.id) {
          newState ??= {
            ...currentState,
          };

          newState.own_membership = event.member;
        }

        return newState ?? currentState;
      });
    },
    'feeds.feed_member.removed': (event) => {
      const { connected_user: connectedUser } =
        this.client.state.getLatestValue();

      this.state.next((currentState) => {
        const newState = {
          ...currentState,
          members: currentState.members?.filter(
            (member) => member.user.id !== event.user?.id,
          ),
        };

        if (connectedUser?.id === event.member_id) {
          delete newState.own_membership;
        }

        return newState;
      });
    },
    'feeds.feed_member.updated': (event) => {
      const { connected_user: connectedUser } =
        this.client.state.getLatestValue();

      this.state.next((currentState) => {
        const memberIndex =
          currentState.members?.findIndex(
            (member) => member.user.id === event.member.user.id,
          ) ?? -1;

        let newState: FeedState | undefined;

        if (memberIndex !== -1) {
          // if there's an index, there's a member to update
          const newMembers = [...currentState.members!];
          newMembers[memberIndex] = event.member;

          newState ??= {
            ...currentState,
          };

          newState.members = newMembers;
        }

        if (connectedUser?.id === event.member.user.id) {
          newState ??= {
            ...currentState,
          };

          newState.own_membership = event.member;
        }

        return newState ?? currentState;
      });
    },
    'feeds.notification_feed.updated': (event) => {
      console.info('notification feed updated', event);
      // TODO: handle notification feed updates
    },
    // the poll events should be removed from here
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
      fid: `${groupId}:${id}`,
      group_id: groupId,
      id,
      ...(data ?? {}),
      is_loading: false,
      is_loading_activities: false,
      comments_by_entity_id: {},
      watch,
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

  private handleCommentReactionEvent(
    event: (CommentReactionAddedEvent | CommentReactionDeletedEvent) & {
      type: 'feeds.comment.reaction.added' | 'feeds.comment.reaction.deleted';
    },
  ) {
    const { comment, reaction } = event;
    const connectedUser = this.client.state.getLatestValue().connected_user;

    this.state.next((currentState) => {
      const forId = comment.parent_id ?? comment.object_id;
      const entityState = currentState.comments_by_entity_id[forId];

      const commentIndex = this.getCommentIndex(comment, currentState);

      if (commentIndex === -1) return currentState;

      const newComments = entityState?.comments?.concat([]) ?? [];

      const commentCopy: Partial<CommentResponse> = { ...comment };

      delete commentCopy.own_reactions;

      const newComment: CommentResponse = {
        ...newComments[commentIndex],
        ...commentCopy,
        // TODO: FIXME this should be handled by the backend
        latest_reactions: commentCopy.latest_reactions ?? [],
        reaction_groups: commentCopy.reaction_groups ?? {},
      };

      newComments[commentIndex] = newComment;

      if (reaction.user.id === connectedUser?.id) {
        if (event.type === 'feeds.comment.reaction.added') {
          newComment.own_reactions = newComment.own_reactions.concat(
            reaction,
          ) ?? [reaction];
        } else if (event.type === 'feeds.comment.reaction.deleted') {
          newComment.own_reactions = newComment.own_reactions.filter(
            (r) => r.type !== reaction.type,
          );
        }
      }

      return {
        ...currentState,
        comments_by_entity_id: {
          ...currentState.comments_by_entity_id,
          [forId]: {
            ...entityState,
            comments: newComments,
          },
        },
      };
    });
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
        // Empty queue when reinitializing the state
        this.stateUpdateQueue.clear();
        const responseCopy: Partial<
          StreamResponse<GetOrCreateFeedResponse>['feed'] &
            StreamResponse<GetOrCreateFeedResponse>
        > = {
          ...response,
          ...response.feed,
        };

        delete responseCopy.feed;
        delete responseCopy.metadata;
        delete responseCopy.duration;

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
   * @internal
   */
  handleFollowCreated(follow: FollowResponse) {
    if (
      !shouldUpdateState({
        stateUpdateId: getStateUpdateQueueIdForFollow(follow),
        stateUpdateQueue: this.stateUpdateQueue,
        watch: this.currentState.watch,
      })
    ) {
      return;
    }
    const connectedUser = this.client.state.getLatestValue().connected_user;
    const result = handleFollowCreated(
      follow,
      this.currentState,
      this.fid,
      connectedUser?.id,
    );
    if (result.changed) {
      this.state.next(result.data);
    }
  }

  /**
   * @internal
   */
  handleFollowDeleted(
    follow:
      | FollowResponse
      // Backend doesn't return the follow in delete follow response https://getstream.slack.com/archives/C06RK9WCR09/p1753176937507209
      | { source_feed: { fid: string }; target_feed: { fid: string } },
  ) {
    if (
      !shouldUpdateState({
        stateUpdateId: getStateUpdateQueueIdForUnfollow(follow),
        stateUpdateQueue: this.stateUpdateQueue,
        watch: this.currentState.watch,
      })
    ) {
      return;
    }

    const connectedUser = this.client.state.getLatestValue().connected_user;
    const result = handleFollowDeleted(
      follow,
      this.currentState,
      this.fid,
      connectedUser?.id,
    );
    if (result.changed) {
      this.state.next(result.data);
    }
  }

  /**
   * @internal
   */
  handleWatchStopped() {
    this.state.partialNext({
      watch: false,
    });
  }

  /**
   * @internal
   */
  handleWatchStarted() {
    this.state.partialNext({
      watch: true,
    });
  }

  private handleBookmarkAdded(event: BookmarkAddedEvent) {
    const currentActivities = this.currentState.activities;
    const { connected_user: connectedUser } =
      this.client.state.getLatestValue();
    const isCurrentUser = event.bookmark.user.id === connectedUser?.id;

    const result = addBookmarkToActivities(
      event,
      currentActivities,
      isCurrentUser,
    );
    if (result.changed) {
      this.state.partialNext({ activities: result.activities });
    }
  }

  private handleBookmarkDeleted(event: BookmarkDeletedEvent) {
    const currentActivities = this.currentState.activities;
    const { connected_user: connectedUser } =
      this.client.state.getLatestValue();
    const isCurrentUser = event.bookmark.user.id === connectedUser?.id;

    const result = removeBookmarkFromActivities(
      event,
      currentActivities,
      isCurrentUser,
    );
    if (result.changed) {
      this.state.partialNext({ activities: result.activities });
    }
  }

  private handleBookmarkUpdated(event: BookmarkUpdatedEvent) {
    const currentActivities = this.currentState.activities;
    const { connected_user: connectedUser } =
      this.client.state.getLatestValue();
    const isCurrentUser = event.bookmark.user.id === connectedUser?.id;

    const result = updateBookmarkInActivities(
      event,
      currentActivities,
      isCurrentUser,
    );
    if (result.changed) {
      this.state.partialNext({ activities: result.activities });
    }
  }

  /**
   * Returns index of the provided comment object.
   */
  private getCommentIndex(
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
          comment_id: comment.id,
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
                    `${follow.source_feed.fid}-${follow.target_feed.fid}`,
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

  async follow(
    feedOrFid: Feed | string,
    options?: Omit<SingleFollowRequest, 'source' | 'target'>,
  ) {
    const fid = typeof feedOrFid === 'string' ? feedOrFid : feedOrFid.fid;

    const response = await this.client.follow({
      ...options,
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

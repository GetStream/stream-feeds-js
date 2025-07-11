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
} from './gen/models';
import { Patch, StateStore } from './common/StateStore';
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
import { FeedsApi, StreamResponse } from './gen-imports';
import { capitalize } from './common/utils';
import type {
  ActivityIdOrCommentId,
  GetCommentsRepliesRequest,
  GetCommentsRequest,
  LoadingStates,
  PagerResponseWithLoadingStates,
} from './types';
import type { FromArray } from './types-internal';

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
         *       parent_id: undefined,
         *     },
         *     'comment-1': {
         *       comments: [comment2],
         *       parent_id: 'activity-1', // parent store where "comment-1" is located in "comments" array
         *     }
         *   }
         * }
         * ```
         */
        parent_id?: ActivityIdOrCommentId;
        comments?: CommentResponse[];
      }
    | undefined
  >;

  followers_pagination?: LoadingStates & { sort?: string };

  following_pagination?: LoadingStates & { sort?: string };
};

const END_OF_LIST = 'eol' as const;
const DEFAULT_COMMENT_PAGINATION = 'first' as const;

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
      const currentActivities = this.currentState.activities;
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
    'feeds.comment.added': (event) => {
      const { comment } = event;
      const forId = comment.parent_id ?? comment.object_id;

      this.state.next((currentState) => {
        const entityState = currentState.comments_by_entity_id[forId];
        const newComments = entityState?.comments?.concat([]) ?? [];

        if (
          entityState?.pagination?.sort === 'last' &&
          entityState?.pagination.next === END_OF_LIST
        ) {
          newComments.unshift(comment);
        } else if (entityState?.pagination?.sort === 'first') {
          newComments.push(comment);
        } else {
          // no other sorting option is supported yet
          return currentState;
        }

        return {
          ...currentState,
          comments_by_entity_id: {
            ...currentState.comments_by_entity_id,
            [forId]: {
              ...currentState.comments_by_entity_id[forId],
              comments: newComments,
            },
          },
        };
      });
    },
    'feeds.comment.deleted': ({ comment }) => {
      const forId = comment.parent_id ?? comment.object_id;

      this.state.next((currentState) => {
        const newCommentsByEntityId = {
          ...currentState.comments_by_entity_id,
          [forId]: {
            ...currentState.comments_by_entity_id[forId],
          },
        };

        const index = this.getCommentIndex(comment, currentState);

        if (newCommentsByEntityId?.[forId]?.comments?.length && index !== -1) {
          newCommentsByEntityId[forId].comments = [
            ...newCommentsByEntityId[forId].comments,
          ];

          newCommentsByEntityId[forId]?.comments?.splice(index, 1);
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
      const forId = comment.parent_id ?? comment.object_id;

      this.state.next((currentState) => {
        const entityState = currentState.comments_by_entity_id[forId];

        if (!entityState?.comments?.length) return currentState;

        const index = this.getCommentIndex(comment, currentState);

        if (index === -1) return currentState;

        const newComments = [...entityState.comments];

        newComments[index] = comment;

        return {
          ...currentState,
          comments_by_entity_id: {
            ...currentState.comments_by_entity_id,
            [forId]: {
              ...currentState.comments_by_entity_id[forId],
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
      // filter non-accepted follows (the way getOrCreate does by default)
      if (event.follow.status !== 'accepted') return;

      // this feed followed someone
      if (event.follow.source_feed.feed_id === this.fid) {
        if (this.currentState.following_pagination?.next === END_OF_LIST) {
          this.state.next((currentState) => ({
            ...currentState,
            ...event.follow.source_feed,
            // TODO: respect sort
            following: currentState.following
              ? currentState.following.concat(event.follow)
              : [event.follow],
          }));
        }
      } else if (
        // someone followed this feed
        event.follow.target_feed.feed_id === this.fid
      ) {
        const source = event.follow.source_feed;
        const connectedUser = this.client.state.getLatestValue().connectedUser;

        this.state.next((currentState) => {
          const newState = { ...currentState, ...event.follow.target_feed };

          if (source.created_by.id === connectedUser?.id) {
            newState.own_follows = newState.own_follows
              ? newState.own_follows.concat(event.follow)
              : [event.follow];
          }

          if (currentState.followers_pagination?.next === END_OF_LIST) {
            // TODO: respect sort
            newState.followers = newState.followers
              ? newState.followers.concat(event.follow)
              : [event.follow];
          }

          return newState;
        });
      }
    },
    'feeds.follow.deleted': (event) => {
      // this feed unfollowed someone
      if (event.follow.source_feed.feed_id === this.fid) {
        this.state.next((currentState) => {
          return {
            ...currentState,
            ...event.follow.source_feed,
            following: currentState.following?.filter(
              (follow) =>
                follow.target_feed.feed_id !== event.follow.target_feed.feed_id,
            ),
          };
        });
      } else if (
        // someone unfollowed this feed
        event.follow.target_feed.feed_id === this.fid
      ) {
        const source = event.follow.source_feed;
        const connectedUser = this.client.state.getLatestValue().connectedUser;

        this.state.next((currentState) => {
          const newState = { ...currentState, ...event.follow.target_feed };

          if (source.created_by.id === connectedUser?.id) {
            newState.own_follows = newState.own_follows?.filter(
              (follow) =>
                follow.source_feed.feed_id !== event.follow.source_feed.feed_id,
            );
          }

          newState.followers = newState.followers?.filter(
            (follow) =>
              follow.source_feed.feed_id !== event.follow.source_feed.feed_id,
          );

          return newState;
        });
      }
    },
    'feeds.follow.updated': Feed.noop,
    'feeds.comment.reaction.added': this.handleCommentReactionEvent.bind(this),
    'feeds.comment.reaction.deleted':
      this.handleCommentReactionEvent.bind(this),
    'feeds.comment.reaction.updated': Feed.noop,
    'feeds.feed_member.added': (event) => {
      const { member } = event;

      // do not add a member if the pagination has reached the end of the list
      if (this.currentState.member_pagination?.next !== END_OF_LIST) return;

      this.state.next((currentState) => {
        return {
          ...currentState,
          // TODO: respect sort
          members: currentState.members
            ? currentState.members.concat(member)
            : [member],
        };
      });
    },
    'feeds.feed_member.removed': (event) => {
      this.state.next((currentState) => {
        return {
          ...currentState,
          members: currentState.members?.filter(
            (member) => member.user.id !== event.user?.id,
          ),
        };
      });
    },
    'feeds.feed_member.updated': (event) => {
      this.state.next((currentState) => {
        const memberIndex =
          currentState.members?.findIndex(
            (member) => member.user.id === event.member.user.id,
          ) ?? -1;

        if (memberIndex !== -1) {
          const newMembers = [...currentState.members!];
          newMembers[memberIndex] = event.member;

          return {
            ...currentState,
            members: newMembers,
          };
        }

        return currentState;
      });
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
    'feeds.bookmark_folder.deleted': undefined,
    'feeds.bookmark_folder.updated': undefined,
  };

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  constructor(
    client: FeedsClient,
    groupId: 'user' | 'timeline' | (string & {}),
    id: string,
    data?: FeedResponse,
  ) {
    // Need this ugly cast because fileUpload endpoints :(
    super(client as unknown as FeedsApi, groupId, id);
    this.state = new StateStore<FeedState>({
      feed_id: `${groupId}:${id}`,
      group_id: groupId,
      id,
      ...(data ?? {}),
      is_loading: false,
      is_loading_activities: false,
      comments_by_entity_id: {},
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
    const connectedUser = this.client.state.getLatestValue().connectedUser;

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

          // if there is no next cursor, set it to END_OF_LIST
          // request has to have a limit set for this to work
          if (
            (request?.followers_pagination?.limit ?? 0) > 0 &&
            typeof nextState.followers_pagination?.next === 'undefined'
          ) {
            nextState.followers_pagination = {
              ...nextState.followers_pagination,
              next: END_OF_LIST,
            };
          }

          if (
            (request?.following_pagination?.limit ?? 0) > 0 &&
            typeof nextState.following_pagination?.next === 'undefined'
          ) {
            nextState.following_pagination = {
              ...nextState.following_pagination,
              next: END_OF_LIST,
            };
          }

          if (
            (request?.member_pagination?.limit ?? 0) > 0 &&
            typeof nextState.member_pagination?.next === 'undefined'
          ) {
            nextState.member_pagination = {
              ...nextState.member_pagination,
              next: END_OF_LIST,
            };
          }

          if (!request?.followers_pagination?.limit) {
            delete nextState.followers;
          }
          if (!request?.following_pagination?.limit) {
            delete nextState.following;
          }

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

  private handleBookmarkAdded(event: BookmarkAddedEvent) {
    const currentActivities = this.currentState.activities;
    const { connectedUser } = this.client.state.getLatestValue();
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
    const { connectedUser } = this.client.state.getLatestValue();
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
    const { connectedUser } = this.client.state.getLatestValue();
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

  private getActivityIndex(activity: ActivityResponse, state?: FeedState) {
    const { activities } = state ?? this.currentState;

    if (!activities) {
      return -1;
    }

    let activityIndex = activities.indexOf(activity);

    // fast lookup failed, try slower approach
    if (activityIndex === -1) {
      activityIndex = activities.findIndex(
        (activity_) => activity_.id === activity.id,
      );
    }

    return activityIndex;
  }

  private updateActivityInState(
    activity: ActivityResponse,
    patch: Patch<FromArray<FeedState['activities']>>,
  ) {
    this.state.next((currentState) => {
      const activityIndex = this.getActivityIndex(activity, currentState);

      if (activityIndex === -1) return currentState;

      const nextActivities = [...currentState.activities!];

      nextActivities[activityIndex] = patch(
        currentState.activities![activityIndex],
      );

      return {
        ...currentState,
        activities: nextActivities,
      };
    });
  }

  private async loadNextPageComments({
    forId,
    base,
    sort,
    parentId,
  }: {
    parentId?: string;
    forId: string;
    sort: string;
    base: () => Promise<PagerResponse & { comments: CommentResponse[] }>;
  }) {
    try {
      this.state.next((currentState) => ({
        ...currentState,
        comments_by_entity_id: {
          ...currentState.comments_by_entity_id,
          [forId]: {
            ...currentState.comments_by_entity_id[forId],
            pagination: {
              ...currentState.comments_by_entity_id[forId]?.pagination,
              loading_next_page: true,
            },
          },
        },
      }));

      const { next: newNextCursor = END_OF_LIST, comments } = await base();

      this.state.next((currentState) => {
        const newPagination = {
          ...currentState.comments_by_entity_id[forId]?.pagination,
          next: newNextCursor,
        };

        if (typeof newPagination.sort === 'undefined') {
          newPagination.sort = sort;
        }

        return {
          ...currentState,
          comments_by_entity_id: {
            ...currentState.comments_by_entity_id,
            [forId]: {
              ...currentState.comments_by_entity_id[forId],
              parent_id: parentId,
              pagination: newPagination,
              comments: currentState.comments_by_entity_id[forId]?.comments
                ? currentState.comments_by_entity_id[forId].comments?.concat(
                    comments,
                  )
                : comments,
            },
          },
        };
      });
    } catch (error) {
      console.error(error);
      // TODO: figure out how to handle errorss
    } finally {
      this.state.next((currentState) => ({
        ...currentState,
        comments_by_entity_id: {
          ...currentState.comments_by_entity_id,
          [forId]: {
            ...currentState.comments_by_entity_id[forId],
            pagination: {
              ...currentState.comments_by_entity_id[forId]?.pagination,
              loading_next_page: false,
            },
          },
        },
      }));
    }
  }

  public async loadNextPageActivityComments(
    activity: ActivityResponse,
    request?: Partial<
      Omit<GetCommentsRequest, 'object_id' | 'object_type' | 'next'>
    >,
  ) {
    const pagination =
      this.currentState.comments_by_entity_id[activity.id]?.pagination;
    const currentNextCursor = pagination?.next;
    const currentSort = pagination?.sort;
    const isLoading = pagination?.loading_next_page;

    const sort = currentSort ?? request?.sort ?? DEFAULT_COMMENT_PAGINATION;

    if (isLoading || currentNextCursor === END_OF_LIST) return;

    await this.loadNextPageComments({
      forId: activity.id,
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
    const pagination =
      this.currentState.comments_by_entity_id[comment.id]?.pagination;
    const currentNextCursor = pagination?.next;
    const currentSort = pagination?.sort;
    const isLoading = pagination?.loading_next_page;

    const sort = currentSort ?? request?.sort ?? DEFAULT_COMMENT_PAGINATION;

    if (isLoading || currentNextCursor === END_OF_LIST) return;

    await this.loadNextPageComments({
      forId: comment.id,
      base: () =>
        this.client.getCommentReplies({
          ...request,
          comment_id: comment.id,
          // use known sort first (prevents broken pagination)
          sort: currentSort ?? request?.sort ?? DEFAULT_COMMENT_PAGINATION,
          next: currentNextCursor,
        }),
      parentId: comment.parent_id ?? comment.object_id,
      sort,
    });
  }

  private async loadNextPageFollows(
    type: 'followers' | 'following',
    request: Pick<QueryFollowsRequest, 'limit'>,
  ) {
    const paginationKey = `${type}_pagination` as const;
    const method = `query${capitalize(type)}` as const;

    const currentNextCursor = this.currentState[paginationKey]?.next;
    const isLoading = this.currentState[paginationKey]?.loading_next_page;

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
    const response = await this.getOrCreate({
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
    });

    return response;
  }

  addActivity(request: Omit<ActivityRequest, 'feed_ids'>) {
    return this.feedsApi.addActivity({
      ...request,
      feed_ids: [this.fid],
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

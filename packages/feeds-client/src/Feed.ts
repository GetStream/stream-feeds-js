import {
  ActivityAddedEvent,
  ActivityDeletedEvent,
  ActivityMarkEvent,
  ActivityPinnedEvent,
  ActivityReactionAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityRemovedFromFeedEvent,
  ActivityRequest,
  ActivityUnpinnedEvent,
  ActivityUpdatedEvent,
  BookmarkAddedEvent,
  BookmarkDeletedEvent,
  BookmarkUpdatedEvent,
  CommentAddedEvent,
  CommentDeletedEvent,
  CommentReactionAddedEvent,
  CommentReactionDeletedEvent,
  CommentUpdatedEvent,
  FeedCreatedEvent,
  FeedDeletedEvent,
  FeedGroupChangedEvent,
  FeedGroupDeletedEvent,
  FeedMemberAddedEvent,
  FeedMemberRemovedEvent,
  FeedMemberUpdatedEvent,
  FeedResponse,
  FeedUpdatedEvent,
  FollowCreatedEvent,
  FollowDeletedEvent,
  FollowUpdatedEvent,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  PollClosedFeedEvent,
  PollDeletedFeedEvent,
  PollUpdatedFeedEvent,
  PollVoteCastedFeedEvent,
  PollVoteChangedFeedEvent,
  PollVoteRemovedFeedEvent,
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

export type FeedState = Partial<
  Omit<GetOrCreateFeedResponse, 'duration' | 'feed'>
> &
  Partial<{
    [key in keyof FeedResponse]: FeedResponse[key];
  }> & {
    /**
     * True when loading state using `getOrCreate`
     */
    is_loading: boolean;
    /**
     * True when loading activities using `getOrCreate` or `getNextPage`
     */
    is_loading_activities: boolean;
  };

export class Feed extends FeedApi {
  readonly state: StateStore<FeedState>;
  private readonly eventHandlers: {
    [key in WSEvent['type']]: (_: WSEvent & { type: key }) => void;
  } = {
    'feeds.activity.added': (
      event: { type: 'feeds.activity.added' } & ActivityAddedEvent,
    ) => {
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
    'feeds.activity.deleted': (
      event: { type: 'feeds.activity.deleted' } & ActivityDeletedEvent,
    ) => {
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
    'feeds.activity.reaction.added': (
      event: {
        type: 'feeds.activity.reaction.added';
      } & ActivityReactionAddedEvent,
    ) => {
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
    'feeds.activity.reaction.deleted': (
      event: {
        type: 'feeds.activity.reaction.deleted';
      } & ActivityReactionDeletedEvent,
    ) => {
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
    'feeds.activity.removed_from_feed': (
      _: {
        type: 'feeds.activity.removed_from_feed';
      } & ActivityRemovedFromFeedEvent & {
          type: 'feeds.activity.removed_from_feed';
        },
    ) => {},
    'feeds.activity.updated': (
      event: { type: 'feeds.activity.updated' } & ActivityUpdatedEvent,
    ) => {
      const currentActivities = this.state.getLatestValue().activities;
      if (currentActivities) {
        const result = updateActivityInState(event.activity, currentActivities);
        if (result.changed) {
          this.state.partialNext({ activities: result.activities });
        }
      }
    },
    'feeds.bookmark.added': (
      _: { type: 'feeds.bookmark.added' } & BookmarkAddedEvent,
    ) => {},
    'feeds.bookmark.deleted': (
      _: { type: 'feeds.bookmark.deleted' } & BookmarkDeletedEvent,
    ) => {},
    'feeds.bookmark.updated': (
      _: { type: 'feeds.bookmark.updated' } & BookmarkUpdatedEvent,
    ) => {},
    'feeds.comment.added': (
      _: { type: 'feeds.comment.added' } & CommentAddedEvent,
    ) => {},
    'feeds.comment.deleted': (
      _: { type: 'feeds.comment.deleted' } & CommentDeletedEvent,
    ) => {},
    'feeds.comment.updated': (
      _: { type: 'feeds.comment.updated' } & CommentUpdatedEvent,
    ) => {},
    'feeds.feed.created': (
      _: { type: 'feeds.feed.created' } & FeedCreatedEvent,
    ) => {
      // nothing to do
    },
    'feeds.feed.deleted': (
      _: { type: 'feeds.feed.deleted' } & FeedDeletedEvent,
    ) => {
      // nothing to do
    },
    'feeds.feed.updated': (
      event: { type: 'feeds.feed.updated' } & FeedUpdatedEvent,
    ) => {
      this.state.partialNext({ ...event.feed });
    },
    'feeds.feed_group.changed': (
      _: { type: 'feeds.feed_group.changed' } & FeedGroupChangedEvent,
    ) => {},
    'feeds.feed_group.deleted': (
      _: { type: 'feeds.feed_group.deleted' } & FeedGroupDeletedEvent,
    ) => {},
    'feeds.follow.created': (
      _: { type: 'feeds.follow.created' } & FollowCreatedEvent,
    ) => {},
    'feeds.follow.deleted': (
      _: { type: 'feeds.follow.deleted' } & FollowDeletedEvent,
    ) => {},
    'feeds.follow.updated': (
      _: { type: 'feeds.follow.updated' } & FollowUpdatedEvent,
    ) => {},
    'feeds.comment.reaction.added': (
      _: {
        type: 'feeds.comment.reaction.added';
      } & CommentReactionAddedEvent & {
          type: 'feeds.comment.reaction.added';
        },
    ) => {},
    'feeds.comment.reaction.deleted': (
      _: {
        type: 'feeds.comment.reaction.deleted';
      } & CommentReactionDeletedEvent & {
          type: 'feeds.comment.reaction.deleted';
        },
    ) => {},
    'feeds.feed_member.added': function (
      _: { type: 'feeds.feed_member.added' } & FeedMemberAddedEvent & {
          type: 'feeds.feed_member.added';
        },
    ): void {},
    'feeds.feed_member.removed': function (
      _: { type: 'feeds.feed_member.removed' } & FeedMemberRemovedEvent & {
          type: 'feeds.feed_member.removed';
        },
    ): void {},
    'feeds.feed_member.updated': function (
      _: { type: 'feeds.feed_member.updated' } & FeedMemberUpdatedEvent & {
          type: 'feeds.feed_member.updated';
        },
    ): void {},
    'feeds.poll.closed': function (
      _: { type: 'feeds.poll.closed' } & PollClosedFeedEvent & {
          type: 'feeds.poll.closed';
        },
    ): void {},
    'feeds.poll.deleted': function (
      _: { type: 'feeds.poll.deleted' } & PollDeletedFeedEvent & {
          type: 'feeds.poll.deleted';
        },
    ): void {},
    'feeds.poll.updated': function (
      _: { type: 'feeds.poll.updated' } & PollUpdatedFeedEvent & {
          type: 'feeds.poll.updated';
        },
    ): void {},
    'feeds.poll.vote_casted': function (
      _: { type: 'feeds.poll.vote_casted' } & PollVoteCastedFeedEvent & {
          type: 'feeds.poll.vote_casted';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'feeds.poll.vote_changed': function (
      _: { type: 'feeds.poll.vote_changed' } & PollVoteChangedFeedEvent & {
          type: 'feeds.poll.vote_changed';
        },
    ): void {},
    'feeds.poll.vote_removed': function (
      _: { type: 'feeds.poll.vote_removed' } & PollVoteRemovedFeedEvent & {
          type: 'feeds.poll.vote_removed';
        },
    ): void {},
    'feeds.activity.pinned': function (
      _: { type: 'feeds.activity.pinned' } & ActivityPinnedEvent & {
          type: 'feeds.activity.pinned';
        },
    ): void {},
    'feeds.activity.unpinned': function (
      _: { type: 'feeds.activity.unpinned' } & ActivityUnpinnedEvent & {
          type: 'feeds.activity.unpinned';
        },
    ): void {},
    'feeds.activity.marked': function (
      _: { type: 'feeds.activity.marked' } & ActivityMarkEvent & {
          type: 'feeds.activity.marked';
        },
    ): void {},
  };

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  constructor(
    client: FeedsClient,
    group: string,
    id: string,
    data?: FeedResponse,
  ) {
    super(client, group, id);
    this.state = new StateStore<FeedState>({
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
        const currentState = this.state.getLatestValue();
        const currentActivities = currentState.activities || [];
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
        const responseCopy = {
          ...response,
        };
        const feed = responseCopy.feed;
        // @ts-expect-error feed is removed from the response, it's spread out in the state
        delete responseCopy.feed;
        // @ts-expect-error
        delete responseCopy.metadata;
        const nextState: FeedState = {
          ...responseCopy,
          ...feed,
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
    const eventHandler: Function = this.eventHandlers[event.type];
    if (eventHandler) {
      eventHandler(event);
    } else {
      console.warn(`Received unknown event type: ${event.type}`, event);
    }
    this.eventDispatcher.dispatch(event);
  }
}

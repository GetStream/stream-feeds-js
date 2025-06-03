import {
  ActivityAddedEvent,
  ActivityDeletedEvent,
  ActivityReactionAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityRemovedFromFeedEvent,
  ActivityRequest,
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
  FeedResponse,
  FeedUpdatedEvent,
  FollowCreatedEvent,
  FollowDeletedEvent,
  FollowUpdatedEvent,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
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
    'activity.added': (
      event: { type: 'activity.added' } & ActivityAddedEvent,
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
    'activity.deleted': (
      event: { type: 'activity.deleted' } & ActivityDeletedEvent,
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
    'activity.reaction.added': (
      event: { type: 'activity.reaction.added' } & ActivityReactionAddedEvent,
    ) => {
      const currentActivities = this.state.getLatestValue().activities;
      const connectedUser = this.client.state.getLatestValue().connectedUser;
      const isCurrentUser = Boolean(
        connectedUser && event.reaction.user.id === connectedUser.id,
      );

      const result = addReactionToActivities(
        event.reaction,
        currentActivities,
        isCurrentUser,
      );
      if (result.changed) {
        this.state.partialNext({ activities: result.activities });
      }
    },
    'activity.reaction.deleted': (
      event: {
        type: 'activity.reaction.deleted';
      } & ActivityReactionDeletedEvent,
    ) => {
      const currentActivities = this.state.getLatestValue().activities;
      const connectedUser = this.client.state.getLatestValue().connectedUser;
      const isCurrentUser = Boolean(
        connectedUser && event.reaction.user.id === connectedUser.id,
      );

      const result = removeReactionFromActivities(
        event.reaction,
        currentActivities,
        isCurrentUser,
      );
      if (result.changed) {
        this.state.partialNext({ activities: result.activities });
      }
    },
    'activity.removed_from_feed': (
      _: {
        type: 'activity.removed_from_feed';
      } & ActivityRemovedFromFeedEvent & { type: 'activity.removed_from_feed' },
    ) => {},
    'activity.updated': (
      event: { type: 'activity.updated' } & ActivityUpdatedEvent,
    ) => {
      const currentActivities = this.state.getLatestValue().activities;
      if (currentActivities) {
        const result = updateActivityInState(event.activity, currentActivities);
        if (result.changed) {
          this.state.partialNext({ activities: result.activities });
        }
      }
    },
    'bookmark.added': (
      _: { type: 'bookmark.added' } & BookmarkAddedEvent,
    ) => {},
    'bookmark.deleted': (
      _: { type: 'bookmark.deleted' } & BookmarkDeletedEvent,
    ) => {},
    'bookmark.updated': (
      _: { type: 'bookmark.updated' } & BookmarkUpdatedEvent,
    ) => {},
    'comment.added': (
      _: { type: 'comment.added' } & CommentAddedEvent & {
          type: 'comment.added';
        },
    ) => {},
    'comment.deleted': (
      _: { type: 'comment.deleted' } & CommentDeletedEvent,
    ) => {},
    'comment.updated': (
      _: { type: 'comment.updated' } & CommentUpdatedEvent,
    ) => {},
    'feed.created': (_: { type: 'feed.created' } & FeedCreatedEvent) => {
      // nothing to do
    },
    'feed.deleted': (_: { type: 'feed.deleted' } & FeedDeletedEvent) => {
      // nothing to do
    },
    'feed.updated': (event: { type: 'feed.updated' } & FeedUpdatedEvent) => {
      this.state.partialNext({ ...event.feed });
    },
    'feed_group.changed': (
      _: { type: 'feed_group.changed' } & FeedGroupChangedEvent,
    ) => {},
    'feed_group.deleted': (
      _: { type: 'feed_group.deleted' } & FeedGroupDeletedEvent,
    ) => {},
    'follow.created': (
      _: { type: 'follow.created' } & FollowCreatedEvent,
    ) => {},
    'follow.deleted': (
      _: { type: 'follow.deleted' } & FollowDeletedEvent,
    ) => {},
    'follow.updated': (
      _: { type: 'follow.updated' } & FollowUpdatedEvent,
    ) => {},
    'comment.reaction.added': (
      _: { type: 'comment.reaction.added' } & CommentReactionAddedEvent & {
          type: 'comment.reaction.added';
        },
    ) => {},
    'comment.reaction.deleted': (
      _: { type: 'comment.reaction.deleted' } & CommentReactionDeletedEvent & {
          type: 'comment.reaction.deleted';
        },
    ) => {},
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

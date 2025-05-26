import {
  ActivityAddedEvent,
  ActivityDeletedEvent,
  ActivityReactionAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityRemovedFromFeedEvent,
  ActivityUpdatedEvent,
  BookmarkAddedEvent,
  BookmarkDeletedEvent,
  BookmarkUpdatedEvent,
  CommentAddedEvent,
  CommentDeletedEvent,
  CommentReactionAddedEvent,
  CommentReactionRemovedEvent,
  CommentUpdatedEvent,
  FeedCreatedEvent,
  FeedDeletedEvent,
  FeedGroupChangedEvent,
  FeedGroupDeletedEvent,
  FeedResponse,
  FeedUpdatedEvent,
  FollowAddedEvent,
  FollowRemovedEvent,
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

export type FeedState = Partial<
  Omit<GetOrCreateFeedResponse, 'duration' | 'feed'>
> &
  Partial<{
    [key in keyof FeedResponse]: FeedResponse[key];
  }>;

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
      _: { type: 'activity.reaction.added' } & ActivityReactionAddedEvent,
    ) => {},
    'activity.reaction.deleted': (
      _: {
        type: 'activity.reaction.deleted';
      } & ActivityReactionDeletedEvent,
    ) => {},
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
    'follow.added': (_: { type: 'follow.added' } & FollowAddedEvent) => {},
    'follow.removed': (
      _: { type: 'follow.removed' } & FollowRemovedEvent,
    ) => {},
    'follow.updated': (
      _: { type: 'follow.updated' } & FollowUpdatedEvent,
    ) => {},
    'comment.reaction.added': (
      _: { type: 'comment.reaction.added' } & CommentReactionAddedEvent & {
          type: 'comment.reaction.added';
        },
    ) => {},
    'comment.reaction.removed': (
      _: { type: 'comment.reaction.removed' } & CommentReactionRemovedEvent & {
          type: 'comment.reaction.removed';
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
    this.state = new StateStore<FeedState>(data ?? {});
  }

  get fid() {
    return `${this.group}:${this.id}`;
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    const responseCopy = {
      ...response,
    };
    const feed = responseCopy.feed;
    // @ts-expect-error feed is removed from the response, it's spread out in the state
    delete responseCopy.feed;
    // @ts-expect-error
    delete responseCopy.metadata;
    const nextState: FeedState = { ...responseCopy, ...feed };

    if (!request?.follower_pagination?.limit) {
      delete nextState.followers;
    }
    if (!request?.following_pagination?.limit) {
      delete nextState.following;
    }

    this.state.next({ ...nextState });

    return response;
  }

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  handleWSEvent(event: WSEvent) {
    // @ts-expect-error TODO: why?
    this.eventHandlers[event.type](event);
    this.eventDispatcher.dispatch(event);
  }
}

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
  Feed,
  FeedCreatedEvent,
  FeedDeletedEvent,
  FeedGroupChangedEvent,
  FeedGroupDeletedEvent,
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
    [key in keyof Feed]: Feed[key];
  }>;

export class FlatFeed extends FeedApi {
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
    'activity.reaction.added': function (
      _: { type: 'activity.reaction.added' } & ActivityReactionAddedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'activity.reaction.deleted': function (
      _: {
        type: 'activity.reaction.deleted';
      } & ActivityReactionDeletedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'activity.removed_from_feed': function (
      _: {
        type: 'activity.removed_from_feed';
      } & ActivityRemovedFromFeedEvent & { type: 'activity.removed_from_feed' },
    ): void {
      throw new Error('Function not implemented.');
    },
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
    'bookmark.added': function (
      _: { type: 'bookmark.added' } & BookmarkAddedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'bookmark.deleted': function (
      _: { type: 'bookmark.deleted' } & BookmarkDeletedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'bookmark.updated': function (
      _: { type: 'bookmark.updated' } & BookmarkUpdatedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'comment.added': function (
      _: { type: 'comment.added' } & CommentAddedEvent & {
          type: 'comment.added';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'comment.deleted': function (
      _: { type: 'comment.deleted' } & CommentDeletedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'comment.updated': function (
      _: { type: 'comment.updated' } & CommentUpdatedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'feed.created': (_: { type: 'feed.created' } & FeedCreatedEvent): void => {
      // nothing to do
    },
    'feed.deleted': (_: { type: 'feed.deleted' } & FeedDeletedEvent): void => {
      // nothing to do
    },
    'feed.updated': (
      event: { type: 'feed.updated' } & FeedUpdatedEvent,
    ): void => {
      this.state.partialNext({ ...event.feed });
    },
    'feed_group.changed': function (
      _: { type: 'feed_group.changed' } & FeedGroupChangedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'feed_group.deleted': function (
      _: { type: 'feed_group.deleted' } & FeedGroupDeletedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'follow.added': function (
      _: { type: 'follow.added' } & FollowAddedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'follow.removed': function (
      _: { type: 'follow.removed' } & FollowRemovedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'follow.updated': function (
      _: { type: 'follow.updated' } & FollowUpdatedEvent,
    ): void {
      throw new Error('Function not implemented.');
    },
    'comment.reaction.added': function (
      _: { type: 'comment.reaction.added' } & CommentReactionAddedEvent & {
          type: 'comment.reaction.added';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'comment.reaction.removed': function (
      _: { type: 'comment.reaction.removed' } & CommentReactionRemovedEvent & {
          type: 'comment.reaction.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
  };

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  constructor(client: FeedsClient, group: string, id: string, feed?: Feed) {
    super(client, group, id);
    this.state = new StateStore<FeedState>(feed ?? {});
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

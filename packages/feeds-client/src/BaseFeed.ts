import {
  ActivityAddedEvent,
  ActivityUpdatedEvent,
  Feed,
  WSEvent,
  ActivityRemovedEvent,
  BookmarkAddedEvent,
  BookmarkRemovedEvent,
  BookmarkUpdatedEvent,
  CommentAddedEvent,
  CommentRemovedEvent,
  CommentUpdatedEvent,
  FeedCreatedEvent,
  FeedGroupChangedEvent,
  FeedGroupRemovedEvent,
  FeedRemovedEvent,
  FollowAddedEvent,
  FollowRemovedEvent,
  FollowUpdatedEvent,
  ReactionAddedEvent,
  ReactionRemovedEvent,
  GetOrCreateFeedResponse,
  GetOrCreateFeedRequest,
} from './gen/models';
import { FeedsClient } from './FeedsClient';
import { StateStore } from './common/StateStore';
import { EventDispatcher } from './common/EventDispatcher';
import { FeedApi } from './gen/feeds/FeedApi';

// TODO: since generated models use snake_case we have to use snake_case in state as well
// Maybe we should do a transformation in the generated code and use camelCase?
export type BaseFeedState = Partial<
  Omit<GetOrCreateFeedResponse, 'duration' | 'feed'>
> &
  Partial<{
    [key in keyof Feed]: Feed[key];
  }>;

export abstract class BaseFeed<
  T extends {
    [key in keyof BaseFeedState]: BaseFeedState[key];
  } = BaseFeedState,
> extends FeedApi {
  readonly state: StateStore<T>;
  abstract type: 'flat' | 'notification';

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  private readonly eventHandlers: {
    [key in WSEvent['type']]: (_: WSEvent & { type: key }) => void;
  } = {
    'activity.added': function (
      _: { type: 'activity.added' } & ActivityAddedEvent & {
          type: 'activity.added';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'activity.reaction.added': function (
      _: { type: 'activity.reaction.added' } & ReactionAddedEvent & {
          type: 'activity.reaction.added';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'activity.reaction.removed': function (
      _: { type: 'activity.reaction.removed' } & ReactionRemovedEvent & {
          type: 'activity.reaction.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'activity.removed': function (
      _: { type: 'activity.removed' } & ActivityRemovedEvent & {
          type: 'activity.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'activity.updated': function (
      _: { type: 'activity.updated' } & ActivityUpdatedEvent & {
          type: 'activity.updated';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'bookmark.added': function (
      _: { type: 'bookmark.added' } & BookmarkAddedEvent & {
          type: 'bookmark.added';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'bookmark.removed': function (
      _: { type: 'bookmark.removed' } & BookmarkRemovedEvent & {
          type: 'bookmark.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'bookmark.updated': function (
      _: { type: 'bookmark.updated' } & BookmarkUpdatedEvent & {
          type: 'bookmark.updated';
        },
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
    'comment.removed': function (
      _: { type: 'comment.removed' } & CommentRemovedEvent & {
          type: 'comment.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'comment.updated': function (
      _: { type: 'comment.updated' } & CommentUpdatedEvent & {
          type: 'comment.updated';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'feed.created': function (
      _: { type: 'feed.created' } & FeedCreatedEvent & {
          type: 'feed.created';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'feed.removed': function (
      _: { type: 'feed.removed' } & FeedRemovedEvent & {
          type: 'feed.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'feed_group.changed': function (
      _: { type: 'feed_group.changed' } & FeedGroupChangedEvent & {
          type: 'feed_group.changed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'feed_group.removed': function (
      _: { type: 'feed_group.removed' } & FeedGroupRemovedEvent & {
          type: 'feed_group.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'follow.added': function (
      _: { type: 'follow.added' } & FollowAddedEvent & {
          type: 'follow.added';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'follow.removed': function (
      _: { type: 'follow.removed' } & FollowRemovedEvent & {
          type: 'follow.removed';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
    'follow.updated': function (
      _: { type: 'follow.updated' } & FollowUpdatedEvent & {
          type: 'follow.updated';
        },
    ): void {
      throw new Error('Function not implemented.');
    },
  };

  constructor(client: FeedsClient, group: string, id: string, feed?: Feed) {
    super(client, group, id);
    this.state = new StateStore<T>(this.getInitialState(feed));
  }

  get fid() {
    return `${this.group}:${this.id}`;
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    this.feedUpdated(response.feed);

    return response;
  }

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  /**
   * internal
   * @param event
   */
  handleWSEvent(event: WSEvent) {
    // @ts-expect-error TODO: why?
    this.eventHandlers[event.type](event);
    this.eventDispatcher.dispatch(event);
  }

  protected abstract getInitialState(feed?: Feed): T;

  protected abstract feedUpdated(feed: Partial<Feed>): void;
}

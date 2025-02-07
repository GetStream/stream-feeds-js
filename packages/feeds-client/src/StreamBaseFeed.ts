import { EventDispatcher, StateStore } from '@stream-io/common';
import { StreamFeedApi } from './gen/feeds/FeedApi';
import {
  ActivityAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityReactionNewEvent,
  ActivityReactionUpdatedEvent,
  ActivityRemovedEvent,
  ActivityUpdatedEvent,
  Feed,
  NotificationFollowEvent,
  NotificationFollowRequestEvent,
  GetOrCreateFeedRequest,
  NotificationUnfollowEvent,
  WSEvent,
  QueryCommentsRequest,
  Comment,
} from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';
import {
  addMemberToState,
  removeMemberFromState,
  updateMemberInState,
} from './state-updates/member-utils';
import { ActivityOrCommentId } from './types';
import {
  addCommentsToState,
  removeCommentFromState,
  updateCommentInState,
} from './state-updates/comment-utils';

// TODO: since generated models use snake_case we have to use snake_case in state as well
// Maybe we should do a transformation in the generated code and use camelCase?
export type StreamBaseFeedState = Partial<Feed> & {
  offset: number;
  limit: number;
  has_next_page: boolean;
  is_loading_next_page: boolean;
  activity_comments: Record<
    ActivityOrCommentId,
    { comments: Comment[]; next?: string }
  >;
};

export abstract class StreamBaseFeed<
  T extends {
    [key in keyof StreamBaseFeedState]: StreamBaseFeedState[key];
  } = StreamBaseFeedState,
> extends StreamFeedApi {
  readonly state: StateStore<T>;
  abstract type: Feed['type'];

  protected eventDispatcher: EventDispatcher<WSEvent['type'], WSEvent> =
    new EventDispatcher<WSEvent['type'], WSEvent>();

  private readonly eventHandlers: {
    [key in WSEvent['type']]: (event: WSEvent & { type: key }) => void;
  } = {
    'feeds.activity_added': (event) => this.newActivityReceived(event),
    'feeds.activity_reaction_deleted': (event) =>
      this.activityReactionRemoved(event),
    'feeds.activity_reaction_new': (event) =>
      this.reactionAddedToActivity(event),
    'feeds.activity_reaction_updated': (event) =>
      this.activityReactionUpdated(event),
    'feeds.activity_removed': (event) => this.activityRemoved(event),
    'feeds.activity_updated': (event) => this.activityUpdated(event),
    'feeds.notification.follow': (event) =>
      this.updateFeedFromFollowEvent(event),
    'feeds.notification.follow_request_created': (event) =>
      this.updateFeedFromFollowEvent(event),
    'feeds.notification.follow_request_updated': (event) =>
      this.updateFeedFromFollowEvent(event),
    'feeds.notification.unfollow': (event) =>
      this.updateFeedFromFollowEvent(event),
    'feeds.feed_deleted': (event) =>
      this.feedUpdated({
        ...event.feed,
        members: this.state.getLatestValue().members ?? [],
      }),
    'feeds.member_added': (event) => {
      const result = addMemberToState(
        event.member,
        this.state.getLatestValue().members ?? [],
        this.state.getLatestValue().invites ?? [],
      );
      if (result.changed) {
        this.feedUpdated({ members: result.members, invites: result.invites });
      }
    },
    'feeds.member_removed': (event) => {
      const result = removeMemberFromState(
        event.member,
        this.state.getLatestValue().members ?? [],
      );
      if (result.changed) {
        this.feedUpdated({ members: result.members });
      }
    },
    'feeds.member_updated': (event) => {
      const result = updateMemberInState(
        event.member,
        this.state.getLatestValue().members ?? [],
        this.state.getLatestValue().invites ?? [],
      );
      if (result.changed) {
        this.feedUpdated({ members: result.members, invites: result.invites });
      }
    },
    // Integrators should handle notification.member* events
    'feeds.notification.member_added': (_) => {},
    'feeds.notification.member_invited': (_) => {},
    'feeds.notification.member_removed': (_) => {},
    'feeds.activity_comment_new': (event) => {
      const activityId = event.comment.activity_id;
      const parentId = event.comment.parent_id;
      // TODO: backend sends empty parent id as empty string intead of undefined
      const id = parentId && parentId?.length > 0 ? parentId : activityId;
      const activityComments =
        this.state.getLatestValue().activity_comments ?? {};
      if (activityComments[id]) {
        this.addNewCommentToState(
          id,
          event.comment,
          activityComments[id].comments,
        );
      }
    },
    'feeds.activity_comment_removed': (event) => {
      const activityId = event.comment.activity_id;
      const parentId = event.comment.parent_id;
      // TODO: backend sends empty parent id as empty string intead of undefined
      const id = parentId && parentId?.length > 0 ? parentId : activityId;
      const activityComments =
        this.state.getLatestValue().activity_comments ?? {};
      if (activityComments[id]) {
        this.deleteCommentFromState(
          id,
          event.comment,
          activityComments[id].comments,
        );
      }
    },
    'feeds.activity_comment_updated': (event) => {
      const activityId = event.comment.activity_id;
      const parentId = event.comment.parent_id;
      // TODO: backend sends empty parent id as empty string intead of undefined
      const id = parentId && parentId?.length > 0 ? parentId : activityId;
      const activityComments =
        this.state.getLatestValue().activity_comments ?? {};
      if (activityComments[id]) {
        this.updateCommentInState(
          activityId,
          event.comment,
          activityComments[id].comments,
        );
      }
    },
    'feeds.comment_reaction_deleted': function (_): void {
      throw new Error('Function not implemented.');
    },
    'feeds.comment_reaction_new': function (_): void {
      throw new Error('Function not implemented.');
    },
    'feeds.comment_reaction_updated': function (_): void {
      throw new Error('Function not implemented.');
    },
  };

  constructor(
    client: StreamFeedsClient,
    group: string,
    id: string,
    feed?: Feed,
  ) {
    super(client, group, id);
    this.state = new StateStore<T>(this.getInitialState(feed));
  }

  get fid() {
    return `${this.group}:${this.id}`;
  }

  async get() {
    const response = await super.get();
    this.feedUpdated(response.feed);

    return response;
  }

  async getOrCreate(request?: GetOrCreateFeedRequest) {
    const response = await super.getOrCreate(request);
    this.feedUpdated(response.feed);

    return response;
  }

  readNextPage = async () => {
    const offset = this.state.getLatestValue().offset;
    const limit = this.state.getLatestValue().limit ?? 30;

    if (!this.state.getLatestValue().has_next_page) {
      return await Promise.resolve();
    } else {
      this.setLoadingState(true);
      try {
        const response = await this.read({ offset: offset + limit, limit });
        return response;
      } finally {
        this.setLoadingState(false);
      }
    }
  };

  queryActivityComments = async (
    { activityId, parentId }: { activityId: string; parentId?: string },
    request: QueryCommentsRequest = {},
  ) => {
    if (!request.filter) {
      request.filter = { activity_id: activityId };
    } else {
      request.filter.activity_id = activityId;
    }
    if (parentId) {
      request.filter.parent_id = parentId;
    }
    const response = await this.client.queryFeedComments(request);

    const activityComments =
      this.state.getLatestValue().activity_comments ?? {};
    const id = parentId ?? activityId;
    const comments = request.next ? activityComments[id]?.comments : undefined;
    const result = addCommentsToState(response.comments, comments);
    if (result.changed) {
      const newActivityComments = { ...activityComments };
      newActivityComments[id] = {
        comments: result.comments,
        next: response.pager.next,
      };
      // @ts-expect-error TODO: why is this needed?
      this.state.partialNext({ activity_comments: newActivityComments });
    }

    return response;
  };

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

  public abstract read(request: {
    limit: number;
    offset: number;
  }): Promise<any>;

  protected abstract getInitialState(feed?: Feed): T;

  protected abstract setLoadingState(state: boolean): void;

  protected abstract feedUpdated(feed: Partial<Feed>): void;

  protected abstract newActivityReceived(event: ActivityAddedEvent): void;

  protected abstract activityUpdated(event: ActivityUpdatedEvent): void;

  protected abstract activityRemoved(event: ActivityRemovedEvent): void;

  protected abstract reactionAddedToActivity(
    event: ActivityReactionNewEvent,
  ): void;

  protected abstract activityReactionUpdated(
    event: ActivityReactionUpdatedEvent,
  ): void;

  protected abstract activityReactionRemoved(
    event: ActivityReactionDeletedEvent,
  ): void;

  private updateFeedFromFollowEvent(
    event:
      | NotificationFollowRequestEvent
      | NotificationFollowEvent
      | NotificationUnfollowEvent,
  ) {
    const sourceFeed = event.source_feed;
    const targetFeed = event.target_feed;
    if (`${sourceFeed.group}:${sourceFeed.id}` === this.fid) {
      this.feedUpdated({
        ...sourceFeed,
        members: this.state.getLatestValue().members,
        invites: this.state.getLatestValue().invites,
        own_capabilities: this.state.getLatestValue().own_capabilities,
      });
    } else if (`${targetFeed.group}:${targetFeed.id}` === this.fid) {
      this.feedUpdated({
        ...targetFeed,
        members: this.state.getLatestValue().members,
        invites: this.state.getLatestValue().invites,
        own_capabilities: this.state.getLatestValue().own_capabilities,
      });
    }
  }

  private addNewCommentToState(
    id: ActivityOrCommentId,
    comment: Comment,
    comments: Comment[],
  ) {
    const result = addCommentsToState([comment], comments);
    if (result.changed) {
      const activityComments =
        this.state.getLatestValue().activity_comments ?? {};
      const newActivityComments = { ...activityComments };
      newActivityComments[id] = {
        ...activityComments[id],
        comments: result.comments,
      };
      // @ts-expect-error TODO: why is this needed?
      this.state.partialNext({ activity_comments: newActivityComments });
    }
  }

  private updateCommentInState(
    id: ActivityOrCommentId,
    comment: Comment,
    comments: Comment[],
  ) {
    const result = updateCommentInState(comment, comments);
    if (result.changed) {
      const activityComments =
        this.state.getLatestValue().activity_comments ?? {};
      const newActivityComments = { ...activityComments };
      newActivityComments[id] = {
        ...activityComments[id],
        comments: result.comments,
      };
      // @ts-expect-error TODO: why is this needed?
      this.state.partialNext({ activity_comments: newActivityComments });
    }
  }

  private deleteCommentFromState(
    id: ActivityOrCommentId,
    comment: Comment,
    comments: Comment[],
  ) {
    const result = removeCommentFromState(comment, comments);
    if (result.changed) {
      const activityComments =
        this.state.getLatestValue().activity_comments ?? {};
      const newActivityComments = { ...activityComments };
      newActivityComments[id] = {
        ...activityComments[id],
        comments: result.comments,
      };
      // @ts-expect-error TODO: why is this needed?
      this.state.partialNext({ activity_comments: newActivityComments });
    }
  }
}

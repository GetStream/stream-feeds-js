import {
  ActivityAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityReactionNewEvent,
  ActivityReactionUpdatedEvent,
  ActivityRemovedEvent,
  ActivityUpdatedEvent,
  Feed,
  ReadNotificationFeedResponse,
} from './gen/models';
import { StreamBaseFeed, StreamBaseFeedState } from './StreamBaseFeed';

type NotificationFeed = StreamBaseFeedState &
  Partial<Omit<ReadNotificationFeedResponse, 'duration'>>;

export type StreamNotificationFeedState = {
  [key in keyof NotificationFeed]: NotificationFeed[key];
};

export class StreamNotificationFeedClient extends StreamBaseFeed<StreamNotificationFeedState> {
  type = 'notification' as const;
  read = async (request: {
    limit: number;
    offset: number;
    mark_seen?: string;
    mark_read?: string;
  }) => {
    this.setLoadingState(true);
    try {
      const response = await this.readNotification(request);
      const groups = this.state.getLatestValue().groups ?? [];
      const newGrpoups = [...(request.offset === 0 ? [] : groups)];
      newGrpoups.push(...response.groups);
      this.state.partialNext({
        unread: response.unread,
        unseen: response.unseen,
        groups: newGrpoups,
        limit: request.limit,
        offset: request.offset,
        has_next_page: response.groups.length === request.limit,
      });

      return response;
    } finally {
      this.setLoadingState(false);
    }
  };

  protected getInitialState(feed?: Feed) {
    const defaultState: StreamNotificationFeedState = {
      created_at: undefined,
      follower_count: undefined,
      following_count: undefined,
      group: undefined,
      id: undefined,
      type: undefined,
      updated_at: undefined,
      visibility_level: undefined,
      invites: undefined,
      members: undefined,
      created_by: undefined,
      deleted_at: undefined,
      custom: undefined,
      groups: undefined,
      unread: undefined,
      unseen: undefined,
      limit: 0,
      offset: 0,
      has_next_page: true,
      is_loading_next_page: false,
    };
    return { ...defaultState, ...feed };
  }

  protected setLoadingState(state: boolean): void {
    this.state.partialNext({ is_loading_next_page: state });
  }

  protected updateFromFeedResponse(feed: Feed): void {
    this.state.partialNext(feed);
  }

  protected newActivityReceived(_: ActivityAddedEvent): void {
    throw new Error('Method not implemented.');
  }

  protected activityUpdated(_: ActivityUpdatedEvent): void {
    throw new Error('Method not implemented.');
  }

  protected activityRemoved(_: ActivityRemovedEvent): void {
    throw new Error('Method not implemented.');
  }

  protected reactionAddedToActivity(_: ActivityReactionNewEvent): void {
    throw new Error('Method not implemented.');
  }

  protected activityReactionUpdated(event: ActivityReactionUpdatedEvent): void {
    throw new Error('Method not implemented.');
  }
  protected activityReactionRemoved(event: ActivityReactionDeletedEvent): void {
    throw new Error('Method not implemented.');
  }
}

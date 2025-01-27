import {
  addActivitiesToState,
  removeActivityFromState,
  updateActivityInState,
} from './activity-utils';
import {
  Activity,
  ActivityAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityReactionNewEvent,
  ActivityReactionUpdatedEvent,
  ActivityRemovedEvent,
  ActivityUpdatedEvent,
  Feed,
  ReadFlatFeedResponse,
} from './gen/models';
import {
  addReactionToActivity,
  deleteReactionFromActivity,
  updateReactionOfActivity,
} from './reaction-utils';
import { StreamBaseFeed, StreamBaseFeedState } from './StreamBaseFeed';
import { UpdateStateResult } from './types-internal';

type FlatFeed = StreamBaseFeedState &
  Partial<Omit<ReadFlatFeedResponse, 'duration'>>;

export type StreamFlatFeedState = {
  [key in keyof FlatFeed]: FlatFeed[key];
};

export class StreamFlatFeedClient extends StreamBaseFeed<StreamFlatFeedState> {
  type = 'flat' as const;
  read = async (request: { limit: number; offset: number }) => {
    this.setLoadingState(true);
    try {
      const response = await this.readFlat(request);
      let activities = this.state.getLatestValue().activities ?? [];
      if (request.offset === 0) {
        activities = [];
      }
      const result = addActivitiesToState(
        response.activities,
        activities,
        'end',
      );
      this.state.partialNext({
        activities: result.activities,
        limit: request.limit,
        offset: request.offset,
        has_next_page: response.activities.length === request.limit,
      });

      return response;
    } finally {
      this.setLoadingState(false);
    }
  };

  protected getInitialState(feed?: Feed) {
    const defaultState: StreamFlatFeedState = {
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
      activities: undefined,
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

  protected feedUpdated(feed: Feed): void {
    this.state.partialNext(feed);
  }

  protected newActivityReceived(event: ActivityAddedEvent): void {
    const activities = this.state.getLatestValue().activities ?? [];
    const result = addActivitiesToState([event.activity], activities, 'start');
    this.updateActivitiesIfNecessary(result);
  }

  protected activityUpdated(event: ActivityUpdatedEvent): void {
    const activities = this.state.getLatestValue().activities ?? [];
    const result = updateActivityInState(event.activity, activities);
    this.updateActivitiesIfNecessary(result);
  }

  protected activityRemoved(event: ActivityRemovedEvent): void {
    const activities = this.state.getLatestValue().activities ?? [];
    const result = removeActivityFromState(event.activity, activities);
    this.updateActivitiesIfNecessary(result);
  }

  protected reactionAddedToActivity(event: ActivityReactionNewEvent): void {
    const activities = this.state.getLatestValue().activities ?? [];
    const result = addReactionToActivity(
      activities,
      event,
      this.client.state.getLatestValue().connectedUser?.id ===
        event.reaction.user_id,
    );
    this.updateActivitiesIfNecessary(result);
  }

  protected activityReactionUpdated(event: ActivityReactionUpdatedEvent): void {
    const activities = this.state.getLatestValue().activities ?? [];
    const result = updateReactionOfActivity(
      activities,
      event,
      this.client.state.getLatestValue().connectedUser?.id ===
        event.reaction.user_id,
    );
    this.updateActivitiesIfNecessary(result);
  }

  protected activityReactionRemoved(event: ActivityReactionDeletedEvent): void {
    const activities = this.state.getLatestValue().activities ?? [];
    const result = deleteReactionFromActivity(
      activities,
      event,
      this.client.state.getLatestValue().connectedUser?.id ===
        event.reaction.user_id,
    );
    this.updateActivitiesIfNecessary(result);
  }

  private updateActivitiesIfNecessary(
    result: UpdateStateResult<{ activities: Activity[] }>,
  ) {
    if (result.changed) {
      this.state.partialNext({ activities: result.activities });
    }
  }
}

import { ActivityAddedEvent, Feed, ReadFlatFeedResponse } from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';
import { StreamBaseFeed } from './StreamBaseFeed';

type FlatFeed = Feed & Omit<ReadFlatFeedResponse, 'duration'>;

export type StreamFlatFeedState = Partial<{
  [key in keyof FlatFeed]: FlatFeed[key];
}>;

export class StreamFlatFeedClient extends StreamBaseFeed<StreamFlatFeedState> {
  constructor(
    client: StreamFeedsClient,
    group: string,
    id: string,
    feed?: Feed,
  ) {
    super(client, group, id, feed);
  }

  read = async (request: { limit: number; offset: number }) => {
    const response = await this.readFlat(request);
    const activities = this.state.getLatestValue().activities ?? [];
    this.addActivitiesToState(response.activities, activities);
    this.state.partialNext({ activities: [...activities] });

    return response;
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
    };

    return { ...feed, ...defaultState };
  }

  protected updateFromFeedResponse(feed: Feed): void {
    this.state.partialNext(feed);
  }

  protected newActivityReceived(event: ActivityAddedEvent): void {
    const activities = this.state.getLatestValue().activities ?? [];
    this.addActivitiesToState([event.activity], activities);
    this.state.partialNext({ activities: [...activities] });
  }
}

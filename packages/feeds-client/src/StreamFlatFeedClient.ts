import { ActivityAddedEvent, Feed, ReadFlatFeedResponse } from './gen/models';
import { StreamFeedsClient } from './StreamFeedsClient';
import { StreamBaseFeed } from './StreamBaseFeed';

type FlatFeed = Partial<Feed> & Omit<ReadFlatFeedResponse, 'duration'>;

export type StreamFlatFeedState = Partial<{
  [key in keyof FlatFeed]: FlatFeed[key];
}> & {
  offset: number;
  limit: number;
  has_next_page: boolean;
};

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
    let activities = this.state.getLatestValue().activities ?? [];
    if (request.offset === 0) {
      activities = [];
    }
    this.addActivitiesToState(response.activities, activities);
    this.state.partialNext({
      activities: [...activities],
      limit: request.limit,
      offset: request.offset,
      has_next_page: response.activities.length === request.limit,
    });

    return response;
  };

  readNextPage = async () => {
    const offset = this.state.getLatestValue().offset;
    const limit = this.state.getLatestValue().limit ?? 30;

    if (!this.state.getLatestValue().has_next_page) {
      return Promise.resolve();
    } else {
      return this.read({ offset: offset + limit, limit });
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

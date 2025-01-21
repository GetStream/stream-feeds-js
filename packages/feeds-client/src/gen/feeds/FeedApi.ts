import { StreamResponse, StreamFeedsClient } from '../../gen-imports';
import {
  AddActivityRequest,
  AddActivityResponse,
  DeleteFeedResponse,
  FollowRequest,
  FollowResponse,
  GetFeedResponse,
  GetFollowedFeedsResponse,
  GetFollowingFeedsResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  ReadFlatFeedResponse,
  ReadNotificationFeedResponse,
  RemoveActivityFromFeedResponse,
  UnfollowRequest,
  UnfollowResponse,
  UpdateFeedMembersRequest,
  UpdateFeedMembersResponse,
  UpdateFeedRequest,
  UpdateFeedResponse,
} from '../models';

export class StreamFeedApi {
  constructor(
    protected client: StreamFeedsClient,
    public readonly group: string,
    public readonly id: string,
  ) {}

  delete(): Promise<StreamResponse<DeleteFeedResponse>> {
    return this.client.deleteFeed({ id: this.id, group: this.group });
  }

  get(): Promise<StreamResponse<GetFeedResponse>> {
    return this.client.getFeed({ id: this.id, group: this.group });
  }

  update(
    request?: UpdateFeedRequest,
  ): Promise<StreamResponse<UpdateFeedResponse>> {
    return this.client.updateFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  getOrCreate(
    request?: GetOrCreateFeedRequest & { connection_id?: string },
  ): Promise<StreamResponse<GetOrCreateFeedResponse>> {
    return this.client.getOrCreateFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  addActivity(
    request: AddActivityRequest,
  ): Promise<StreamResponse<AddActivityResponse>> {
    return this.client.addActivity({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  readFlat(request: {
    limit: number;
    offset: number;
  }): Promise<StreamResponse<ReadFlatFeedResponse>> {
    return this.client.readFlatFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  follow(request: FollowRequest): Promise<StreamResponse<FollowResponse>> {
    return this.client.follow({ id: this.id, group: this.group, ...request });
  }

  getFollowingFeeds(request: {
    limit: number;
    offset: number;
    filter?: string[];
  }): Promise<StreamResponse<GetFollowingFeedsResponse>> {
    return this.client.getFollowingFeeds({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  getFollowedFeeds(request: {
    limit: number;
    offset: number;
    filter?: string[];
  }): Promise<StreamResponse<GetFollowedFeedsResponse>> {
    return this.client.getFollowedFeeds({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  updateFeedMembers(
    request?: UpdateFeedMembersRequest,
  ): Promise<StreamResponse<UpdateFeedMembersResponse>> {
    return this.client.updateFeedMembers({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  readNotification(request: {
    limit: number;
    offset: number;
    mark_seen?: string;
    mark_read?: string;
  }): Promise<StreamResponse<ReadNotificationFeedResponse>> {
    return this.client.readNotificationFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  unfollow(
    request: UnfollowRequest,
  ): Promise<StreamResponse<UnfollowResponse>> {
    return this.client.unfollow({ id: this.id, group: this.group, ...request });
  }

  removeActivityFrom(request: {
    activity_id: string;
  }): Promise<StreamResponse<RemoveActivityFromFeedResponse>> {
    return this.client.removeActivityFromFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }
}

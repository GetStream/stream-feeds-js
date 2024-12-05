import { FeedsApi } from './FeedsApi';
import { StreamResponse } from '../../gen-imports';
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
    protected feedsApi: FeedsApi,
    public readonly group: string,
    public readonly id: string,
  ) {}

  delete(): Promise<StreamResponse<DeleteFeedResponse>> {
    return this.feedsApi.deleteFeed({ id: this.id, group: this.group });
  }

  get(): Promise<StreamResponse<GetFeedResponse>> {
    return this.feedsApi.getFeed({ id: this.id, group: this.group });
  }

  update(
    request?: UpdateFeedRequest,
  ): Promise<StreamResponse<UpdateFeedResponse>> {
    return this.feedsApi.updateFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  getOrCreate(
    request?: GetOrCreateFeedRequest & { connection_id?: string },
  ): Promise<StreamResponse<GetOrCreateFeedResponse>> {
    return this.feedsApi.getOrCreateFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  addActivity(
    request: AddActivityRequest,
  ): Promise<StreamResponse<AddActivityResponse>> {
    return this.feedsApi.addActivity({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  readFlat(request: {
    limit: number;
    offset: number;
  }): Promise<StreamResponse<ReadFlatFeedResponse>> {
    return this.feedsApi.readFlatFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  follow(request: FollowRequest): Promise<StreamResponse<FollowResponse>> {
    return this.feedsApi.follow({ id: this.id, group: this.group, ...request });
  }

  getFollowingFeeds(request: {
    limit: number;
    offset: number;
  }): Promise<StreamResponse<GetFollowingFeedsResponse>> {
    return this.feedsApi.getFollowingFeeds({
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
    return this.feedsApi.getFollowedFeeds({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  updateFeedMembers(
    request?: UpdateFeedMembersRequest,
  ): Promise<StreamResponse<UpdateFeedMembersResponse>> {
    return this.feedsApi.updateFeedMembers({
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
    return this.feedsApi.readNotificationFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  unfollow(
    request: UnfollowRequest,
  ): Promise<StreamResponse<UnfollowResponse>> {
    return this.feedsApi.unfollow({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  removeActivityFrom(request: {
    activity_id: string;
  }): Promise<StreamResponse<RemoveActivityFromFeedResponse>> {
    return this.feedsApi.removeActivityFromFeed({
      id: this.id,
      group: this.group,
      ...request,
    });
  }
}

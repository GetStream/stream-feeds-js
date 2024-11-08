import { FeedsApi } from './FeedsApi';
import { StreamResponse } from '../../gen-imports';
import {
  AddActivityRequest,
  AddActivityResponse,
  AddFeedMembersRequest,
  AddFeedMembersResponse,
  DeleteFeedResponse,
  FollowRequest,
  FollowResponse,
  GetFeedResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  ReadFlatFeedResponse,
  RemoveActivityFromFeedResponse,
  RemoveFeedMembersResponse,
  UnfollowResponse,
} from '../models';

export class FeedApi {
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

  getOrCreate(
    request: GetOrCreateFeedRequest,
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

  unfollow(): Promise<StreamResponse<UnfollowResponse>> {
    return this.feedsApi.unfollow({ id: this.id, group: this.group });
  }

  follow(request: FollowRequest): Promise<StreamResponse<FollowResponse>> {
    return this.feedsApi.follow({ id: this.id, group: this.group, ...request });
  }

  removeFeedMembers(request: {
    remove_members: string;
  }): Promise<StreamResponse<RemoveFeedMembersResponse>> {
    return this.feedsApi.removeFeedMembers({
      id: this.id,
      group: this.group,
      ...request,
    });
  }

  addFeedMembers(
    request: AddFeedMembersRequest,
  ): Promise<StreamResponse<AddFeedMembersResponse>> {
    return this.feedsApi.addFeedMembers({
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

import { StreamResponse, FeedsApi } from '../../gen-imports';
import {
  AcceptFeedMemberInviteRequest,
  AcceptFeedMemberInviteResponse,
  DeleteFeedResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  MarkActivityRequest,
  PinActivityRequest,
  PinActivityResponse,
  QueryFeedMembersRequest,
  QueryFeedMembersResponse,
  RejectFeedMemberInviteRequest,
  RejectFeedMemberInviteResponse,
  Response,
  UnpinActivityResponse,
  UpdateFeedMembersRequest,
  UpdateFeedMembersResponse,
  UpdateFeedRequest,
  UpdateFeedResponse,
} from '../models';

export class FeedApi {
  constructor(
    protected feedsApi: FeedsApi,
    public readonly group: string,
    public readonly id: string,
  ) {}

  delete(request?: {
    hard_delete?: boolean;
  }): Promise<StreamResponse<DeleteFeedResponse>> {
    return this.feedsApi.deleteFeed({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  getOrCreate(
    request?: GetOrCreateFeedRequest & { connection_id?: string },
  ): Promise<StreamResponse<GetOrCreateFeedResponse>> {
    return this.feedsApi.getOrCreateFeed({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  update(
    request?: UpdateFeedRequest,
  ): Promise<StreamResponse<UpdateFeedResponse>> {
    return this.feedsApi.updateFeed({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  markActivity(
    request?: MarkActivityRequest,
  ): Promise<StreamResponse<Response>> {
    return this.feedsApi.markActivity({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  unpinActivity(request: {
    activity_id: string;
  }): Promise<StreamResponse<UnpinActivityResponse>> {
    return this.feedsApi.unpinActivity({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  pinActivity(
    request: PinActivityRequest & { activity_id: string },
  ): Promise<StreamResponse<PinActivityResponse>> {
    return this.feedsApi.pinActivity({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  updateFeedMembers(
    request: UpdateFeedMembersRequest,
  ): Promise<StreamResponse<UpdateFeedMembersResponse>> {
    return this.feedsApi.updateFeedMembers({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  acceptFeedMemberInvite(
    request?: AcceptFeedMemberInviteRequest,
  ): Promise<StreamResponse<AcceptFeedMemberInviteResponse>> {
    return this.feedsApi.acceptFeedMemberInvite({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  queryFeedMembers(
    request?: QueryFeedMembersRequest,
  ): Promise<StreamResponse<QueryFeedMembersResponse>> {
    return this.feedsApi.queryFeedMembers({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  rejectFeedMemberInvite(
    request?: RejectFeedMemberInviteRequest,
  ): Promise<StreamResponse<RejectFeedMemberInviteResponse>> {
    return this.feedsApi.rejectFeedMemberInvite({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  stopWatching(request?: {
    connection_id?: string;
  }): Promise<StreamResponse<Response>> {
    return this.feedsApi.stopWatchingFeed({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }
}

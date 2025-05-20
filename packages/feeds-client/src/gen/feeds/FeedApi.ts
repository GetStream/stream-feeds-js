import { StreamResponse, FeedsApi } from '../../gen-imports';
import {
  AcceptFeedMemberRequest,
  AcceptFeedMemberResponse,
  DeleteFeedResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  MarkActivityRequest,
  PinActivityRequest,
  PinActivityResponse,
  QueryFeedMembersRequest,
  QueryFeedMembersResponse,
  RejectFeedMemberRequest,
  RejectFeedMemberResponse,
  Response,
  UnpinActivityResponse,
  UpdateFeedMembersRequest,
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
  ): Promise<StreamResponse<Response>> {
    return this.feedsApi.updateFeedMembers({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }

  acceptFeedMember(
    request: AcceptFeedMemberRequest,
  ): Promise<StreamResponse<AcceptFeedMemberResponse>> {
    return this.feedsApi.acceptFeedMember({
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

  rejectFeedMember(
    request: RejectFeedMemberRequest,
  ): Promise<StreamResponse<RejectFeedMemberResponse>> {
    return this.feedsApi.rejectFeedMember({
      feed_id: this.id,
      feed_group_id: this.group,
      ...request,
    });
  }
}

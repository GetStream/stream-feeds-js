import { StreamResponse, FeedsApi } from '../../gen-imports';
import {
  AcceptFeedMemberRequest,
  AcceptFeedMemberResponse,
  GetFeedResponse,
  MarkActivityRequest,
  PinActivityRequest,
  PinActivityResponse,
  RejectFeedMemberRequest,
  RejectFeedMemberResponse,
  RemoveFeedResponse,
  Response,
  UnpinActivityResponse,
  UpdateFeedMembersRequest,
} from '../models';

export class FeedApi {
  constructor(
    protected feedsApi: FeedsApi,
    public readonly group: string,
    public readonly id: string,
  ) {}

  remove(): Promise<StreamResponse<RemoveFeedResponse>> {
    return this.feedsApi.removeFeed({
      feed_id: this.id,
      feed_group_id: this.group,
    });
  }

  get(request?: {
    connection_id?: string;
  }): Promise<StreamResponse<GetFeedResponse>> {
    return this.feedsApi.getFeed({
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

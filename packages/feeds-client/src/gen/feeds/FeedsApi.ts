import { ApiClient, StreamResponse } from '../../gen-imports';
import {
  AcceptFeedMemberRequest,
  AcceptFeedMemberResponse,
  AcceptFollowRequest,
  AcceptFollowResponse,
  AddActivityRequest,
  AddActivityResponse,
  AddBookmarkRequest,
  AddBookmarkResponse,
  AddCommentRequest,
  AddCommentResponse,
  AddReactionRequest,
  AddReactionResponse,
  CreateActivitiesBatchRequest,
  CreateActivitiesBatchResponse,
  CreateManyFeedsRequest,
  CreateManyFeedsResponse,
  DeleteActivityReactionResponse,
  DeleteActivityResponse,
  DeleteBookmarkResponse,
  DeleteFeedResponse,
  FollowManyRequest,
  FollowManyResponse,
  FollowRequest,
  FollowResponse,
  FollowSuggestionsResponse,
  GetActivityResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  MarkActivityRequest,
  PinActivityRequest,
  PinActivityResponse,
  QueryActivitiesRequest,
  QueryActivitiesResponse,
  QueryCommentsRequest,
  QueryCommentsResponse,
  QueryFeedMembersRequest,
  QueryFeedMembersResponse,
  QueryFeedsResponse,
  QueryFollowsRequest,
  QueryFollowsResponse,
  RejectFeedMemberRequest,
  RejectFeedMemberResponse,
  RejectFollowRequest,
  RejectFollowResponse,
  RemoveActivitiesRequest,
  RemoveActivitiesResponse,
  RemoveCommentResponse,
  Response,
  UnfollowResponse,
  UnpinActivityResponse,
  UpdateActivityPartialRequest,
  UpdateActivityPartialResponse,
  UpdateBookmarkRequest,
  UpdateBookmarkResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  UpdateFeedMembersRequest,
  UpdateFeedRequest,
  UpdateFeedResponse,
  UpdateFollowRequest,
  UpdateFollowResponse,
} from '../models';
import { decoders } from '../model-decoders/decoders';

export class FeedsApi {
  constructor(public readonly apiClient: ApiClient) {}

  async addActivity(
    request: AddActivityRequest,
  ): Promise<StreamResponse<AddActivityResponse>> {
    const body = {
      type: request?.type,
      fids: request?.fids,
      expires_at: request?.expires_at,
      id: request?.id,
      parent_id: request?.parent_id,
      text: request?.text,
      user_id: request?.user_id,
      visibility: request?.visibility,
      attachments: request?.attachments,
      filter_tags: request?.filter_tags,
      interest_tags: request?.interest_tags,
      mentioned_user_ids: request?.mentioned_user_ids,
      custom: request?.custom,
      location: request?.location,
      search_data: request?.search_data,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddActivityResponse>
    >('POST', '/feeds/v3/activities', undefined, undefined, body);

    decoders.AddActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async upsertActivities(
    request: CreateActivitiesBatchRequest,
  ): Promise<StreamResponse<CreateActivitiesBatchResponse>> {
    const body = {
      activities: request?.activities,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<CreateActivitiesBatchResponse>
    >('POST', '/feeds/v3/activities/batch', undefined, undefined, body);

    decoders.CreateActivitiesBatchResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryActivities(
    request?: QueryActivitiesRequest,
  ): Promise<StreamResponse<QueryActivitiesResponse>> {
    const body = {
      comment_limit: request?.comment_limit,
      comment_sort: request?.comment_sort,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryActivitiesResponse>
    >('POST', '/feeds/v3/activities/query', undefined, undefined, body);

    decoders.QueryActivitiesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async removeActivities(
    request: RemoveActivitiesRequest,
  ): Promise<StreamResponse<RemoveActivitiesResponse>> {
    const body = {
      activity_ids: request?.activity_ids,
      hard_delete: request?.hard_delete,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<RemoveActivitiesResponse>
    >('POST', '/feeds/v3/activities/remove', undefined, undefined, body);

    decoders.RemoveActivitiesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteActivity(request: {
    activity_id: string;
    hard_delete?: boolean;
  }): Promise<StreamResponse<DeleteActivityResponse>> {
    const queryParams = {
      hard_delete: request?.hard_delete,
    };
    const pathParams = {
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteActivityResponse>
    >('DELETE', '/feeds/v3/activities/{activity_id}', pathParams, queryParams);

    decoders.DeleteActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getActivity(request: {
    activity_id: string;
  }): Promise<StreamResponse<GetActivityResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetActivityResponse>
    >('GET', '/feeds/v3/activities/{activity_id}', pathParams, undefined);

    decoders.GetActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateActivityPartial(
    request: UpdateActivityPartialRequest & { activity_id: string },
  ): Promise<StreamResponse<UpdateActivityPartialResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      unset: request?.unset,
      set: request?.set,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateActivityPartialResponse>
    >(
      'PATCH',
      '/feeds/v3/activities/{activity_id}',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateActivityPartialResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteBookmark(request: {
    activity_id: string;
  }): Promise<StreamResponse<DeleteBookmarkResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteBookmarkResponse>
    >(
      'DELETE',
      '/feeds/v3/activities/{activity_id}/bookmarks',
      pathParams,
      undefined,
    );

    decoders.DeleteBookmarkResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateBookmark(
    request: UpdateBookmarkRequest & { activity_id: string },
  ): Promise<StreamResponse<UpdateBookmarkResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      feed_id: request?.feed_id,
      feed_type: request?.feed_type,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateBookmarkResponse>
    >(
      'PATCH',
      '/feeds/v3/activities/{activity_id}/bookmarks',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateBookmarkResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addBookmark(
    request: AddBookmarkRequest & { activity_id: string },
  ): Promise<StreamResponse<AddBookmarkResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      folder_id: request?.folder_id,
      custom: request?.custom,
      new_folder: request?.new_folder,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddBookmarkResponse>
    >(
      'POST',
      '/feeds/v3/activities/{activity_id}/bookmarks',
      pathParams,
      undefined,
      body,
    );

    decoders.AddBookmarkResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addComment(
    request: AddCommentRequest & { activity_id: string },
  ): Promise<StreamResponse<AddCommentResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      comment: request?.comment,
      parent_id: request?.parent_id,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddCommentResponse>
    >(
      'POST',
      '/feeds/v3/activities/{activity_id}/comments',
      pathParams,
      undefined,
      body,
    );

    decoders.AddCommentResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteActivityReaction(request: {
    activity_id: string;
  }): Promise<StreamResponse<DeleteActivityReactionResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteActivityReactionResponse>
    >(
      'DELETE',
      '/feeds/v3/activities/{activity_id}/reactions',
      pathParams,
      undefined,
    );

    decoders.DeleteActivityReactionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addReaction(
    request: AddReactionRequest & { activity_id: string },
  ): Promise<StreamResponse<AddReactionResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      type: request?.type,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddReactionResponse>
    >(
      'POST',
      '/feeds/v3/activities/{activity_id}/reactions',
      pathParams,
      undefined,
      body,
    );

    decoders.AddReactionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryComments(
    request?: QueryCommentsRequest,
  ): Promise<StreamResponse<QueryCommentsResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      user_id: request?.user_id,
      activity_ids: request?.activity_ids,
      parent_ids: request?.parent_ids,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryCommentsResponse>
    >('POST', '/feeds/v3/comments/query', undefined, undefined, body);

    decoders.QueryCommentsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async removeComment(request: {
    comment_id: string;
  }): Promise<StreamResponse<RemoveCommentResponse>> {
    const pathParams = {
      comment_id: request?.comment_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<RemoveCommentResponse>
    >('DELETE', '/feeds/v3/comments/{comment_id}', pathParams, undefined);

    decoders.RemoveCommentResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateComment(
    request: UpdateCommentRequest & { comment_id: string },
  ): Promise<StreamResponse<UpdateCommentResponse>> {
    const pathParams = {
      comment_id: request?.comment_id,
    };
    const body = {
      comment: request?.comment,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateCommentResponse>
    >('PATCH', '/feeds/v3/comments/{comment_id}', pathParams, undefined, body);

    decoders.UpdateCommentResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteFeed(request: {
    feed_group_id: string;
    feed_id: string;
    hard_delete?: boolean;
  }): Promise<StreamResponse<DeleteFeedResponse>> {
    const queryParams = {
      hard_delete: request?.hard_delete,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteFeedResponse>
    >(
      'DELETE',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      queryParams,
    );

    decoders.DeleteFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateFeed(
    request: UpdateFeedRequest & { feed_group_id: string; feed_id: string },
  ): Promise<StreamResponse<UpdateFeedResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateFeedResponse>
    >(
      'PATCH',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getOrCreateFeed(
    request: GetOrCreateFeedRequest & {
      feed_group_id: string;
      feed_id: string;
      connection_id?: string;
    },
  ): Promise<StreamResponse<GetOrCreateFeedResponse>> {
    const queryParams = {
      connection_id: request?.connection_id,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      comment_limit: request?.comment_limit,
      comment_sort: request?.comment_sort,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      view: request?.view,
      watch: request?.watch,
      data: request?.data,
      external_ranking: request?.external_ranking,
      filter: request?.filter,
      follower_pagination: request?.follower_pagination,
      following_pagination: request?.following_pagination,
      member_pagination: request?.member_pagination,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetOrCreateFeedResponse>
    >(
      'POST',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      queryParams,
      body,
    );

    decoders.GetOrCreateFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async markActivity(
    request: MarkActivityRequest & { feed_group_id: string; feed_id: string },
  ): Promise<StreamResponse<Response>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      mark_all_read: request?.mark_all_read,
      mark_all_seen: request?.mark_all_seen,
      mark_read: request?.mark_read,
      mark_watched: request?.mark_watched,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'POST',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/mark/batch',
      pathParams,
      undefined,
      body,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async unpinActivity(request: {
    feed_group_id: string;
    feed_id: string;
    activity_id: string;
  }): Promise<StreamResponse<UnpinActivityResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UnpinActivityResponse>
    >(
      'DELETE',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/{activity_id}/pin',
      pathParams,
      undefined,
    );

    decoders.UnpinActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async pinActivity(
    request: PinActivityRequest & {
      feed_group_id: string;
      feed_id: string;
      activity_id: string;
    },
  ): Promise<StreamResponse<PinActivityResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
      activity_id: request?.activity_id,
    };
    const body = {};

    const response = await this.apiClient.sendRequest<
      StreamResponse<PinActivityResponse>
    >(
      'POST',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/{activity_id}/pin',
      pathParams,
      undefined,
      body,
    );

    decoders.PinActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateFeedMembers(
    request: UpdateFeedMembersRequest & {
      feed_group_id: string;
      feed_id: string;
    },
  ): Promise<StreamResponse<Response>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      operation: request?.operation,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      members: request?.members,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'PATCH',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}/members',
      pathParams,
      undefined,
      body,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async acceptFeedMember(
    request: AcceptFeedMemberRequest & {
      feed_id: string;
      feed_group_id: string;
    },
  ): Promise<StreamResponse<AcceptFeedMemberResponse>> {
    const pathParams = {
      feed_id: request?.feed_id,
      feed_group_id: request?.feed_group_id,
    };
    const body = {
      user_id: request?.user_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AcceptFeedMemberResponse>
    >(
      'POST',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}/members/accept',
      pathParams,
      undefined,
      body,
    );

    decoders.AcceptFeedMemberResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryFeedMembers(
    request: QueryFeedMembersRequest & {
      feed_group_id: string;
      feed_id: string;
    },
  ): Promise<StreamResponse<QueryFeedMembersResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryFeedMembersResponse>
    >(
      'POST',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}/members/query',
      pathParams,
      undefined,
      body,
    );

    decoders.QueryFeedMembersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async rejectFeedMember(
    request: RejectFeedMemberRequest & {
      feed_group_id: string;
      feed_id: string;
    },
  ): Promise<StreamResponse<RejectFeedMemberResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      user_id: request?.user_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<RejectFeedMemberResponse>
    >(
      'POST',
      '/feeds/v3/feed_groups/{feed_group_id}/feeds/{feed_id}/members/reject',
      pathParams,
      undefined,
      body,
    );

    decoders.RejectFeedMemberResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createManyFeeds(
    request: CreateManyFeedsRequest,
  ): Promise<StreamResponse<CreateManyFeedsResponse>> {
    const body = {
      feeds: request?.feeds,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<CreateManyFeedsResponse>
    >('POST', '/feeds/v3/feeds/batch', undefined, undefined, body);

    decoders.CreateManyFeedsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async feedsQueryFeeds(request?: {
    connection_id?: string;
  }): Promise<StreamResponse<QueryFeedsResponse>> {
    const queryParams = {
      connection_id: request?.connection_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryFeedsResponse>
    >('GET', '/feeds/v3/feeds/query', undefined, queryParams);

    decoders.QueryFeedsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getFollowSuggestions(): Promise<
    StreamResponse<FollowSuggestionsResponse>
  > {
    const response = await this.apiClient.sendRequest<
      StreamResponse<FollowSuggestionsResponse>
    >('GET', '/feeds/v3/follow_suggestions', undefined, undefined);

    decoders.FollowSuggestionsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateFollow(
    request?: UpdateFollowRequest,
  ): Promise<StreamResponse<UpdateFollowResponse>> {
    const body = {
      push_preference: request?.push_preference,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateFollowResponse>
    >('PATCH', '/feeds/v3/follows', undefined, undefined, body);

    decoders.UpdateFollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async follow(
    request: FollowRequest,
  ): Promise<StreamResponse<FollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      push_preference: request?.push_preference,
      request: request?.request,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<FollowResponse>
    >('POST', '/feeds/v3/follows', undefined, undefined, body);

    decoders.FollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async acceptFollow(
    request: AcceptFollowRequest,
  ): Promise<StreamResponse<AcceptFollowResponse>> {
    const body = {
      source_fid: request?.source_fid,
      target_fid: request?.target_fid,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AcceptFollowResponse>
    >('POST', '/feeds/v3/follows/accept', undefined, undefined, body);

    decoders.AcceptFollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async followMany(
    request: FollowManyRequest,
  ): Promise<StreamResponse<FollowManyResponse>> {
    const body = {
      follows: request?.follows,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<FollowManyResponse>
    >('POST', '/feeds/v3/follows/batch', undefined, undefined, body);

    decoders.FollowManyResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryFollows(
    request?: QueryFollowsRequest,
  ): Promise<StreamResponse<QueryFollowsResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryFollowsResponse>
    >('POST', '/feeds/v3/follows/query', undefined, undefined, body);

    decoders.QueryFollowsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async rejectFollow(
    request: RejectFollowRequest,
  ): Promise<StreamResponse<RejectFollowResponse>> {
    const body = {
      source_fid: request?.source_fid,
      target_fid: request?.target_fid,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<RejectFollowResponse>
    >('POST', '/feeds/v3/follows/reject', undefined, undefined, body);

    decoders.RejectFollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async unfollow(request: {
    source: string;
    target: string;
  }): Promise<StreamResponse<UnfollowResponse>> {
    const pathParams = {
      source: request?.source,
      target: request?.target,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UnfollowResponse>
    >('DELETE', '/feeds/v3/follows/{source}/{target}', pathParams, undefined);

    decoders.UnfollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }
}

import { ApiClient, StreamResponse } from '../../gen-imports';
import {
  AcceptFeedMemberInviteRequest,
  AcceptFeedMemberInviteResponse,
  AcceptFollowRequest,
  AcceptFollowResponse,
  ActivityFeedbackRequest,
  ActivityFeedbackResponse,
  AddActivityRequest,
  AddActivityResponse,
  AddBookmarkRequest,
  AddBookmarkResponse,
  AddCommentReactionRequest,
  AddCommentReactionResponse,
  AddCommentRequest,
  AddCommentResponse,
  AddCommentsBatchRequest,
  AddCommentsBatchResponse,
  AddReactionRequest,
  AddReactionResponse,
  BlockUsersRequest,
  BlockUsersResponse,
  CastPollVoteRequest,
  CreateBlockListRequest,
  CreateBlockListResponse,
  CreateDeviceRequest,
  CreateFeedsBatchRequest,
  CreateFeedsBatchResponse,
  CreateGuestRequest,
  CreateGuestResponse,
  CreatePollOptionRequest,
  CreatePollRequest,
  DeleteActivitiesRequest,
  DeleteActivitiesResponse,
  DeleteActivityReactionResponse,
  DeleteActivityResponse,
  DeleteBookmarkFolderResponse,
  DeleteBookmarkResponse,
  DeleteCommentReactionResponse,
  DeleteCommentResponse,
  DeleteFeedResponse,
  FileUploadRequest,
  FileUploadResponse,
  FollowBatchRequest,
  FollowBatchResponse,
  FollowRequest,
  GetActivityResponse,
  GetApplicationResponse,
  GetBlockedUsersResponse,
  GetCommentRepliesResponse,
  GetCommentResponse,
  GetCommentsResponse,
  GetFollowSuggestionsResponse,
  GetOGResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  ImageUploadRequest,
  ImageUploadResponse,
  ListBlockListResponse,
  ListDevicesResponse,
  MarkActivityRequest,
  PinActivityRequest,
  PinActivityResponse,
  PollOptionResponse,
  PollResponse,
  PollVoteResponse,
  PollVotesResponse,
  QueryActivitiesRequest,
  QueryActivitiesResponse,
  QueryActivityReactionsRequest,
  QueryActivityReactionsResponse,
  QueryBookmarkFoldersRequest,
  QueryBookmarkFoldersResponse,
  QueryBookmarksRequest,
  QueryBookmarksResponse,
  QueryCommentReactionsRequest,
  QueryCommentReactionsResponse,
  QueryCommentsRequest,
  QueryCommentsResponse,
  QueryFeedMembersRequest,
  QueryFeedMembersResponse,
  QueryFeedsRequest,
  QueryFeedsResponse,
  QueryFollowsRequest,
  QueryFollowsResponse,
  QueryPollVotesRequest,
  QueryPollsRequest,
  QueryPollsResponse,
  QueryUsersPayload,
  QueryUsersResponse,
  RejectFeedMemberInviteRequest,
  RejectFeedMemberInviteResponse,
  RejectFollowRequest,
  RejectFollowResponse,
  Response,
  SharedLocationResponse,
  SharedLocationsResponse,
  SingleFollowResponse,
  UnblockUsersRequest,
  UnblockUsersResponse,
  UnfollowResponse,
  UnpinActivityResponse,
  UpdateActivityPartialRequest,
  UpdateActivityPartialResponse,
  UpdateActivityRequest,
  UpdateActivityResponse,
  UpdateBlockListRequest,
  UpdateBlockListResponse,
  UpdateBookmarkFolderRequest,
  UpdateBookmarkFolderResponse,
  UpdateBookmarkRequest,
  UpdateBookmarkResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  UpdateFeedMembersRequest,
  UpdateFeedMembersResponse,
  UpdateFeedRequest,
  UpdateFeedResponse,
  UpdateFollowRequest,
  UpdateFollowResponse,
  UpdateLiveLocationRequest,
  UpdatePollOptionRequest,
  UpdatePollPartialRequest,
  UpdatePollRequest,
  UpdateUsersPartialRequest,
  UpdateUsersRequest,
  UpdateUsersResponse,
  UpsertActivitiesRequest,
  UpsertActivitiesResponse,
  UpsertPushPreferencesRequest,
  UpsertPushPreferencesResponse,
  WSAuthMessage,
} from '../models';
import { decoders } from '../model-decoders/decoders';

export class FeedsApi {
  constructor(public readonly apiClient: ApiClient) {}

  async getApp(): Promise<StreamResponse<GetApplicationResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<GetApplicationResponse>
    >('GET', '/api/v2/app', undefined, undefined);

    decoders.GetApplicationResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async listBlockLists(request?: {
    team?: string;
  }): Promise<StreamResponse<ListBlockListResponse>> {
    const queryParams = {
      team: request?.team,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<ListBlockListResponse>
    >('GET', '/api/v2/blocklists', undefined, queryParams);

    decoders.ListBlockListResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createBlockList(
    request: CreateBlockListRequest,
  ): Promise<StreamResponse<CreateBlockListResponse>> {
    const body = {
      name: request?.name,
      words: request?.words,
      team: request?.team,
      type: request?.type,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<CreateBlockListResponse>
    >(
      'POST',
      '/api/v2/blocklists',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.CreateBlockListResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteBlockList(request: {
    name: string;
    team?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      team: request?.team,
    };
    const pathParams = {
      name: request?.name,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/blocklists/{name}',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateBlockList(
    request: UpdateBlockListRequest & { name: string },
  ): Promise<StreamResponse<UpdateBlockListResponse>> {
    const pathParams = {
      name: request?.name,
    };
    const body = {
      team: request?.team,
      words: request?.words,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateBlockListResponse>
    >(
      'PUT',
      '/api/v2/blocklists/{name}',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateBlockListResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteDevice(request: {
    id: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/devices',
      undefined,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async listDevices(): Promise<StreamResponse<ListDevicesResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<ListDevicesResponse>
    >('GET', '/api/v2/devices', undefined, undefined);

    decoders.ListDevicesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createDevice(
    request: CreateDeviceRequest,
  ): Promise<StreamResponse<Response>> {
    const body = {
      id: request?.id,
      push_provider: request?.push_provider,
      push_provider_name: request?.push_provider_name,
      voip_token: request?.voip_token,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'POST',
      '/api/v2/devices',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addActivity(
    request: AddActivityRequest,
  ): Promise<StreamResponse<AddActivityResponse>> {
    const body = {
      type: request?.type,
      feeds: request?.feeds,
      expires_at: request?.expires_at,
      id: request?.id,
      parent_id: request?.parent_id,
      poll_id: request?.poll_id,
      text: request?.text,
      visibility: request?.visibility,
      visibility_tag: request?.visibility_tag,
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
    >(
      'POST',
      '/api/v2/feeds/activities',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.AddActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async upsertActivities(
    request: UpsertActivitiesRequest,
  ): Promise<StreamResponse<UpsertActivitiesResponse>> {
    const body = {
      activities: request?.activities,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpsertActivitiesResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/batch',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.UpsertActivitiesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteActivities(
    request: DeleteActivitiesRequest,
  ): Promise<StreamResponse<DeleteActivitiesResponse>> {
    const body = {
      ids: request?.ids,
      hard_delete: request?.hard_delete,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteActivitiesResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/delete',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.DeleteActivitiesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryActivities(
    request?: QueryActivitiesRequest,
  ): Promise<StreamResponse<QueryActivitiesResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryActivitiesResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/query',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryActivitiesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteBookmark(request: {
    activity_id: string;
    folder_id?: string;
  }): Promise<StreamResponse<DeleteBookmarkResponse>> {
    const queryParams = {
      folder_id: request?.folder_id,
    };
    const pathParams = {
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteBookmarkResponse>
    >(
      'DELETE',
      '/api/v2/feeds/activities/{activity_id}/bookmarks',
      pathParams,
      queryParams,
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
      folder_id: request?.folder_id,
      new_folder_id: request?.new_folder_id,
      custom: request?.custom,
      new_folder: request?.new_folder,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateBookmarkResponse>
    >(
      'PATCH',
      '/api/v2/feeds/activities/{activity_id}/bookmarks',
      pathParams,
      undefined,
      body,
      'application/json',
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
      '/api/v2/feeds/activities/{activity_id}/bookmarks',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.AddBookmarkResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async activityFeedback(
    request: ActivityFeedbackRequest & { activity_id: string },
  ): Promise<StreamResponse<ActivityFeedbackResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      hide: request?.hide,
      mute_user: request?.mute_user,
      reason: request?.reason,
      report: request?.report,
      show_less: request?.show_less,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<ActivityFeedbackResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/feedback',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.ActivityFeedbackResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async castPollVote(
    request: CastPollVoteRequest & { activity_id: string; poll_id: string },
  ): Promise<StreamResponse<PollVoteResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
      poll_id: request?.poll_id,
    };
    const body = {
      vote: request?.vote,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollVoteResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/polls/{poll_id}/vote',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.PollVoteResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deletePollVote(request: {
    activity_id: string;
    poll_id: string;
    vote_id: string;
    user_id?: string;
  }): Promise<StreamResponse<PollVoteResponse>> {
    const queryParams = {
      user_id: request?.user_id,
    };
    const pathParams = {
      activity_id: request?.activity_id,
      poll_id: request?.poll_id,
      vote_id: request?.vote_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollVoteResponse>
    >(
      'DELETE',
      '/api/v2/feeds/activities/{activity_id}/polls/{poll_id}/vote/{vote_id}',
      pathParams,
      queryParams,
    );

    decoders.PollVoteResponse?.(response.body);

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
      create_notification_activity: request?.create_notification_activity,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddReactionResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/reactions',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.AddReactionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryActivityReactions(
    request: QueryActivityReactionsRequest & { activity_id: string },
  ): Promise<StreamResponse<QueryActivityReactionsResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryActivityReactionsResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/reactions/query',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryActivityReactionsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteActivityReaction(request: {
    activity_id: string;
    type: string;
  }): Promise<StreamResponse<DeleteActivityReactionResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
      type: request?.type,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteActivityReactionResponse>
    >(
      'DELETE',
      '/api/v2/feeds/activities/{activity_id}/reactions/{type}',
      pathParams,
      undefined,
    );

    decoders.DeleteActivityReactionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteActivity(request: {
    id: string;
    hard_delete?: boolean;
  }): Promise<StreamResponse<DeleteActivityResponse>> {
    const queryParams = {
      hard_delete: request?.hard_delete,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteActivityResponse>
    >('DELETE', '/api/v2/feeds/activities/{id}', pathParams, queryParams);

    decoders.DeleteActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getActivity(request: {
    id: string;
  }): Promise<StreamResponse<GetActivityResponse>> {
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetActivityResponse>
    >('GET', '/api/v2/feeds/activities/{id}', pathParams, undefined);

    decoders.GetActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateActivityPartial(
    request: UpdateActivityPartialRequest & { id: string },
  ): Promise<StreamResponse<UpdateActivityPartialResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      unset: request?.unset,
      set: request?.set,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateActivityPartialResponse>
    >(
      'PATCH',
      '/api/v2/feeds/activities/{id}',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateActivityPartialResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateActivity(
    request: UpdateActivityRequest & { id: string },
  ): Promise<StreamResponse<UpdateActivityResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      expires_at: request?.expires_at,
      poll_id: request?.poll_id,
      text: request?.text,
      visibility: request?.visibility,
      attachments: request?.attachments,
      feeds: request?.feeds,
      filter_tags: request?.filter_tags,
      interest_tags: request?.interest_tags,
      custom: request?.custom,
      location: request?.location,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateActivityResponse>
    >(
      'PUT',
      '/api/v2/feeds/activities/{id}',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryBookmarkFolders(
    request?: QueryBookmarkFoldersRequest,
  ): Promise<StreamResponse<QueryBookmarkFoldersResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryBookmarkFoldersResponse>
    >(
      'POST',
      '/api/v2/feeds/bookmark_folders/query',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryBookmarkFoldersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteBookmarkFolder(request: {
    folder_id: string;
  }): Promise<StreamResponse<DeleteBookmarkFolderResponse>> {
    const pathParams = {
      folder_id: request?.folder_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteBookmarkFolderResponse>
    >(
      'DELETE',
      '/api/v2/feeds/bookmark_folders/{folder_id}',
      pathParams,
      undefined,
    );

    decoders.DeleteBookmarkFolderResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateBookmarkFolder(
    request: UpdateBookmarkFolderRequest & { folder_id: string },
  ): Promise<StreamResponse<UpdateBookmarkFolderResponse>> {
    const pathParams = {
      folder_id: request?.folder_id,
    };
    const body = {
      name: request?.name,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateBookmarkFolderResponse>
    >(
      'PATCH',
      '/api/v2/feeds/bookmark_folders/{folder_id}',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateBookmarkFolderResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryBookmarks(
    request?: QueryBookmarksRequest,
  ): Promise<StreamResponse<QueryBookmarksResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryBookmarksResponse>
    >(
      'POST',
      '/api/v2/feeds/bookmarks/query',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryBookmarksResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getComments(request: {
    object_id: string;
    object_type: string;
    depth?: number;
    sort?: string;
    replies_limit?: number;
    limit?: number;
    prev?: string;
    next?: string;
  }): Promise<StreamResponse<GetCommentsResponse>> {
    const queryParams = {
      object_id: request?.object_id,
      object_type: request?.object_type,
      depth: request?.depth,
      sort: request?.sort,
      replies_limit: request?.replies_limit,
      limit: request?.limit,
      prev: request?.prev,
      next: request?.next,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetCommentsResponse>
    >('GET', '/api/v2/feeds/comments', undefined, queryParams);

    decoders.GetCommentsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addComment(
    request: AddCommentRequest,
  ): Promise<StreamResponse<AddCommentResponse>> {
    const body = {
      comment: request?.comment,
      object_id: request?.object_id,
      object_type: request?.object_type,
      create_notification_activity: request?.create_notification_activity,
      parent_id: request?.parent_id,
      skip_push: request?.skip_push,
      attachments: request?.attachments,
      mentioned_user_ids: request?.mentioned_user_ids,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddCommentResponse>
    >(
      'POST',
      '/api/v2/feeds/comments',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.AddCommentResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addCommentsBatch(
    request: AddCommentsBatchRequest,
  ): Promise<StreamResponse<AddCommentsBatchResponse>> {
    const body = {
      comments: request?.comments,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddCommentsBatchResponse>
    >(
      'POST',
      '/api/v2/feeds/comments/batch',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.AddCommentsBatchResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryComments(
    request: QueryCommentsRequest,
  ): Promise<StreamResponse<QueryCommentsResponse>> {
    const body = {
      filter: request?.filter,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryCommentsResponse>
    >(
      'POST',
      '/api/v2/feeds/comments/query',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryCommentsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteComment(request: {
    id: string;
    hard_delete?: boolean;
  }): Promise<StreamResponse<DeleteCommentResponse>> {
    const queryParams = {
      hard_delete: request?.hard_delete,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteCommentResponse>
    >('DELETE', '/api/v2/feeds/comments/{id}', pathParams, queryParams);

    decoders.DeleteCommentResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getComment(request: {
    id: string;
  }): Promise<StreamResponse<GetCommentResponse>> {
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetCommentResponse>
    >('GET', '/api/v2/feeds/comments/{id}', pathParams, undefined);

    decoders.GetCommentResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateComment(
    request: UpdateCommentRequest & { id: string },
  ): Promise<StreamResponse<UpdateCommentResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      comment: request?.comment,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateCommentResponse>
    >(
      'PATCH',
      '/api/v2/feeds/comments/{id}',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateCommentResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addCommentReaction(
    request: AddCommentReactionRequest & { id: string },
  ): Promise<StreamResponse<AddCommentReactionResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      type: request?.type,
      create_notification_activity: request?.create_notification_activity,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddCommentReactionResponse>
    >(
      'POST',
      '/api/v2/feeds/comments/{id}/reactions',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.AddCommentReactionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryCommentReactions(
    request: QueryCommentReactionsRequest & { id: string },
  ): Promise<StreamResponse<QueryCommentReactionsResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryCommentReactionsResponse>
    >(
      'POST',
      '/api/v2/feeds/comments/{id}/reactions/query',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryCommentReactionsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteCommentReaction(request: {
    id: string;
    type: string;
  }): Promise<StreamResponse<DeleteCommentReactionResponse>> {
    const pathParams = {
      id: request?.id,
      type: request?.type,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteCommentReactionResponse>
    >(
      'DELETE',
      '/api/v2/feeds/comments/{id}/reactions/{type}',
      pathParams,
      undefined,
    );

    decoders.DeleteCommentReactionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getCommentReplies(request: {
    id: string;
    depth?: number;
    sort?: string;
    replies_limit?: number;
    limit?: number;
    prev?: string;
    next?: string;
  }): Promise<StreamResponse<GetCommentRepliesResponse>> {
    const queryParams = {
      depth: request?.depth,
      sort: request?.sort,
      replies_limit: request?.replies_limit,
      limit: request?.limit,
      prev: request?.prev,
      next: request?.next,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetCommentRepliesResponse>
    >('GET', '/api/v2/feeds/comments/{id}/replies', pathParams, queryParams);

    decoders.GetCommentRepliesResponse?.(response.body);

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
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      queryParams,
    );

    decoders.DeleteFeedResponse?.(response.body);

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
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      view: request?.view,
      watch: request?.watch,
      activity_selector_options: request?.activity_selector_options,
      data: request?.data,
      external_ranking: request?.external_ranking,
      filter: request?.filter,
      followers_pagination: request?.followers_pagination,
      following_pagination: request?.following_pagination,
      interest_weights: request?.interest_weights,
      member_pagination: request?.member_pagination,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetOrCreateFeedResponse>
    >(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      queryParams,
      body,
      'application/json',
    );

    decoders.GetOrCreateFeedResponse?.(response.body);

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
      'PUT',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateFeedResponse?.(response.body);

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
      mark_seen: request?.mark_seen,
      mark_watched: request?.mark_watched,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/mark/batch',
      pathParams,
      undefined,
      body,
      'application/json',
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
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/{activity_id}/pin',
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
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/{activity_id}/pin',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.PinActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateFeedMembers(
    request: UpdateFeedMembersRequest & {
      feed_group_id: string;
      feed_id: string;
    },
  ): Promise<StreamResponse<UpdateFeedMembersResponse>> {
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

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateFeedMembersResponse>
    >(
      'PATCH',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateFeedMembersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async acceptFeedMemberInvite(
    request: AcceptFeedMemberInviteRequest & {
      feed_id: string;
      feed_group_id: string;
    },
  ): Promise<StreamResponse<AcceptFeedMemberInviteResponse>> {
    const pathParams = {
      feed_id: request?.feed_id,
      feed_group_id: request?.feed_group_id,
    };
    const body = {};

    const response = await this.apiClient.sendRequest<
      StreamResponse<AcceptFeedMemberInviteResponse>
    >(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members/accept',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.AcceptFeedMemberInviteResponse?.(response.body);

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
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members/query',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryFeedMembersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async rejectFeedMemberInvite(
    request: RejectFeedMemberInviteRequest & {
      feed_group_id: string;
      feed_id: string;
    },
  ): Promise<StreamResponse<RejectFeedMemberInviteResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {};

    const response = await this.apiClient.sendRequest<
      StreamResponse<RejectFeedMemberInviteResponse>
    >(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members/reject',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.RejectFeedMemberInviteResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async stopWatchingFeed(request: {
    feed_group_id: string;
    feed_id: string;
    connection_id?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      connection_id: request?.connection_id,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/watch',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getFollowSuggestions(request: {
    feed_group_id: string;
    limit?: number;
  }): Promise<StreamResponse<GetFollowSuggestionsResponse>> {
    const queryParams = {
      limit: request?.limit,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetFollowSuggestionsResponse>
    >(
      'GET',
      '/api/v2/feeds/feed_groups/{feed_group_id}/follow_suggestions',
      pathParams,
      queryParams,
    );

    decoders.GetFollowSuggestionsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createFeedsBatch(
    request: CreateFeedsBatchRequest,
  ): Promise<StreamResponse<CreateFeedsBatchResponse>> {
    const body = {
      feeds: request?.feeds,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<CreateFeedsBatchResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/batch',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.CreateFeedsBatchResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  protected async _queryFeeds(
    request?: QueryFeedsRequest & { connection_id?: string },
  ): Promise<StreamResponse<QueryFeedsResponse>> {
    const queryParams = {
      connection_id: request?.connection_id,
    };
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      watch: request?.watch,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryFeedsResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/query',
      undefined,
      queryParams,
      body,
      'application/json',
    );

    decoders.QueryFeedsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateFollow(
    request: UpdateFollowRequest,
  ): Promise<StreamResponse<UpdateFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      create_notification_activity: request?.create_notification_activity,
      follower_role: request?.follower_role,
      push_preference: request?.push_preference,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateFollowResponse>
    >(
      'PATCH',
      '/api/v2/feeds/follows',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.UpdateFollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async follow(
    request: FollowRequest,
  ): Promise<StreamResponse<SingleFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      create_notification_activity: request?.create_notification_activity,
      push_preference: request?.push_preference,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<SingleFollowResponse>
    >(
      'POST',
      '/api/v2/feeds/follows',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.SingleFollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async acceptFollow(
    request: AcceptFollowRequest,
  ): Promise<StreamResponse<AcceptFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      follower_role: request?.follower_role,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AcceptFollowResponse>
    >(
      'POST',
      '/api/v2/feeds/follows/accept',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.AcceptFollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async followBatch(
    request: FollowBatchRequest,
  ): Promise<StreamResponse<FollowBatchResponse>> {
    const body = {
      follows: request?.follows,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<FollowBatchResponse>
    >(
      'POST',
      '/api/v2/feeds/follows/batch',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.FollowBatchResponse?.(response.body);

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
    >(
      'POST',
      '/api/v2/feeds/follows/query',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryFollowsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async rejectFollow(
    request: RejectFollowRequest,
  ): Promise<StreamResponse<RejectFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<RejectFollowResponse>
    >(
      'POST',
      '/api/v2/feeds/follows/reject',
      undefined,
      undefined,
      body,
      'application/json',
    );

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
    >(
      'DELETE',
      '/api/v2/feeds/follows/{source}/{target}',
      pathParams,
      undefined,
    );

    decoders.UnfollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createGuest(
    request: CreateGuestRequest,
  ): Promise<StreamResponse<CreateGuestResponse>> {
    const body = {
      user: request?.user,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<CreateGuestResponse>
    >('POST', '/api/v2/guest', undefined, undefined, body, 'application/json');

    decoders.CreateGuestResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async longPoll(request?: {
    connection_id?: string;
    json?: WSAuthMessage;
  }): Promise<StreamResponse<{}>> {
    const queryParams = {
      connection_id: request?.connection_id,
      json: request?.json,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<{}>>(
      'GET',
      '/api/v2/longpoll',
      undefined,
      queryParams,
    );

    decoders['{}']?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getOG(request: {
    url: string;
  }): Promise<StreamResponse<GetOGResponse>> {
    const queryParams = {
      url: request?.url,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetOGResponse>
    >('GET', '/api/v2/og', undefined, queryParams);

    decoders.GetOGResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createPoll(
    request: CreatePollRequest,
  ): Promise<StreamResponse<PollResponse>> {
    const body = {
      name: request?.name,
      allow_answers: request?.allow_answers,
      allow_user_suggested_options: request?.allow_user_suggested_options,
      description: request?.description,
      enforce_unique_vote: request?.enforce_unique_vote,
      id: request?.id,
      is_closed: request?.is_closed,
      max_votes_allowed: request?.max_votes_allowed,
      voting_visibility: request?.voting_visibility,
      options: request?.options,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollResponse>
    >('POST', '/api/v2/polls', undefined, undefined, body, 'application/json');

    decoders.PollResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updatePoll(
    request: UpdatePollRequest,
  ): Promise<StreamResponse<PollResponse>> {
    const body = {
      id: request?.id,
      name: request?.name,
      allow_answers: request?.allow_answers,
      allow_user_suggested_options: request?.allow_user_suggested_options,
      description: request?.description,
      enforce_unique_vote: request?.enforce_unique_vote,
      is_closed: request?.is_closed,
      max_votes_allowed: request?.max_votes_allowed,
      voting_visibility: request?.voting_visibility,
      options: request?.options,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollResponse>
    >('PUT', '/api/v2/polls', undefined, undefined, body, 'application/json');

    decoders.PollResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryPolls(
    request?: QueryPollsRequest & { user_id?: string },
  ): Promise<StreamResponse<QueryPollsResponse>> {
    const queryParams = {
      user_id: request?.user_id,
    };
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryPollsResponse>
    >(
      'POST',
      '/api/v2/polls/query',
      undefined,
      queryParams,
      body,
      'application/json',
    );

    decoders.QueryPollsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deletePoll(request: {
    poll_id: string;
    user_id?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      user_id: request?.user_id,
    };
    const pathParams = {
      poll_id: request?.poll_id,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/polls/{poll_id}',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getPoll(request: {
    poll_id: string;
    user_id?: string;
  }): Promise<StreamResponse<PollResponse>> {
    const queryParams = {
      user_id: request?.user_id,
    };
    const pathParams = {
      poll_id: request?.poll_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollResponse>
    >('GET', '/api/v2/polls/{poll_id}', pathParams, queryParams);

    decoders.PollResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updatePollPartial(
    request: UpdatePollPartialRequest & { poll_id: string },
  ): Promise<StreamResponse<PollResponse>> {
    const pathParams = {
      poll_id: request?.poll_id,
    };
    const body = {
      unset: request?.unset,
      set: request?.set,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollResponse>
    >(
      'PATCH',
      '/api/v2/polls/{poll_id}',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.PollResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createPollOption(
    request: CreatePollOptionRequest & { poll_id: string },
  ): Promise<StreamResponse<PollOptionResponse>> {
    const pathParams = {
      poll_id: request?.poll_id,
    };
    const body = {
      text: request?.text,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollOptionResponse>
    >(
      'POST',
      '/api/v2/polls/{poll_id}/options',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.PollOptionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updatePollOption(
    request: UpdatePollOptionRequest & { poll_id: string },
  ): Promise<StreamResponse<PollOptionResponse>> {
    const pathParams = {
      poll_id: request?.poll_id,
    };
    const body = {
      id: request?.id,
      text: request?.text,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollOptionResponse>
    >(
      'PUT',
      '/api/v2/polls/{poll_id}/options',
      pathParams,
      undefined,
      body,
      'application/json',
    );

    decoders.PollOptionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deletePollOption(request: {
    poll_id: string;
    option_id: string;
    user_id?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      user_id: request?.user_id,
    };
    const pathParams = {
      poll_id: request?.poll_id,
      option_id: request?.option_id,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/polls/{poll_id}/options/{option_id}',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getPollOption(request: {
    poll_id: string;
    option_id: string;
    user_id?: string;
  }): Promise<StreamResponse<PollOptionResponse>> {
    const queryParams = {
      user_id: request?.user_id,
    };
    const pathParams = {
      poll_id: request?.poll_id,
      option_id: request?.option_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollOptionResponse>
    >(
      'GET',
      '/api/v2/polls/{poll_id}/options/{option_id}',
      pathParams,
      queryParams,
    );

    decoders.PollOptionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryPollVotes(
    request: QueryPollVotesRequest & { poll_id: string; user_id?: string },
  ): Promise<StreamResponse<PollVotesResponse>> {
    const queryParams = {
      user_id: request?.user_id,
    };
    const pathParams = {
      poll_id: request?.poll_id,
    };
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<PollVotesResponse>
    >(
      'POST',
      '/api/v2/polls/{poll_id}/votes',
      pathParams,
      queryParams,
      body,
      'application/json',
    );

    decoders.PollVotesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updatePushNotificationPreferences(
    request: UpsertPushPreferencesRequest,
  ): Promise<StreamResponse<UpsertPushPreferencesResponse>> {
    const body = {
      preferences: request?.preferences,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpsertPushPreferencesResponse>
    >(
      'POST',
      '/api/v2/push_preferences',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.UpsertPushPreferencesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteFile(request?: {
    url?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      url: request?.url,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/uploads/file',
      undefined,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async uploadFile(
    request?: FileUploadRequest,
  ): Promise<StreamResponse<FileUploadResponse>> {
    const body = {
      file: request?.file,
      user: request?.user,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<FileUploadResponse>
    >(
      'POST',
      '/api/v2/uploads/file',
      undefined,
      undefined,
      body,
      'multipart/form-data',
    );

    decoders.FileUploadResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteImage(request?: {
    url?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      url: request?.url,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/uploads/image',
      undefined,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async uploadImage(
    request?: ImageUploadRequest,
  ): Promise<StreamResponse<ImageUploadResponse>> {
    const body = {
      file: request?.file,
      upload_sizes: request?.upload_sizes,
      user: request?.user,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<ImageUploadResponse>
    >(
      'POST',
      '/api/v2/uploads/image',
      undefined,
      undefined,
      body,
      'multipart/form-data',
    );

    decoders.ImageUploadResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryUsers(request?: {
    payload?: QueryUsersPayload;
  }): Promise<StreamResponse<QueryUsersResponse>> {
    const queryParams = {
      payload: request?.payload,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryUsersResponse>
    >('GET', '/api/v2/users', undefined, queryParams);

    decoders.QueryUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateUsersPartial(
    request: UpdateUsersPartialRequest,
  ): Promise<StreamResponse<UpdateUsersResponse>> {
    const body = {
      users: request?.users,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateUsersResponse>
    >('PATCH', '/api/v2/users', undefined, undefined, body, 'application/json');

    decoders.UpdateUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateUsers(
    request: UpdateUsersRequest,
  ): Promise<StreamResponse<UpdateUsersResponse>> {
    const body = {
      users: request?.users,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateUsersResponse>
    >('POST', '/api/v2/users', undefined, undefined, body, 'application/json');

    decoders.UpdateUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getBlockedUsers(): Promise<StreamResponse<GetBlockedUsersResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<GetBlockedUsersResponse>
    >('GET', '/api/v2/users/block', undefined, undefined);

    decoders.GetBlockedUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async blockUsers(
    request: BlockUsersRequest,
  ): Promise<StreamResponse<BlockUsersResponse>> {
    const body = {
      blocked_user_id: request?.blocked_user_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<BlockUsersResponse>
    >(
      'POST',
      '/api/v2/users/block',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.BlockUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getUserLiveLocations(): Promise<
    StreamResponse<SharedLocationsResponse>
  > {
    const response = await this.apiClient.sendRequest<
      StreamResponse<SharedLocationsResponse>
    >('GET', '/api/v2/users/live_locations', undefined, undefined);

    decoders.SharedLocationsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateLiveLocation(
    request: UpdateLiveLocationRequest,
  ): Promise<StreamResponse<SharedLocationResponse>> {
    const body = {
      message_id: request?.message_id,
      end_at: request?.end_at,
      latitude: request?.latitude,
      longitude: request?.longitude,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<SharedLocationResponse>
    >(
      'PUT',
      '/api/v2/users/live_locations',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.SharedLocationResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async unblockUsers(
    request: UnblockUsersRequest,
  ): Promise<StreamResponse<UnblockUsersResponse>> {
    const body = {
      blocked_user_id: request?.blocked_user_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UnblockUsersResponse>
    >(
      'POST',
      '/api/v2/users/unblock',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.UnblockUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }
}

import type { ApiClient, StreamResponse } from '../../gen-imports';
import type {
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
  AddCommentBookmarkRequest,
  AddCommentBookmarkResponse,
  AddCommentReactionRequest,
  AddCommentReactionResponse,
  AddCommentRequest,
  AddCommentResponse,
  AddCommentsBatchRequest,
  AddCommentsBatchResponse,
  AddReactionRequest,
  AddReactionResponse,
  AddUserGroupMembersRequest,
  AddUserGroupMembersResponse,
  BatchQueryActivityReactionsRequest,
  BatchQueryActivityReactionsResponse,
  BatchQueryCommentReactionsRequest,
  BatchQueryCommentReactionsResponse,
  BlockUsersRequest,
  BlockUsersResponse,
  CastPollVoteRequest,
  ChangeFeedVisibilityRequest,
  ChangeFeedVisibilityResponse,
  CreateBlockListRequest,
  CreateBlockListResponse,
  CreateCollectionsRequest,
  CreateCollectionsResponse,
  CreateDeviceRequest,
  CreateFeedsBatchRequest,
  CreateFeedsBatchResponse,
  CreateGuestRequest,
  CreateGuestResponse,
  CreatePollOptionRequest,
  CreatePollRequest,
  CreateUserGroupRequest,
  CreateUserGroupResponse,
  DeleteActivitiesRequest,
  DeleteActivitiesResponse,
  DeleteActivityReactionResponse,
  DeleteActivityResponse,
  DeleteBookmarkFolderResponse,
  DeleteBookmarkResponse,
  DeleteCollectionsResponse,
  DeleteCommentBookmarkResponse,
  DeleteCommentReactionResponse,
  DeleteCommentResponse,
  DeleteFeedResponse,
  DeleteUserInterestsResponse,
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
  GetFeedCountsResponse,
  GetFollowSuggestionsResponse,
  GetOGResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  GetOrCreateFollowResponse,
  GetOrCreateUnfollowRequest,
  GetOrCreateUnfollowResponse,
  GetUserGroupResponse,
  GetUserInterestsResponse,
  ImageUploadRequest,
  ImageUploadResponse,
  ImportBlockListRequest,
  ImportBlockListResponse,
  ListBlockListResponse,
  ListDevicesResponse,
  ListUserGroupsResponse,
  MarkActivityRequest,
  OwnBatchRequest,
  OwnBatchResponse,
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
  QueryActivitySharesResponse,
  QueryBookmarkFoldersRequest,
  QueryBookmarkFoldersResponse,
  QueryBookmarksRequest,
  QueryBookmarksResponse,
  QueryCollectionsRequest,
  QueryCollectionsResponse,
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
  QueryPinnedActivitiesRequest,
  QueryPinnedActivitiesResponse,
  QueryPollVotesRequest,
  QueryPollsRequest,
  QueryPollsResponse,
  QueryUsersPayload,
  QueryUsersResponse,
  ReadCollectionsResponse,
  RejectFeedMemberInviteRequest,
  RejectFeedMemberInviteResponse,
  RejectFollowRequest,
  RejectFollowResponse,
  RemoveUserGroupMembersRequest,
  RemoveUserGroupMembersResponse,
  Response,
  RestoreActivityRequest,
  RestoreActivityResponse,
  RestoreCommentRequest,
  RestoreCommentResponse,
  SearchRolesResponse,
  SearchUserGroupsResponse,
  SharedLocationResponse,
  SharedLocationsResponse,
  SingleFollowResponse,
  TrackActivityMetricsRequest,
  TrackActivityMetricsResponse,
  TranslateActivityRequest,
  TranslateActivityResponse,
  TranslateCommentRequest,
  TranslateCommentResponse,
  UnblockUsersRequest,
  UnblockUsersResponse,
  UnfollowBatchRequest,
  UnfollowBatchResponse,
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
  UpdateCollectionsRequest,
  UpdateCollectionsResponse,
  UpdateCommentBookmarkRequest,
  UpdateCommentBookmarkResponse,
  UpdateCommentPartialRequest,
  UpdateCommentPartialResponse,
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
  UpdateUserGroupRequest,
  UpdateUserGroupResponse,
  UpdateUsersPartialRequest,
  UpdateUsersRequest,
  UpdateUsersResponse,
  UpsertActivitiesRequest,
  UpsertActivitiesResponse,
  UpsertPushPreferencesRequest,
  UpsertPushPreferencesResponse,
  UpsertUserInterestsRequest,
  UpsertUserInterestsResponse,
  WSAuthMessage,
} from '../models';
import { decoders } from '../model-decoders/decoders';

export class FeedsApi {
  constructor(public readonly apiClient: ApiClient) {}

  async getApp(): Promise<StreamResponse<GetApplicationResponse>> {
    const response = await this.apiClient.sendRequest<GetApplicationResponse>(
      'GET',
      '/api/v2/app',
      undefined,
      undefined,
    );

    decoders.GetApplicationResponse?.(response);

    return response;
  }

  async listBlockLists(request?: {
    team?: string;
    cursor?: string;
    limit?: number;
  }): Promise<StreamResponse<ListBlockListResponse>> {
    const queryParams = {
      team: request?.team,
      cursor: request?.cursor,
      limit: request?.limit,
    };

    const response = await this.apiClient.sendRequest<ListBlockListResponse>(
      'GET',
      '/api/v2/blocklists',
      undefined,
      queryParams,
    );

    decoders.ListBlockListResponse?.(response);

    return response;
  }

  async createBlockList(
    request: CreateBlockListRequest,
  ): Promise<StreamResponse<CreateBlockListResponse>> {
    const body = {
      name: request?.name,
      words: request?.words,
      is_confusable_folding_enabled: request?.is_confusable_folding_enabled,
      is_leet_check_enabled: request?.is_leet_check_enabled,
      is_plural_check_enabled: request?.is_plural_check_enabled,
      is_substring_matching_enabled: request?.is_substring_matching_enabled,
      team: request?.team,
      type: request?.type,
    };

    const response = await this.apiClient.sendRequest<CreateBlockListResponse>(
      'POST',
      '/api/v2/blocklists',
      undefined,
      undefined,
      body,
    );

    decoders.CreateBlockListResponse?.(response);

    return response;
  }

  async importBlockList(
    request: ImportBlockListRequest & { id: string },
  ): Promise<StreamResponse<ImportBlockListResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      items: request?.items,
      chunk_size: request?.chunk_size,
    };

    const response = await this.apiClient.sendRequest<ImportBlockListResponse>(
      'POST',
      '/api/v2/blocklists/{id}/import',
      pathParams,
      undefined,
      body,
    );

    decoders.ImportBlockListResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/blocklists/{name}',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response);

    return response;
  }

  async updateBlockList(
    request: UpdateBlockListRequest & { name: string },
  ): Promise<StreamResponse<UpdateBlockListResponse>> {
    const pathParams = {
      name: request?.name,
    };
    const body = {
      is_confusable_folding_enabled: request?.is_confusable_folding_enabled,
      is_leet_check_enabled: request?.is_leet_check_enabled,
      is_plural_check_enabled: request?.is_plural_check_enabled,
      is_substring_matching_enabled: request?.is_substring_matching_enabled,
      team: request?.team,
      words: request?.words,
    };

    const response = await this.apiClient.sendRequest<UpdateBlockListResponse>(
      'PUT',
      '/api/v2/blocklists/{name}',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateBlockListResponse?.(response);

    return response;
  }

  async deleteDevice(request: {
    id: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/devices',
      undefined,
      queryParams,
    );

    decoders.Response?.(response);

    return response;
  }

  async listDevices(): Promise<StreamResponse<ListDevicesResponse>> {
    const response = await this.apiClient.sendRequest<ListDevicesResponse>(
      'GET',
      '/api/v2/devices',
      undefined,
      undefined,
    );

    decoders.ListDevicesResponse?.(response);

    return response;
  }

  async createDevice(
    request: CreateDeviceRequest,
  ): Promise<StreamResponse<Response>> {
    const body = {
      id: request?.id,
      push_provider: request?.push_provider,
      hardware_id: request?.hardware_id,
      push_provider_name: request?.push_provider_name,
      voip_token: request?.voip_token,
    };

    const response = await this.apiClient.sendRequest<Response>(
      'POST',
      '/api/v2/devices',
      undefined,
      undefined,
      body,
    );

    decoders.Response?.(response);

    return response;
  }

  async addActivity(
    request: AddActivityRequest,
  ): Promise<StreamResponse<AddActivityResponse>> {
    const body = {
      type: request?.type,
      feeds: request?.feeds,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      create_notification_activity: request?.create_notification_activity,
      enrich_own_fields: request?.enrich_own_fields,
      expires_at: request?.expires_at,
      id: request?.id,
      parent_id: request?.parent_id,
      poll_id: request?.poll_id,
      restrict_replies: request?.restrict_replies,
      skip_enrich_url: request?.skip_enrich_url,
      skip_push: request?.skip_push,
      text: request?.text,
      visibility: request?.visibility,
      visibility_tag: request?.visibility_tag,
      attachments: request?.attachments,
      collection_refs: request?.collection_refs,
      collections: request?.collections,
      filter_tags: request?.filter_tags,
      interest_tags: request?.interest_tags,
      mentioned_user_ids: request?.mentioned_user_ids,
      custom: request?.custom,
      location: request?.location,
      search_data: request?.search_data,
    };

    const response = await this.apiClient.sendRequest<AddActivityResponse>(
      'POST',
      '/api/v2/feeds/activities',
      undefined,
      undefined,
      body,
    );

    decoders.AddActivityResponse?.(response);

    return response;
  }

  async upsertActivities(
    request: UpsertActivitiesRequest,
  ): Promise<StreamResponse<UpsertActivitiesResponse>> {
    const body = {
      activities: request?.activities,
      enrich_own_fields: request?.enrich_own_fields,
    };

    const response = await this.apiClient.sendRequest<UpsertActivitiesResponse>(
      'POST',
      '/api/v2/feeds/activities/batch',
      undefined,
      undefined,
      body,
    );

    decoders.UpsertActivitiesResponse?.(response);

    return response;
  }

  async deleteActivities(
    request: DeleteActivitiesRequest,
  ): Promise<StreamResponse<DeleteActivitiesResponse>> {
    const body = {
      ids: request?.ids,
      delete_notification_activity: request?.delete_notification_activity,
      hard_delete: request?.hard_delete,
    };

    const response = await this.apiClient.sendRequest<DeleteActivitiesResponse>(
      'POST',
      '/api/v2/feeds/activities/delete',
      undefined,
      undefined,
      body,
    );

    decoders.DeleteActivitiesResponse?.(response);

    return response;
  }

  async trackActivityMetrics(
    request: TrackActivityMetricsRequest,
  ): Promise<StreamResponse<TrackActivityMetricsResponse>> {
    const body = {
      events: request?.events,
    };

    const response =
      await this.apiClient.sendRequest<TrackActivityMetricsResponse>(
        'POST',
        '/api/v2/feeds/activities/metrics/track',
        undefined,
        undefined,
        body,
      );

    decoders.TrackActivityMetricsResponse?.(response);

    return response;
  }

  async queryActivities(
    request?: QueryActivitiesRequest & {
      language?: string;
      translate_text?: boolean;
    },
  ): Promise<StreamResponse<QueryActivitiesResponse>> {
    const queryParams = {
      language: request?.language,
      translate_text: request?.translate_text,
    };
    const body = {
      enrich_own_fields: request?.enrich_own_fields,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<QueryActivitiesResponse>(
      'POST',
      '/api/v2/feeds/activities/query',
      undefined,
      queryParams,
      body,
    );

    decoders.QueryActivitiesResponse?.(response);

    return response;
  }

  async batchQueryActivityReactions(
    request: BatchQueryActivityReactionsRequest,
  ): Promise<StreamResponse<BatchQueryActivityReactionsResponse>> {
    const body = {
      activity_ids: request?.activity_ids,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response =
      await this.apiClient.sendRequest<BatchQueryActivityReactionsResponse>(
        'POST',
        '/api/v2/feeds/activities/reactions/query',
        undefined,
        undefined,
        body,
      );

    decoders.BatchQueryActivityReactionsResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<DeleteBookmarkResponse>(
      'DELETE',
      '/api/v2/feeds/activities/{activity_id}/bookmarks',
      pathParams,
      queryParams,
    );

    decoders.DeleteBookmarkResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<UpdateBookmarkResponse>(
      'PATCH',
      '/api/v2/feeds/activities/{activity_id}/bookmarks',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateBookmarkResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<AddBookmarkResponse>(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/bookmarks',
      pathParams,
      undefined,
      body,
    );

    decoders.AddBookmarkResponse?.(response);

    return response;
  }

  async activityFeedback(
    request: ActivityFeedbackRequest & { activity_id: string },
  ): Promise<StreamResponse<ActivityFeedbackResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      hide: request?.hide,
      show_less: request?.show_less,
      show_more: request?.show_more,
    };

    const response = await this.apiClient.sendRequest<ActivityFeedbackResponse>(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/feedback',
      pathParams,
      undefined,
      body,
    );

    decoders.ActivityFeedbackResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<PollVoteResponse>(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/polls/{poll_id}/vote',
      pathParams,
      undefined,
      body,
    );

    decoders.PollVoteResponse?.(response);

    return response;
  }

  async deletePollVote(request: {
    activity_id: string;
    poll_id: string;
    vote_id: string;
  }): Promise<StreamResponse<PollVoteResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
      poll_id: request?.poll_id,
      vote_id: request?.vote_id,
    };

    const response = await this.apiClient.sendRequest<PollVoteResponse>(
      'DELETE',
      '/api/v2/feeds/activities/{activity_id}/polls/{poll_id}/vote/{vote_id}',
      pathParams,
      undefined,
    );

    decoders.PollVoteResponse?.(response);

    return response;
  }

  async addActivityReaction(
    request: AddReactionRequest & { activity_id: string },
  ): Promise<StreamResponse<AddReactionResponse>> {
    const pathParams = {
      activity_id: request?.activity_id,
    };
    const body = {
      type: request?.type,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      create_notification_activity: request?.create_notification_activity,
      enforce_unique: request?.enforce_unique,
      skip_push: request?.skip_push,
      target_feeds: request?.target_feeds,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<AddReactionResponse>(
      'POST',
      '/api/v2/feeds/activities/{activity_id}/reactions',
      pathParams,
      undefined,
      body,
    );

    decoders.AddReactionResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<QueryActivityReactionsResponse>(
        'POST',
        '/api/v2/feeds/activities/{activity_id}/reactions/query',
        pathParams,
        undefined,
        body,
      );

    decoders.QueryActivityReactionsResponse?.(response);

    return response;
  }

  async deleteActivityReaction(request: {
    activity_id: string;
    type: string;
    delete_notification_activity?: boolean;
  }): Promise<StreamResponse<DeleteActivityReactionResponse>> {
    const queryParams = {
      delete_notification_activity: request?.delete_notification_activity,
    };
    const pathParams = {
      activity_id: request?.activity_id,
      type: request?.type,
    };

    const response =
      await this.apiClient.sendRequest<DeleteActivityReactionResponse>(
        'DELETE',
        '/api/v2/feeds/activities/{activity_id}/reactions/{type}',
        pathParams,
        queryParams,
      );

    decoders.DeleteActivityReactionResponse?.(response);

    return response;
  }

  async queryActivityShares(request: {
    activity_id: string;
    limit?: number;
    prev?: string;
    next?: string;
  }): Promise<StreamResponse<QueryActivitySharesResponse>> {
    const queryParams = {
      limit: request?.limit,
      prev: request?.prev,
      next: request?.next,
    };
    const pathParams = {
      activity_id: request?.activity_id,
    };

    const response =
      await this.apiClient.sendRequest<QueryActivitySharesResponse>(
        'GET',
        '/api/v2/feeds/activities/{activity_id}/shares',
        pathParams,
        queryParams,
      );

    decoders.QueryActivitySharesResponse?.(response);

    return response;
  }

  async deleteActivity(request: {
    id: string;
    hard_delete?: boolean;
    delete_notification_activity?: boolean;
  }): Promise<StreamResponse<DeleteActivityResponse>> {
    const queryParams = {
      hard_delete: request?.hard_delete,
      delete_notification_activity: request?.delete_notification_activity,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<DeleteActivityResponse>(
      'DELETE',
      '/api/v2/feeds/activities/{id}',
      pathParams,
      queryParams,
    );

    decoders.DeleteActivityResponse?.(response);

    return response;
  }

  async getActivity(request: {
    id: string;
    comment_sort?: string;
    comment_limit?: number;
    skip_own_followings?: boolean;
    language?: string;
    translate_text?: boolean;
    include_top_level_comment_count?: boolean;
  }): Promise<StreamResponse<GetActivityResponse>> {
    const queryParams = {
      comment_sort: request?.comment_sort,
      comment_limit: request?.comment_limit,
      skip_own_followings: request?.skip_own_followings,
      language: request?.language,
      translate_text: request?.translate_text,
      include_top_level_comment_count: request?.include_top_level_comment_count,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<GetActivityResponse>(
      'GET',
      '/api/v2/feeds/activities/{id}',
      pathParams,
      queryParams,
    );

    decoders.GetActivityResponse?.(response);

    return response;
  }

  async updateActivityPartial(
    request: UpdateActivityPartialRequest & { id: string },
  ): Promise<StreamResponse<UpdateActivityPartialResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      copy_custom_to_notification: request?.copy_custom_to_notification,
      enrich_own_fields: request?.enrich_own_fields,
      handle_mention_notifications: request?.handle_mention_notifications,
      run_activity_processors: request?.run_activity_processors,
      unset: request?.unset,
      set: request?.set,
    };

    const response =
      await this.apiClient.sendRequest<UpdateActivityPartialResponse>(
        'PATCH',
        '/api/v2/feeds/activities/{id}',
        pathParams,
        undefined,
        body,
      );

    decoders.UpdateActivityPartialResponse?.(response);

    return response;
  }

  async updateActivity(
    request: UpdateActivityRequest & { id: string },
  ): Promise<StreamResponse<UpdateActivityResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      copy_custom_to_notification: request?.copy_custom_to_notification,
      enrich_own_fields: request?.enrich_own_fields,
      expires_at: request?.expires_at,
      handle_mention_notifications: request?.handle_mention_notifications,
      poll_id: request?.poll_id,
      restrict_replies: request?.restrict_replies,
      run_activity_processors: request?.run_activity_processors,
      skip_enrich_url: request?.skip_enrich_url,
      text: request?.text,
      visibility: request?.visibility,
      visibility_tag: request?.visibility_tag,
      attachments: request?.attachments,
      collection_refs: request?.collection_refs,
      feeds: request?.feeds,
      filter_tags: request?.filter_tags,
      interest_tags: request?.interest_tags,
      mentioned_user_ids: request?.mentioned_user_ids,
      custom: request?.custom,
      location: request?.location,
      search_data: request?.search_data,
    };

    const response = await this.apiClient.sendRequest<UpdateActivityResponse>(
      'PUT',
      '/api/v2/feeds/activities/{id}',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateActivityResponse?.(response);

    return response;
  }

  async restoreActivity(
    request: RestoreActivityRequest & {
      id: string;
      enrich_own_fields?: boolean;
    },
  ): Promise<StreamResponse<RestoreActivityResponse>> {
    const queryParams = {
      enrich_own_fields: request?.enrich_own_fields,
    };
    const pathParams = {
      id: request?.id,
    };
    const body = {};

    const response = await this.apiClient.sendRequest<RestoreActivityResponse>(
      'POST',
      '/api/v2/feeds/activities/{id}/restore',
      pathParams,
      queryParams,
      body,
    );

    decoders.RestoreActivityResponse?.(response);

    return response;
  }

  async translateActivity(
    request: TranslateActivityRequest & { id: string },
  ): Promise<StreamResponse<TranslateActivityResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      language: request?.language,
    };

    const response =
      await this.apiClient.sendRequest<TranslateActivityResponse>(
        'POST',
        '/api/v2/feeds/activities/{id}/translate',
        pathParams,
        undefined,
        body,
      );

    decoders.TranslateActivityResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<QueryBookmarkFoldersResponse>(
        'POST',
        '/api/v2/feeds/bookmark_folders/query',
        undefined,
        undefined,
        body,
      );

    decoders.QueryBookmarkFoldersResponse?.(response);

    return response;
  }

  async deleteBookmarkFolder(request: {
    folder_id: string;
  }): Promise<StreamResponse<DeleteBookmarkFolderResponse>> {
    const pathParams = {
      folder_id: request?.folder_id,
    };

    const response =
      await this.apiClient.sendRequest<DeleteBookmarkFolderResponse>(
        'DELETE',
        '/api/v2/feeds/bookmark_folders/{folder_id}',
        pathParams,
        undefined,
      );

    decoders.DeleteBookmarkFolderResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<UpdateBookmarkFolderResponse>(
        'PATCH',
        '/api/v2/feeds/bookmark_folders/{folder_id}',
        pathParams,
        undefined,
        body,
      );

    decoders.UpdateBookmarkFolderResponse?.(response);

    return response;
  }

  async queryBookmarks(
    request?: QueryBookmarksRequest & {
      language?: string;
      translate_text?: boolean;
    },
  ): Promise<StreamResponse<QueryBookmarksResponse>> {
    const queryParams = {
      language: request?.language,
      translate_text: request?.translate_text,
    };
    const body = {
      enrich_own_fields: request?.enrich_own_fields,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<QueryBookmarksResponse>(
      'POST',
      '/api/v2/feeds/bookmarks/query',
      undefined,
      queryParams,
      body,
    );

    decoders.QueryBookmarksResponse?.(response);

    return response;
  }

  async deleteCollections(request: {
    collection_refs: string[];
  }): Promise<StreamResponse<DeleteCollectionsResponse>> {
    const queryParams = {
      collection_refs: request?.collection_refs,
    };

    const response =
      await this.apiClient.sendRequest<DeleteCollectionsResponse>(
        'DELETE',
        '/api/v2/feeds/collections',
        undefined,
        queryParams,
      );

    decoders.DeleteCollectionsResponse?.(response);

    return response;
  }

  async readCollections(request?: {
    collection_refs?: string[];
  }): Promise<StreamResponse<ReadCollectionsResponse>> {
    const queryParams = {
      collection_refs: request?.collection_refs,
    };

    const response = await this.apiClient.sendRequest<ReadCollectionsResponse>(
      'GET',
      '/api/v2/feeds/collections',
      undefined,
      queryParams,
    );

    decoders.ReadCollectionsResponse?.(response);

    return response;
  }

  async updateCollections(
    request: UpdateCollectionsRequest,
  ): Promise<StreamResponse<UpdateCollectionsResponse>> {
    const body = {
      collections: request?.collections,
    };

    const response =
      await this.apiClient.sendRequest<UpdateCollectionsResponse>(
        'PATCH',
        '/api/v2/feeds/collections',
        undefined,
        undefined,
        body,
      );

    decoders.UpdateCollectionsResponse?.(response);

    return response;
  }

  async createCollections(
    request: CreateCollectionsRequest,
  ): Promise<StreamResponse<CreateCollectionsResponse>> {
    const body = {
      collections: request?.collections,
    };

    const response =
      await this.apiClient.sendRequest<CreateCollectionsResponse>(
        'POST',
        '/api/v2/feeds/collections',
        undefined,
        undefined,
        body,
      );

    decoders.CreateCollectionsResponse?.(response);

    return response;
  }

  async queryCollections(
    request?: QueryCollectionsRequest,
  ): Promise<StreamResponse<QueryCollectionsResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<QueryCollectionsResponse>(
      'POST',
      '/api/v2/feeds/collections/query',
      undefined,
      undefined,
      body,
    );

    decoders.QueryCollectionsResponse?.(response);

    return response;
  }

  async getComments(request: {
    object_id: string;
    object_type: string;
    depth?: number;
    sort?: string;
    replies_limit?: number;
    id_around?: string;
    language?: string;
    translate_text?: boolean;
    limit?: number;
    prev?: string;
    next?: string;
    include_top_level_comment_count?: boolean;
  }): Promise<StreamResponse<GetCommentsResponse>> {
    const queryParams = {
      object_id: request?.object_id,
      object_type: request?.object_type,
      depth: request?.depth,
      sort: request?.sort,
      replies_limit: request?.replies_limit,
      id_around: request?.id_around,
      language: request?.language,
      translate_text: request?.translate_text,
      limit: request?.limit,
      prev: request?.prev,
      next: request?.next,
      include_top_level_comment_count: request?.include_top_level_comment_count,
    };

    const response = await this.apiClient.sendRequest<GetCommentsResponse>(
      'GET',
      '/api/v2/feeds/comments',
      undefined,
      queryParams,
    );

    decoders.GetCommentsResponse?.(response);

    return response;
  }

  async addComment(
    request?: AddCommentRequest,
  ): Promise<StreamResponse<AddCommentResponse>> {
    const body = {
      comment: request?.comment,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      create_notification_activity: request?.create_notification_activity,
      id: request?.id,
      object_id: request?.object_id,
      object_type: request?.object_type,
      parent_id: request?.parent_id,
      skip_enrich_url: request?.skip_enrich_url,
      skip_push: request?.skip_push,
      attachments: request?.attachments,
      mentioned_user_ids: request?.mentioned_user_ids,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<AddCommentResponse>(
      'POST',
      '/api/v2/feeds/comments',
      undefined,
      undefined,
      body,
    );

    decoders.AddCommentResponse?.(response);

    return response;
  }

  async addCommentsBatch(
    request: AddCommentsBatchRequest,
  ): Promise<StreamResponse<AddCommentsBatchResponse>> {
    const body = {
      comments: request?.comments,
    };

    const response = await this.apiClient.sendRequest<AddCommentsBatchResponse>(
      'POST',
      '/api/v2/feeds/comments/batch',
      undefined,
      undefined,
      body,
    );

    decoders.AddCommentsBatchResponse?.(response);

    return response;
  }

  async queryComments(
    request: QueryCommentsRequest & {
      language?: string;
      translate_text?: boolean;
    },
  ): Promise<StreamResponse<QueryCommentsResponse>> {
    const queryParams = {
      language: request?.language,
      translate_text: request?.translate_text,
    };
    const body = {
      filter: request?.filter,
      id_around: request?.id_around,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
    };

    const response = await this.apiClient.sendRequest<QueryCommentsResponse>(
      'POST',
      '/api/v2/feeds/comments/query',
      undefined,
      queryParams,
      body,
    );

    decoders.QueryCommentsResponse?.(response);

    return response;
  }

  async batchQueryCommentReactions(
    request: BatchQueryCommentReactionsRequest,
  ): Promise<StreamResponse<BatchQueryCommentReactionsResponse>> {
    const body = {
      comment_ids: request?.comment_ids,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response =
      await this.apiClient.sendRequest<BatchQueryCommentReactionsResponse>(
        'POST',
        '/api/v2/feeds/comments/reactions/query',
        undefined,
        undefined,
        body,
      );

    decoders.BatchQueryCommentReactionsResponse?.(response);

    return response;
  }

  async deleteCommentBookmark(request: {
    comment_id: string;
    folder_id?: string;
  }): Promise<StreamResponse<DeleteCommentBookmarkResponse>> {
    const queryParams = {
      folder_id: request?.folder_id,
    };
    const pathParams = {
      comment_id: request?.comment_id,
    };

    const response =
      await this.apiClient.sendRequest<DeleteCommentBookmarkResponse>(
        'DELETE',
        '/api/v2/feeds/comments/{comment_id}/bookmarks',
        pathParams,
        queryParams,
      );

    decoders.DeleteCommentBookmarkResponse?.(response);

    return response;
  }

  async updateCommentBookmark(
    request: UpdateCommentBookmarkRequest & { comment_id: string },
  ): Promise<StreamResponse<UpdateCommentBookmarkResponse>> {
    const pathParams = {
      comment_id: request?.comment_id,
    };
    const body = {
      folder_id: request?.folder_id,
      new_folder_id: request?.new_folder_id,
      custom: request?.custom,
      new_folder: request?.new_folder,
    };

    const response =
      await this.apiClient.sendRequest<UpdateCommentBookmarkResponse>(
        'PATCH',
        '/api/v2/feeds/comments/{comment_id}/bookmarks',
        pathParams,
        undefined,
        body,
      );

    decoders.UpdateCommentBookmarkResponse?.(response);

    return response;
  }

  async addCommentBookmark(
    request: AddCommentBookmarkRequest & { comment_id: string },
  ): Promise<StreamResponse<AddCommentBookmarkResponse>> {
    const pathParams = {
      comment_id: request?.comment_id,
    };
    const body = {
      folder_id: request?.folder_id,
      custom: request?.custom,
      new_folder: request?.new_folder,
    };

    const response =
      await this.apiClient.sendRequest<AddCommentBookmarkResponse>(
        'POST',
        '/api/v2/feeds/comments/{comment_id}/bookmarks',
        pathParams,
        undefined,
        body,
      );

    decoders.AddCommentBookmarkResponse?.(response);

    return response;
  }

  async deleteComment(request: {
    id: string;
    hard_delete?: boolean;
    delete_notification_activity?: boolean;
  }): Promise<StreamResponse<DeleteCommentResponse>> {
    const queryParams = {
      hard_delete: request?.hard_delete,
      delete_notification_activity: request?.delete_notification_activity,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<DeleteCommentResponse>(
      'DELETE',
      '/api/v2/feeds/comments/{id}',
      pathParams,
      queryParams,
    );

    decoders.DeleteCommentResponse?.(response);

    return response;
  }

  async getComment(request: {
    id: string;
    language?: string;
    translate_text?: boolean;
  }): Promise<StreamResponse<GetCommentResponse>> {
    const queryParams = {
      language: request?.language,
      translate_text: request?.translate_text,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<GetCommentResponse>(
      'GET',
      '/api/v2/feeds/comments/{id}',
      pathParams,
      queryParams,
    );

    decoders.GetCommentResponse?.(response);

    return response;
  }

  async updateComment(
    request: UpdateCommentRequest & { id: string },
  ): Promise<StreamResponse<UpdateCommentResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      comment: request?.comment,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      handle_mention_notifications: request?.handle_mention_notifications,
      skip_enrich_url: request?.skip_enrich_url,
      skip_push: request?.skip_push,
      attachments: request?.attachments,
      mentioned_user_ids: request?.mentioned_user_ids,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<UpdateCommentResponse>(
      'PATCH',
      '/api/v2/feeds/comments/{id}',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateCommentResponse?.(response);

    return response;
  }

  async updateCommentPartial(
    request: UpdateCommentPartialRequest & { id: string },
  ): Promise<StreamResponse<UpdateCommentPartialResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      copy_custom_to_notification: request?.copy_custom_to_notification,
      handle_mention_notifications: request?.handle_mention_notifications,
      skip_enrich_url: request?.skip_enrich_url,
      skip_push: request?.skip_push,
      unset: request?.unset,
      set: request?.set,
    };

    const response =
      await this.apiClient.sendRequest<UpdateCommentPartialResponse>(
        'POST',
        '/api/v2/feeds/comments/{id}/partial',
        pathParams,
        undefined,
        body,
      );

    decoders.UpdateCommentPartialResponse?.(response);

    return response;
  }

  async addCommentReaction(
    request: AddCommentReactionRequest & { id: string },
  ): Promise<StreamResponse<AddCommentReactionResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      type: request?.type,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      create_notification_activity: request?.create_notification_activity,
      enforce_unique: request?.enforce_unique,
      skip_push: request?.skip_push,
      target_feeds: request?.target_feeds,
      custom: request?.custom,
    };

    const response =
      await this.apiClient.sendRequest<AddCommentReactionResponse>(
        'POST',
        '/api/v2/feeds/comments/{id}/reactions',
        pathParams,
        undefined,
        body,
      );

    decoders.AddCommentReactionResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<QueryCommentReactionsResponse>(
        'POST',
        '/api/v2/feeds/comments/{id}/reactions/query',
        pathParams,
        undefined,
        body,
      );

    decoders.QueryCommentReactionsResponse?.(response);

    return response;
  }

  async deleteCommentReaction(request: {
    id: string;
    type: string;
    delete_notification_activity?: boolean;
  }): Promise<StreamResponse<DeleteCommentReactionResponse>> {
    const queryParams = {
      delete_notification_activity: request?.delete_notification_activity,
    };
    const pathParams = {
      id: request?.id,
      type: request?.type,
    };

    const response =
      await this.apiClient.sendRequest<DeleteCommentReactionResponse>(
        'DELETE',
        '/api/v2/feeds/comments/{id}/reactions/{type}',
        pathParams,
        queryParams,
      );

    decoders.DeleteCommentReactionResponse?.(response);

    return response;
  }

  async getCommentReplies(request: {
    id: string;
    depth?: number;
    sort?: string;
    replies_limit?: number;
    id_around?: string;
    language?: string;
    translate_text?: boolean;
    limit?: number;
    prev?: string;
    next?: string;
  }): Promise<StreamResponse<GetCommentRepliesResponse>> {
    const queryParams = {
      depth: request?.depth,
      sort: request?.sort,
      replies_limit: request?.replies_limit,
      id_around: request?.id_around,
      language: request?.language,
      translate_text: request?.translate_text,
      limit: request?.limit,
      prev: request?.prev,
      next: request?.next,
    };
    const pathParams = {
      id: request?.id,
    };

    const response =
      await this.apiClient.sendRequest<GetCommentRepliesResponse>(
        'GET',
        '/api/v2/feeds/comments/{id}/replies',
        pathParams,
        queryParams,
      );

    decoders.GetCommentRepliesResponse?.(response);

    return response;
  }

  async restoreComment(
    request: RestoreCommentRequest & { id: string },
  ): Promise<StreamResponse<RestoreCommentResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {};

    const response = await this.apiClient.sendRequest<RestoreCommentResponse>(
      'POST',
      '/api/v2/feeds/comments/{id}/restore',
      pathParams,
      undefined,
      body,
    );

    decoders.RestoreCommentResponse?.(response);

    return response;
  }

  async translateComment(
    request: TranslateCommentRequest & { id: string },
  ): Promise<StreamResponse<TranslateCommentResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      language: request?.language,
    };

    const response = await this.apiClient.sendRequest<TranslateCommentResponse>(
      'POST',
      '/api/v2/feeds/comments/{id}/translate',
      pathParams,
      undefined,
      body,
    );

    decoders.TranslateCommentResponse?.(response);

    return response;
  }

  async deleteFeed(request: {
    feed_group_id: string;
    feed_id: string;
    hard_delete?: boolean;
    purge_user_activities?: boolean;
  }): Promise<StreamResponse<DeleteFeedResponse>> {
    const queryParams = {
      hard_delete: request?.hard_delete,
      purge_user_activities: request?.purge_user_activities,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };

    const response = await this.apiClient.sendRequest<DeleteFeedResponse>(
      'DELETE',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      queryParams,
    );

    decoders.DeleteFeedResponse?.(response);

    return response;
  }

  async getOrCreateFeed(
    request: GetOrCreateFeedRequest & {
      feed_group_id: string;
      feed_id: string;
      language?: string;
      translate_text?: boolean;
      connection_id?: string;
    },
  ): Promise<StreamResponse<GetOrCreateFeedResponse>> {
    const queryParams = {
      language: request?.language,
      translate_text: request?.translate_text,
      connection_id: request?.connection_id,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      id_around: request?.id_around,
      limit: request?.limit,
      next: request?.next,
      overwrite_interest_weights: request?.overwrite_interest_weights,
      prev: request?.prev,
      view: request?.view,
      watch: request?.watch,
      data: request?.data,
      enrichment_options: request?.enrichment_options,
      external_ranking: request?.external_ranking,
      filter: request?.filter,
      followers_pagination: request?.followers_pagination,
      following_pagination: request?.following_pagination,
      friend_reactions_options: request?.friend_reactions_options,
      interest_weights: request?.interest_weights,
      member_pagination: request?.member_pagination,
    };

    const response = await this.apiClient.sendRequest<GetOrCreateFeedResponse>(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      queryParams,
      body,
    );

    decoders.GetOrCreateFeedResponse?.(response);

    return response;
  }

  async updateFeed(
    request: UpdateFeedRequest & { feed_group_id: string; feed_id: string },
  ): Promise<StreamResponse<UpdateFeedResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      clear_location: request?.clear_location,
      description: request?.description,
      enrich_own_fields: request?.enrich_own_fields,
      name: request?.name,
      filter_tags: request?.filter_tags,
      custom: request?.custom,
      location: request?.location,
    };

    const response = await this.apiClient.sendRequest<UpdateFeedResponse>(
      'PUT',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateFeedResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<Response>(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/mark/batch',
      pathParams,
      undefined,
      body,
    );

    decoders.Response?.(response);

    return response;
  }

  async unpinActivity(request: {
    feed_group_id: string;
    feed_id: string;
    activity_id: string;
    enrich_own_fields?: boolean;
  }): Promise<StreamResponse<UnpinActivityResponse>> {
    const queryParams = {
      enrich_own_fields: request?.enrich_own_fields,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<UnpinActivityResponse>(
      'DELETE',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/{activity_id}/pin',
      pathParams,
      queryParams,
    );

    decoders.UnpinActivityResponse?.(response);

    return response;
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
    const body = {
      enrich_own_fields: request?.enrich_own_fields,
    };

    const response = await this.apiClient.sendRequest<PinActivityResponse>(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/activities/{activity_id}/pin',
      pathParams,
      undefined,
      body,
    );

    decoders.PinActivityResponse?.(response);

    return response;
  }

  async changeFeedVisibility(
    request: ChangeFeedVisibilityRequest & {
      feed_group_id: string;
      feed_id: string;
    },
  ): Promise<StreamResponse<ChangeFeedVisibilityResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      visibility: request?.visibility,
      pending_follows_action: request?.pending_follows_action,
    };

    const response =
      await this.apiClient.sendRequest<ChangeFeedVisibilityResponse>(
        'POST',
        '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/change_visibility',
        pathParams,
        undefined,
        body,
      );

    decoders.ChangeFeedVisibilityResponse?.(response);

    return response;
  }

  async getFeedCounts(request: {
    feed_group_id: string;
    feed_id: string;
  }): Promise<StreamResponse<GetFeedCountsResponse>> {
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };

    const response = await this.apiClient.sendRequest<GetFeedCountsResponse>(
      'GET',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/counts',
      pathParams,
      undefined,
    );

    decoders.GetFeedCountsResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<UpdateFeedMembersResponse>(
        'PATCH',
        '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members',
        pathParams,
        undefined,
        body,
      );

    decoders.UpdateFeedMembersResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<AcceptFeedMemberInviteResponse>(
        'POST',
        '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members/accept',
        pathParams,
        undefined,
        body,
      );

    decoders.AcceptFeedMemberInviteResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<QueryFeedMembersResponse>(
      'POST',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members/query',
      pathParams,
      undefined,
      body,
    );

    decoders.QueryFeedMembersResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<RejectFeedMemberInviteResponse>(
        'POST',
        '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/members/reject',
        pathParams,
        undefined,
        body,
      );

    decoders.RejectFeedMemberInviteResponse?.(response);

    return response;
  }

  async queryPinnedActivities(
    request: QueryPinnedActivitiesRequest & {
      feed_group_id: string;
      feed_id: string;
      language?: string;
      translate_text?: boolean;
    },
  ): Promise<StreamResponse<QueryPinnedActivitiesResponse>> {
    const queryParams = {
      language: request?.language,
      translate_text: request?.translate_text,
    };
    const pathParams = {
      feed_group_id: request?.feed_group_id,
      feed_id: request?.feed_id,
    };
    const body = {
      enrich_own_fields: request?.enrich_own_fields,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response =
      await this.apiClient.sendRequest<QueryPinnedActivitiesResponse>(
        'POST',
        '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/pinned_activities/query',
        pathParams,
        queryParams,
        body,
      );

    decoders.QueryPinnedActivitiesResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/feeds/feed_groups/{feed_group_id}/feeds/{feed_id}/watch',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<GetFollowSuggestionsResponse>(
        'GET',
        '/api/v2/feeds/feed_groups/{feed_group_id}/follow_suggestions',
        pathParams,
        queryParams,
      );

    decoders.GetFollowSuggestionsResponse?.(response);

    return response;
  }

  async createFeedsBatch(
    request: CreateFeedsBatchRequest,
  ): Promise<StreamResponse<CreateFeedsBatchResponse>> {
    const body = {
      feeds: request?.feeds,
      enrich_own_fields: request?.enrich_own_fields,
    };

    const response = await this.apiClient.sendRequest<CreateFeedsBatchResponse>(
      'POST',
      '/api/v2/feeds/feeds/batch',
      undefined,
      undefined,
      body,
    );

    decoders.CreateFeedsBatchResponse?.(response);

    return response;
  }

  async ownBatch(
    request: OwnBatchRequest & { connection_id?: string },
  ): Promise<StreamResponse<OwnBatchResponse>> {
    const queryParams = {
      connection_id: request?.connection_id,
    };
    const body = {
      feeds: request?.feeds,
      fields: request?.fields,
    };

    const response = await this.apiClient.sendRequest<OwnBatchResponse>(
      'POST',
      '/api/v2/feeds/feeds/own/batch',
      undefined,
      queryParams,
      body,
    );

    decoders.OwnBatchResponse?.(response);

    return response;
  }

  protected async _queryFeeds(
    request?: QueryFeedsRequest & { connection_id?: string },
  ): Promise<StreamResponse<QueryFeedsResponse>> {
    const queryParams = {
      connection_id: request?.connection_id,
    };
    const body = {
      enrich_own_fields: request?.enrich_own_fields,
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      watch: request?.watch,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<QueryFeedsResponse>(
      'POST',
      '/api/v2/feeds/feeds/query',
      undefined,
      queryParams,
      body,
    );

    decoders.QueryFeedsResponse?.(response);

    return response;
  }

  async updateFollow(
    request: UpdateFollowRequest,
  ): Promise<StreamResponse<UpdateFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      activity_copy_limit: request?.activity_copy_limit,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      create_notification_activity: request?.create_notification_activity,
      enrich_own_fields: request?.enrich_own_fields,
      follower_role: request?.follower_role,
      push_preference: request?.push_preference,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<UpdateFollowResponse>(
      'PATCH',
      '/api/v2/feeds/follows',
      undefined,
      undefined,
      body,
    );

    decoders.UpdateFollowResponse?.(response);

    return response;
  }

  async follow(
    request: FollowRequest,
  ): Promise<StreamResponse<SingleFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      activity_copy_limit: request?.activity_copy_limit,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      create_notification_activity: request?.create_notification_activity,
      enrich_own_fields: request?.enrich_own_fields,
      push_preference: request?.push_preference,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<SingleFollowResponse>(
      'POST',
      '/api/v2/feeds/follows',
      undefined,
      undefined,
      body,
    );

    decoders.SingleFollowResponse?.(response);

    return response;
  }

  async acceptFollow(
    request: AcceptFollowRequest,
  ): Promise<StreamResponse<AcceptFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      follower_role: request?.follower_role,
    };

    const response = await this.apiClient.sendRequest<AcceptFollowResponse>(
      'POST',
      '/api/v2/feeds/follows/accept',
      undefined,
      undefined,
      body,
    );

    decoders.AcceptFollowResponse?.(response);

    return response;
  }

  async followBatch(
    request: FollowBatchRequest,
  ): Promise<StreamResponse<FollowBatchResponse>> {
    const body = {
      follows: request?.follows,
      enrich_own_fields: request?.enrich_own_fields,
    };

    const response = await this.apiClient.sendRequest<FollowBatchResponse>(
      'POST',
      '/api/v2/feeds/follows/batch',
      undefined,
      undefined,
      body,
    );

    decoders.FollowBatchResponse?.(response);

    return response;
  }

  async getOrCreateFollows(
    request: FollowBatchRequest,
  ): Promise<StreamResponse<FollowBatchResponse>> {
    const body = {
      follows: request?.follows,
      enrich_own_fields: request?.enrich_own_fields,
    };

    const response = await this.apiClient.sendRequest<FollowBatchResponse>(
      'POST',
      '/api/v2/feeds/follows/batch/upsert',
      undefined,
      undefined,
      body,
    );

    decoders.FollowBatchResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<QueryFollowsResponse>(
      'POST',
      '/api/v2/feeds/follows/query',
      undefined,
      undefined,
      body,
    );

    decoders.QueryFollowsResponse?.(response);

    return response;
  }

  async rejectFollow(
    request: RejectFollowRequest,
  ): Promise<StreamResponse<RejectFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
    };

    const response = await this.apiClient.sendRequest<RejectFollowResponse>(
      'POST',
      '/api/v2/feeds/follows/reject',
      undefined,
      undefined,
      body,
    );

    decoders.RejectFollowResponse?.(response);

    return response;
  }

  async getOrCreateFollow(
    request: FollowRequest,
  ): Promise<StreamResponse<GetOrCreateFollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      activity_copy_limit: request?.activity_copy_limit,
      copy_custom_to_notification: request?.copy_custom_to_notification,
      create_notification_activity: request?.create_notification_activity,
      enrich_own_fields: request?.enrich_own_fields,
      push_preference: request?.push_preference,
      skip_push: request?.skip_push,
      custom: request?.custom,
    };

    const response =
      await this.apiClient.sendRequest<GetOrCreateFollowResponse>(
        'POST',
        '/api/v2/feeds/follows/upsert',
        undefined,
        undefined,
        body,
      );

    decoders.GetOrCreateFollowResponse?.(response);

    return response;
  }

  async unfollow(request: {
    source: string;
    target: string;
    delete_notification_activity?: boolean;
    keep_history?: boolean;
    enrich_own_fields?: boolean;
  }): Promise<StreamResponse<UnfollowResponse>> {
    const queryParams = {
      delete_notification_activity: request?.delete_notification_activity,
      keep_history: request?.keep_history,
      enrich_own_fields: request?.enrich_own_fields,
    };
    const pathParams = {
      source: request?.source,
      target: request?.target,
    };

    const response = await this.apiClient.sendRequest<UnfollowResponse>(
      'DELETE',
      '/api/v2/feeds/follows/{source}/{target}',
      pathParams,
      queryParams,
    );

    decoders.UnfollowResponse?.(response);

    return response;
  }

  async getOrCreateUnfollows(
    request: UnfollowBatchRequest,
  ): Promise<StreamResponse<UnfollowBatchResponse>> {
    const body = {
      follows: request?.follows,
      delete_notification_activity: request?.delete_notification_activity,
      enrich_own_fields: request?.enrich_own_fields,
    };

    const response = await this.apiClient.sendRequest<UnfollowBatchResponse>(
      'POST',
      '/api/v2/feeds/unfollow/batch/upsert',
      undefined,
      undefined,
      body,
    );

    decoders.UnfollowBatchResponse?.(response);

    return response;
  }

  async getOrCreateUnfollow(
    request: GetOrCreateUnfollowRequest,
  ): Promise<StreamResponse<GetOrCreateUnfollowResponse>> {
    const body = {
      source: request?.source,
      target: request?.target,
      delete_notification_activity: request?.delete_notification_activity,
      enrich_own_fields: request?.enrich_own_fields,
      keep_history: request?.keep_history,
    };

    const response =
      await this.apiClient.sendRequest<GetOrCreateUnfollowResponse>(
        'POST',
        '/api/v2/feeds/unfollow/upsert',
        undefined,
        undefined,
        body,
      );

    decoders.GetOrCreateUnfollowResponse?.(response);

    return response;
  }

  async deleteUserInterests(request: {
    user_id: string;
    tags: string[];
  }): Promise<StreamResponse<DeleteUserInterestsResponse>> {
    const queryParams = {
      tags: request?.tags,
    };
    const pathParams = {
      user_id: request?.user_id,
    };

    const response =
      await this.apiClient.sendRequest<DeleteUserInterestsResponse>(
        'DELETE',
        '/api/v2/feeds/users/{user_id}/interests',
        pathParams,
        queryParams,
      );

    decoders.DeleteUserInterestsResponse?.(response);

    return response;
  }

  async getUserInterests(request: {
    user_id: string;
    limit?: number;
  }): Promise<StreamResponse<GetUserInterestsResponse>> {
    const queryParams = {
      limit: request?.limit,
    };
    const pathParams = {
      user_id: request?.user_id,
    };

    const response = await this.apiClient.sendRequest<GetUserInterestsResponse>(
      'GET',
      '/api/v2/feeds/users/{user_id}/interests',
      pathParams,
      queryParams,
    );

    decoders.GetUserInterestsResponse?.(response);

    return response;
  }

  async upsertUserInterests(
    request: UpsertUserInterestsRequest & { user_id: string },
  ): Promise<StreamResponse<UpsertUserInterestsResponse>> {
    const pathParams = {
      user_id: request?.user_id,
    };
    const body = {
      interests: request?.interests,
    };

    const response =
      await this.apiClient.sendRequest<UpsertUserInterestsResponse>(
        'PUT',
        '/api/v2/feeds/users/{user_id}/interests',
        pathParams,
        undefined,
        body,
      );

    decoders.UpsertUserInterestsResponse?.(response);

    return response;
  }

  async createGuest(
    request: CreateGuestRequest,
  ): Promise<StreamResponse<CreateGuestResponse>> {
    const body = {
      user: request?.user,
    };

    const response = await this.apiClient.sendRequest<CreateGuestResponse>(
      'POST',
      '/api/v2/guest',
      undefined,
      undefined,
      body,
    );

    decoders.CreateGuestResponse?.(response);

    return response;
  }

  async longPoll(request?: {
    connection_id?: string;
    json?: WSAuthMessage;
  }): Promise<StreamResponse<{}>> {
    const queryParams = {
      connection_id: request?.connection_id,
      json: request?.json,
    };

    const response = await this.apiClient.sendRequest<{}>(
      'GET',
      '/api/v2/longpoll',
      undefined,
      queryParams,
    );

    decoders['{}']?.(response);

    return response;
  }

  async getOG(request: {
    url: string;
  }): Promise<StreamResponse<GetOGResponse>> {
    const queryParams = {
      url: request?.url,
    };

    const response = await this.apiClient.sendRequest<GetOGResponse>(
      'GET',
      '/api/v2/og',
      undefined,
      queryParams,
    );

    decoders.GetOGResponse?.(response);

    return response;
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
      team: request?.team,
      voting_visibility: request?.voting_visibility,
      options: request?.options,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<PollResponse>(
      'POST',
      '/api/v2/polls',
      undefined,
      undefined,
      body,
    );

    decoders.PollResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<PollResponse>(
      'PUT',
      '/api/v2/polls',
      undefined,
      undefined,
      body,
    );

    decoders.PollResponse?.(response);

    return response;
  }

  async queryPolls(
    request?: QueryPollsRequest,
  ): Promise<StreamResponse<QueryPollsResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<QueryPollsResponse>(
      'POST',
      '/api/v2/polls/query',
      undefined,
      undefined,
      body,
    );

    decoders.QueryPollsResponse?.(response);

    return response;
  }

  async deletePoll(request: {
    poll_id: string;
  }): Promise<StreamResponse<Response>> {
    const pathParams = {
      poll_id: request?.poll_id,
    };

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/polls/{poll_id}',
      pathParams,
      undefined,
    );

    decoders.Response?.(response);

    return response;
  }

  async getPoll(request: {
    poll_id: string;
  }): Promise<StreamResponse<PollResponse>> {
    const pathParams = {
      poll_id: request?.poll_id,
    };

    const response = await this.apiClient.sendRequest<PollResponse>(
      'GET',
      '/api/v2/polls/{poll_id}',
      pathParams,
      undefined,
    );

    decoders.PollResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<PollResponse>(
      'PATCH',
      '/api/v2/polls/{poll_id}',
      pathParams,
      undefined,
      body,
    );

    decoders.PollResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<PollOptionResponse>(
      'POST',
      '/api/v2/polls/{poll_id}/options',
      pathParams,
      undefined,
      body,
    );

    decoders.PollOptionResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<PollOptionResponse>(
      'PUT',
      '/api/v2/polls/{poll_id}/options',
      pathParams,
      undefined,
      body,
    );

    decoders.PollOptionResponse?.(response);

    return response;
  }

  async deletePollOption(request: {
    poll_id: string;
    option_id: string;
  }): Promise<StreamResponse<Response>> {
    const pathParams = {
      poll_id: request?.poll_id,
      option_id: request?.option_id,
    };

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/polls/{poll_id}/options/{option_id}',
      pathParams,
      undefined,
    );

    decoders.Response?.(response);

    return response;
  }

  async getPollOption(request: {
    poll_id: string;
    option_id: string;
  }): Promise<StreamResponse<PollOptionResponse>> {
    const pathParams = {
      poll_id: request?.poll_id,
      option_id: request?.option_id,
    };

    const response = await this.apiClient.sendRequest<PollOptionResponse>(
      'GET',
      '/api/v2/polls/{poll_id}/options/{option_id}',
      pathParams,
      undefined,
    );

    decoders.PollOptionResponse?.(response);

    return response;
  }

  async queryPollVotes(
    request: QueryPollVotesRequest & { poll_id: string },
  ): Promise<StreamResponse<PollVotesResponse>> {
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

    const response = await this.apiClient.sendRequest<PollVotesResponse>(
      'POST',
      '/api/v2/polls/{poll_id}/votes',
      pathParams,
      undefined,
      body,
    );

    decoders.PollVotesResponse?.(response);

    return response;
  }

  async updatePushNotificationPreferences(
    request: UpsertPushPreferencesRequest,
  ): Promise<StreamResponse<UpsertPushPreferencesResponse>> {
    const body = {
      preferences: request?.preferences,
    };

    const response =
      await this.apiClient.sendRequest<UpsertPushPreferencesResponse>(
        'POST',
        '/api/v2/push_preferences',
        undefined,
        undefined,
        body,
      );

    decoders.UpsertPushPreferencesResponse?.(response);

    return response;
  }

  async searchRoles(request: {
    query: string;
    limit?: number;
    name_gt?: string;
    role_type?: string;
    include_global_roles?: boolean;
  }): Promise<StreamResponse<SearchRolesResponse>> {
    const queryParams = {
      query: request?.query,
      limit: request?.limit,
      name_gt: request?.name_gt,
      role_type: request?.role_type,
      include_global_roles: request?.include_global_roles,
    };

    const response = await this.apiClient.sendRequest<SearchRolesResponse>(
      'GET',
      '/api/v2/roles/search',
      undefined,
      queryParams,
    );

    decoders.SearchRolesResponse?.(response);

    return response;
  }

  async deleteFile(request?: {
    url?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      url: request?.url,
    };

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/uploads/file',
      undefined,
      queryParams,
    );

    decoders.Response?.(response);

    return response;
  }

  async uploadFile(
    request?: FileUploadRequest,
  ): Promise<StreamResponse<FileUploadResponse>> {
    const body = {
      file: request?.file,
      user: request?.user,
    };

    const response = await this.apiClient.sendRequest<FileUploadResponse>(
      'POST',
      '/api/v2/uploads/file',
      undefined,
      undefined,
      body,
      'multipart/form-data',
    );

    decoders.FileUploadResponse?.(response);

    return response;
  }

  async deleteImage(request?: {
    url?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      url: request?.url,
    };

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/uploads/image',
      undefined,
      queryParams,
    );

    decoders.Response?.(response);

    return response;
  }

  async uploadImage(
    request?: ImageUploadRequest,
  ): Promise<StreamResponse<ImageUploadResponse>> {
    const body = {
      file: request?.file,
      upload_sizes: request?.upload_sizes,
      user: request?.user,
    };

    const response = await this.apiClient.sendRequest<ImageUploadResponse>(
      'POST',
      '/api/v2/uploads/image',
      undefined,
      undefined,
      body,
      'multipart/form-data',
    );

    decoders.ImageUploadResponse?.(response);

    return response;
  }

  async listUserGroups(request?: {
    limit?: number;
    id_gt?: string;
    created_at_gt?: string;
    team_id?: string;
  }): Promise<StreamResponse<ListUserGroupsResponse>> {
    const queryParams = {
      limit: request?.limit,
      id_gt: request?.id_gt,
      created_at_gt: request?.created_at_gt,
      team_id: request?.team_id,
    };

    const response = await this.apiClient.sendRequest<ListUserGroupsResponse>(
      'GET',
      '/api/v2/usergroups',
      undefined,
      queryParams,
    );

    decoders.ListUserGroupsResponse?.(response);

    return response;
  }

  async createUserGroup(
    request: CreateUserGroupRequest,
  ): Promise<StreamResponse<CreateUserGroupResponse>> {
    const body = {
      name: request?.name,
      description: request?.description,
      id: request?.id,
      team_id: request?.team_id,
      member_ids: request?.member_ids,
    };

    const response = await this.apiClient.sendRequest<CreateUserGroupResponse>(
      'POST',
      '/api/v2/usergroups',
      undefined,
      undefined,
      body,
    );

    decoders.CreateUserGroupResponse?.(response);

    return response;
  }

  async searchUserGroups(request: {
    query: string;
    limit?: number;
    name_gt?: string;
    id_gt?: string;
    team_id?: string;
  }): Promise<StreamResponse<SearchUserGroupsResponse>> {
    const queryParams = {
      query: request?.query,
      limit: request?.limit,
      name_gt: request?.name_gt,
      id_gt: request?.id_gt,
      team_id: request?.team_id,
    };

    const response = await this.apiClient.sendRequest<SearchUserGroupsResponse>(
      'GET',
      '/api/v2/usergroups/search',
      undefined,
      queryParams,
    );

    decoders.SearchUserGroupsResponse?.(response);

    return response;
  }

  async deleteUserGroup(request: {
    id: string;
    team_id?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      team_id: request?.team_id,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<Response>(
      'DELETE',
      '/api/v2/usergroups/{id}',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response);

    return response;
  }

  async getUserGroup(request: {
    id: string;
    team_id?: string;
  }): Promise<StreamResponse<GetUserGroupResponse>> {
    const queryParams = {
      team_id: request?.team_id,
    };
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<GetUserGroupResponse>(
      'GET',
      '/api/v2/usergroups/{id}',
      pathParams,
      queryParams,
    );

    decoders.GetUserGroupResponse?.(response);

    return response;
  }

  async updateUserGroup(
    request: UpdateUserGroupRequest & { id: string },
  ): Promise<StreamResponse<UpdateUserGroupResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      description: request?.description,
      name: request?.name,
      team_id: request?.team_id,
    };

    const response = await this.apiClient.sendRequest<UpdateUserGroupResponse>(
      'PUT',
      '/api/v2/usergroups/{id}',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateUserGroupResponse?.(response);

    return response;
  }

  async addUserGroupMembers(
    request: AddUserGroupMembersRequest & { id: string },
  ): Promise<StreamResponse<AddUserGroupMembersResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      member_ids: request?.member_ids,
      as_admin: request?.as_admin,
      team_id: request?.team_id,
    };

    const response =
      await this.apiClient.sendRequest<AddUserGroupMembersResponse>(
        'POST',
        '/api/v2/usergroups/{id}/members',
        pathParams,
        undefined,
        body,
      );

    decoders.AddUserGroupMembersResponse?.(response);

    return response;
  }

  async removeUserGroupMembers(
    request: RemoveUserGroupMembersRequest & { id: string },
  ): Promise<StreamResponse<RemoveUserGroupMembersResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      member_ids: request?.member_ids,
      team_id: request?.team_id,
    };

    const response =
      await this.apiClient.sendRequest<RemoveUserGroupMembersResponse>(
        'POST',
        '/api/v2/usergroups/{id}/members/delete',
        pathParams,
        undefined,
        body,
      );

    decoders.RemoveUserGroupMembersResponse?.(response);

    return response;
  }

  async queryUsers(request?: {
    payload?: QueryUsersPayload;
  }): Promise<StreamResponse<QueryUsersResponse>> {
    const queryParams = {
      payload: request?.payload,
    };

    const response = await this.apiClient.sendRequest<QueryUsersResponse>(
      'GET',
      '/api/v2/users',
      undefined,
      queryParams,
    );

    decoders.QueryUsersResponse?.(response);

    return response;
  }

  async updateUsersPartial(
    request: UpdateUsersPartialRequest,
  ): Promise<StreamResponse<UpdateUsersResponse>> {
    const body = {
      users: request?.users,
    };

    const response = await this.apiClient.sendRequest<UpdateUsersResponse>(
      'PATCH',
      '/api/v2/users',
      undefined,
      undefined,
      body,
    );

    decoders.UpdateUsersResponse?.(response);

    return response;
  }

  async updateUsers(
    request: UpdateUsersRequest,
  ): Promise<StreamResponse<UpdateUsersResponse>> {
    const body = {
      users: request?.users,
    };

    const response = await this.apiClient.sendRequest<UpdateUsersResponse>(
      'POST',
      '/api/v2/users',
      undefined,
      undefined,
      body,
    );

    decoders.UpdateUsersResponse?.(response);

    return response;
  }

  async getBlockedUsers(): Promise<StreamResponse<GetBlockedUsersResponse>> {
    const response = await this.apiClient.sendRequest<GetBlockedUsersResponse>(
      'GET',
      '/api/v2/users/block',
      undefined,
      undefined,
    );

    decoders.GetBlockedUsersResponse?.(response);

    return response;
  }

  async blockUsers(
    request: BlockUsersRequest,
  ): Promise<StreamResponse<BlockUsersResponse>> {
    const body = {
      blocked_user_id: request?.blocked_user_id,
    };

    const response = await this.apiClient.sendRequest<BlockUsersResponse>(
      'POST',
      '/api/v2/users/block',
      undefined,
      undefined,
      body,
    );

    decoders.BlockUsersResponse?.(response);

    return response;
  }

  async getUserLiveLocations(): Promise<
    StreamResponse<SharedLocationsResponse>
  > {
    const response = await this.apiClient.sendRequest<SharedLocationsResponse>(
      'GET',
      '/api/v2/users/live_locations',
      undefined,
      undefined,
    );

    decoders.SharedLocationsResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<SharedLocationResponse>(
      'PUT',
      '/api/v2/users/live_locations',
      undefined,
      undefined,
      body,
    );

    decoders.SharedLocationResponse?.(response);

    return response;
  }

  async unblockUsers(
    request: UnblockUsersRequest,
  ): Promise<StreamResponse<UnblockUsersResponse>> {
    const body = {
      blocked_user_id: request?.blocked_user_id,
    };

    const response = await this.apiClient.sendRequest<UnblockUsersResponse>(
      'POST',
      '/api/v2/users/unblock',
      undefined,
      undefined,
      body,
    );

    decoders.UnblockUsersResponse?.(response);

    return response;
  }
}

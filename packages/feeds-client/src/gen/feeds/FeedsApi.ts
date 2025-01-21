import {
  ApiClient,
  CommonApiWrapper,
  StreamClient,
  StreamResponse,
} from '../../gen-imports';
import {
  AddActivityRequest,
  AddActivityResponse,
  AddReactionToActivityRequest,
  AddReactionToActivityResponse,
  DeleteFeedGroupResponse,
  DeleteFeedResponse,
  DeleteReactionFromActivityResponse,
  FollowRequest,
  FollowResponse,
  GetFeedGroupsResponse,
  GetFeedResponse,
  GetFollowedFeedsResponse,
  GetFollowingFeedsResponse,
  GetOrCreateFeedRequest,
  GetOrCreateFeedResponse,
  QueryActivitiesRequest,
  QueryActivitiesResponse,
  QueryFeedsRequest,
  QueryFeedsResponse,
  QueryFollowRequestsRequest,
  QueryFollowRequestsResponse,
  QueryReactionsRequest,
  QueryReactionsResponse,
  ReadFlatFeedResponse,
  ReadNotificationFeedResponse,
  RemoveActivityFromFeedResponse,
  UnfollowRequest,
  UnfollowResponse,
  UpdateActivityRequest,
  UpdateActivityResponse,
  UpdateFeedMembersRequest,
  UpdateFeedMembersResponse,
  UpdateFeedRequest,
  UpdateFeedResponse,
  UpsertFeedGroupRequest,
  UpsertFeedGroupResponse,
} from '../models';
import { decoders } from '../model-decoders/decoders';

export class FeedsApi extends CommonApiWrapper {
  public readonly apiClient: ApiClient;

  constructor(streamClient: StreamClient) {
    super(streamClient);
    this.apiClient = streamClient.apiClient;
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
    >('POST', '/api/v2/feeds/activities/query', undefined, undefined, body);

    decoders.QueryActivitiesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateActivity(
    request: UpdateActivityRequest & { id: string },
  ): Promise<StreamResponse<UpdateActivityResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      object: request?.object,
      verb: request?.verb,
      add_to_targets: request?.add_to_targets,
      remove_to_targets: request?.remove_to_targets,
      replace_to_targets: request?.replace_to_targets,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateActivityResponse>
    >('PATCH', '/api/v2/feeds/activities/{id}', pathParams, undefined, body);

    decoders.UpdateActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async feedsAddReactionToActivity(
    request: AddReactionToActivityRequest & { id: string },
  ): Promise<StreamResponse<AddReactionToActivityResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      type: request?.type,
      created_at: request?.created_at,
      enforce_unique: request?.enforce_unique,
      score: request?.score,
      updated_at: request?.updated_at,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddReactionToActivityResponse>
    >(
      'POST',
      '/api/v2/feeds/activities/{id}/reactions',
      pathParams,
      undefined,
      body,
    );

    decoders.AddReactionToActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async feedsDeleteReactionFromActivity(request: {
    id: string;
    type: string;
  }): Promise<StreamResponse<DeleteReactionFromActivityResponse>> {
    const pathParams = {
      id: request?.id,
      type: request?.type,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteReactionFromActivityResponse>
    >(
      'DELETE',
      '/api/v2/feeds/activities/{id}/reactions/{type}',
      pathParams,
      undefined,
    );

    decoders.DeleteReactionFromActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getFeedGroups(): Promise<StreamResponse<GetFeedGroupsResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<GetFeedGroupsResponse>
    >('GET', '/api/v2/feeds/feedgroups', undefined, undefined);

    decoders.GetFeedGroupsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteFeedGroup(): Promise<StreamResponse<DeleteFeedGroupResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteFeedGroupResponse>
    >('DELETE', '/api/v2/feeds/feedgroups/{group}', undefined, undefined);

    decoders.DeleteFeedGroupResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async upsertFeedGroup(
    request: UpsertFeedGroupRequest,
  ): Promise<StreamResponse<UpsertFeedGroupResponse>> {
    const body = {
      feed_group: request?.feed_group,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpsertFeedGroupResponse>
    >('POST', '/api/v2/feeds/feedgroups/{group}', undefined, undefined, body);

    decoders.UpsertFeedGroupResponse?.(response.body);

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
    >('POST', '/api/v2/feeds/feeds/query', undefined, queryParams, body);

    decoders.QueryFeedsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteFeed(request: {
    group: string;
    id: string;
  }): Promise<StreamResponse<DeleteFeedResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteFeedResponse>
    >('DELETE', '/api/v2/feeds/feeds/{group}/{id}', pathParams, undefined);

    decoders.DeleteFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getFeed(request: {
    group: string;
    id: string;
  }): Promise<StreamResponse<GetFeedResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetFeedResponse>
    >('GET', '/api/v2/feeds/feeds/{group}/{id}', pathParams, undefined);

    decoders.GetFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateFeed(
    request: UpdateFeedRequest & { group: string; id: string },
  ): Promise<StreamResponse<UpdateFeedResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      accept_invite: request?.accept_invite,
      max_activity_copy_limit_for_invites:
        request?.max_activity_copy_limit_for_invites,
      reject_invite: request?.reject_invite,
      accepted_follow_requests: request?.accepted_follow_requests,
      add_members: request?.add_members,
      assign_roles: request?.assign_roles,
      cancelled_pending_follow_requests:
        request?.cancelled_pending_follow_requests,
      invited_follow_requests: request?.invited_follow_requests,
      invites: request?.invites,
      rejected_follow_requests: request?.rejected_follow_requests,
      rejected_invite_follow_requests: request?.rejected_invite_follow_requests,
      remove_members: request?.remove_members,
      revoked_follow_requests: request?.revoked_follow_requests,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateFeedResponse>
    >('PATCH', '/api/v2/feeds/feeds/{group}/{id}', pathParams, undefined, body);

    decoders.UpdateFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getOrCreateFeed(
    request: GetOrCreateFeedRequest & {
      group: string;
      id: string;
      connection_id?: string;
    },
  ): Promise<StreamResponse<GetOrCreateFeedResponse>> {
    const queryParams = {
      connection_id: request?.connection_id,
    };
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      visibility_level: request?.visibility_level,
      watch: request?.watch,
      invites: request?.invites,
      members: request?.members,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetOrCreateFeedResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/{group}/{id}',
      pathParams,
      queryParams,
      body,
    );

    decoders.GetOrCreateFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async addActivity(
    request: AddActivityRequest & { group: string; id: string },
  ): Promise<StreamResponse<AddActivityResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      object: request?.object,
      verb: request?.verb,
      public: request?.public,
      to_targets: request?.to_targets,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddActivityResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/{group}/{id}/add_activity',
      pathParams,
      undefined,
      body,
    );

    decoders.AddActivityResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async readFlatFeed(request: {
    group: string;
    id: string;
    limit: number;
    offset: number;
  }): Promise<StreamResponse<ReadFlatFeedResponse>> {
    const queryParams = {
      limit: request?.limit,
      offset: request?.offset,
    };
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<ReadFlatFeedResponse>
    >('GET', '/api/v2/feeds/feeds/{group}/{id}/flat', pathParams, queryParams);

    decoders.ReadFlatFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async follow(
    request: FollowRequest & { group: string; id: string },
  ): Promise<StreamResponse<FollowResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      target_group: request?.target_group,
      target_id: request?.target_id,
      activity_copy_limit: request?.activity_copy_limit,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<FollowResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/{group}/{id}/follow',
      pathParams,
      undefined,
      body,
    );

    decoders.FollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getFollowingFeeds(request: {
    group: string;
    id: string;
    limit: number;
    offset: number;
    filter?: string[];
  }): Promise<StreamResponse<GetFollowingFeedsResponse>> {
    const queryParams = {
      limit: request?.limit,
      offset: request?.offset,
      filter: request?.filter,
    };
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetFollowingFeedsResponse>
    >(
      'GET',
      '/api/v2/feeds/feeds/{group}/{id}/followers',
      pathParams,
      queryParams,
    );

    decoders.GetFollowingFeedsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getFollowedFeeds(request: {
    group: string;
    id: string;
    limit: number;
    offset: number;
    filter?: string[];
  }): Promise<StreamResponse<GetFollowedFeedsResponse>> {
    const queryParams = {
      limit: request?.limit,
      offset: request?.offset,
      filter: request?.filter,
    };
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetFollowedFeedsResponse>
    >(
      'GET',
      '/api/v2/feeds/feeds/{group}/{id}/following',
      pathParams,
      queryParams,
    );

    decoders.GetFollowedFeedsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateFeedMembers(
    request: UpdateFeedMembersRequest & { group: string; id: string },
  ): Promise<StreamResponse<UpdateFeedMembersResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      remove_members: request?.remove_members,
      update_members: request?.update_members,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateFeedMembersResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/{group}/{id}/members',
      pathParams,
      undefined,
      body,
    );

    decoders.UpdateFeedMembersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async readNotificationFeed(request: {
    group: string;
    id: string;
    limit: number;
    offset: number;
    mark_seen?: string;
    mark_read?: string;
  }): Promise<StreamResponse<ReadNotificationFeedResponse>> {
    const queryParams = {
      limit: request?.limit,
      offset: request?.offset,
      mark_seen: request?.mark_seen,
      mark_read: request?.mark_read,
    };
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<ReadNotificationFeedResponse>
    >(
      'GET',
      '/api/v2/feeds/feeds/{group}/{id}/notification',
      pathParams,
      queryParams,
    );

    decoders.ReadNotificationFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async unfollow(
    request: UnfollowRequest & { group: string; id: string },
  ): Promise<StreamResponse<UnfollowResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      target_group: request?.target_group,
      target_id: request?.target_id,
      keep_history: request?.keep_history,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UnfollowResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/{group}/{id}/unfollow',
      pathParams,
      undefined,
      body,
    );

    decoders.UnfollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async removeActivityFromFeed(request: {
    group: string;
    id: string;
    activity_id: string;
  }): Promise<StreamResponse<RemoveActivityFromFeedResponse>> {
    const pathParams = {
      group: request?.group,
      id: request?.id,
      activity_id: request?.activity_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<RemoveActivityFromFeedResponse>
    >(
      'DELETE',
      '/api/v2/feeds/feeds/{group}/{id}/{activity_id}',
      pathParams,
      undefined,
    );

    decoders.RemoveActivityFromFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async feedsQueryFollowRequests(
    request?: QueryFollowRequestsRequest,
  ): Promise<StreamResponse<QueryFollowRequestsResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryFollowRequestsResponse>
    >(
      'POST',
      '/api/v2/feeds/follow_requests/query',
      undefined,
      undefined,
      body,
    );

    decoders.QueryFollowRequestsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async feedsQueryReactions(
    request: QueryReactionsRequest & { id: string },
  ): Promise<StreamResponse<QueryReactionsResponse>> {
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
      StreamResponse<QueryReactionsResponse>
    >(
      'POST',
      '/api/v2/feeds/reactions/{id}/query',
      pathParams,
      undefined,
      body,
    );

    decoders.QueryReactionsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }
}

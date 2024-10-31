import {
  ApiClient,
  CommonApiWrapper,
  StreamClient,
  StreamResponse,
} from '../../gen-imports';
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
  QueryActivitiesRequest,
  QueryActivitiesResponse,
  QueryFeedsRequest,
  QueryFeedsResponse,
  ReadFlatFeedResponse,
  RemoveActivityFromFeedResponse,
  RemoveFeedMembersResponse,
  UnfollowResponse,
} from '../models';
import { decoders } from '../model-decoders';

export class FeedsApi extends CommonApiWrapper {
  public readonly apiClient: ApiClient;

  constructor(streamClient: StreamClient) {
    super(streamClient);
    this.apiClient = streamClient.apiClient;
  }

  queryActivities = async (
    request?: QueryActivitiesRequest,
  ): Promise<StreamResponse<QueryActivitiesResponse>> => {
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
  };

  queryFeeds = async (
    request?: QueryFeedsRequest,
  ): Promise<StreamResponse<QueryFeedsResponse>> => {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryFeedsResponse>
    >('POST', '/api/v2/feeds/feeds/query', undefined, undefined, body);

    decoders.QueryFeedsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  deleteFeed = async (request: {
    group: string;
    id: string;
  }): Promise<StreamResponse<DeleteFeedResponse>> => {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteFeedResponse>
    >('DELETE', '/api/v2/feeds/feeds/{group}/{id}', pathParams, undefined);

    decoders.DeleteFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  getFeed = async (request: {
    group: string;
    id: string;
  }): Promise<StreamResponse<GetFeedResponse>> => {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetFeedResponse>
    >('GET', '/api/v2/feeds/feeds/{group}/{id}', pathParams, undefined);

    decoders.GetFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  getOrCreateFeed = async (
    request: GetOrCreateFeedRequest & { group: string; id: string },
  ): Promise<StreamResponse<GetOrCreateFeedResponse>> => {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      visibility_level: request?.visibility_level,
      members: request?.members,
      custom: request?.custom,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetOrCreateFeedResponse>
    >('POST', '/api/v2/feeds/feeds/{group}/{id}', pathParams, undefined, body);

    decoders.GetOrCreateFeedResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  addActivity = async (
    request: AddActivityRequest & { group: string; id: string },
  ): Promise<StreamResponse<AddActivityResponse>> => {
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
  };

  readFlatFeed = async (request: {
    group: string;
    id: string;
    limit: number;
    offset: number;
  }): Promise<StreamResponse<ReadFlatFeedResponse>> => {
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
  };

  unfollow = async (request: {
    group: string;
    id: string;
  }): Promise<StreamResponse<UnfollowResponse>> => {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UnfollowResponse>
    >(
      'DELETE',
      '/api/v2/feeds/feeds/{group}/{id}/follow',
      pathParams,
      undefined,
    );

    decoders.UnfollowResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  follow = async (
    request: FollowRequest & { group: string; id: string },
  ): Promise<StreamResponse<FollowResponse>> => {
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
  };

  removeFeedMembers = async (request: {
    group: string;
    id: string;
    remove_members: string;
  }): Promise<StreamResponse<RemoveFeedMembersResponse>> => {
    const queryParams = {
      remove_members: request?.remove_members,
    };
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<RemoveFeedMembersResponse>
    >(
      'DELETE',
      '/api/v2/feeds/feeds/{group}/{id}/members',
      pathParams,
      queryParams,
    );

    decoders.RemoveFeedMembersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  addFeedMembers = async (
    request: AddFeedMembersRequest & { group: string; id: string },
  ): Promise<StreamResponse<AddFeedMembersResponse>> => {
    const pathParams = {
      group: request?.group,
      id: request?.id,
    };
    const body = {
      new_members: request?.new_members,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<AddFeedMembersResponse>
    >(
      'POST',
      '/api/v2/feeds/feeds/{group}/{id}/members',
      pathParams,
      undefined,
      body,
    );

    decoders.AddFeedMembersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  removeActivityFromFeed = async (request: {
    group: string;
    id: string;
    activity_id: string;
  }): Promise<StreamResponse<RemoveActivityFromFeedResponse>> => {
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
  };
}

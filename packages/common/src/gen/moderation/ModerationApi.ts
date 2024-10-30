import { ApiClient, StreamResponse } from '../../gen-imports';
import {
  BanRequest,
  BanResponse,
  FlagRequest,
  FlagResponse,
  MuteRequest,
  MuteResponse,
  QueryModerationConfigsRequest,
  QueryModerationConfigsResponse,
  QueryReviewQueueRequest,
  QueryReviewQueueResponse,
  SubmitActionRequest,
  SubmitActionResponse,
} from '../models';
import { decoders } from '../model-decoders';

export class ModerationApi {
  constructor(public readonly apiClient: ApiClient) {}

  ban = async (request: BanRequest): Promise<StreamResponse<BanResponse>> => {
    const body = {
      target_user_id: request?.target_user_id,
      banned_by_id: request?.banned_by_id,
      channel_cid: request?.channel_cid,
      ip_ban: request?.ip_ban,
      reason: request?.reason,
      shadow: request?.shadow,
      timeout: request?.timeout,
      banned_by: request?.banned_by,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<BanResponse>
    >('POST', '/api/v2/moderation/ban', undefined, undefined, body);

    decoders.BanResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  queryModerationConfigs = async (
    request?: QueryModerationConfigsRequest,
  ): Promise<StreamResponse<QueryModerationConfigsResponse>> => {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryModerationConfigsResponse>
    >('POST', '/api/v2/moderation/configs', undefined, undefined, body);

    decoders.QueryModerationConfigsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  flag = async (
    request: FlagRequest,
  ): Promise<StreamResponse<FlagResponse>> => {
    const body = {
      entity_id: request?.entity_id,
      entity_type: request?.entity_type,
      reason: request?.reason,
      entity_creator_id: request?.entity_creator_id,
      custom: request?.custom,
      moderation_payload: request?.moderation_payload,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<FlagResponse>
    >('POST', '/api/v2/moderation/flag', undefined, undefined, body);

    decoders.FlagResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  mute = async (
    request: MuteRequest,
  ): Promise<StreamResponse<MuteResponse>> => {
    const body = {
      target_ids: request?.target_ids,
      timeout: request?.timeout,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<MuteResponse>
    >('POST', '/api/v2/moderation/mute', undefined, undefined, body);

    decoders.MuteResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  queryReviewQueue = async (
    request?: QueryReviewQueueRequest,
  ): Promise<StreamResponse<QueryReviewQueueResponse>> => {
    const body = {
      limit: request?.limit,
      lock_moderator_duration: request?.lock_moderator_duration,
      lock_moderator_id: request?.lock_moderator_id,
      next: request?.next,
      prev: request?.prev,
      stats_only: request?.stats_only,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryReviewQueueResponse>
    >('POST', '/api/v2/moderation/review_queue', undefined, undefined, body);

    decoders.QueryReviewQueueResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };

  submitAction = async (
    request: SubmitActionRequest,
  ): Promise<StreamResponse<SubmitActionResponse>> => {
    const body = {
      action_type: request?.action_type,
      item_id: request?.item_id,
      ban: request?.ban,
      custom: request?.custom,
      delete_activity: request?.delete_activity,
      delete_message: request?.delete_message,
      delete_reaction: request?.delete_reaction,
      delete_user: request?.delete_user,
      mark_reviewed: request?.mark_reviewed,
      unban: request?.unban,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<SubmitActionResponse>
    >('POST', '/api/v2/moderation/submit_action', undefined, undefined, body);

    decoders.SubmitActionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  };
}

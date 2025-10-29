import type { ApiClient, StreamResponse } from '../../gen-imports';
import type {
  BanRequest,
  BanResponse,
  DeleteModerationConfigResponse,
  FlagRequest,
  FlagResponse,
  GetConfigResponse,
  MuteRequest,
  MuteResponse,
  QueryModerationConfigsRequest,
  QueryModerationConfigsResponse,
  QueryReviewQueueRequest,
  QueryReviewQueueResponse,
  SubmitActionRequest,
  SubmitActionResponse,
  UpsertConfigRequest,
  UpsertConfigResponse,
} from '../models';
import { decoders } from '../model-decoders/decoders';

export class ModerationApi {
  constructor(public readonly apiClient: ApiClient) {}

  async ban(request: BanRequest): Promise<StreamResponse<BanResponse>> {
    const body = {
      target_user_id: request?.target_user_id,
      banned_by_id: request?.banned_by_id,
      channel_cid: request?.channel_cid,
      delete_messages: request?.delete_messages,
      ip_ban: request?.ip_ban,
      reason: request?.reason,
      shadow: request?.shadow,
      timeout: request?.timeout,
      banned_by: request?.banned_by,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<BanResponse>
    >(
      'POST',
      '/api/v2/moderation/ban',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.BanResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async upsertConfig(
    request: UpsertConfigRequest,
  ): Promise<StreamResponse<UpsertConfigResponse>> {
    const body = {
      key: request?.key,
      async: request?.async,
      team: request?.team,
      ai_image_config: request?.ai_image_config,
      ai_text_config: request?.ai_text_config,
      ai_video_config: request?.ai_video_config,
      automod_platform_circumvention_config:
        request?.automod_platform_circumvention_config,
      automod_semantic_filters_config: request?.automod_semantic_filters_config,
      automod_toxicity_config: request?.automod_toxicity_config,
      aws_rekognition_config: request?.aws_rekognition_config,
      block_list_config: request?.block_list_config,
      bodyguard_config: request?.bodyguard_config,
      google_vision_config: request?.google_vision_config,
      llm_config: request?.llm_config,
      rule_builder_config: request?.rule_builder_config,
      velocity_filter_config: request?.velocity_filter_config,
      video_call_rule_config: request?.video_call_rule_config,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpsertConfigResponse>
    >(
      'POST',
      '/api/v2/moderation/config',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.UpsertConfigResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteConfig(request: {
    key: string;
    team?: string;
  }): Promise<StreamResponse<DeleteModerationConfigResponse>> {
    const queryParams = {
      team: request?.team,
    };
    const pathParams = {
      key: request?.key,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<DeleteModerationConfigResponse>
    >('DELETE', '/api/v2/moderation/config/{key}', pathParams, queryParams);

    decoders.DeleteModerationConfigResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getConfig(request: {
    key: string;
    team?: string;
  }): Promise<StreamResponse<GetConfigResponse>> {
    const queryParams = {
      team: request?.team,
    };
    const pathParams = {
      key: request?.key,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetConfigResponse>
    >('GET', '/api/v2/moderation/config/{key}', pathParams, queryParams);

    decoders.GetConfigResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryModerationConfigs(
    request?: QueryModerationConfigsRequest,
  ): Promise<StreamResponse<QueryModerationConfigsResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryModerationConfigsResponse>
    >(
      'POST',
      '/api/v2/moderation/configs',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryModerationConfigsResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async flag(request: FlagRequest): Promise<StreamResponse<FlagResponse>> {
    const body = {
      entity_id: request?.entity_id,
      entity_type: request?.entity_type,
      entity_creator_id: request?.entity_creator_id,
      reason: request?.reason,
      custom: request?.custom,
      moderation_payload: request?.moderation_payload,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<FlagResponse>
    >(
      'POST',
      '/api/v2/moderation/flag',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.FlagResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async mute(request: MuteRequest): Promise<StreamResponse<MuteResponse>> {
    const body = {
      target_ids: request?.target_ids,
      timeout: request?.timeout,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<MuteResponse>
    >(
      'POST',
      '/api/v2/moderation/mute',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.MuteResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryReviewQueue(
    request?: QueryReviewQueueRequest,
  ): Promise<StreamResponse<QueryReviewQueueResponse>> {
    const body = {
      limit: request?.limit,
      lock_count: request?.lock_count,
      lock_duration: request?.lock_duration,
      lock_items: request?.lock_items,
      next: request?.next,
      prev: request?.prev,
      stats_only: request?.stats_only,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryReviewQueueResponse>
    >(
      'POST',
      '/api/v2/moderation/review_queue',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.QueryReviewQueueResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async submitAction(
    request: SubmitActionRequest,
  ): Promise<StreamResponse<SubmitActionResponse>> {
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
      shadow_block: request?.shadow_block,
      unban: request?.unban,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<SubmitActionResponse>
    >(
      'POST',
      '/api/v2/moderation/submit_action',
      undefined,
      undefined,
      body,
      'application/json',
    );

    decoders.SubmitActionResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }
}

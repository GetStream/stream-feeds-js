import type { ApiClient, StreamResponse } from '../../gen-imports';
import type {
  AppealRequest,
  AppealResponse,
  BanRequest,
  BulkActionAppealsRequest,
  BulkActionAppealsResponse,
  BulkDeleteActionConfigRequest,
  BulkDeleteActionConfigResponse,
  BulkUpsertActionConfigRequest,
  BulkUpsertActionConfigResponse,
  CreateQueueRequest,
  DeleteActionConfigResponse,
  DeleteModerationConfigResponse,
  DeleteQueueRequest,
  FlagItemResponse,
  FlagRequest,
  GetActionConfigResponse,
  GetAppealResponse,
  GetConfigResponse,
  ListQueuesResponse,
  ModerationBanResponse,
  MuteRequest,
  MuteResponse,
  QueryAppealsRequest,
  QueryAppealsResponse,
  QueryModerationConfigsRequest,
  QueryModerationConfigsResponse,
  QueryReviewQueueRequest,
  QueryReviewQueueResponse,
  QueueResponse,
  SubmitActionRequest,
  SubmitActionResponse,
  UnbanRequest,
  UnbanResponse,
  UnmuteRequest,
  UnmuteResponse,
  UpdateQueueRequest,
  UpsertActionConfigRequest,
  UpsertActionConfigResponse,
  UpsertConfigRequest,
  UpsertConfigResponse,
} from '../models';
import { decoders } from '../model-decoders/decoders';

export class ModerationApi {
  constructor(public readonly apiClient: ApiClient) {}

  async getActionConfig(request?: {
    queue_type?: string;
    entity_type?: string;
    exclude_defaults?: boolean;
    only_defaults?: boolean;
  }): Promise<StreamResponse<GetActionConfigResponse>> {
    const queryParams = {
      queue_type: request?.queue_type,
      entity_type: request?.entity_type,
      exclude_defaults: request?.exclude_defaults,
      only_defaults: request?.only_defaults,
    };

    const response = await this.apiClient.sendRequest<GetActionConfigResponse>(
      'GET',
      '/api/v2/moderation/action_config',
      undefined,
      queryParams,
    );

    decoders.GetActionConfigResponse?.(response);

    return response;
  }

  async upsertActionConfig(
    request: UpsertActionConfigRequest,
  ): Promise<StreamResponse<UpsertActionConfigResponse>> {
    const body = {
      action: request?.action,
      entity_type: request?.entity_type,
      order: request?.order,
      description: request?.description,
      icon: request?.icon,
      id: request?.id,
      queue_type: request?.queue_type,
      custom: request?.custom,
    };

    const response =
      await this.apiClient.sendRequest<UpsertActionConfigResponse>(
        'POST',
        '/api/v2/moderation/action_config',
        undefined,
        undefined,
        body,
      );

    decoders.UpsertActionConfigResponse?.(response);

    return response;
  }

  async bulkUpsertActionConfig(
    request: BulkUpsertActionConfigRequest,
  ): Promise<StreamResponse<BulkUpsertActionConfigResponse>> {
    const body = {
      action_configs: request?.action_configs,
    };

    const response =
      await this.apiClient.sendRequest<BulkUpsertActionConfigResponse>(
        'POST',
        '/api/v2/moderation/action_config/bulk',
        undefined,
        undefined,
        body,
      );

    decoders.BulkUpsertActionConfigResponse?.(response);

    return response;
  }

  async bulkDeleteActionConfig(
    request: BulkDeleteActionConfigRequest,
  ): Promise<StreamResponse<BulkDeleteActionConfigResponse>> {
    const body = {
      ids: request?.ids,
    };

    const response =
      await this.apiClient.sendRequest<BulkDeleteActionConfigResponse>(
        'POST',
        '/api/v2/moderation/action_config/bulk_delete',
        undefined,
        undefined,
        body,
      );

    decoders.BulkDeleteActionConfigResponse?.(response);

    return response;
  }

  async deleteActionConfig(request: {
    id: string;
  }): Promise<StreamResponse<DeleteActionConfigResponse>> {
    const pathParams = {
      id: request?.id,
    };

    const response =
      await this.apiClient.sendRequest<DeleteActionConfigResponse>(
        'DELETE',
        '/api/v2/moderation/action_config/{id}',
        pathParams,
        undefined,
      );

    decoders.DeleteActionConfigResponse?.(response);

    return response;
  }

  async appeal(
    request: AppealRequest,
  ): Promise<StreamResponse<AppealResponse>> {
    const body = {
      appeal_reason: request?.appeal_reason,
      entity_id: request?.entity_id,
      entity_type: request?.entity_type,
      channel_cid: request?.channel_cid,
      review_queue_item_id: request?.review_queue_item_id,
      attachments: request?.attachments,
    };

    const response = await this.apiClient.sendRequest<AppealResponse>(
      'POST',
      '/api/v2/moderation/appeal',
      undefined,
      undefined,
      body,
    );

    decoders.AppealResponse?.(response);

    return response;
  }

  async getAppeal(request: {
    id: string;
  }): Promise<StreamResponse<GetAppealResponse>> {
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<GetAppealResponse>(
      'GET',
      '/api/v2/moderation/appeal/{id}',
      pathParams,
      undefined,
    );

    decoders.GetAppealResponse?.(response);

    return response;
  }

  async queryAppeals(
    request?: QueryAppealsRequest,
  ): Promise<StreamResponse<QueryAppealsResponse>> {
    const body = {
      limit: request?.limit,
      next: request?.next,
      prev: request?.prev,
      sort: request?.sort,
      filter: request?.filter,
    };

    const response = await this.apiClient.sendRequest<QueryAppealsResponse>(
      'POST',
      '/api/v2/moderation/appeals',
      undefined,
      undefined,
      body,
    );

    decoders.QueryAppealsResponse?.(response);

    return response;
  }

  async bulkActionAppeals(
    request: BulkActionAppealsRequest,
  ): Promise<StreamResponse<BulkActionAppealsResponse>> {
    const body = {
      action_type: request?.action_type,
      appeal_ids: request?.appeal_ids,
      mark_reviewed: request?.mark_reviewed,
      reject_appeal: request?.reject_appeal,
      restore: request?.restore,
      unban: request?.unban,
      unblock: request?.unblock,
    };

    const response =
      await this.apiClient.sendRequest<BulkActionAppealsResponse>(
        'POST',
        '/api/v2/moderation/appeals/bulk_action',
        undefined,
        undefined,
        body,
      );

    decoders.BulkActionAppealsResponse?.(response);

    return response;
  }

  async ban(
    request: BanRequest,
  ): Promise<StreamResponse<ModerationBanResponse>> {
    const body = {
      target_user_id: request?.target_user_id,
      channel_cid: request?.channel_cid,
      delete_messages: request?.delete_messages,
      ip_ban: request?.ip_ban,
      reason: request?.reason,
      shadow: request?.shadow,
      timeout: request?.timeout,
    };

    const response = await this.apiClient.sendRequest<ModerationBanResponse>(
      'POST',
      '/api/v2/moderation/ban',
      undefined,
      undefined,
      body,
    );

    decoders.ModerationBanResponse?.(response);

    return response;
  }

  async upsertConfig(
    request: UpsertConfigRequest,
  ): Promise<StreamResponse<UpsertConfigResponse>> {
    const body = {
      key: request?.key,
      async: request?.async,
      team: request?.team,
      ai_audio_config: request?.ai_audio_config,
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
      flood_config: request?.flood_config,
      google_vision_config: request?.google_vision_config,
      llm_config: request?.llm_config,
      rule_builder_config: request?.rule_builder_config,
      velocity_filter_config: request?.velocity_filter_config,
      video_call_rule_config: request?.video_call_rule_config,
    };

    const response = await this.apiClient.sendRequest<UpsertConfigResponse>(
      'POST',
      '/api/v2/moderation/config',
      undefined,
      undefined,
      body,
    );

    decoders.UpsertConfigResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<DeleteModerationConfigResponse>(
        'DELETE',
        '/api/v2/moderation/config/{key}',
        pathParams,
        queryParams,
      );

    decoders.DeleteModerationConfigResponse?.(response);

    return response;
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

    const response = await this.apiClient.sendRequest<GetConfigResponse>(
      'GET',
      '/api/v2/moderation/config/{key}',
      pathParams,
      queryParams,
    );

    decoders.GetConfigResponse?.(response);

    return response;
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

    const response =
      await this.apiClient.sendRequest<QueryModerationConfigsResponse>(
        'POST',
        '/api/v2/moderation/configs',
        undefined,
        undefined,
        body,
      );

    decoders.QueryModerationConfigsResponse?.(response);

    return response;
  }

  async flag(request: FlagRequest): Promise<StreamResponse<FlagItemResponse>> {
    const body = {
      entity_id: request?.entity_id,
      entity_type: request?.entity_type,
      entity_creator_id: request?.entity_creator_id,
      reason: request?.reason,
      custom: request?.custom,
      moderation_payload: request?.moderation_payload,
    };

    const response = await this.apiClient.sendRequest<FlagItemResponse>(
      'POST',
      '/api/v2/moderation/flag',
      undefined,
      undefined,
      body,
    );

    decoders.FlagItemResponse?.(response);

    return response;
  }

  async mute(request: MuteRequest): Promise<StreamResponse<MuteResponse>> {
    const body = {
      target_ids: request?.target_ids,
      timeout: request?.timeout,
    };

    const response = await this.apiClient.sendRequest<MuteResponse>(
      'POST',
      '/api/v2/moderation/mute',
      undefined,
      undefined,
      body,
    );

    decoders.MuteResponse?.(response);

    return response;
  }

  async listQueues(): Promise<StreamResponse<ListQueuesResponse>> {
    const response = await this.apiClient.sendRequest<ListQueuesResponse>(
      'GET',
      '/api/v2/moderation/queues',
      undefined,
      undefined,
    );

    decoders.ListQueuesResponse?.(response);

    return response;
  }

  async createQueue(
    request: CreateQueueRequest,
  ): Promise<StreamResponse<QueueResponse>> {
    const body = {
      name: request?.name,
      type: request?.type,
      description: request?.description,
      sort: request?.sort,
      filters: request?.filters,
    };

    const response = await this.apiClient.sendRequest<QueueResponse>(
      'POST',
      '/api/v2/moderation/queues',
      undefined,
      undefined,
      body,
    );

    decoders.QueueResponse?.(response);

    return response;
  }

  async getQueue(request: {
    id: string;
  }): Promise<StreamResponse<QueueResponse>> {
    const pathParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<QueueResponse>(
      'GET',
      '/api/v2/moderation/queues/{id}',
      pathParams,
      undefined,
    );

    decoders.QueueResponse?.(response);

    return response;
  }

  async updateQueue(
    request: UpdateQueueRequest & { id: string },
  ): Promise<StreamResponse<QueueResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {
      description: request?.description,
      name: request?.name,
      sort: request?.sort,
      filters: request?.filters,
    };

    const response = await this.apiClient.sendRequest<QueueResponse>(
      'PATCH',
      '/api/v2/moderation/queues/{id}',
      pathParams,
      undefined,
      body,
    );

    decoders.QueueResponse?.(response);

    return response;
  }

  async deleteQueue(
    request: DeleteQueueRequest & { id: string },
  ): Promise<StreamResponse<QueueResponse>> {
    const pathParams = {
      id: request?.id,
    };
    const body = {};

    const response = await this.apiClient.sendRequest<QueueResponse>(
      'POST',
      '/api/v2/moderation/queues/{id}/delete',
      pathParams,
      undefined,
      body,
    );

    decoders.QueueResponse?.(response);

    return response;
  }

  async queryReviewQueue(
    request?: QueryReviewQueueRequest,
  ): Promise<StreamResponse<QueryReviewQueueResponse>> {
    const body = {
      exclude_default_action_config: request?.exclude_default_action_config,
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

    const response = await this.apiClient.sendRequest<QueryReviewQueueResponse>(
      'POST',
      '/api/v2/moderation/review_queue',
      undefined,
      undefined,
      body,
    );

    decoders.QueryReviewQueueResponse?.(response);

    return response;
  }

  async submitAction(
    request: SubmitActionRequest,
  ): Promise<StreamResponse<SubmitActionResponse>> {
    const body = {
      action_type: request?.action_type,
      appeal_id: request?.appeal_id,
      item_id: request?.item_id,
      ban: request?.ban,
      block: request?.block,
      bypass: request?.bypass,
      custom: request?.custom,
      delete_activity: request?.delete_activity,
      delete_comment: request?.delete_comment,
      delete_message: request?.delete_message,
      delete_reaction: request?.delete_reaction,
      delete_user: request?.delete_user,
      delete_user_messages: request?.delete_user_messages,
      escalate: request?.escalate,
      flag: request?.flag,
      mark_reviewed: request?.mark_reviewed,
      reject_appeal: request?.reject_appeal,
      restore: request?.restore,
      shadow_block: request?.shadow_block,
      unban: request?.unban,
      unblock: request?.unblock,
    };

    const response = await this.apiClient.sendRequest<SubmitActionResponse>(
      'POST',
      '/api/v2/moderation/submit_action',
      undefined,
      undefined,
      body,
    );

    decoders.SubmitActionResponse?.(response);

    return response;
  }

  async unban(
    request: UnbanRequest & { target_user_id: string; channel_cid?: string },
  ): Promise<StreamResponse<UnbanResponse>> {
    const queryParams = {
      target_user_id: request?.target_user_id,
      channel_cid: request?.channel_cid,
    };
    const body = {};

    const response = await this.apiClient.sendRequest<UnbanResponse>(
      'POST',
      '/api/v2/moderation/unban',
      undefined,
      queryParams,
      body,
    );

    decoders.UnbanResponse?.(response);

    return response;
  }

  async unmute(
    request: UnmuteRequest,
  ): Promise<StreamResponse<UnmuteResponse>> {
    const body = {
      target_ids: request?.target_ids,
    };

    const response = await this.apiClient.sendRequest<UnmuteResponse>(
      'POST',
      '/api/v2/moderation/unmute',
      undefined,
      undefined,
      body,
    );

    decoders.UnmuteResponse?.(response);

    return response;
  }
}

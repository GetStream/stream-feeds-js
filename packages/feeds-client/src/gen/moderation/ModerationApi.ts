import { ApiClient, StreamResponse } from '../../gen-imports';
import {  AIImageConfig,  AIImageLabelDefinition,  AITextConfig,  AIVideoConfig,  APIError,  AWSRekognitionRule,  AcceptFeedMemberInviteRequest,  AcceptFeedMemberInviteResponse,  AcceptFollowRequest,  AcceptFollowResponse,  Action,  ActionLogResponse,  ActionSequence,  ActivityAddedEvent,  ActivityDeletedEvent,  ActivityFeedbackEvent,  ActivityFeedbackEventPayload,  ActivityFeedbackRequest,  ActivityFeedbackResponse,  ActivityLocation,  ActivityMarkEvent,  ActivityPinResponse,  ActivityPinnedEvent,  ActivityProcessorConfig,  ActivityReactionAddedEvent,  ActivityReactionDeletedEvent,  ActivityReactionUpdatedEvent,  ActivityRemovedFromFeedEvent,  ActivityRequest,  ActivityResponse,  ActivityRestoredEvent,  ActivitySelectorConfig,  ActivityUnpinnedEvent,  ActivityUpdatedEvent,  AddActivityRequest,  AddActivityResponse,  AddBookmarkRequest,  AddBookmarkResponse,  AddCommentReactionRequest,  AddCommentReactionResponse,  AddCommentRequest,  AddCommentResponse,  AddCommentsBatchRequest,  AddCommentsBatchResponse,  AddFolderRequest,  AddReactionRequest,  AddReactionResponse,  AddUserGroupMembersRequest,  AddUserGroupMembersResponse,  AggregatedActivityResponse,  AggregationConfig,  AppEventResponse,  AppResponseFields,  AppUpdatedEvent,  AppealItemResponse,  AppealRequest,  AppealResponse,  Attachment,  AudioSettingsResponse,  AutomodPlatformCircumventionConfig,  AutomodRule,  AutomodSemanticFiltersConfig,  AutomodSemanticFiltersRule,  AutomodToxicityConfig,  BackstageSettingsResponse,  BanActionRequestPayload,  BanInfoResponse,  BanOptions,  BanRequest,  BanResponse,  BlockActionRequestPayload,  BlockListConfig,  BlockListOptions,  BlockListResponse,  BlockListRule,  BlockUsersRequest,  BlockUsersResponse,  BlockedUserResponse,  BodyguardRule,  BodyguardSeverityRule,  BookmarkAddedEvent,  BookmarkDeletedEvent,  BookmarkFolderDeletedEvent,  BookmarkFolderResponse,  BookmarkFolderUpdatedEvent,  BookmarkResponse,  BookmarkUpdatedEvent,  BroadcastSettingsResponse,  CallActionOptions,  CallCustomPropertyParameters,  CallIngressResponse,  CallParticipantResponse,  CallResponse,  CallRuleActionSequence,  CallSessionResponse,  CallSettingsResponse,  CallTypeRuleParameters,  CallViolationCountParameters,  CastPollVoteRequest,  ChannelConfigWithInfo,  ChannelMemberResponse,  ChannelMute,  ChannelOwnCapability,  ChannelPushPreferencesResponse,  ChannelResponse,  ChatPreferences,  ChatPreferencesInput,  ChatPreferencesResponse,  ClosedCaptionRuleParameters,  CollectionRequest,  CollectionResponse,  Command,  CommentAddedEvent,  CommentDeletedEvent,  CommentReactionAddedEvent,  CommentReactionDeletedEvent,  CommentReactionUpdatedEvent,  CommentResponse,  CommentUpdatedEvent,  CompositeRecordingResponse,  ConfigResponse,  ConnectUserDetailsRequest,  ContentCountRuleParameters,  CreateBlockListRequest,  CreateBlockListResponse,  CreateCollectionsRequest,  CreateCollectionsResponse,  CreateDeviceRequest,  CreateFeedsBatchRequest,  CreateFeedsBatchResponse,  CreateGuestRequest,  CreateGuestResponse,  CreatePollOptionRequest,  CreatePollRequest,  CreateUserGroupRequest,  CreateUserGroupResponse,  CustomActionRequestPayload,  Data,  DecayFunctionConfig,  DeleteActivitiesRequest,  DeleteActivitiesResponse,  DeleteActivityReactionResponse,  DeleteActivityRequestPayload,  DeleteActivityResponse,  DeleteBookmarkFolderResponse,  DeleteBookmarkResponse,  DeleteCollectionsResponse,  DeleteCommentReactionResponse,  DeleteCommentRequestPayload,  DeleteCommentResponse,  DeleteFeedResponse,  DeleteMessageRequestPayload,  DeleteModerationConfigResponse,  DeleteReactionRequestPayload,  DeleteUserRequestPayload,  DeliveryReceiptsResponse,  DeviceResponse,  DraftPayloadResponse,  DraftResponse,  EgressHLSResponse,  EgressRTMPResponse,  EgressResponse,  EnrichedActivity,  EnrichedCollectionResponse,  EnrichedReaction,  EnrichmentOptions,  EntityCreatorResponse,  FeedCreatedEvent,  FeedDeletedEvent,  FeedGroup,  FeedGroupChangedEvent,  FeedGroupDeletedEvent,  FeedGroupRestoredEvent,  FeedInput,  FeedMemberAddedEvent,  FeedMemberRemovedEvent,  FeedMemberRequest,  FeedMemberResponse,  FeedMemberUpdatedEvent,  FeedOwnCapability,  FeedOwnData,  FeedRequest,  FeedResponse,  FeedSuggestionResponse,  FeedUpdatedEvent,  FeedsPreferences,  FeedsPreferencesResponse,  FeedsReactionGroupResponse,  FeedsReactionResponse,  Field,  FileUploadConfig,  FileUploadRequest,  FileUploadResponse,  FilterConfigResponse,  FlagCountRuleParameters,  FlagRequest,  FlagResponse,  FlagUserOptions,  FollowBatchRequest,  FollowBatchResponse,  FollowCreatedEvent,  FollowDeletedEvent,  FollowPair,  FollowRequest,  FollowResponse,  FollowUpdatedEvent,  FrameRecordingResponse,  FrameRecordingSettingsResponse,  FriendReactionsOptions,  FullUserResponse,  GeofenceSettingsResponse,  GetActivityResponse,  GetAppealResponse,  GetApplicationResponse,  GetBlockedUsersResponse,  GetCommentRepliesResponse,  GetCommentResponse,  GetCommentsResponse,  GetConfigResponse,  GetFollowSuggestionsResponse,  GetOGResponse,  GetOrCreateFeedRequest,  GetOrCreateFeedResponse,  GetUserGroupResponse,  GoogleVisionConfig,  HLSSettingsResponse,  HarmConfig,  HealthCheckEvent,  ImageContentParameters,  ImageData,  ImageRuleParameters,  ImageSize,  ImageUploadRequest,  ImageUploadResponse,  Images,  IndividualRecordingResponse,  IndividualRecordingSettingsResponse,  IngressAudioEncodingResponse,  IngressSettingsResponse,  IngressSourceResponse,  IngressVideoEncodingResponse,  IngressVideoLayerResponse,  KeyframeRuleParameters,  LLMConfig,  LLMRule,  LabelThresholds,  LimitsSettingsResponse,  ListBlockListResponse,  ListDevicesResponse,  ListUserGroupsResponse,  MarkActivityRequest,  MarkReviewedRequestPayload,  MembershipLevelResponse,  MessageResponse,  ModerationActionConfigResponse,  ModerationCustomActionEvent,  ModerationFlagResponse,  ModerationFlaggedEvent,  ModerationMarkReviewedEvent,  ModerationPayload,  ModerationPayloadResponse,  ModerationV2Response,  MuteRequest,  MuteResponse,  NoiseCancellationSettings,  NotificationComment,  NotificationConfig,  NotificationContext,  NotificationFeedUpdatedEvent,  NotificationParentActivity,  NotificationStatusResponse,  NotificationTarget,  NotificationTrigger,  OCRRule,  OnlyUserID,  OwnBatchRequest,  OwnBatchResponse,  OwnUserResponse,  PagerRequest,  PagerResponse,  PinActivityRequest,  PinActivityResponse,  PollClosedFeedEvent,  PollDeletedFeedEvent,  PollOptionInput,  PollOptionRequest,  PollOptionResponse,  PollOptionResponseData,  PollResponse,  PollResponseData,  PollUpdatedFeedEvent,  PollVoteCastedFeedEvent,  PollVoteChangedFeedEvent,  PollVoteRemovedFeedEvent,  PollVoteResponse,  PollVoteResponseData,  PollVotesResponse,  PrivacySettingsResponse,  PushNotificationConfig,  PushPreferenceInput,  PushPreferencesResponse,  QueryActivitiesRequest,  QueryActivitiesResponse,  QueryActivityReactionsRequest,  QueryActivityReactionsResponse,  QueryAppealsRequest,  QueryAppealsResponse,  QueryBookmarkFoldersRequest,  QueryBookmarkFoldersResponse,  QueryBookmarksRequest,  QueryBookmarksResponse,  QueryCollectionsRequest,  QueryCollectionsResponse,  QueryCommentReactionsRequest,  QueryCommentReactionsResponse,  QueryCommentsRequest,  QueryCommentsResponse,  QueryFeedMembersRequest,  QueryFeedMembersResponse,  QueryFeedsRequest,  QueryFeedsResponse,  QueryFollowsRequest,  QueryFollowsResponse,  QueryModerationConfigsRequest,  QueryModerationConfigsResponse,  QueryPinnedActivitiesRequest,  QueryPinnedActivitiesResponse,  QueryPollVotesRequest,  QueryPollsRequest,  QueryPollsResponse,  QueryReviewQueueRequest,  QueryReviewQueueResponse,  QueryUsersPayload,  QueryUsersResponse,  RTMPIngress,  RTMPSettingsResponse,  RankingConfig,  RawRecordingResponse,  RawRecordingSettingsResponse,  Reaction,  ReactionGroupResponse,  ReactionResponse,  ReadCollectionsResponse,  ReadReceiptsResponse,  RecordSettingsResponse,  RejectAppealRequestPayload,  RejectFeedMemberInviteRequest,  RejectFeedMemberInviteResponse,  RejectFollowRequest,  RejectFollowResponse,  ReminderResponseData,  RemoveUserGroupMembersRequest,  RemoveUserGroupMembersResponse,  RepliesMeta,  Response,  RestoreActionRequestPayload,  RestoreActivityRequest,  RestoreActivityResponse,  ReviewQueueItemResponse,  RingSettingsResponse,  RuleBuilderAction,  RuleBuilderCondition,  RuleBuilderConditionGroup,  RuleBuilderConfig,  RuleBuilderRule,  SRTIngress,  ScreensharingSettingsResponse,  SearchUserGroupsResponse,  SessionSettingsResponse,  ShadowBlockActionRequestPayload,  SharedLocationResponse,  SharedLocationResponseData,  SharedLocationsResponse,  SingleFollowResponse,  SortParam,  SortParamRequest,  SpeechSegmentConfig,  StoriesConfig,  StoriesFeedUpdatedEvent,  SubmitActionRequest,  SubmitActionResponse,  TargetResolution,  TextContentParameters,  TextRuleParameters,  ThreadedCommentResponse,  Thresholds,  ThumbnailResponse,  ThumbnailsSettingsResponse,  Time,  TrackActivityMetricsEvent,  TrackActivityMetricsEventResult,  TrackActivityMetricsRequest,  TrackActivityMetricsResponse,  TranscriptionSettingsResponse,  TranslationSettings,  TypingIndicatorsResponse,  UnbanActionRequestPayload,  UnblockActionRequestPayload,  UnblockUsersRequest,  UnblockUsersResponse,  UnfollowBatchRequest,  UnfollowBatchResponse,  UnfollowResponse,  UnpinActivityResponse,  UpdateActivityPartialRequest,  UpdateActivityPartialResponse,  UpdateActivityRequest,  UpdateActivityResponse,  UpdateBlockListRequest,  UpdateBlockListResponse,  UpdateBookmarkFolderRequest,  UpdateBookmarkFolderResponse,  UpdateBookmarkRequest,  UpdateBookmarkResponse,  UpdateCollectionRequest,  UpdateCollectionsRequest,  UpdateCollectionsResponse,  UpdateCommentRequest,  UpdateCommentResponse,  UpdateFeedMembersRequest,  UpdateFeedMembersResponse,  UpdateFeedRequest,  UpdateFeedResponse,  UpdateFollowRequest,  UpdateFollowResponse,  UpdateLiveLocationRequest,  UpdatePollOptionRequest,  UpdatePollPartialRequest,  UpdatePollRequest,  UpdateUserGroupRequest,  UpdateUserGroupResponse,  UpdateUserPartialRequest,  UpdateUsersPartialRequest,  UpdateUsersRequest,  UpdateUsersResponse,  UpsertActivitiesRequest,  UpsertActivitiesResponse,  UpsertConfigRequest,  UpsertConfigResponse,  UpsertPushPreferencesRequest,  UpsertPushPreferencesResponse,  User,  UserBannedEvent,  UserCreatedWithinParameters,  UserCustomPropertyParameters,  UserDeactivatedEvent,  UserGroupMember,  UserGroupResponse,  UserIdenticalContentCountParameters,  UserMuteResponse,  UserReactivatedEvent,  UserRequest,  UserResponse,  UserResponseCommonFields,  UserResponsePrivacyFields,  UserRoleParameters,  UserRuleParameters,  UserUnbannedEvent,  UserUpdatedEvent,  VelocityFilterConfig,  VelocityFilterConfigRule,  VideoCallRuleConfig,  VideoContentParameters,  VideoEndCallRequestPayload,  VideoKickUserRequestPayload,  VideoRuleParameters,  VideoSettingsResponse,  VoteData,  WHIPIngress,  WSAuthMessage,  WSClientEvent,  WSEvent,  } from '../models';
import { decoders } from '../model-decoders/decoders'

export class ModerationApi {

    constructor(public readonly apiClient: ApiClient) {}

    
    async appeal (request: AppealRequest 
    
    ): Promise<StreamResponse<AppealResponse>> {
        const body = {
          appeal_reason: request?.appeal_reason,entity_id: request?.entity_id,entity_type: request?.entity_type,attachments: request?.attachments,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<AppealResponse>>('POST', '/api/v2/moderation/appeal',  undefined ,  undefined  , body, 'application/json');

       decoders["AppealResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async getAppeal (request: 
    
    
    {id: string,
    }
    ): Promise<StreamResponse<GetAppealResponse>> {
        const pathParams = {
          id: request?.id,
        };
        

        const response = await this.apiClient.sendRequest<StreamResponse<GetAppealResponse>>('GET', '/api/v2/moderation/appeal/{id}', pathParams ,  undefined  );

       decoders["GetAppealResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async queryAppeals (request?: QueryAppealsRequest 
    
    ): Promise<StreamResponse<QueryAppealsResponse>> {
        const body = {
          limit: request?.limit,next: request?.next,prev: request?.prev,sort: request?.sort,filter: request?.filter,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<QueryAppealsResponse>>('POST', '/api/v2/moderation/appeals',  undefined ,  undefined  , body, 'application/json');

       decoders["QueryAppealsResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async ban (request: BanRequest 
    
    ): Promise<StreamResponse<BanResponse>> {
        const body = {
          target_user_id: request?.target_user_id,banned_by_id: request?.banned_by_id,channel_cid: request?.channel_cid,delete_messages: request?.delete_messages,ip_ban: request?.ip_ban,reason: request?.reason,shadow: request?.shadow,timeout: request?.timeout,banned_by: request?.banned_by,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<BanResponse>>('POST', '/api/v2/moderation/ban',  undefined ,  undefined  , body, 'application/json');

       decoders["BanResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async upsertConfig (request: UpsertConfigRequest 
    
    ): Promise<StreamResponse<UpsertConfigResponse>> {
        const body = {
          key: request?.key,async: request?.async,team: request?.team,ai_image_config: request?.ai_image_config,ai_text_config: request?.ai_text_config,ai_video_config: request?.ai_video_config,automod_platform_circumvention_config: request?.automod_platform_circumvention_config,automod_semantic_filters_config: request?.automod_semantic_filters_config,automod_toxicity_config: request?.automod_toxicity_config,aws_rekognition_config: request?.aws_rekognition_config,block_list_config: request?.block_list_config,bodyguard_config: request?.bodyguard_config,google_vision_config: request?.google_vision_config,llm_config: request?.llm_config,rule_builder_config: request?.rule_builder_config,velocity_filter_config: request?.velocity_filter_config,video_call_rule_config: request?.video_call_rule_config,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<UpsertConfigResponse>>('POST', '/api/v2/moderation/config',  undefined ,  undefined  , body, 'application/json');

       decoders["UpsertConfigResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async deleteConfig (request: 
    
    
    {key: string,team?: string,
    }
    ): Promise<StreamResponse<DeleteModerationConfigResponse>> {
        
        const queryParams = {
          team: request?.team,
        };
        const pathParams = {
          key: request?.key,
        };
        

        const response = await this.apiClient.sendRequest<StreamResponse<DeleteModerationConfigResponse>>('DELETE', '/api/v2/moderation/config/{key}', pathParams , queryParams  );

       decoders["DeleteModerationConfigResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async getConfig (request: 
    
    
    {key: string,team?: string,
    }
    ): Promise<StreamResponse<GetConfigResponse>> {
        
        const queryParams = {
          team: request?.team,
        };
        const pathParams = {
          key: request?.key,
        };
        

        const response = await this.apiClient.sendRequest<StreamResponse<GetConfigResponse>>('GET', '/api/v2/moderation/config/{key}', pathParams , queryParams  );

       decoders["GetConfigResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async queryModerationConfigs (request?: QueryModerationConfigsRequest 
    
    ): Promise<StreamResponse<QueryModerationConfigsResponse>> {
        const body = {
          limit: request?.limit,next: request?.next,prev: request?.prev,sort: request?.sort,filter: request?.filter,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<QueryModerationConfigsResponse>>('POST', '/api/v2/moderation/configs',  undefined ,  undefined  , body, 'application/json');

       decoders["QueryModerationConfigsResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async flag (request: FlagRequest 
    
    ): Promise<StreamResponse<FlagResponse>> {
        const body = {
          entity_id: request?.entity_id,entity_type: request?.entity_type,entity_creator_id: request?.entity_creator_id,reason: request?.reason,custom: request?.custom,moderation_payload: request?.moderation_payload,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<FlagResponse>>('POST', '/api/v2/moderation/flag',  undefined ,  undefined  , body, 'application/json');

       decoders["FlagResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async mute (request: MuteRequest 
    
    ): Promise<StreamResponse<MuteResponse>> {
        const body = {
          target_ids: request?.target_ids,timeout: request?.timeout,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<MuteResponse>>('POST', '/api/v2/moderation/mute',  undefined ,  undefined  , body, 'application/json');

       decoders["MuteResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async queryReviewQueue (request?: QueryReviewQueueRequest 
    
    ): Promise<StreamResponse<QueryReviewQueueResponse>> {
        const body = {
          limit: request?.limit,lock_count: request?.lock_count,lock_duration: request?.lock_duration,lock_items: request?.lock_items,next: request?.next,prev: request?.prev,stats_only: request?.stats_only,sort: request?.sort,filter: request?.filter,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<QueryReviewQueueResponse>>('POST', '/api/v2/moderation/review_queue',  undefined ,  undefined  , body, 'application/json');

       decoders["QueryReviewQueueResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    
    async submitAction (request: SubmitActionRequest 
    
    ): Promise<StreamResponse<SubmitActionResponse>> {
        const body = {
          action_type: request?.action_type,appeal_id: request?.appeal_id,item_id: request?.item_id,ban: request?.ban,block: request?.block,custom: request?.custom,delete_activity: request?.delete_activity,delete_comment: request?.delete_comment,delete_message: request?.delete_message,delete_reaction: request?.delete_reaction,delete_user: request?.delete_user,flag: request?.flag,mark_reviewed: request?.mark_reviewed,reject_appeal: request?.reject_appeal,restore: request?.restore,shadow_block: request?.shadow_block,unban: request?.unban,unblock: request?.unblock,
        }
        

        const response = await this.apiClient.sendRequest<StreamResponse<SubmitActionResponse>>('POST', '/api/v2/moderation/submit_action',  undefined ,  undefined  , body, 'application/json');

       decoders["SubmitActionResponse"]?.(response.body);

      return {...response.body, metadata: response.metadata};
}
    }
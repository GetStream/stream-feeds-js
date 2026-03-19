import { StreamResponse, FeedsApi } from '../../gen-imports';
import {  AIImageConfig,  AIImageLabelDefinition,  AITextConfig,  AIVideoConfig,  APIError,  AWSRekognitionRule,  AcceptFeedMemberInviteRequest,  AcceptFeedMemberInviteResponse,  AcceptFollowRequest,  AcceptFollowResponse,  Action,  ActionLogResponse,  ActionSequence,  ActivityAddedEvent,  ActivityDeletedEvent,  ActivityFeedbackEvent,  ActivityFeedbackEventPayload,  ActivityFeedbackRequest,  ActivityFeedbackResponse,  ActivityLocation,  ActivityMarkEvent,  ActivityPinResponse,  ActivityPinnedEvent,  ActivityProcessorConfig,  ActivityReactionAddedEvent,  ActivityReactionDeletedEvent,  ActivityReactionUpdatedEvent,  ActivityRemovedFromFeedEvent,  ActivityRequest,  ActivityResponse,  ActivityRestoredEvent,  ActivitySelectorConfig,  ActivityUnpinnedEvent,  ActivityUpdatedEvent,  AddActivityRequest,  AddActivityResponse,  AddBookmarkRequest,  AddBookmarkResponse,  AddCommentReactionRequest,  AddCommentReactionResponse,  AddCommentRequest,  AddCommentResponse,  AddCommentsBatchRequest,  AddCommentsBatchResponse,  AddFolderRequest,  AddReactionRequest,  AddReactionResponse,  AddUserGroupMembersRequest,  AddUserGroupMembersResponse,  AggregatedActivityResponse,  AggregationConfig,  AppEventResponse,  AppResponseFields,  AppUpdatedEvent,  AppealItemResponse,  AppealRequest,  AppealResponse,  Attachment,  AudioSettingsResponse,  AutomodPlatformCircumventionConfig,  AutomodRule,  AutomodSemanticFiltersConfig,  AutomodSemanticFiltersRule,  AutomodToxicityConfig,  BackstageSettingsResponse,  BanActionRequestPayload,  BanInfoResponse,  BanOptions,  BanRequest,  BanResponse,  BlockActionRequestPayload,  BlockListConfig,  BlockListOptions,  BlockListResponse,  BlockListRule,  BlockUsersRequest,  BlockUsersResponse,  BlockedUserResponse,  BodyguardRule,  BodyguardSeverityRule,  BookmarkAddedEvent,  BookmarkDeletedEvent,  BookmarkFolderDeletedEvent,  BookmarkFolderResponse,  BookmarkFolderUpdatedEvent,  BookmarkResponse,  BookmarkUpdatedEvent,  BroadcastSettingsResponse,  CallActionOptions,  CallCustomPropertyParameters,  CallIngressResponse,  CallParticipantResponse,  CallResponse,  CallRuleActionSequence,  CallSessionResponse,  CallSettingsResponse,  CallTypeRuleParameters,  CallViolationCountParameters,  CastPollVoteRequest,  ChannelConfigWithInfo,  ChannelMemberResponse,  ChannelMute,  ChannelOwnCapability,  ChannelPushPreferencesResponse,  ChannelResponse,  ChatPreferences,  ChatPreferencesInput,  ChatPreferencesResponse,  ClosedCaptionRuleParameters,  CollectionRequest,  CollectionResponse,  Command,  CommentAddedEvent,  CommentDeletedEvent,  CommentReactionAddedEvent,  CommentReactionDeletedEvent,  CommentReactionUpdatedEvent,  CommentResponse,  CommentUpdatedEvent,  CompositeRecordingResponse,  ConfigResponse,  ConnectUserDetailsRequest,  ContentCountRuleParameters,  CreateBlockListRequest,  CreateBlockListResponse,  CreateCollectionsRequest,  CreateCollectionsResponse,  CreateDeviceRequest,  CreateFeedsBatchRequest,  CreateFeedsBatchResponse,  CreateGuestRequest,  CreateGuestResponse,  CreatePollOptionRequest,  CreatePollRequest,  CreateUserGroupRequest,  CreateUserGroupResponse,  CustomActionRequestPayload,  Data,  DecayFunctionConfig,  DeleteActivitiesRequest,  DeleteActivitiesResponse,  DeleteActivityReactionResponse,  DeleteActivityRequestPayload,  DeleteActivityResponse,  DeleteBookmarkFolderResponse,  DeleteBookmarkResponse,  DeleteCollectionsResponse,  DeleteCommentReactionResponse,  DeleteCommentRequestPayload,  DeleteCommentResponse,  DeleteFeedResponse,  DeleteMessageRequestPayload,  DeleteModerationConfigResponse,  DeleteReactionRequestPayload,  DeleteUserRequestPayload,  DeliveryReceiptsResponse,  DeviceResponse,  DraftPayloadResponse,  DraftResponse,  EgressHLSResponse,  EgressRTMPResponse,  EgressResponse,  EnrichedActivity,  EnrichedCollectionResponse,  EnrichedReaction,  EnrichmentOptions,  EntityCreatorResponse,  FeedCreatedEvent,  FeedDeletedEvent,  FeedGroup,  FeedGroupChangedEvent,  FeedGroupDeletedEvent,  FeedGroupRestoredEvent,  FeedInput,  FeedMemberAddedEvent,  FeedMemberRemovedEvent,  FeedMemberRequest,  FeedMemberResponse,  FeedMemberUpdatedEvent,  FeedOwnCapability,  FeedOwnData,  FeedRequest,  FeedResponse,  FeedSuggestionResponse,  FeedUpdatedEvent,  FeedsPreferences,  FeedsPreferencesResponse,  FeedsReactionGroupResponse,  FeedsReactionResponse,  Field,  FileUploadConfig,  FileUploadRequest,  FileUploadResponse,  FilterConfigResponse,  FlagCountRuleParameters,  FlagRequest,  FlagResponse,  FlagUserOptions,  FollowBatchRequest,  FollowBatchResponse,  FollowCreatedEvent,  FollowDeletedEvent,  FollowPair,  FollowRequest,  FollowResponse,  FollowUpdatedEvent,  FrameRecordingResponse,  FrameRecordingSettingsResponse,  FriendReactionsOptions,  FullUserResponse,  GeofenceSettingsResponse,  GetActivityResponse,  GetAppealResponse,  GetApplicationResponse,  GetBlockedUsersResponse,  GetCommentRepliesResponse,  GetCommentResponse,  GetCommentsResponse,  GetConfigResponse,  GetFollowSuggestionsResponse,  GetOGResponse,  GetOrCreateFeedRequest,  GetOrCreateFeedResponse,  GetUserGroupResponse,  GoogleVisionConfig,  HLSSettingsResponse,  HarmConfig,  HealthCheckEvent,  ImageContentParameters,  ImageData,  ImageRuleParameters,  ImageSize,  ImageUploadRequest,  ImageUploadResponse,  Images,  IndividualRecordingResponse,  IndividualRecordingSettingsResponse,  IngressAudioEncodingResponse,  IngressSettingsResponse,  IngressSourceResponse,  IngressVideoEncodingResponse,  IngressVideoLayerResponse,  KeyframeRuleParameters,  LLMConfig,  LLMRule,  LabelThresholds,  LimitsSettingsResponse,  ListBlockListResponse,  ListDevicesResponse,  ListUserGroupsResponse,  MarkActivityRequest,  MarkReviewedRequestPayload,  MembershipLevelResponse,  MessageResponse,  ModerationActionConfigResponse,  ModerationCustomActionEvent,  ModerationFlagResponse,  ModerationFlaggedEvent,  ModerationMarkReviewedEvent,  ModerationPayload,  ModerationPayloadResponse,  ModerationV2Response,  MuteRequest,  MuteResponse,  NoiseCancellationSettings,  NotificationComment,  NotificationConfig,  NotificationContext,  NotificationFeedUpdatedEvent,  NotificationParentActivity,  NotificationStatusResponse,  NotificationTarget,  NotificationTrigger,  OCRRule,  OnlyUserID,  OwnBatchRequest,  OwnBatchResponse,  OwnUserResponse,  PagerRequest,  PagerResponse,  PinActivityRequest,  PinActivityResponse,  PollClosedFeedEvent,  PollDeletedFeedEvent,  PollOptionInput,  PollOptionRequest,  PollOptionResponse,  PollOptionResponseData,  PollResponse,  PollResponseData,  PollUpdatedFeedEvent,  PollVoteCastedFeedEvent,  PollVoteChangedFeedEvent,  PollVoteRemovedFeedEvent,  PollVoteResponse,  PollVoteResponseData,  PollVotesResponse,  PrivacySettingsResponse,  PushNotificationConfig,  PushPreferenceInput,  PushPreferencesResponse,  QueryActivitiesRequest,  QueryActivitiesResponse,  QueryActivityReactionsRequest,  QueryActivityReactionsResponse,  QueryAppealsRequest,  QueryAppealsResponse,  QueryBookmarkFoldersRequest,  QueryBookmarkFoldersResponse,  QueryBookmarksRequest,  QueryBookmarksResponse,  QueryCollectionsRequest,  QueryCollectionsResponse,  QueryCommentReactionsRequest,  QueryCommentReactionsResponse,  QueryCommentsRequest,  QueryCommentsResponse,  QueryFeedMembersRequest,  QueryFeedMembersResponse,  QueryFeedsRequest,  QueryFeedsResponse,  QueryFollowsRequest,  QueryFollowsResponse,  QueryModerationConfigsRequest,  QueryModerationConfigsResponse,  QueryPinnedActivitiesRequest,  QueryPinnedActivitiesResponse,  QueryPollVotesRequest,  QueryPollsRequest,  QueryPollsResponse,  QueryReviewQueueRequest,  QueryReviewQueueResponse,  QueryUsersPayload,  QueryUsersResponse,  RTMPIngress,  RTMPSettingsResponse,  RankingConfig,  RawRecordingResponse,  RawRecordingSettingsResponse,  Reaction,  ReactionGroupResponse,  ReactionResponse,  ReadCollectionsResponse,  ReadReceiptsResponse,  RecordSettingsResponse,  RejectAppealRequestPayload,  RejectFeedMemberInviteRequest,  RejectFeedMemberInviteResponse,  RejectFollowRequest,  RejectFollowResponse,  ReminderResponseData,  RemoveUserGroupMembersRequest,  RemoveUserGroupMembersResponse,  RepliesMeta,  Response,  RestoreActionRequestPayload,  RestoreActivityRequest,  RestoreActivityResponse,  ReviewQueueItemResponse,  RingSettingsResponse,  RuleBuilderAction,  RuleBuilderCondition,  RuleBuilderConditionGroup,  RuleBuilderConfig,  RuleBuilderRule,  SRTIngress,  ScreensharingSettingsResponse,  SearchUserGroupsResponse,  SessionSettingsResponse,  ShadowBlockActionRequestPayload,  SharedLocationResponse,  SharedLocationResponseData,  SharedLocationsResponse,  SingleFollowResponse,  SortParam,  SortParamRequest,  SpeechSegmentConfig,  StoriesConfig,  StoriesFeedUpdatedEvent,  SubmitActionRequest,  SubmitActionResponse,  TargetResolution,  TextContentParameters,  TextRuleParameters,  ThreadedCommentResponse,  Thresholds,  ThumbnailResponse,  ThumbnailsSettingsResponse,  Time,  TrackActivityMetricsEvent,  TrackActivityMetricsEventResult,  TrackActivityMetricsRequest,  TrackActivityMetricsResponse,  TranscriptionSettingsResponse,  TranslationSettings,  TypingIndicatorsResponse,  UnbanActionRequestPayload,  UnblockActionRequestPayload,  UnblockUsersRequest,  UnblockUsersResponse,  UnfollowBatchRequest,  UnfollowBatchResponse,  UnfollowResponse,  UnpinActivityResponse,  UpdateActivityPartialRequest,  UpdateActivityPartialResponse,  UpdateActivityRequest,  UpdateActivityResponse,  UpdateBlockListRequest,  UpdateBlockListResponse,  UpdateBookmarkFolderRequest,  UpdateBookmarkFolderResponse,  UpdateBookmarkRequest,  UpdateBookmarkResponse,  UpdateCollectionRequest,  UpdateCollectionsRequest,  UpdateCollectionsResponse,  UpdateCommentRequest,  UpdateCommentResponse,  UpdateFeedMembersRequest,  UpdateFeedMembersResponse,  UpdateFeedRequest,  UpdateFeedResponse,  UpdateFollowRequest,  UpdateFollowResponse,  UpdateLiveLocationRequest,  UpdatePollOptionRequest,  UpdatePollPartialRequest,  UpdatePollRequest,  UpdateUserGroupRequest,  UpdateUserGroupResponse,  UpdateUserPartialRequest,  UpdateUsersPartialRequest,  UpdateUsersRequest,  UpdateUsersResponse,  UpsertActivitiesRequest,  UpsertActivitiesResponse,  UpsertConfigRequest,  UpsertConfigResponse,  UpsertPushPreferencesRequest,  UpsertPushPreferencesResponse,  User,  UserBannedEvent,  UserCreatedWithinParameters,  UserCustomPropertyParameters,  UserDeactivatedEvent,  UserGroupMember,  UserGroupResponse,  UserIdenticalContentCountParameters,  UserMuteResponse,  UserReactivatedEvent,  UserRequest,  UserResponse,  UserResponseCommonFields,  UserResponsePrivacyFields,  UserRoleParameters,  UserRuleParameters,  UserUnbannedEvent,  UserUpdatedEvent,  VelocityFilterConfig,  VelocityFilterConfigRule,  VideoCallRuleConfig,  VideoContentParameters,  VideoEndCallRequestPayload,  VideoKickUserRequestPayload,  VideoRuleParameters,  VideoSettingsResponse,  VoteData,  WHIPIngress,  WSAuthMessage,  WSClientEvent,  WSEvent,  } from '../models';

export class FeedApi {
    constructor(
        protected feedsApi: FeedsApi,
        public readonly  group : string,
        public  readonly id: string, 
  ) {}



    delete(request?: 
    
    
    {hard_delete?: boolean,
    }
    ): Promise<StreamResponse<DeleteFeedResponse>> {
        
        return this.feedsApi.deleteFeed( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    getOrCreate(request?: GetOrCreateFeedRequest 
     & 
    
    {connection_id?: string,
    }
    ): Promise<StreamResponse<GetOrCreateFeedResponse>> {
        
        return this.feedsApi.getOrCreateFeed( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    update(request?: UpdateFeedRequest 
    
    ): Promise<StreamResponse<UpdateFeedResponse>> {
        
        return this.feedsApi.updateFeed( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    markActivity(request?: MarkActivityRequest 
    
    ): Promise<StreamResponse<Response>> {
        
        return this.feedsApi.markActivity( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    unpinActivity(request: 
    
    
    {activity_id: string,enrich_own_fields?: boolean,
    }
    ): Promise<StreamResponse<UnpinActivityResponse>> {
        
        return this.feedsApi.unpinActivity( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    pinActivity(request: PinActivityRequest 
     & 
    
    {activity_id: string,
    }
    ): Promise<StreamResponse<PinActivityResponse>> {
        
        return this.feedsApi.pinActivity( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    updateFeedMembers(request: UpdateFeedMembersRequest 
    
    ): Promise<StreamResponse<UpdateFeedMembersResponse>> {
        
        return this.feedsApi.updateFeedMembers( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    acceptFeedMemberInvite(request?: AcceptFeedMemberInviteRequest 
    
    ): Promise<StreamResponse<AcceptFeedMemberInviteResponse>> {
        
        return this.feedsApi.acceptFeedMemberInvite( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    queryFeedMembers(request?: QueryFeedMembersRequest 
    
    ): Promise<StreamResponse<QueryFeedMembersResponse>> {
        
        return this.feedsApi.queryFeedMembers( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    rejectFeedMemberInvite(request?: RejectFeedMemberInviteRequest 
    
    ): Promise<StreamResponse<RejectFeedMemberInviteResponse>> {
        
        return this.feedsApi.rejectFeedMemberInvite( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    queryPinnedActivities(request?: QueryPinnedActivitiesRequest 
    
    ): Promise<StreamResponse<QueryPinnedActivitiesResponse>> {
        
        return this.feedsApi.queryPinnedActivities( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }

    stopWatching(request?: 
    
    
    {connection_id?: string,
    }
    ): Promise<StreamResponse<Response>> {
        
        return this.feedsApi.stopWatchingFeed( { feed_id: this.id, feed_group_id: this.group,...request} ) 
    }
}
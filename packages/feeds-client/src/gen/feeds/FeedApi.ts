import { StreamResponse, FeedsApi } from '../../gen-imports';
import {  AIImageConfig,  AIImageLabelDefinition,  AITextConfig,  AIVideoConfig,  APIError,  AWSRekognitionRule,  AcceptFeedMemberInviteRequest,  AcceptFeedMemberInviteResponse,  AcceptFollowRequest,  AcceptFollowResponse,  Action,  ActionLogResponse,  ActionSequence,  ActivityAddedEvent,  ActivityDeletedEvent,  ActivityFeedbackEvent,  ActivityFeedbackEventPayload,  ActivityFeedbackRequest,  ActivityFeedbackResponse,  ActivityFilterConfig,  ActivityMarkEvent,  ActivityPinResponse,  ActivityPinnedEvent,  ActivityProcessorConfig,  ActivityReactionAddedEvent,  ActivityReactionDeletedEvent,  ActivityReactionUpdatedEvent,  ActivityRemovedFromFeedEvent,  ActivityRequest,  ActivityResponse,  ActivityRestoredEvent,  ActivitySelectorConfig,  ActivityUnpinnedEvent,  ActivityUpdatedEvent,  AddActivityRequest,  AddActivityResponse,  AddBookmarkRequest,  AddBookmarkResponse,  AddCommentBookmarkRequest,  AddCommentBookmarkResponse,  AddCommentReactionRequest,  AddCommentReactionResponse,  AddCommentRequest,  AddCommentResponse,  AddCommentsBatchRequest,  AddCommentsBatchResponse,  AddFolderRequest,  AddReactionRequest,  AddReactionResponse,  AddUserGroupMembersRequest,  AddUserGroupMembersResponse,  AggregatedActivityResponse,  AggregationConfig,  AppEventResponse,  AppResponseFields,  AppUpdatedEvent,  AppealItemResponse,  AppealRequest,  AppealResponse,  Attachment,  AutomodPlatformCircumventionConfig,  AutomodRule,  AutomodSemanticFiltersConfig,  AutomodSemanticFiltersRule,  AutomodToxicityConfig,  BanActionRequestPayload,  BanInfoResponse,  BanOptions,  BanRequest,  BanResponse,  BlockActionRequestPayload,  BlockListConfig,  BlockListOptions,  BlockListResponse,  BlockListRule,  BlockUsersRequest,  BlockUsersResponse,  BlockedUserResponse,  BodyguardProfileSummary,  BodyguardRule,  BodyguardSeverityRule,  BookmarkAddedEvent,  BookmarkDeletedEvent,  BookmarkFolderDeletedEvent,  BookmarkFolderResponse,  BookmarkFolderUpdatedEvent,  BookmarkResponse,  BookmarkUpdatedEvent,  BulkDeleteActionConfigRequest,  BulkDeleteActionConfigResponse,  BulkUpsertActionConfigRequest,  BulkUpsertActionConfigResponse,  BypassActionRequest,  CallActionOptions,  CallCustomPropertyParameters,  CallResponse,  CallRuleActionSequence,  CallTypeRuleParameters,  CallViolationCountParameters,  CastPollVoteRequest,  ChangeFeedVisibilityRequest,  ChangeFeedVisibilityResponse,  ChannelConfigWithInfo,  ChannelMemberResponse,  ChannelMessageCountRuleParameters,  ChannelMute,  ChannelOwnCapability,  ChannelPushPreferencesResponse,  ChannelResponse,  ChatDraftPayloadResponse,  ChatDraftResponse,  ChatMessageResponse,  ChatModerationV2Response,  ChatPreferences,  ChatPreferencesInput,  ChatPreferencesResponse,  ChatReactionGroupResponse,  ChatReactionGroupUserResponse,  ChatReactionResponse,  ChatReminderResponseData,  ChatSharedLocationResponseData,  ClosedCaptionRuleParameters,  CollectionRequest,  CollectionResponse,  Command,  CommentAddedEvent,  CommentDeletedEvent,  CommentReactionAddedEvent,  CommentReactionDeletedEvent,  CommentReactionUpdatedEvent,  CommentResponse,  CommentRestoredEvent,  CommentUpdatedEvent,  ConfigResponse,  ConnectUserDetailsRequest,  ContentCountRuleParameters,  CreateBlockListRequest,  CreateBlockListResponse,  CreateCollectionsRequest,  CreateCollectionsResponse,  CreateDeviceRequest,  CreateFeedsBatchRequest,  CreateFeedsBatchResponse,  CreateGuestRequest,  CreateGuestResponse,  CreatePollOptionRequest,  CreatePollRequest,  CreateUserGroupRequest,  CreateUserGroupResponse,  CustomActionRequestPayload,  Data,  DecayFunctionConfig,  DeleteActionConfigResponse,  DeleteActivitiesRequest,  DeleteActivitiesResponse,  DeleteActivityReactionResponse,  DeleteActivityRequestPayload,  DeleteActivityResponse,  DeleteBookmarkFolderResponse,  DeleteBookmarkResponse,  DeleteCollectionsResponse,  DeleteCommentBookmarkResponse,  DeleteCommentReactionResponse,  DeleteCommentRequestPayload,  DeleteCommentResponse,  DeleteFeedResponse,  DeleteMessageRequestPayload,  DeleteModerationConfigResponse,  DeleteReactionRequestPayload,  DeleteUserRequestPayload,  DeliveryReceiptsResponse,  DeviceResponse,  DraftPayloadResponse,  DraftResponse,  EnrichedActivity,  EnrichedCollectionResponse,  EnrichedReaction,  EnrichmentOptions,  EntityCreatorResponse,  EscalatePayload,  EscalationMetadata,  FeedCreatedEvent,  FeedDeletedEvent,  FeedGroup,  FeedGroupChangedEvent,  FeedGroupDeletedEvent,  FeedGroupRestoredEvent,  FeedInput,  FeedMemberAddedEvent,  FeedMemberRemovedEvent,  FeedMemberRequest,  FeedMemberResponse,  FeedMemberUpdatedEvent,  FeedOwnCapability,  FeedOwnData,  FeedRequest,  FeedResponse,  FeedSuggestionResponse,  FeedUpdatedEvent,  FeedsActivityLocation,  FeedsBookmarkResponse,  FeedsEnrichedCollectionResponse,  FeedsFeedResponse,  FeedsNotificationComment,  FeedsNotificationContext,  FeedsNotificationParentActivity,  FeedsNotificationTarget,  FeedsNotificationTrigger,  FeedsPreferences,  FeedsPreferencesResponse,  FeedsReactionGroupResponse,  FeedsReactionResponse,  FeedsV3ActivityResponse,  FeedsV3CommentResponse,  Field,  FileUploadConfig,  FileUploadRequest,  FileUploadResponse,  FilterConfigResponse,  FlagCountRuleParameters,  FlagRequest,  FlagResponse,  FlagUserOptions,  FollowBatchRequest,  FollowBatchResponse,  FollowCreatedEvent,  FollowDeletedEvent,  FollowRequest,  FollowResponse,  FollowUpdatedEvent,  FriendReactionsOptions,  FullUserResponse,  GetActionConfigResponse,  GetActivityResponse,  GetAppealResponse,  GetApplicationResponse,  GetBlockedUsersResponse,  GetCommentRepliesResponse,  GetCommentResponse,  GetCommentsResponse,  GetConfigResponse,  GetFollowSuggestionsResponse,  GetOGResponse,  GetOrCreateFeedRequest,  GetOrCreateFeedResponse,  GetUserGroupResponse,  GoogleVisionConfig,  HarmConfig,  HealthCheckEvent,  ImageContentParameters,  ImageData,  ImageRuleParameters,  ImageSize,  ImageUploadRequest,  ImageUploadResponse,  Images,  KeyframeRuleParameters,  LLMConfig,  LLMRule,  LabelThresholds,  ListBlockListResponse,  ListDevicesResponse,  ListUserGroupsResponse,  Location,  MarkActivityRequest,  MarkReviewedRequestPayload,  MembershipLevelResponse,  MessageResponse,  ModerationActionConfigResponse,  ModerationCustomActionEvent,  ModerationFlagResponse,  ModerationFlaggedEvent,  ModerationMarkReviewedEvent,  ModerationPayload,  ModerationPayloadResponse,  ModerationV2Response,  MuteRequest,  MuteResponse,  NotificationComment,  NotificationConfig,  NotificationContext,  NotificationFeedUpdatedEvent,  NotificationParentActivity,  NotificationStatusResponse,  NotificationTarget,  NotificationTrigger,  OCRRule,  OnlyUserID,  OwnBatchRequest,  OwnBatchResponse,  OwnUserResponse,  PagerRequest,  PagerResponse,  PinActivityRequest,  PinActivityResponse,  PollClosedFeedEvent,  PollDeletedFeedEvent,  PollOptionInput,  PollOptionRequest,  PollOptionResponse,  PollOptionResponseData,  PollResponse,  PollResponseData,  PollUpdatedFeedEvent,  PollVoteCastedFeedEvent,  PollVoteChangedFeedEvent,  PollVoteRemovedFeedEvent,  PollVoteResponse,  PollVoteResponseData,  PollVotesResponse,  PrivacySettingsResponse,  PushNotificationConfig,  PushPreferenceInput,  PushPreferencesResponse,  QueryActivitiesRequest,  QueryActivitiesResponse,  QueryActivityReactionsRequest,  QueryActivityReactionsResponse,  QueryAppealsRequest,  QueryAppealsResponse,  QueryBookmarkFoldersRequest,  QueryBookmarkFoldersResponse,  QueryBookmarksRequest,  QueryBookmarksResponse,  QueryCollectionsRequest,  QueryCollectionsResponse,  QueryCommentReactionsRequest,  QueryCommentReactionsResponse,  QueryCommentsRequest,  QueryCommentsResponse,  QueryFeedMembersRequest,  QueryFeedMembersResponse,  QueryFeedsRequest,  QueryFeedsResponse,  QueryFollowsRequest,  QueryFollowsResponse,  QueryModerationConfigsRequest,  QueryModerationConfigsResponse,  QueryPinnedActivitiesRequest,  QueryPinnedActivitiesResponse,  QueryPollVotesRequest,  QueryPollsRequest,  QueryPollsResponse,  QueryReviewQueueRequest,  QueryReviewQueueResponse,  QueryUsersPayload,  QueryUsersResponse,  RankingConfig,  Reaction,  ReactionGroupResponse,  ReactionGroupUserResponse,  ReactionResponse,  ReadCollectionsResponse,  ReadReceiptsResponse,  RejectAppealRequestPayload,  RejectFeedMemberInviteRequest,  RejectFeedMemberInviteResponse,  RejectFollowRequest,  RejectFollowResponse,  ReminderResponseData,  RemoveUserGroupMembersRequest,  RemoveUserGroupMembersResponse,  RepliesMeta,  Response,  RestoreActionRequestPayload,  RestoreActivityRequest,  RestoreActivityResponse,  RestoreCommentRequest,  RestoreCommentResponse,  ReviewQueueItemResponse,  RuleBuilderAction,  RuleBuilderCondition,  RuleBuilderConditionGroup,  RuleBuilderConfig,  RuleBuilderRule,  SearchUserGroupsResponse,  ShadowBlockActionRequestPayload,  SharedLocationResponse,  SharedLocationResponseData,  SharedLocationsResponse,  SingleFollowResponse,  SortParam,  SortParamRequest,  StoriesConfig,  StoriesFeedUpdatedEvent,  SubmitActionRequest,  SubmitActionResponse,  TextContentParameters,  TextRuleParameters,  ThreadedCommentResponse,  Thresholds,  Time,  TrackActivityMetricsEvent,  TrackActivityMetricsEventResult,  TrackActivityMetricsRequest,  TrackActivityMetricsResponse,  TypingIndicatorsResponse,  UnbanActionRequestPayload,  UnblockActionRequestPayload,  UnblockUsersRequest,  UnblockUsersResponse,  UnfollowBatchRequest,  UnfollowBatchResponse,  UnfollowPair,  UnfollowResponse,  UnpinActivityResponse,  UpdateActivityPartialRequest,  UpdateActivityPartialResponse,  UpdateActivityRequest,  UpdateActivityResponse,  UpdateBlockListRequest,  UpdateBlockListResponse,  UpdateBookmarkFolderRequest,  UpdateBookmarkFolderResponse,  UpdateBookmarkRequest,  UpdateBookmarkResponse,  UpdateCollectionRequest,  UpdateCollectionsRequest,  UpdateCollectionsResponse,  UpdateCommentBookmarkRequest,  UpdateCommentBookmarkResponse,  UpdateCommentPartialRequest,  UpdateCommentPartialResponse,  UpdateCommentRequest,  UpdateCommentResponse,  UpdateFeedMembersRequest,  UpdateFeedMembersResponse,  UpdateFeedRequest,  UpdateFeedResponse,  UpdateFollowRequest,  UpdateFollowResponse,  UpdateLiveLocationRequest,  UpdatePollOptionRequest,  UpdatePollPartialRequest,  UpdatePollRequest,  UpdateUserGroupRequest,  UpdateUserGroupResponse,  UpdateUserPartialRequest,  UpdateUsersPartialRequest,  UpdateUsersRequest,  UpdateUsersResponse,  UpsertActionConfigItem,  UpsertActionConfigRequest,  UpsertActionConfigResponse,  UpsertActivitiesRequest,  UpsertActivitiesResponse,  UpsertConfigRequest,  UpsertConfigResponse,  UpsertPushPreferencesRequest,  UpsertPushPreferencesResponse,  User,  UserBannedEvent,  UserCreatedWithinParameters,  UserCustomPropertyParameters,  UserDeactivatedEvent,  UserGroupMember,  UserGroupResponse,  UserIdenticalContentCountParameters,  UserMuteResponse,  UserReactivatedEvent,  UserRequest,  UserResponse,  UserResponseCommonFields,  UserResponsePrivacyFields,  UserRoleParameters,  UserRuleParameters,  UserUnbannedEvent,  UserUpdatedEvent,  VelocityFilterConfig,  VelocityFilterConfigRule,  VideoCallRuleConfig,  VideoContentParameters,  VideoEndCallRequestPayload,  VideoKickUserRequestPayload,  VideoRuleParameters,  VoteData,  WSAuthMessage,  WSClientEvent,  WSEvent,  } from '../models';

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

    changeFeedVisibility(request: ChangeFeedVisibilityRequest 
    
    ): Promise<StreamResponse<ChangeFeedVisibilityResponse>> {
        
        return this.feedsApi.changeFeedVisibility( { feed_id: this.id, feed_group_id: this.group,...request} ) 
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
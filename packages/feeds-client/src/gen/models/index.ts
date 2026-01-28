export interface AIImageConfig {
  enabled: boolean;

  ocr_rules: OCRRule[];

  rules: AWSRekognitionRule[];

  async?: boolean;
}

export interface AITextConfig {
  enabled: boolean;

  profile: string;

  rules: BodyguardRule[];

  severity_rules: BodyguardSeverityRule[];

  async?: boolean;
}

export interface AIVideoConfig {
  enabled: boolean;

  rules: AWSRekognitionRule[];

  async?: boolean;
}

export interface APIError {
  code: number;

  duration: string;

  message: string;

  more_info: string;

  status_code: number;

  details: number[];

  unrecoverable?: boolean;

  exception_fields?: Record<string, string>;
}

export interface AWSRekognitionRule {
  action:
    | 'flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove';

  label: string;

  min_confidence: number;
}

export interface AcceptFeedMemberInviteRequest {}

export interface AcceptFeedMemberInviteResponse {
  duration: string;

  member: FeedMemberResponse;
}

export interface AcceptFollowRequest {
  source: string;

  target: string;

  follower_role?: string;
}

export interface AcceptFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface Action {
  name: string;

  text: string;

  type: string;

  style?: string;

  value?: string;
}

export interface ActionLogResponse {
  created_at: Date;

  id: string;

  reason: string;

  target_user_id: string;

  type: string;

  user_id: string;

  ai_providers: string[];

  custom: Record<string, any>;

  review_queue_item?: ReviewQueueItemResponse;

  target_user?: UserResponse;

  user?: UserResponse;
}

export interface ActionSequence {
  action: string;

  blur: boolean;

  cooldown_period: number;

  threshold: number;

  time_window: number;

  warning: boolean;

  warning_text: string;
}

export interface ActivityAddedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityDeletedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityFeedbackEvent {
  created_at: Date;

  activity_feedback: ActivityFeedbackEventPayload;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityFeedbackEventPayload {
  action: 'hide' | 'show_more' | 'show_less';

  activity_id: string;

  created_at: Date;

  updated_at: Date;

  value: string;

  user: UserResponse;
}

export interface ActivityFeedbackRequest {
  hide?: boolean;

  show_less?: boolean;

  show_more?: boolean;
}

export interface ActivityFeedbackResponse {
  activity_id: string;

  duration: string;
}

export interface ActivityLocation {
  lat: number;

  lng: number;
}

export interface ActivityMarkEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  mark_all_read?: boolean;

  mark_all_seen?: boolean;

  received_at?: Date;

  mark_read?: string[];

  mark_seen?: string[];

  mark_watched?: string[];

  user?: UserResponseCommonFields;
}

export interface ActivityPinResponse {
  created_at: Date;

  feed: string;

  updated_at: Date;

  activity: ActivityResponse;

  user: UserResponse;
}

export interface ActivityPinnedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  pinned_activity: PinActivityResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityProcessorConfig {
  type: string;

  openai_key?: string;

  config?: Record<string, any>;
}

export interface ActivityReactionAddedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityReactionDeletedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityReactionUpdatedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityRemovedFromFeedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityRequest {
  type: string;

  feeds: string[];

  create_notification_activity?: boolean;

  expires_at?: string;

  id?: string;

  parent_id?: string;

  poll_id?: string;

  restrict_replies?: 'everyone' | 'people_i_follow' | 'nobody';

  skip_enrich_url?: boolean;

  skip_push?: boolean;

  text?: string;

  visibility?: 'public' | 'private' | 'tag';

  visibility_tag?: string;

  attachments?: Attachment[];

  collection_refs?: string[];

  filter_tags?: string[];

  interest_tags?: string[];

  mentioned_user_ids?: string[];

  custom?: Record<string, any>;

  location?: ActivityLocation;

  search_data?: Record<string, any>;
}

export interface ActivityResponse {
  bookmark_count: number;

  comment_count: number;

  created_at: Date;

  hidden: boolean;

  id: string;

  popularity: number;

  preview: boolean;

  reaction_count: number;

  restrict_replies: string;

  score: number;

  share_count: number;

  type: string;

  updated_at: Date;

  visibility: 'public' | 'private' | 'tag';

  attachments: Attachment[];

  comments: CommentResponse[];

  feeds: string[];

  filter_tags: string[];

  interest_tags: string[];

  latest_reactions: FeedsReactionResponse[];

  mentioned_users: UserResponse[];

  own_bookmarks: BookmarkResponse[];

  own_reactions: FeedsReactionResponse[];

  collections: Record<string, EnrichedCollectionResponse>;

  custom: Record<string, any>;

  reaction_groups: Record<string, ReactionGroupResponse>;

  search_data: Record<string, any>;

  user: UserResponse;

  deleted_at?: Date;

  edited_at?: Date;

  expires_at?: Date;

  is_watched?: boolean;

  moderation_action?: string;

  selector_source?: string;

  text?: string;

  visibility_tag?: string;

  current_feed?: FeedResponse;

  location?: ActivityLocation;

  moderation?: ModerationV2Response;

  notification_context?: NotificationContext;

  parent?: ActivityResponse;

  poll?: PollResponseData;
}

export interface ActivityRestoredEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivitySelectorConfig {
  cutoff_time: Date;

  cutoff_window?: string;

  min_popularity?: number;

  type?: string;

  sort?: SortParam[];

  filter?: Record<string, any>;

  params?: Record<string, any>;
}

export interface ActivityUnpinnedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  pinned_activity: PinActivityResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityUpdatedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface AddActivityRequest {
  type: string;

  feeds: string[];

  create_notification_activity?: boolean;

  expires_at?: string;

  id?: string;

  parent_id?: string;

  poll_id?: string;

  restrict_replies?: 'everyone' | 'people_i_follow' | 'nobody';

  skip_enrich_url?: boolean;

  skip_push?: boolean;

  text?: string;

  visibility?: 'public' | 'private' | 'tag';

  visibility_tag?: string;

  attachments?: Attachment[];

  collection_refs?: string[];

  filter_tags?: string[];

  interest_tags?: string[];

  mentioned_user_ids?: string[];

  custom?: Record<string, any>;

  location?: ActivityLocation;

  search_data?: Record<string, any>;
}

export interface AddActivityResponse {
  duration: string;

  activity: ActivityResponse;

  mention_notifications_created?: number;
}

export interface AddBookmarkRequest {
  folder_id?: string;

  custom?: Record<string, any>;

  new_folder?: AddFolderRequest;
}

export interface AddBookmarkResponse {
  duration: string;

  bookmark: BookmarkResponse;
}

export interface AddCommentReactionRequest {
  type: string;

  create_notification_activity?: boolean;

  enforce_unique?: boolean;

  skip_push?: boolean;

  custom?: Record<string, any>;
}

export interface AddCommentReactionResponse {
  duration: string;

  comment: CommentResponse;

  reaction: FeedsReactionResponse;

  notification_created?: boolean;
}

export interface AddCommentRequest {
  comment?: string;

  create_notification_activity?: boolean;

  id?: string;

  object_id?: string;

  object_type?: string;

  parent_id?: string;

  skip_enrich_url?: boolean;

  skip_push?: boolean;

  attachments?: Attachment[];

  mentioned_user_ids?: string[];

  custom?: Record<string, any>;
}

export interface AddCommentResponse {
  duration: string;

  comment: CommentResponse;

  mention_notifications_created?: number;

  notification_created?: boolean;
}

export interface AddCommentsBatchRequest {
  comments: AddCommentRequest[];
}

export interface AddCommentsBatchResponse {
  duration: string;

  comments: CommentResponse[];
}

export interface AddFolderRequest {
  name: string;

  custom?: Record<string, any>;
}

export interface AddReactionRequest {
  type: string;

  create_notification_activity?: boolean;

  enforce_unique?: boolean;

  skip_push?: boolean;

  custom?: Record<string, any>;
}

export interface AddReactionResponse {
  duration: string;

  activity: ActivityResponse;

  reaction: FeedsReactionResponse;

  notification_created?: boolean;
}

export interface AggregatedActivityResponse {
  activity_count: number;

  created_at: Date;

  group: string;

  score: number;

  updated_at: Date;

  user_count: number;

  user_count_truncated: boolean;

  activities: ActivityResponse[];

  is_watched?: boolean;
}

export interface AggregationConfig {
  format?: string;

  group_size?: number;
}

export interface AppEventResponse {
  auto_translation_enabled: boolean;

  name: string;

  async_url_enrich_enabled?: boolean;

  file_upload_config?: FileUploadConfig;

  image_upload_config?: FileUploadConfig;
}

export interface AppResponseFields {
  async_url_enrich_enabled: boolean;

  auto_translation_enabled: boolean;

  id: number;

  name: string;

  placement: string;

  file_upload_config: FileUploadConfig;

  image_upload_config: FileUploadConfig;
}

export interface AppUpdatedEvent {
  created_at: Date;

  app: AppEventResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;
}

export interface AppealItemResponse {
  appeal_reason: string;

  created_at: Date;

  entity_id: string;

  entity_type: string;

  id: string;

  status: string;

  updated_at: Date;

  decision_reason?: string;

  attachments?: string[];

  entity_content?: ModerationPayload;

  user?: UserResponse;
}

export interface AppealRequest {
  appeal_reason: string;

  entity_id: string;

  entity_type: string;

  attachments?: string[];
}

export interface AppealResponse {
  appeal_id: string;

  duration: string;
}

export interface Attachment {
  custom: Record<string, any>;

  asset_url?: string;

  author_icon?: string;

  author_link?: string;

  author_name?: string;

  color?: string;

  fallback?: string;

  footer?: string;

  footer_icon?: string;

  image_url?: string;

  og_scrape_url?: string;

  original_height?: number;

  original_width?: number;

  pretext?: string;

  text?: string;

  thumb_url?: string;

  title?: string;

  title_link?: string;

  type?: string;

  actions?: Action[];

  fields?: Field[];

  giphy?: Images;
}

export interface AudioSettingsResponse {
  access_request_enabled: boolean;

  default_device: 'speaker' | 'earpiece';

  hifi_audio_enabled: boolean;

  mic_default_on: boolean;

  opus_dtx_enabled: boolean;

  redundant_coding_enabled: boolean;

  speaker_default_on: boolean;

  noise_cancellation?: NoiseCancellationSettings;
}

export interface AutomodPlatformCircumventionConfig {
  enabled: boolean;

  rules: AutomodRule[];

  async?: boolean;
}

export interface AutomodRule {
  action:
    | 'flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove';

  label: string;

  threshold: number;
}

export interface AutomodSemanticFiltersConfig {
  enabled: boolean;

  rules: AutomodSemanticFiltersRule[];

  async?: boolean;
}

export interface AutomodSemanticFiltersRule {
  action: 'flag' | 'shadow' | 'remove';

  name: string;

  threshold: number;
}

export interface AutomodToxicityConfig {
  enabled: boolean;

  rules: AutomodRule[];

  async?: boolean;
}

export interface BackstageSettingsResponse {
  enabled: boolean;

  join_ahead_time_seconds?: number;
}

export interface Ban {
  created_at: Date;

  shadow: boolean;

  expires?: Date;

  reason?: string;

  channel?: Channel;

  created_by?: User;

  target?: User;
}

export interface BanActionRequest {
  channel_ban_only?: boolean;

  delete_messages?: 'soft' | 'pruning' | 'hard';

  ip_ban?: boolean;

  reason?: string;

  shadow?: boolean;

  timeout?: number;
}

export interface BanOptions {
  delete_messages?: 'soft' | 'pruning' | 'hard';

  duration?: number;

  ip_ban?: boolean;

  reason?: string;

  shadow_ban?: boolean;
}

export interface BanRequest {
  target_user_id: string;

  banned_by_id?: string;

  channel_cid?: string;

  delete_messages?: 'soft' | 'pruning' | 'hard';

  ip_ban?: boolean;

  reason?: string;

  shadow?: boolean;

  timeout?: number;

  banned_by?: UserRequest;
}

export interface BanResponse {
  duration: string;
}

export interface BlockActionRequest {
  reason?: string;
}

export interface BlockListConfig {
  enabled: boolean;

  rules: BlockListRule[];

  async?: boolean;
}

export interface BlockListOptions {
  behavior: 'flag' | 'block' | 'shadow_block';

  blocklist: string;
}

export interface BlockListResponse {
  is_leet_check_enabled: boolean;

  is_plural_check_enabled: boolean;

  name: string;

  type: string;

  words: string[];

  created_at?: Date;

  id?: string;

  team?: string;

  updated_at?: Date;
}

export interface BlockListRule {
  action:
    | 'flag'
    | 'mask_flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove';

  name: string;

  team: string;
}

export interface BlockUsersRequest {
  blocked_user_id: string;
}

export interface BlockUsersResponse {
  blocked_by_user_id: string;

  blocked_user_id: string;

  created_at: Date;

  duration: string;
}

export interface BlockedUserResponse {
  blocked_user_id: string;

  created_at: Date;

  user_id: string;

  blocked_user: UserResponse;

  user: UserResponse;
}

export interface BodyguardRule {
  action:
    | 'flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove';

  label: string;

  severity_rules: BodyguardSeverityRule[];
}

export interface BodyguardSeverityRule {
  action:
    | 'flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove';

  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BookmarkAddedEvent {
  created_at: Date;

  bookmark: BookmarkResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkDeletedEvent {
  created_at: Date;

  bookmark: BookmarkResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkFolderDeletedEvent {
  created_at: Date;

  bookmark_folder: BookmarkFolderResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkFolderResponse {
  created_at: Date;

  id: string;

  name: string;

  updated_at: Date;

  user: UserResponse;

  custom?: Record<string, any>;
}

export interface BookmarkFolderUpdatedEvent {
  created_at: Date;

  bookmark_folder: BookmarkFolderResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkResponse {
  created_at: Date;

  updated_at: Date;

  activity: ActivityResponse;

  user: UserResponse;

  custom?: Record<string, any>;

  folder?: BookmarkFolderResponse;
}

export interface BookmarkUpdatedEvent {
  created_at: Date;

  bookmark: BookmarkResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BroadcastSettingsResponse {
  enabled: boolean;

  hls: HLSSettingsResponse;

  rtmp: RTMPSettingsResponse;
}

export interface CallIngressResponse {
  rtmp: RTMPIngress;

  srt: SRTIngress;

  whip: WHIPIngress;
}

export interface CallParticipantResponse {
  joined_at: Date;

  role: string;

  user_session_id: string;

  user: UserResponse;
}

export interface CallResponse {
  backstage: boolean;

  captioning: boolean;

  cid: string;

  created_at: Date;

  current_session_id: string;

  id: string;

  recording: boolean;

  transcribing: boolean;

  translating: boolean;

  type: string;

  updated_at: Date;

  blocked_user_ids: string[];

  created_by: UserResponse;

  custom: Record<string, any>;

  egress: EgressResponse;

  ingress: CallIngressResponse;

  settings: CallSettingsResponse;

  channel_cid?: string;

  ended_at?: Date;

  join_ahead_time_seconds?: number;

  routing_number?: string;

  starts_at?: Date;

  team?: string;

  session?: CallSessionResponse;

  thumbnails?: ThumbnailResponse;
}

export interface CallSessionResponse {
  anonymous_participant_count: number;

  id: string;

  participants: CallParticipantResponse[];

  accepted_by: Record<string, Date>;

  missed_by: Record<string, Date>;

  participants_count_by_role: Record<string, number>;

  rejected_by: Record<string, Date>;

  ended_at?: Date;

  live_ended_at?: Date;

  live_started_at?: Date;

  started_at?: Date;

  timer_ends_at?: Date;
}

export interface CallSettingsResponse {
  audio: AudioSettingsResponse;

  backstage: BackstageSettingsResponse;

  broadcasting: BroadcastSettingsResponse;

  frame_recording: FrameRecordingSettingsResponse;

  geofencing: GeofenceSettingsResponse;

  individual_recording: IndividualRecordingSettingsResponse;

  limits: LimitsSettingsResponse;

  raw_recording: RawRecordingSettingsResponse;

  recording: RecordSettingsResponse;

  ring: RingSettingsResponse;

  screensharing: ScreensharingSettingsResponse;

  session: SessionSettingsResponse;

  thumbnails: ThumbnailsSettingsResponse;

  transcription: TranscriptionSettingsResponse;

  video: VideoSettingsResponse;

  ingress?: IngressSettingsResponse;
}

export interface CastPollVoteRequest {
  vote?: VoteData;
}

export interface Channel {
  auto_translation_language: string;

  cid: string;

  created_at: Date;

  disabled: boolean;

  frozen: boolean;

  id: string;

  type: string;

  updated_at: Date;

  custom: Record<string, any>;

  auto_translation_enabled?: boolean;

  cooldown?: number;

  deleted_at?: Date;

  last_campaigns?: string;

  last_message_at?: Date;

  member_count?: number;

  message_count?: number;

  message_count_updated_at?: Date;

  team?: string;

  active_live_locations?: SharedLocation[];

  filter_tags?: string[];

  invites?: ChannelMember[];

  members?: ChannelMember[];

  config?: ChannelConfig;

  config_overrides?: ConfigOverrides;

  created_by?: User;

  members_lookup?: Record<string, ChannelMemberLookup>;

  truncated_by?: User;
}

export interface ChannelConfig {
  automod: 'disabled' | 'simple' | 'AI';

  automod_behavior: 'flag' | 'block' | 'shadow_block';

  connect_events: boolean;

  count_messages: boolean;

  created_at: Date;

  custom_events: boolean;

  delivery_events: boolean;

  mark_messages_pending: boolean;

  max_message_length: number;

  mutes: boolean;

  name: string;

  polls: boolean;

  push_notifications: boolean;

  quotes: boolean;

  reactions: boolean;

  read_events: boolean;

  reminders: boolean;

  replies: boolean;

  search: boolean;

  shared_locations: boolean;

  skip_last_msg_update_for_system_msgs: boolean;

  typing_events: boolean;

  updated_at: Date;

  uploads: boolean;

  url_enrichment: boolean;

  user_message_reminders: boolean;

  commands: string[];

  blocklist?: string;

  blocklist_behavior?: 'flag' | 'block' | 'shadow_block';

  partition_size?: number;

  partition_ttl?: number;

  allowed_flag_reasons?: string[];

  blocklists?: BlockListOptions[];

  automod_thresholds?: Thresholds;
}

export interface ChannelConfigWithInfo {
  automod: 'disabled' | 'simple' | 'AI';

  automod_behavior: 'flag' | 'block' | 'shadow_block';

  connect_events: boolean;

  count_messages: boolean;

  created_at: Date;

  custom_events: boolean;

  delivery_events: boolean;

  mark_messages_pending: boolean;

  max_message_length: number;

  mutes: boolean;

  name: string;

  polls: boolean;

  push_notifications: boolean;

  quotes: boolean;

  reactions: boolean;

  read_events: boolean;

  reminders: boolean;

  replies: boolean;

  search: boolean;

  shared_locations: boolean;

  skip_last_msg_update_for_system_msgs: boolean;

  typing_events: boolean;

  updated_at: Date;

  uploads: boolean;

  url_enrichment: boolean;

  user_message_reminders: boolean;

  commands: Command[];

  blocklist?: string;

  blocklist_behavior?: 'flag' | 'block' | 'shadow_block';

  partition_size?: number;

  partition_ttl?: string;

  allowed_flag_reasons?: string[];

  blocklists?: BlockListOptions[];

  automod_thresholds?: Thresholds;

  grants?: Record<string, string[]>;
}

export interface ChannelMember {
  banned: boolean;

  channel_role: string;

  created_at: Date;

  is_global_banned: boolean;

  notifications_muted: boolean;

  shadow_banned: boolean;

  updated_at: Date;

  custom: Record<string, any>;

  archived_at?: Date;

  ban_expires?: Date;

  blocked?: boolean;

  deleted_at?: Date;

  hidden?: boolean;

  invite_accepted_at?: Date;

  invite_rejected_at?: Date;

  invited?: boolean;

  is_moderator?: boolean;

  pinned_at?: Date;

  status?: string;

  user_id?: string;

  deleted_messages?: string[];

  channel?: DenormalizedChannelFields;

  user?: User;
}

export interface ChannelMemberLookup {
  archived: boolean;

  banned: boolean;

  blocked: boolean;

  hidden: boolean;

  pinned: boolean;

  archived_at?: Date;

  ban_expires?: Date;

  pinned_at?: Date;
}

export interface ChannelMemberResponse {
  banned: boolean;

  channel_role: string;

  created_at: Date;

  notifications_muted: boolean;

  shadow_banned: boolean;

  updated_at: Date;

  custom: Record<string, any>;

  archived_at?: Date;

  ban_expires?: Date;

  deleted_at?: Date;

  invite_accepted_at?: Date;

  invite_rejected_at?: Date;

  invited?: boolean;

  is_moderator?: boolean;

  pinned_at?: Date;

  role?: 'member' | 'moderator' | 'admin' | 'owner';

  status?: string;

  user_id?: string;

  deleted_messages?: string[];

  user?: UserResponse;
}

export interface ChannelMute {
  created_at: Date;

  updated_at: Date;

  expires?: Date;

  channel?: ChannelResponse;

  user?: UserResponse;
}

export const ChannelOwnCapability = {
  BAN_CHANNEL_MEMBERS: 'ban-channel-members',
  CAST_POLL_VOTE: 'cast-poll-vote',
  CONNECT_EVENTS: 'connect-events',
  CREATE_ATTACHMENT: 'create-attachment',
  DELETE_ANY_MESSAGE: 'delete-any-message',
  DELETE_CHANNEL: 'delete-channel',
  DELETE_OWN_MESSAGE: 'delete-own-message',
  DELIVERY_EVENTS: 'delivery-events',
  FLAG_MESSAGE: 'flag-message',
  FREEZE_CHANNEL: 'freeze-channel',
  JOIN_CHANNEL: 'join-channel',
  LEAVE_CHANNEL: 'leave-channel',
  MUTE_CHANNEL: 'mute-channel',
  PIN_MESSAGE: 'pin-message',
  QUERY_POLL_VOTES: 'query-poll-votes',
  QUOTE_MESSAGE: 'quote-message',
  READ_EVENTS: 'read-events',
  SEARCH_MESSAGES: 'search-messages',
  SEND_CUSTOM_EVENTS: 'send-custom-events',
  SEND_LINKS: 'send-links',
  SEND_MESSAGE: 'send-message',
  SEND_POLL: 'send-poll',
  SEND_REACTION: 'send-reaction',
  SEND_REPLY: 'send-reply',
  SEND_RESTRICTED_VISIBILITY_MESSAGE: 'send-restricted-visibility-message',
  SEND_TYPING_EVENTS: 'send-typing-events',
  SET_CHANNEL_COOLDOWN: 'set-channel-cooldown',
  SHARE_LOCATION: 'share-location',
  SKIP_SLOW_MODE: 'skip-slow-mode',
  SLOW_MODE: 'slow-mode',
  TYPING_EVENTS: 'typing-events',
  UPDATE_ANY_MESSAGE: 'update-any-message',
  UPDATE_CHANNEL: 'update-channel',
  UPDATE_CHANNEL_MEMBERS: 'update-channel-members',
  UPDATE_OWN_MESSAGE: 'update-own-message',
  UPDATE_THREAD: 'update-thread',
  UPLOAD_FILE: 'upload-file',
} as const;

export type ChannelOwnCapability =
  (typeof ChannelOwnCapability)[keyof typeof ChannelOwnCapability];

export interface ChannelPushPreferences {
  chat_level?: string;

  disabled_until?: Date;
}

export interface ChannelResponse {
  cid: string;

  created_at: Date;

  disabled: boolean;

  frozen: boolean;

  id: string;

  type: string;

  updated_at: Date;

  custom: Record<string, any>;

  auto_translation_enabled?: boolean;

  auto_translation_language?: string;

  blocked?: boolean;

  cooldown?: number;

  deleted_at?: Date;

  hidden?: boolean;

  hide_messages_before?: Date;

  last_message_at?: Date;

  member_count?: number;

  message_count?: number;

  mute_expires_at?: Date;

  muted?: boolean;

  team?: string;

  truncated_at?: Date;

  filter_tags?: string[];

  members?: ChannelMemberResponse[];

  own_capabilities?: ChannelOwnCapability[];

  config?: ChannelConfigWithInfo;

  created_by?: UserResponse;

  truncated_by?: UserResponse;
}

export interface CollectionRequest {
  name: string;

  custom: Record<string, any>;

  id?: string;
}

export interface CollectionResponse {
  id: string;

  name: string;

  created_at?: Date;

  updated_at?: Date;

  user_id?: string;

  custom?: Record<string, any>;
}

export interface Command {
  args: string;

  description: string;

  name: string;

  set: string;

  created_at?: Date;

  updated_at?: Date;
}

export interface CommentAddedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  comment: CommentResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentDeletedEvent {
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentReactionAddedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  comment: CommentResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentReactionDeletedEvent {
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface CommentReactionUpdatedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  comment: CommentResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentResponse {
  confidence_score: number;

  created_at: Date;

  downvote_count: number;

  id: string;

  object_id: string;

  object_type: string;

  reaction_count: number;

  reply_count: number;

  score: number;

  status: string;

  updated_at: Date;

  upvote_count: number;

  mentioned_users: UserResponse[];

  own_reactions: FeedsReactionResponse[];

  user: UserResponse;

  controversy_score?: number;

  deleted_at?: Date;

  edited_at?: Date;

  parent_id?: string;

  text?: string;

  attachments?: Attachment[];

  latest_reactions?: FeedsReactionResponse[];

  custom?: Record<string, any>;

  moderation?: ModerationV2Response;

  reaction_groups?: Record<string, ReactionGroupResponse>;
}

export interface CommentUpdatedEvent {
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CompositeRecordingResponse {
  status: string;
}

export interface ConfigOverrides {
  commands: string[];

  grants: Record<string, string[]>;

  blocklist?: string;

  blocklist_behavior?: 'flag' | 'block';

  count_messages?: boolean;

  max_message_length?: number;

  quotes?: boolean;

  reactions?: boolean;

  replies?: boolean;

  shared_locations?: boolean;

  typing_events?: boolean;

  uploads?: boolean;

  url_enrichment?: boolean;

  user_message_reminders?: boolean;
}

export interface ConfigResponse {
  async: boolean;

  created_at: Date;

  key: string;

  team: string;

  updated_at: Date;

  supported_video_call_harm_types: string[];

  ai_image_config?: AIImageConfig;

  ai_text_config?: AITextConfig;

  ai_video_config?: AIVideoConfig;

  automod_platform_circumvention_config?: AutomodPlatformCircumventionConfig;

  automod_semantic_filters_config?: AutomodSemanticFiltersConfig;

  automod_toxicity_config?: AutomodToxicityConfig;

  block_list_config?: BlockListConfig;

  llm_config?: LLMConfig;

  velocity_filter_config?: VelocityFilterConfig;

  video_call_rule_config?: VideoCallRuleConfig;
}

export interface ConnectUserDetailsRequest {
  id: string;

  image?: string;

  invisible?: boolean;

  language?: string;

  name?: string;

  custom?: Record<string, any>;

  privacy_settings?: PrivacySettingsResponse;
}

export interface ContentCountRuleParameters {
  threshold?: number;

  time_window?: string;
}

export interface CreateBlockListRequest {
  name: string;

  words: string[];

  is_leet_check_enabled?: boolean;

  is_plural_check_enabled?: boolean;

  team?: string;

  type?:
    | 'regex'
    | 'domain'
    | 'domain_allowlist'
    | 'email'
    | 'email_allowlist'
    | 'word';
}

export interface CreateBlockListResponse {
  duration: string;

  blocklist?: BlockListResponse;
}

export interface CreateCollectionsRequest {
  collections: CollectionRequest[];
}

export interface CreateCollectionsResponse {
  duration: string;

  collections: CollectionResponse[];
}

export interface CreateDeviceRequest {
  id: string;

  push_provider: 'firebase' | 'apn' | 'huawei' | 'xiaomi';

  push_provider_name?: string;

  voip_token?: boolean;
}

export interface CreateFeedsBatchRequest {
  feeds: FeedRequest[];
}

export interface CreateFeedsBatchResponse {
  duration: string;

  feeds: FeedResponse[];
}

export interface CreateGuestRequest {
  user: UserRequest;
}

export interface CreateGuestResponse {
  access_token: string;

  duration: string;

  user: UserResponse;
}

export interface CreatePollOptionRequest {
  text: string;

  custom?: Record<string, any>;
}

export interface CreatePollRequest {
  name: string;

  allow_answers?: boolean;

  allow_user_suggested_options?: boolean;

  description?: string;

  enforce_unique_vote?: boolean;

  id?: string;

  is_closed?: boolean;

  max_votes_allowed?: number;

  voting_visibility?: 'anonymous' | 'public';

  options?: PollOptionInput[];

  custom?: Record<string, any>;
}

export interface CustomActionRequest {
  id?: string;

  options?: Record<string, any>;
}

export interface Data {
  id: string;
}

export interface DecayFunctionConfig {
  base?: string;

  decay?: string;

  direction?: string;

  offset?: string;

  origin?: string;

  scale?: string;
}

export interface DeleteActivitiesRequest {
  ids: string[];

  delete_notification_activity?: boolean;

  hard_delete?: boolean;
}

export interface DeleteActivitiesResponse {
  duration: string;

  deleted_ids: string[];
}

export interface DeleteActivityReactionResponse {
  duration: string;

  activity: ActivityResponse;

  reaction: FeedsReactionResponse;
}

export interface DeleteActivityRequest {
  hard_delete?: boolean;

  reason?: string;
}

export interface DeleteActivityResponse {
  duration: string;
}

export interface DeleteBookmarkFolderResponse {
  duration: string;
}

export interface DeleteBookmarkResponse {
  duration: string;

  bookmark: BookmarkResponse;
}

export interface DeleteCollectionsResponse {
  duration: string;
}

export interface DeleteCommentReactionResponse {
  duration: string;

  comment: CommentResponse;

  reaction: FeedsReactionResponse;
}

export interface DeleteCommentRequest {
  hard_delete?: boolean;

  reason?: string;
}

export interface DeleteCommentResponse {
  duration: string;

  activity: ActivityResponse;

  comment: CommentResponse;
}

export interface DeleteFeedResponse {
  duration: string;

  task_id: string;
}

export interface DeleteMessageRequest {
  hard_delete?: boolean;

  reason?: string;
}

export interface DeleteModerationConfigResponse {
  duration: string;
}

export interface DeleteReactionRequest {
  hard_delete?: boolean;

  reason?: string;
}

export interface DeleteUserRequest {
  delete_conversation_channels?: boolean;

  delete_feeds_content?: boolean;

  hard_delete?: boolean;

  mark_messages_deleted?: boolean;

  reason?: string;
}

export interface DeliveryReceipts {
  enabled: boolean;
}

export interface DeliveryReceiptsResponse {
  enabled: boolean;
}

export interface DenormalizedChannelFields {
  created_at?: string;

  created_by_id?: string;

  disabled?: boolean;

  frozen?: boolean;

  id?: string;

  last_message_at?: string;

  member_count?: number;

  team?: string;

  type?: string;

  updated_at?: string;

  custom?: Record<string, any>;
}

export interface Device {
  created_at: Date;

  id: string;

  push_provider: 'firebase' | 'apn' | 'huawei' | 'xiaomi';

  user_id: string;

  disabled?: boolean;

  disabled_reason?: string;

  push_provider_name?: string;

  voip?: boolean;
}

export interface DeviceResponse {
  created_at: Date;

  id: string;

  push_provider: string;

  user_id: string;

  disabled?: boolean;

  disabled_reason?: string;

  push_provider_name?: string;

  voip?: boolean;
}

export interface DraftPayloadResponse {
  id: string;

  text: string;

  custom: Record<string, any>;

  html?: string;

  mml?: string;

  parent_id?: string;

  poll_id?: string;

  quoted_message_id?: string;

  show_in_channel?: boolean;

  silent?: boolean;

  type?: string;

  attachments?: Attachment[];

  mentioned_users?: UserResponse[];
}

export interface DraftResponse {
  channel_cid: string;

  created_at: Date;

  message: DraftPayloadResponse;

  parent_id?: string;

  channel?: ChannelResponse;

  parent_message?: MessageResponse;

  quoted_message?: MessageResponse;
}

export interface EgressHLSResponse {
  playlist_url: string;

  status: string;
}

export interface EgressRTMPResponse {
  name: string;

  started_at: Date;

  stream_key?: string;

  stream_url?: string;
}

export interface EgressResponse {
  broadcasting: boolean;

  rtmps: EgressRTMPResponse[];

  composite_recording?: CompositeRecordingResponse;

  frame_recording?: FrameRecordingResponse;

  hls?: EgressHLSResponse;

  individual_recording?: IndividualRecordingResponse;

  raw_recording?: RawRecordingResponse;
}

export interface EnrichedActivity {
  foreign_id?: string;

  id?: string;

  score?: number;

  verb?: string;

  to?: string[];

  actor?: Data;

  latest_reactions?: Record<string, EnrichedReaction[]>;

  object?: Data;

  origin?: Data;

  own_reactions?: Record<string, EnrichedReaction[]>;

  reaction_counts?: Record<string, number>;

  target?: Data;
}

export interface EnrichedCollectionResponse {
  id: string;

  name: string;

  status: 'ok' | 'notfound';

  created_at?: Date;

  updated_at?: Date;

  user_id?: string;

  custom?: Record<string, any>;
}

export interface EnrichedReaction {
  activity_id: string;

  kind: string;

  user_id: string;

  id?: string;

  parent?: string;

  target_feeds?: string[];

  children_counts?: Record<string, number>;

  created_at?: Time;

  data?: Record<string, any>;

  latest_children?: Record<string, EnrichedReaction[]>;

  own_children?: Record<string, EnrichedReaction[]>;

  updated_at?: Time;

  user?: Data;
}

export interface EnrichmentOptions {
  enrich_own_followings?: boolean;

  skip_activity?: boolean;

  skip_activity_collections?: boolean;

  skip_activity_comments?: boolean;

  skip_activity_current_feed?: boolean;

  skip_activity_mentioned_users?: boolean;

  skip_activity_own_bookmarks?: boolean;

  skip_activity_parents?: boolean;

  skip_activity_poll?: boolean;

  skip_activity_reactions?: boolean;

  skip_activity_refresh_image_urls?: boolean;

  skip_all?: boolean;

  skip_feed_member_user?: boolean;

  skip_followers?: boolean;

  skip_following?: boolean;

  skip_own_capabilities?: boolean;

  skip_own_follows?: boolean;

  skip_pins?: boolean;
}

export interface EntityCreatorResponse {
  ban_count: number;

  banned: boolean;

  created_at: Date;

  deleted_content_count: number;

  flagged_count: number;

  id: string;

  language: string;

  online: boolean;

  role: string;

  updated_at: Date;

  blocked_user_ids: string[];

  teams: string[];

  custom: Record<string, any>;

  avg_response_time?: number;

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  teams_role?: Record<string, string>;
}

export interface FeedCreatedEvent {
  created_at: Date;

  fid: string;

  members: FeedMemberResponse[];

  custom: Record<string, any>;

  feed: FeedResponse;

  user: UserResponseCommonFields;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FeedDeletedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedGroup {
  aggregation_version: number;

  app_pk: number;

  created_at: Date;

  default_visibility: string;

  group_id: string;

  updated_at: Date;

  activity_processors: ActivityProcessorConfig[];

  activity_selectors: ActivitySelectorConfig[];

  custom: Record<string, any>;

  deleted_at?: Date;

  last_feed_get_at?: Date;

  aggregation?: AggregationConfig;

  notification?: NotificationConfig;

  push_notification?: PushNotificationConfig;

  ranking?: RankingConfig;

  stories?: StoriesConfig;
}

export interface FeedGroupChangedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  feed_group?: FeedGroup;

  user?: UserResponseCommonFields;
}

export interface FeedGroupDeletedEvent {
  created_at: Date;

  fid: string;

  group_id: string;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FeedInput {
  description?: string;

  name?: string;

  visibility?: 'public' | 'visible' | 'followers' | 'members' | 'private';

  filter_tags?: string[];

  members?: FeedMemberRequest[];

  custom?: Record<string, any>;
}

export interface FeedMemberAddedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  member: FeedMemberResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedMemberRemovedEvent {
  created_at: Date;

  fid: string;

  member_id: string;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedMemberRequest {
  user_id: string;

  invite?: boolean;

  membership_level?: string;

  role?: string;

  custom?: Record<string, any>;
}

export interface FeedMemberResponse {
  created_at: Date;

  role: string;

  status: 'member' | 'pending' | 'rejected';

  updated_at: Date;

  user: UserResponse;

  invite_accepted_at?: Date;

  invite_rejected_at?: Date;

  custom?: Record<string, any>;

  membership_level?: MembershipLevelResponse;
}

export interface FeedMemberUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  member: FeedMemberResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export const FeedOwnCapability = {
  ADD_ACTIVITY: 'add-activity',
  ADD_ACTIVITY_BOOKMARK: 'add-activity-bookmark',
  ADD_ACTIVITY_REACTION: 'add-activity-reaction',
  ADD_COMMENT: 'add-comment',
  ADD_COMMENT_REACTION: 'add-comment-reaction',
  CREATE_FEED: 'create-feed',
  DELETE_ANY_ACTIVITY: 'delete-any-activity',
  DELETE_ANY_COMMENT: 'delete-any-comment',
  DELETE_FEED: 'delete-feed',
  DELETE_OWN_ACTIVITY: 'delete-own-activity',
  DELETE_OWN_ACTIVITY_BOOKMARK: 'delete-own-activity-bookmark',
  DELETE_OWN_ACTIVITY_REACTION: 'delete-own-activity-reaction',
  DELETE_OWN_COMMENT: 'delete-own-comment',
  DELETE_OWN_COMMENT_REACTION: 'delete-own-comment-reaction',
  FOLLOW: 'follow',
  PIN_ACTIVITY: 'pin-activity',
  QUERY_FEED_MEMBERS: 'query-feed-members',
  QUERY_FOLLOWS: 'query-follows',
  READ_ACTIVITIES: 'read-activities',
  READ_FEED: 'read-feed',
  UNFOLLOW: 'unfollow',
  UPDATE_ANY_ACTIVITY: 'update-any-activity',
  UPDATE_ANY_COMMENT: 'update-any-comment',
  UPDATE_FEED: 'update-feed',
  UPDATE_FEED_FOLLOWERS: 'update-feed-followers',
  UPDATE_FEED_MEMBERS: 'update-feed-members',
  UPDATE_OWN_ACTIVITY: 'update-own-activity',
  UPDATE_OWN_ACTIVITY_BOOKMARK: 'update-own-activity-bookmark',
  UPDATE_OWN_COMMENT: 'update-own-comment',
} as const;

export type FeedOwnCapability =
  (typeof FeedOwnCapability)[keyof typeof FeedOwnCapability];

export interface FeedOwnData {
  own_capabilities?: FeedOwnCapability[];

  own_followings?: FollowResponse[];

  own_follows?: FollowResponse[];

  own_membership?: FeedMemberResponse;
}

export interface FeedRequest {
  feed_group_id: string;

  feed_id: string;

  created_by_id?: string;

  description?: string;

  name?: string;

  visibility?: 'public' | 'visible' | 'followers' | 'members' | 'private';

  filter_tags?: string[];

  members?: FeedMemberRequest[];

  custom?: Record<string, any>;
}

export interface FeedResponse {
  activity_count: number;

  created_at: Date;

  description: string;

  feed: string;

  follower_count: number;

  following_count: number;

  group_id: string;

  id: string;

  member_count: number;

  name: string;

  pin_count: number;

  updated_at: Date;

  created_by: UserResponse;

  deleted_at?: Date;

  visibility?: string;

  filter_tags?: string[];

  own_capabilities?: FeedOwnCapability[];

  own_followings?: FollowResponse[];

  own_follows?: FollowResponse[];

  custom?: Record<string, any>;

  own_membership?: FeedMemberResponse;
}

export interface FeedSuggestionResponse {
  activity_count: number;

  created_at: Date;

  description: string;

  feed: string;

  follower_count: number;

  following_count: number;

  group_id: string;

  id: string;

  member_count: number;

  name: string;

  pin_count: number;

  updated_at: Date;

  created_by: UserResponse;

  deleted_at?: Date;

  reason?: string;

  recommendation_score?: number;

  visibility?: string;

  filter_tags?: string[];

  own_capabilities?: FeedOwnCapability[];

  own_followings?: FollowResponse[];

  own_follows?: FollowResponse[];

  algorithm_scores?: Record<string, number>;

  custom?: Record<string, any>;

  own_membership?: FeedMemberResponse;
}

export interface FeedUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  feed: FeedResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedsPreferences {
  comment?: 'all' | 'none';

  comment_reaction?: 'all' | 'none';

  comment_reply?: 'all' | 'none';

  follow?: 'all' | 'none';

  mention?: 'all' | 'none';

  reaction?: 'all' | 'none';

  custom_activity_types?: Record<string, string>;
}

export interface FeedsPreferencesResponse {
  comment?: string;

  comment_reaction?: string;

  follow?: string;

  mention?: string;

  reaction?: string;

  custom_activity_types?: Record<string, string>;
}

export interface FeedsReactionResponse {
  activity_id: string;

  created_at: Date;

  type: string;

  updated_at: Date;

  user: UserResponse;

  comment_id?: string;

  custom?: Record<string, any>;
}

export interface Field {
  short: boolean;

  title: string;

  value: string;
}

export interface FileUploadConfig {
  size_limit: number;

  allowed_file_extensions: string[];

  allowed_mime_types: string[];

  blocked_file_extensions: string[];

  blocked_mime_types: string[];
}

export interface FileUploadRequest {
  file?: string;

  user?: OnlyUserID;
}

export interface FileUploadResponse {
  duration: string;

  file?: string;

  thumb_url?: string;
}

export interface FilterConfigResponse {
  llm_labels: string[];

  ai_text_labels?: string[];
}

export interface FlagCountRuleParameters {
  threshold?: number;
}

export interface FlagRequest {
  entity_id: string;

  entity_type: string;

  entity_creator_id?: string;

  reason?: string;

  custom?: Record<string, any>;

  moderation_payload?: ModerationPayload;
}

export interface FlagResponse {
  duration: string;

  item_id: string;
}

export interface FlagUserOptions {
  reason?: string;
}

export interface FollowBatchRequest {
  follows: FollowRequest[];
}

export interface FollowBatchResponse {
  duration: string;

  created: FollowResponse[];

  follows: FollowResponse[];
}

export interface FollowCreatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FollowDeletedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FollowPair {
  source: string;

  target: string;
}

export interface FollowRequest {
  source: string;

  target: string;

  create_notification_activity?: boolean;

  push_preference?: 'all' | 'none';

  skip_push?: boolean;

  custom?: Record<string, any>;
}

export interface FollowResponse {
  created_at: Date;

  follower_role: string;

  push_preference: 'all' | 'none';

  status: 'accepted' | 'pending' | 'rejected';

  updated_at: Date;

  source_feed: FeedResponse;

  target_feed: FeedResponse;

  request_accepted_at?: Date;

  request_rejected_at?: Date;

  custom?: Record<string, any>;
}

export interface FollowUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FrameRecordingResponse {
  status: string;
}

export interface FrameRecordingSettingsResponse {
  capture_interval_in_seconds: number;

  mode: 'available' | 'disabled' | 'auto-on';

  quality?: string;
}

export interface FullUserResponse {
  banned: boolean;

  created_at: Date;

  id: string;

  invisible: boolean;

  language: string;

  online: boolean;

  role: string;

  shadow_banned: boolean;

  total_unread_count: number;

  unread_channels: number;

  unread_count: number;

  unread_threads: number;

  updated_at: Date;

  blocked_user_ids: string[];

  channel_mutes: ChannelMute[];

  devices: DeviceResponse[];

  mutes: UserMuteResponse[];

  teams: string[];

  custom: Record<string, any>;

  avg_response_time?: number;

  ban_expires?: Date;

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  latest_hidden_channels?: string[];

  privacy_settings?: PrivacySettingsResponse;

  teams_role?: Record<string, string>;
}

export interface GeofenceSettingsResponse {
  names: string[];
}

export interface GetActivityResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface GetAppealResponse {
  duration: string;

  item?: AppealItemResponse;
}

export interface GetApplicationResponse {
  duration: string;

  app: AppResponseFields;
}

export interface GetBlockedUsersResponse {
  duration: string;

  blocks: BlockedUserResponse[];
}

export interface GetCommentRepliesResponse {
  duration: string;

  comments: ThreadedCommentResponse[];

  next?: string;

  prev?: string;
}

export interface GetCommentResponse {
  duration: string;

  comment: CommentResponse;
}

export interface GetCommentsResponse {
  duration: string;

  comments: ThreadedCommentResponse[];

  next?: string;

  prev?: string;
}

export interface GetConfigResponse {
  duration: string;

  config?: ConfigResponse;
}

export interface GetFollowSuggestionsResponse {
  duration: string;

  suggestions: FeedSuggestionResponse[];

  algorithm_used?: string;
}

export interface GetOGResponse {
  duration: string;

  custom: Record<string, any>;

  asset_url?: string;

  author_icon?: string;

  author_link?: string;

  author_name?: string;

  color?: string;

  fallback?: string;

  footer?: string;

  footer_icon?: string;

  image_url?: string;

  og_scrape_url?: string;

  original_height?: number;

  original_width?: number;

  pretext?: string;

  text?: string;

  thumb_url?: string;

  title?: string;

  title_link?: string;

  type?: string;

  actions?: Action[];

  fields?: Field[];

  giphy?: Images;
}

export interface GetOrCreateFeedRequest {
  id_around?: string;

  limit?: number;

  next?: string;

  prev?: string;

  view?: string;

  watch?: boolean;

  data?: FeedInput;

  enrichment_options?: EnrichmentOptions;

  external_ranking?: Record<string, any>;

  filter?: Record<string, any>;

  followers_pagination?: PagerRequest;

  following_pagination?: PagerRequest;

  interest_weights?: Record<string, number>;

  member_pagination?: PagerRequest;
}

export interface GetOrCreateFeedResponse {
  created: boolean;

  duration: string;

  activities: ActivityResponse[];

  aggregated_activities: AggregatedActivityResponse[];

  followers: FollowResponse[];

  following: FollowResponse[];

  members: FeedMemberResponse[];

  pinned_activities: ActivityPinResponse[];

  feed: FeedResponse;

  next?: string;

  prev?: string;

  followers_pagination?: PagerResponse;

  following_pagination?: PagerResponse;

  member_pagination?: PagerResponse;

  notification_status?: NotificationStatusResponse;
}

export interface GoogleVisionConfig {
  enabled?: boolean;
}

export interface HLSSettingsResponse {
  auto_on: boolean;

  enabled: boolean;

  quality_tracks: string[];
}

export interface HarmConfig {
  cooldown_period: number;

  severity: number;

  threshold: number;

  action_sequences: ActionSequence[];

  harm_types: string[];
}

export interface HealthCheckEvent {
  connection_id: string;

  created_at: Date;

  custom: Record<string, any>;

  type: string;

  cid?: string;

  received_at?: Date;

  me?: OwnUserResponse;
}

export interface ImageContentParameters {
  harm_labels?: string[];
}

export interface ImageData {
  frames: string;

  height: string;

  size: string;

  url: string;

  width: string;
}

export interface ImageRuleParameters {
  threshold?: number;

  time_window?: string;

  harm_labels?: string[];
}

export interface ImageSize {
  crop?: 'top' | 'bottom' | 'left' | 'right' | 'center';

  height?: number;

  resize?: 'clip' | 'crop' | 'scale' | 'fill';

  width?: number;
}

export interface ImageUploadRequest {
  file?: string;

  upload_sizes?: ImageSize[];

  user?: OnlyUserID;
}

export interface ImageUploadResponse {
  duration: string;

  file?: string;

  thumb_url?: string;

  upload_sizes?: ImageSize[];
}

export interface Images {
  fixed_height: ImageData;

  fixed_height_downsampled: ImageData;

  fixed_height_still: ImageData;

  fixed_width: ImageData;

  fixed_width_downsampled: ImageData;

  fixed_width_still: ImageData;

  original: ImageData;
}

export interface IndividualRecordingResponse {
  status: string;
}

export interface IndividualRecordingSettingsResponse {
  mode: 'available' | 'disabled' | 'auto-on';
}

export interface IngressAudioEncodingResponse {
  bitrate: number;

  channels: number;

  enable_dtx: boolean;
}

export interface IngressSettingsResponse {
  enabled: boolean;

  audio_encoding_options?: IngressAudioEncodingResponse;

  video_encoding_options?: Record<string, IngressVideoEncodingResponse>;
}

export interface IngressSourceResponse {
  fps: number;

  height: number;

  width: number;
}

export interface IngressVideoEncodingResponse {
  layers: IngressVideoLayerResponse[];

  source: IngressSourceResponse;
}

export interface IngressVideoLayerResponse {
  bitrate: number;

  codec: string;

  frame_rate_limit: number;

  max_dimension: number;

  min_dimension: number;
}

export interface LLMConfig {
  enabled: boolean;

  rules: LLMRule[];

  app_context?: string;

  async?: boolean;

  severity_descriptions?: Record<string, string>;
}

export interface LLMRule {
  action:
    | 'flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove'
    | 'keep';

  description: string;

  label: string;

  severity_rules: BodyguardSeverityRule[];
}

export interface LabelThresholds {
  block?: number;

  flag?: number;
}

export interface LimitsSettingsResponse {
  max_participants_exclude_roles: string[];

  max_duration_seconds?: number;

  max_participants?: number;

  max_participants_exclude_owner?: boolean;
}

export interface ListBlockListResponse {
  duration: string;

  blocklists: BlockListResponse[];
}

export interface ListDevicesResponse {
  duration: string;

  devices: DeviceResponse[];
}

export interface MarkActivityRequest {
  mark_all_read?: boolean;

  mark_all_seen?: boolean;

  mark_read?: string[];

  mark_seen?: string[];

  mark_watched?: string[];
}

export interface MarkReviewedRequest {
  content_to_mark_as_reviewed_limit?: number;

  decision_reason?: string;

  disable_marking_content_as_reviewed?: boolean;
}

export interface MembershipLevelResponse {
  created_at: Date;

  id: string;

  name: string;

  priority: number;

  updated_at: Date;

  tags: string[];

  description?: string;

  custom?: Record<string, any>;
}

export interface Message {
  cid: string;

  created_at: Date;

  deleted_reply_count: number;

  html: string;

  id: string;

  pinned: boolean;

  reply_count: number;

  shadowed: boolean;

  silent: boolean;

  text: string;

  type: string;

  updated_at: Date;

  attachments: Attachment[];

  latest_reactions: Reaction[];

  mentioned_users: User[];

  own_reactions: Reaction[];

  restricted_visibility: string[];

  custom: Record<string, any>;

  reaction_counts: Record<string, number>;

  reaction_groups: Record<string, ReactionGroupResponse>;

  reaction_scores: Record<string, number>;

  before_message_send_failed?: boolean;

  command?: string;

  deleted_at?: Date;

  deleted_for_me?: boolean;

  message_text_updated_at?: Date;

  mml?: string;

  parent_id?: string;

  pin_expires?: Date;

  pinned_at?: Date;

  poll_id?: string;

  quoted_message_id?: string;

  show_in_channel?: boolean;

  thread_participants?: User[];

  i18n?: Record<string, string>;

  image_labels?: Record<string, string[]>;

  member?: ChannelMember;

  moderation?: ModerationV2Response;

  pinned_by?: User;

  poll?: Poll;

  quoted_message?: Message;

  reminder?: MessageReminder;

  shared_location?: SharedLocation;

  user?: User;
}

export interface MessageReminder {
  channel_cid: string;

  created_at: Date;

  message_id: string;

  task_id: string;

  updated_at: Date;

  user_id: string;

  remind_at?: Date;

  channel?: Channel;

  message?: Message;

  user?: User;
}

export interface MessageResponse {
  cid: string;

  created_at: Date;

  deleted_reply_count: number;

  html: string;

  id: string;

  pinned: boolean;

  reply_count: number;

  shadowed: boolean;

  silent: boolean;

  text: string;

  type: 'regular' | 'ephemeral' | 'error' | 'reply' | 'system' | 'deleted';

  updated_at: Date;

  attachments: Attachment[];

  latest_reactions: ReactionResponse[];

  mentioned_users: UserResponse[];

  own_reactions: ReactionResponse[];

  restricted_visibility: string[];

  custom: Record<string, any>;

  reaction_counts: Record<string, number>;

  reaction_scores: Record<string, number>;

  user: UserResponse;

  command?: string;

  deleted_at?: Date;

  deleted_for_me?: boolean;

  message_text_updated_at?: Date;

  mml?: string;

  parent_id?: string;

  pin_expires?: Date;

  pinned_at?: Date;

  poll_id?: string;

  quoted_message_id?: string;

  show_in_channel?: boolean;

  thread_participants?: UserResponse[];

  draft?: DraftResponse;

  i18n?: Record<string, string>;

  image_labels?: Record<string, string[]>;

  member?: ChannelMemberResponse;

  moderation?: ModerationV2Response;

  pinned_by?: UserResponse;

  poll?: PollResponseData;

  quoted_message?: MessageResponse;

  reaction_groups?: Record<string, ReactionGroupResponse>;

  reminder?: ReminderResponseData;

  shared_location?: SharedLocationResponseData;
}

export interface ModerationActionConfig {
  action: string;

  description: string;

  entity_type: string;

  icon: string;

  order: number;

  custom: Record<string, any>;
}

export interface ModerationCustomActionEvent {
  action_id: string;

  created_at: Date;

  custom: Record<string, any>;

  review_queue_item: ReviewQueueItemResponse;

  type: string;

  received_at?: Date;

  action_options?: Record<string, any>;

  message?: MessageResponse;
}

export interface ModerationFlagResponse {
  created_at: Date;

  entity_id: string;

  entity_type: string;

  type: string;

  updated_at: Date;

  user_id: string;

  result: Array<Record<string, any>>;

  entity_creator_id?: string;

  reason?: string;

  review_queue_item_id?: string;

  labels?: string[];

  custom?: Record<string, any>;

  moderation_payload?: ModerationPayload;

  review_queue_item?: ReviewQueueItemResponse;

  user?: UserResponse;
}

export interface ModerationFlaggedEvent {
  created_at: Date;

  type: string;

  item?: string;

  object_id?: string;

  user?: User;
}

export interface ModerationMarkReviewedEvent {
  created_at: Date;

  custom: Record<string, any>;

  item: ReviewQueueItemResponse;

  type: string;

  received_at?: Date;

  message?: MessageResponse;
}

export interface ModerationPayload {
  images?: string[];

  texts?: string[];

  videos?: string[];

  custom?: Record<string, any>;
}

export interface ModerationV2Response {
  action: string;

  original_text: string;

  blocklist_matched?: string;

  platform_circumvented?: boolean;

  semantic_filter_matched?: string;

  image_harms?: string[];

  text_harms?: string[];
}

export interface MuteRequest {
  target_ids: string[];

  timeout?: number;
}

export interface MuteResponse {
  duration: string;

  mutes?: UserMute[];

  non_existing_users?: string[];

  own_user?: OwnUser;
}

export interface NoiseCancellationSettings {
  mode: 'available' | 'disabled' | 'auto-on';
}

export interface NotificationComment {
  comment: string;

  id: string;

  user_id: string;

  attachments?: Attachment[];
}

export interface NotificationConfig {
  deduplication_window?: string;

  track_read?: boolean;

  track_seen?: boolean;
}

export interface NotificationContext {
  target?: NotificationTarget;

  trigger?: NotificationTrigger;
}

export interface NotificationFeedUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  aggregated_activities?: AggregatedActivityResponse[];

  notification_status?: NotificationStatusResponse;

  user?: UserResponseCommonFields;
}

export interface NotificationStatusResponse {
  unread: number;

  unseen: number;

  last_read_at?: Date;

  last_seen_at?: Date;

  read_activities?: string[];

  seen_activities?: string[];
}

export interface NotificationTarget {
  id: string;

  name?: string;

  text?: string;

  type?: string;

  user_id?: string;

  attachments?: Attachment[];

  comment?: NotificationComment;
}

export interface NotificationTrigger {
  text: string;

  type: string;

  comment?: NotificationComment;
}

export interface OCRRule {
  action:
    | 'flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove';

  label: string;
}

export interface OnlyUserID {
  id: string;
}

export interface OwnBatchRequest {
  feeds: string[];

  fields?: string[];
}

export interface OwnBatchResponse {
  duration: string;

  data: Record<string, FeedOwnData>;
}

export interface OwnUser {
  banned: boolean;

  created_at: Date;

  id: string;

  language: string;

  online: boolean;

  role: string;

  total_unread_count: number;

  unread_channels: number;

  unread_count: number;

  unread_threads: number;

  updated_at: Date;

  channel_mutes: ChannelMute[];

  devices: Device[];

  mutes: UserMute[];

  custom: Record<string, any>;

  total_unread_count_by_team: Record<string, number>;

  avg_response_time?: number;

  deactivated_at?: Date;

  deleted_at?: Date;

  invisible?: boolean;

  last_active?: Date;

  last_engaged_at?: Date;

  blocked_user_ids?: string[];

  latest_hidden_channels?: string[];

  teams?: string[];

  privacy_settings?: PrivacySettings;

  push_preferences?: PushPreferences;

  teams_role?: Record<string, string>;
}

export interface OwnUserResponse {
  banned: boolean;

  created_at: Date;

  id: string;

  invisible: boolean;

  language: string;

  online: boolean;

  role: string;

  total_unread_count: number;

  unread_channels: number;

  unread_count: number;

  unread_threads: number;

  updated_at: Date;

  channel_mutes: ChannelMute[];

  devices: DeviceResponse[];

  mutes: UserMuteResponse[];

  teams: string[];

  custom: Record<string, any>;

  avg_response_time?: number;

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  blocked_user_ids?: string[];

  latest_hidden_channels?: string[];

  privacy_settings?: PrivacySettingsResponse;

  push_preferences?: PushPreferencesResponse;

  teams_role?: Record<string, string>;

  total_unread_count_by_team?: Record<string, number>;
}

export interface PagerRequest {
  limit?: number;

  next?: string;

  prev?: string;
}

export interface PagerResponse {
  next?: string;

  prev?: string;
}

export interface PinActivityRequest {}

export interface PinActivityResponse {
  created_at: Date;

  duration: string;

  feed: string;

  user_id: string;

  activity: ActivityResponse;
}

export interface Poll {
  allow_answers: boolean;

  allow_user_suggested_options: boolean;

  answers_count: number;

  created_at: Date;

  created_by_id: string;

  description: string;

  enforce_unique_vote: boolean;

  id: string;

  name: string;

  updated_at: Date;

  vote_count: number;

  latest_answers: PollVote[];

  options: PollOption[];

  own_votes: PollVote[];

  custom: Record<string, any>;

  latest_votes_by_option: Record<string, PollVote[]>;

  vote_counts_by_option: Record<string, number>;

  is_closed?: boolean;

  max_votes_allowed?: number;

  voting_visibility?: string;

  created_by?: User;
}

export interface PollClosedFeedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  poll: PollResponseData;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface PollDeletedFeedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  poll: PollResponseData;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface PollOption {
  id: string;

  text: string;

  custom: Record<string, any>;
}

export interface PollOptionInput {
  text?: string;

  custom?: Record<string, any>;
}

export interface PollOptionRequest {
  id: string;

  text?: string;

  custom?: Record<string, any>;
}

export interface PollOptionResponse {
  duration: string;

  poll_option: PollOptionResponseData;
}

export interface PollOptionResponseData {
  id: string;

  text: string;

  custom: Record<string, any>;
}

export interface PollResponse {
  duration: string;

  poll: PollResponseData;
}

export interface PollResponseData {
  allow_answers: boolean;

  allow_user_suggested_options: boolean;

  answers_count: number;

  created_at: Date;

  created_by_id: string;

  description: string;

  enforce_unique_vote: boolean;

  id: string;

  name: string;

  updated_at: Date;

  vote_count: number;

  voting_visibility: string;

  latest_answers: PollVoteResponseData[];

  options: PollOptionResponseData[];

  own_votes: PollVoteResponseData[];

  custom: Record<string, any>;

  latest_votes_by_option: Record<string, PollVoteResponseData[]>;

  vote_counts_by_option: Record<string, number>;

  is_closed?: boolean;

  max_votes_allowed?: number;

  created_by?: UserResponse;
}

export interface PollUpdatedFeedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  poll: PollResponseData;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface PollVote {
  created_at: Date;

  id: string;

  option_id: string;

  poll_id: string;

  updated_at: Date;

  answer_text?: string;

  is_answer?: boolean;

  user_id?: string;

  user?: User;
}

export interface PollVoteCastedFeedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  poll: PollResponseData;

  poll_vote: PollVoteResponseData;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface PollVoteChangedFeedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  poll: PollResponseData;

  poll_vote: PollVoteResponseData;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface PollVoteRemovedFeedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  poll: PollResponseData;

  poll_vote: PollVoteResponseData;

  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface PollVoteResponse {
  duration: string;

  poll?: PollResponseData;

  vote?: PollVoteResponseData;
}

export interface PollVoteResponseData {
  created_at: Date;

  id: string;

  option_id: string;

  poll_id: string;

  updated_at: Date;

  answer_text?: string;

  is_answer?: boolean;

  user_id?: string;

  user?: UserResponse;
}

export interface PollVotesResponse {
  duration: string;

  votes: PollVoteResponseData[];

  next?: string;

  prev?: string;
}

export interface PrivacySettings {
  delivery_receipts?: DeliveryReceipts;

  read_receipts?: ReadReceipts;

  typing_indicators?: TypingIndicators;
}

export interface PrivacySettingsResponse {
  delivery_receipts?: DeliveryReceiptsResponse;

  read_receipts?: ReadReceiptsResponse;

  typing_indicators?: TypingIndicatorsResponse;
}

export interface PushNotificationConfig {
  enable_push?: boolean;

  push_types?: string[];
}

export interface PushPreferenceInput {
  call_level?: 'all' | 'none' | 'default';

  channel_cid?: string;

  chat_level?: 'all' | 'mentions' | 'none' | 'default';

  disabled_until?: Date;

  feeds_level?: 'all' | 'none' | 'default';

  remove_disable?: boolean;

  user_id?: string;

  feeds_preferences?: FeedsPreferences;
}

export interface PushPreferences {
  call_level?: string;

  chat_level?: string;

  disabled_until?: Date;

  feeds_level?: string;

  feeds_preferences?: FeedsPreferences;
}

export interface PushPreferencesResponse {
  call_level?: string;

  chat_level?: string;

  disabled_until?: Date;

  feeds_level?: string;

  feeds_preferences?: FeedsPreferencesResponse;
}

export interface QueryActivitiesRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryActivitiesResponse {
  duration: string;

  activities: ActivityResponse[];

  next?: string;

  prev?: string;
}

export interface QueryActivityReactionsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryActivityReactionsResponse {
  duration: string;

  reactions: FeedsReactionResponse[];

  next?: string;

  prev?: string;
}

export interface QueryAppealsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryAppealsResponse {
  duration: string;

  items: AppealItemResponse[];

  next?: string;

  prev?: string;
}

export interface QueryBookmarkFoldersRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryBookmarkFoldersResponse {
  duration: string;

  bookmark_folders: BookmarkFolderResponse[];

  next?: string;

  prev?: string;
}

export interface QueryBookmarksRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryBookmarksResponse {
  duration: string;

  bookmarks: BookmarkResponse[];

  next?: string;

  prev?: string;
}

export interface QueryCommentReactionsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryCommentReactionsResponse {
  duration: string;

  reactions: FeedsReactionResponse[];

  next?: string;

  prev?: string;
}

export interface QueryCommentsRequest {
  filter: Record<string, any>;

  limit?: number;

  next?: string;

  prev?: string;

  sort?: 'first' | 'last' | 'top' | 'best' | 'controversial';
}

export interface QueryCommentsResponse {
  duration: string;

  comments: CommentResponse[];

  next?: string;

  prev?: string;
}

export interface QueryFeedMembersRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryFeedMembersResponse {
  duration: string;

  members: FeedMemberResponse[];

  next?: string;

  prev?: string;
}

export interface QueryFeedsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  watch?: boolean;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryFeedsResponse {
  duration: string;

  feeds: FeedResponse[];

  next?: string;

  prev?: string;
}

export interface QueryFollowsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryFollowsResponse {
  duration: string;

  follows: FollowResponse[];

  next?: string;

  prev?: string;
}

export interface QueryModerationConfigsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryModerationConfigsResponse {
  duration: string;

  configs: ConfigResponse[];

  next?: string;

  prev?: string;
}

export interface QueryPollVotesRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryPollsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryPollsResponse {
  duration: string;

  polls: PollResponseData[];

  next?: string;

  prev?: string;
}

export interface QueryReviewQueueRequest {
  limit?: number;

  lock_count?: number;

  lock_duration?: number;

  lock_items?: boolean;

  next?: string;

  prev?: string;

  stats_only?: boolean;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryReviewQueueResponse {
  duration: string;

  items: ReviewQueueItemResponse[];

  action_config: Record<string, ModerationActionConfig[]>;

  stats: Record<string, any>;

  next?: string;

  prev?: string;

  filter_config?: FilterConfigResponse;
}

export interface QueryUsersPayload {
  filter_conditions: Record<string, any>;

  include_deactivated_users?: boolean;

  limit?: number;

  offset?: number;

  presence?: boolean;

  sort?: SortParamRequest[];
}

export interface QueryUsersResponse {
  duration: string;

  users: FullUserResponse[];
}

export interface RTMPIngress {
  address: string;
}

export interface RTMPSettingsResponse {
  enabled: boolean;

  quality: string;
}

export interface RankingConfig {
  score?: string;

  type?: string;

  defaults?: Record<string, any>;

  functions?: Record<string, DecayFunctionConfig>;
}

export interface RawRecordingResponse {
  status: string;
}

export interface RawRecordingSettingsResponse {
  mode: 'available' | 'disabled' | 'auto-on';
}

export interface Reaction {
  activity_id: string;

  created_at: Date;

  kind: string;

  updated_at: Date;

  user_id: string;

  deleted_at?: Date;

  id?: string;

  parent?: string;

  score?: number;

  target_feeds?: string[];

  children_counts?: Record<string, any>;

  data?: Record<string, any>;

  latest_children?: Record<string, Reaction[]>;

  moderation?: Record<string, any>;

  own_children?: Record<string, Reaction[]>;

  target_feeds_extra_data?: Record<string, any>;

  user?: User;
}

export interface ReactionGroupResponse {
  count: number;

  first_reaction_at: Date;

  last_reaction_at: Date;

  sum_scores: number;
}

export interface ReactionResponse {
  created_at: Date;

  message_id: string;

  score: number;

  type: string;

  updated_at: Date;

  user_id: string;

  custom: Record<string, any>;

  user: UserResponse;
}

export interface ReadCollectionsResponse {
  duration: string;

  collections: CollectionResponse[];
}

export interface ReadReceipts {
  enabled: boolean;
}

export interface ReadReceiptsResponse {
  enabled: boolean;
}

export interface RecordSettingsResponse {
  audio_only: boolean;

  mode: string;

  quality: string;
}

export interface RejectAppealRequest {
  decision_reason: string;
}

export interface RejectFeedMemberInviteRequest {}

export interface RejectFeedMemberInviteResponse {
  duration: string;

  member: FeedMemberResponse;
}

export interface RejectFollowRequest {
  source: string;

  target: string;
}

export interface RejectFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface ReminderResponseData {
  channel_cid: string;

  created_at: Date;

  message_id: string;

  updated_at: Date;

  user_id: string;

  remind_at?: Date;

  channel?: ChannelResponse;

  message?: MessageResponse;

  user?: UserResponse;
}

export interface RepliesMeta {
  depth_truncated: boolean;

  has_more: boolean;

  remaining: number;

  next_cursor?: string;
}

export interface Response {
  duration: string;
}

export interface RestoreActionRequest {
  decision_reason?: string;
}

export interface RestoreActivityRequest {}

export interface RestoreActivityResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface ReviewQueueItemResponse {
  ai_text_severity: string;

  created_at: Date;

  entity_id: string;

  entity_type: string;

  flags_count: number;

  id: string;

  latest_moderator_action: string;

  recommended_action: string;

  reviewed_by: string;

  severity: number;

  status: string;

  updated_at: Date;

  actions: ActionLogResponse[];

  bans: Ban[];

  flags: ModerationFlagResponse[];

  languages: string[];

  completed_at?: Date;

  config_key?: string;

  entity_creator_id?: string;

  reviewed_at?: Date;

  teams?: string[];

  activity?: EnrichedActivity;

  appeal?: AppealItemResponse;

  assigned_to?: UserResponse;

  call?: CallResponse;

  entity_creator?: EntityCreatorResponse;

  feeds_v2_activity?: EnrichedActivity;

  feeds_v2_reaction?: Reaction;

  feeds_v3_activity?: ActivityResponse;

  feeds_v3_comment?: CommentResponse;

  message?: MessageResponse;

  moderation_payload?: ModerationPayload;

  reaction?: Reaction;
}

export interface RingSettingsResponse {
  auto_cancel_timeout_ms: number;

  incoming_call_timeout_ms: number;

  missed_call_timeout_ms: number;
}

export interface RuleBuilderAction {
  type:
    | 'ban_user'
    | 'flag_user'
    | 'flag_content'
    | 'block_content'
    | 'shadow_content'
    | 'bounce_flag_content'
    | 'bounce_content'
    | 'bounce_remove_content';

  ban_options?: BanOptions;

  flag_user_options?: FlagUserOptions;
}

export interface RuleBuilderCondition {
  confidence?: number;

  type?: string;

  content_count_rule_params?: ContentCountRuleParameters;

  content_flag_count_rule_params?: FlagCountRuleParameters;

  image_content_params?: ImageContentParameters;

  image_rule_params?: ImageRuleParameters;

  text_content_params?: TextContentParameters;

  text_rule_params?: TextRuleParameters;

  user_created_within_params?: UserCreatedWithinParameters;

  user_custom_property_params?: UserCustomPropertyParameters;

  user_flag_count_rule_params?: FlagCountRuleParameters;

  user_identical_content_count_params?: UserIdenticalContentCountParameters;

  user_role_params?: UserRoleParameters;

  user_rule_params?: UserRuleParameters;

  video_content_params?: VideoContentParameters;

  video_rule_params?: VideoRuleParameters;
}

export interface RuleBuilderConditionGroup {
  logic?: string;

  conditions?: RuleBuilderCondition[];
}

export interface RuleBuilderConfig {
  async?: boolean;

  rules?: RuleBuilderRule[];
}

export interface RuleBuilderRule {
  rule_type: string;

  action: RuleBuilderAction;

  cooldown_period?: string;

  id?: string;

  logic?: string;

  conditions?: RuleBuilderCondition[];

  groups?: RuleBuilderConditionGroup[];
}

export interface SRTIngress {
  address: string;
}

export interface ScreensharingSettingsResponse {
  access_request_enabled: boolean;

  enabled: boolean;

  target_resolution?: TargetResolution;
}

export interface SessionSettingsResponse {
  inactivity_timeout_seconds: number;
}

export interface ShadowBlockActionRequest {
  reason?: string;
}

export interface SharedLocation {
  channel_cid: string;

  created_at: Date;

  created_by_device_id: string;

  message_id: string;

  updated_at: Date;

  user_id: string;

  end_at?: Date;

  latitude?: number;

  longitude?: number;

  channel?: Channel;

  message?: Message;
}

export interface SharedLocationResponse {
  channel_cid: string;

  created_at: Date;

  created_by_device_id: string;

  duration: string;

  latitude: number;

  longitude: number;

  message_id: string;

  updated_at: Date;

  user_id: string;

  end_at?: Date;

  channel?: ChannelResponse;

  message?: MessageResponse;
}

export interface SharedLocationResponseData {
  channel_cid: string;

  created_at: Date;

  created_by_device_id: string;

  latitude: number;

  longitude: number;

  message_id: string;

  updated_at: Date;

  user_id: string;

  end_at?: Date;

  channel?: ChannelResponse;

  message?: MessageResponse;
}

export interface SharedLocationsResponse {
  duration: string;

  active_live_locations: SharedLocationResponseData[];
}

export interface SingleFollowResponse {
  duration: string;

  follow: FollowResponse;

  notification_created?: boolean;
}

export interface SortParam {
  direction: number;

  field: string;

  type: string;
}

export interface SortParamRequest {
  direction?: number;

  field?: string;

  type?: '' | 'number' | 'boolean';
}

export interface SpeechSegmentConfig {
  max_speech_caption_ms?: number;

  silence_duration_ms?: number;
}

export interface StoriesConfig {
  skip_watched?: boolean;

  track_watched?: boolean;
}

export interface StoriesFeedUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

  feed_visibility?: string;

  received_at?: Date;

  activities?: ActivityResponse[];

  aggregated_activities?: AggregatedActivityResponse[];

  user?: UserResponseCommonFields;
}

export interface SubmitActionRequest {
  action_type:
    | 'mark_reviewed'
    | 'delete_message'
    | 'delete_activity'
    | 'delete_comment'
    | 'delete_reaction'
    | 'ban'
    | 'custom'
    | 'unban'
    | 'restore'
    | 'delete_user'
    | 'unblock'
    | 'block'
    | 'shadow_block'
    | 'unmask'
    | 'kick_user'
    | 'end_call'
    | 'reject_appeal';

  appeal_id?: string;

  item_id?: string;

  ban?: BanActionRequest;

  block?: BlockActionRequest;

  custom?: CustomActionRequest;

  delete_activity?: DeleteActivityRequest;

  delete_comment?: DeleteCommentRequest;

  delete_message?: DeleteMessageRequest;

  delete_reaction?: DeleteReactionRequest;

  delete_user?: DeleteUserRequest;

  mark_reviewed?: MarkReviewedRequest;

  reject_appeal?: RejectAppealRequest;

  restore?: RestoreActionRequest;

  shadow_block?: ShadowBlockActionRequest;

  unban?: UnbanActionRequest;

  unblock?: UnblockActionRequest;
}

export interface SubmitActionResponse {
  duration: string;

  appeal_item?: AppealItemResponse;

  item?: ReviewQueueItemResponse;
}

export interface TargetResolution {
  bitrate: number;

  height: number;

  width: number;
}

export interface TextContentParameters {
  contains_url?: boolean;

  severity?: string;

  blocklist_match?: string[];

  harm_labels?: string[];

  llm_harm_labels?: Record<string, string>;
}

export interface TextRuleParameters {
  contains_url?: boolean;

  semantic_filter_min_threshold?: number;

  severity?: string;

  threshold?: number;

  time_window?: string;

  blocklist_match?: string[];

  harm_labels?: string[];

  semantic_filter_names?: string[];

  llm_harm_labels?: Record<string, string>;
}

export interface ThreadedCommentResponse {
  confidence_score: number;

  created_at: Date;

  downvote_count: number;

  id: string;

  object_id: string;

  object_type: string;

  reaction_count: number;

  reply_count: number;

  score: number;

  status: string;

  updated_at: Date;

  upvote_count: number;

  mentioned_users: UserResponse[];

  own_reactions: FeedsReactionResponse[];

  user: UserResponse;

  controversy_score?: number;

  deleted_at?: Date;

  edited_at?: Date;

  parent_id?: string;

  text?: string;

  attachments?: Attachment[];

  latest_reactions?: FeedsReactionResponse[];

  replies?: ThreadedCommentResponse[];

  custom?: Record<string, any>;

  meta?: RepliesMeta;

  moderation?: ModerationV2Response;

  reaction_groups?: Record<string, ReactionGroupResponse>;
}

export interface Thresholds {
  explicit?: LabelThresholds;

  spam?: LabelThresholds;

  toxic?: LabelThresholds;
}

export interface ThumbnailResponse {
  image_url: string;
}

export interface ThumbnailsSettingsResponse {
  enabled: boolean;
}

export interface Time {}

export interface TranscriptionSettingsResponse {
  closed_caption_mode: 'available' | 'disabled' | 'auto-on';

  language:
    | 'auto'
    | 'en'
    | 'fr'
    | 'es'
    | 'de'
    | 'it'
    | 'nl'
    | 'pt'
    | 'pl'
    | 'ca'
    | 'cs'
    | 'da'
    | 'el'
    | 'fi'
    | 'id'
    | 'ja'
    | 'ru'
    | 'sv'
    | 'ta'
    | 'th'
    | 'tr'
    | 'hu'
    | 'ro'
    | 'zh'
    | 'ar'
    | 'tl'
    | 'he'
    | 'hi'
    | 'hr'
    | 'ko'
    | 'ms'
    | 'no'
    | 'uk'
    | 'bg'
    | 'et'
    | 'sl'
    | 'sk';

  mode: 'available' | 'disabled' | 'auto-on';

  speech_segment_config?: SpeechSegmentConfig;

  translation?: TranslationSettings;
}

export interface TranslationSettings {
  enabled: boolean;

  languages: string[];
}

export interface TypingIndicators {
  enabled: boolean;
}

export interface TypingIndicatorsResponse {
  enabled: boolean;
}

export interface UnbanActionRequest {
  decision_reason?: string;
}

export interface UnblockActionRequest {
  decision_reason?: string;
}

export interface UnblockUsersRequest {
  blocked_user_id: string;
}

export interface UnblockUsersResponse {
  duration: string;
}

export interface UnfollowBatchRequest {
  follows: FollowPair[];

  delete_notification_activity?: boolean;
}

export interface UnfollowBatchResponse {
  duration: string;

  follows: FollowResponse[];
}

export interface UnfollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface UnpinActivityResponse {
  duration: string;

  feed: string;

  user_id: string;

  activity: ActivityResponse;
}

export interface UpdateActivityPartialRequest {
  handle_mention_notifications?: boolean;

  unset?: string[];

  set?: Record<string, any>;
}

export interface UpdateActivityPartialResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface UpdateActivityRequest {
  expires_at?: Date;

  handle_mention_notifications?: boolean;

  poll_id?: string;

  restrict_replies?: 'everyone' | 'people_i_follow' | 'nobody';

  skip_enrich_url?: boolean;

  text?: string;

  visibility?: 'public' | 'private' | 'tag';

  visibility_tag?: string;

  attachments?: Attachment[];

  collection_refs?: string[];

  feeds?: string[];

  filter_tags?: string[];

  interest_tags?: string[];

  mentioned_user_ids?: string[];

  custom?: Record<string, any>;

  location?: ActivityLocation;
}

export interface UpdateActivityResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface UpdateBlockListRequest {
  is_leet_check_enabled?: boolean;

  is_plural_check_enabled?: boolean;

  team?: string;

  words?: string[];
}

export interface UpdateBlockListResponse {
  duration: string;

  blocklist?: BlockListResponse;
}

export interface UpdateBookmarkFolderRequest {
  name?: string;

  custom?: Record<string, any>;
}

export interface UpdateBookmarkFolderResponse {
  duration: string;

  bookmark_folder: BookmarkFolderResponse;
}

export interface UpdateBookmarkRequest {
  folder_id?: string;

  new_folder_id?: string;

  custom?: Record<string, any>;

  new_folder?: AddFolderRequest;
}

export interface UpdateBookmarkResponse {
  duration: string;

  bookmark: BookmarkResponse;
}

export interface UpdateCollectionRequest {
  id: string;

  name: string;

  custom: Record<string, any>;
}

export interface UpdateCollectionsRequest {
  collections: UpdateCollectionRequest[];
}

export interface UpdateCollectionsResponse {
  duration: string;

  collections: CollectionResponse[];
}

export interface UpdateCommentRequest {
  comment?: string;

  handle_mention_notifications?: boolean;

  skip_enrich_url?: boolean;

  skip_push?: boolean;

  attachments?: Attachment[];

  mentioned_user_ids?: string[];

  custom?: Record<string, any>;
}

export interface UpdateCommentResponse {
  duration: string;

  comment: CommentResponse;
}

export interface UpdateFeedMembersRequest {
  operation: 'upsert' | 'remove' | 'set';

  limit?: number;

  next?: string;

  prev?: string;

  members?: FeedMemberRequest[];
}

export interface UpdateFeedMembersResponse {
  duration: string;

  added: FeedMemberResponse[];

  removed_ids: string[];

  updated: FeedMemberResponse[];
}

export interface UpdateFeedRequest {
  description?: string;

  name?: string;

  filter_tags?: string[];

  custom?: Record<string, any>;
}

export interface UpdateFeedResponse {
  duration: string;

  feed: FeedResponse;
}

export interface UpdateFollowRequest {
  source: string;

  target: string;

  create_notification_activity?: boolean;

  follower_role?: string;

  push_preference?: 'all' | 'none';

  skip_push?: boolean;

  custom?: Record<string, any>;
}

export interface UpdateFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface UpdateLiveLocationRequest {
  message_id: string;

  end_at?: Date;

  latitude?: number;

  longitude?: number;
}

export interface UpdatePollOptionRequest {
  id: string;

  text: string;

  custom?: Record<string, any>;
}

export interface UpdatePollPartialRequest {
  unset?: string[];

  set?: Record<string, any>;
}

export interface UpdatePollRequest {
  id: string;

  name: string;

  allow_answers?: boolean;

  allow_user_suggested_options?: boolean;

  description?: string;

  enforce_unique_vote?: boolean;

  is_closed?: boolean;

  max_votes_allowed?: number;

  voting_visibility?: 'anonymous' | 'public';

  options?: PollOptionRequest[];

  custom?: Record<string, any>;
}

export interface UpdateUserPartialRequest {
  id: string;

  unset?: string[];

  set?: Record<string, any>;
}

export interface UpdateUsersPartialRequest {
  users: UpdateUserPartialRequest[];
}

export interface UpdateUsersRequest {
  users: Record<string, UserRequest>;
}

export interface UpdateUsersResponse {
  duration: string;

  membership_deletion_task_id: string;

  users: Record<string, FullUserResponse>;
}

export interface UpsertActivitiesRequest {
  activities: ActivityRequest[];
}

export interface UpsertActivitiesResponse {
  duration: string;

  activities: ActivityResponse[];

  mention_notifications_created?: number;
}

export interface UpsertConfigRequest {
  key: string;

  async?: boolean;

  team?: string;

  ai_image_config?: AIImageConfig;

  ai_text_config?: AITextConfig;

  ai_video_config?: AIVideoConfig;

  automod_platform_circumvention_config?: AutomodPlatformCircumventionConfig;

  automod_semantic_filters_config?: AutomodSemanticFiltersConfig;

  automod_toxicity_config?: AutomodToxicityConfig;

  aws_rekognition_config?: AIImageConfig;

  block_list_config?: BlockListConfig;

  bodyguard_config?: AITextConfig;

  google_vision_config?: GoogleVisionConfig;

  llm_config?: LLMConfig;

  rule_builder_config?: RuleBuilderConfig;

  velocity_filter_config?: VelocityFilterConfig;

  video_call_rule_config?: VideoCallRuleConfig;
}

export interface UpsertConfigResponse {
  duration: string;

  config?: ConfigResponse;
}

export interface UpsertPushPreferencesRequest {
  preferences: PushPreferenceInput[];
}

export interface UpsertPushPreferencesResponse {
  duration: string;

  user_channel_preferences: Record<
    string,
    Record<string, ChannelPushPreferences | null>
  >;

  user_preferences: Record<string, PushPreferences>;
}

export interface User {
  banned: boolean;

  id: string;

  online: boolean;

  role: string;

  custom: Record<string, any>;

  teams_role: Record<string, string>;

  avg_response_time?: number;

  ban_expires?: Date;

  created_at?: Date;

  deactivated_at?: Date;

  deleted_at?: Date;

  invisible?: boolean;

  language?: string;

  last_active?: Date;

  last_engaged_at?: Date;

  revoke_tokens_issued_before?: Date;

  updated_at?: Date;

  teams?: string[];

  privacy_settings?: PrivacySettings;
}

export interface UserBannedEvent {
  channel_id: string;

  channel_type: string;

  cid: string;

  created_at: Date;

  shadow: boolean;

  created_by: User;

  type: string;

  expiration?: Date;

  reason?: string;

  team?: string;

  user?: User;
}

export interface UserCreatedWithinParameters {
  max_age?: string;
}

export interface UserCustomPropertyParameters {
  operator?: string;

  property_key?: string;
}

export interface UserDeactivatedEvent {
  created_at: Date;

  created_by: User;

  type: string;

  user?: User;
}

export interface UserIdenticalContentCountParameters {
  threshold?: number;

  time_window?: string;
}

export interface UserMute {
  created_at: Date;

  updated_at: Date;

  expires?: Date;

  target?: User;

  user?: User;
}

export interface UserMuteResponse {
  created_at: Date;

  updated_at: Date;

  expires?: Date;

  target?: UserResponse;

  user?: UserResponse;
}

export interface UserMutedEvent {
  created_at: Date;

  type: string;

  target_user?: string;

  target_users?: string[];

  user?: User;
}

export interface UserReactivatedEvent {
  created_at: Date;

  type: string;

  user?: User;
}

export interface UserRequest {
  id: string;

  image?: string;

  invisible?: boolean;

  language?: string;

  name?: string;

  custom?: Record<string, any>;

  privacy_settings?: PrivacySettingsResponse;
}

export interface UserResponse {
  banned: boolean;

  created_at: Date;

  id: string;

  language: string;

  online: boolean;

  role: string;

  updated_at: Date;

  blocked_user_ids: string[];

  teams: string[];

  custom: Record<string, any>;

  avg_response_time?: number;

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  teams_role?: Record<string, string>;
}

export interface UserResponseCommonFields {
  banned: boolean;

  created_at: Date;

  id: string;

  language: string;

  online: boolean;

  role: string;

  updated_at: Date;

  blocked_user_ids: string[];

  teams: string[];

  custom: Record<string, any>;

  avg_response_time?: number;

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  teams_role?: Record<string, string>;
}

export interface UserResponsePrivacyFields {
  banned: boolean;

  created_at: Date;

  id: string;

  language: string;

  online: boolean;

  role: string;

  updated_at: Date;

  blocked_user_ids: string[];

  teams: string[];

  custom: Record<string, any>;

  avg_response_time?: number;

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  invisible?: boolean;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  privacy_settings?: PrivacySettingsResponse;

  teams_role?: Record<string, string>;
}

export interface UserRoleParameters {
  operator?: string;

  role?: string;
}

export interface UserRuleParameters {
  max_age?: string;
}

export interface UserUpdatedEvent {
  created_at: Date;

  custom: Record<string, any>;

  user: UserResponsePrivacyFields;

  type: string;

  received_at?: Date;
}

export interface VelocityFilterConfig {
  advanced_filters: boolean;

  cascading_actions: boolean;

  cids_per_user: number;

  enabled: boolean;

  first_message_only: boolean;

  rules: VelocityFilterConfigRule[];

  async?: boolean;
}

export interface VelocityFilterConfigRule {
  action: 'flag' | 'shadow' | 'remove' | 'ban';

  ban_duration: number;

  cascading_action: 'flag' | 'shadow' | 'remove' | 'ban';

  cascading_threshold: number;

  check_message_context: boolean;

  fast_spam_threshold: number;

  fast_spam_ttl: number;

  ip_ban: boolean;

  probation_period: number;

  shadow_ban: boolean;

  slow_spam_threshold: number;

  slow_spam_ttl: number;

  url_only: boolean;

  slow_spam_ban_duration?: number;
}

export interface VideoCallRuleConfig {
  flag_all_labels: boolean;

  flagged_labels: string[];

  rules: HarmConfig[];
}

export interface VideoContentParameters {
  harm_labels?: string[];
}

export interface VideoEndCallRequest {}

export interface VideoKickUserRequest {}

export interface VideoRuleParameters {
  threshold?: number;

  time_window?: string;

  harm_labels?: string[];
}

export interface VideoSettingsResponse {
  access_request_enabled: boolean;

  camera_default_on: boolean;

  camera_facing: 'front' | 'back' | 'external';

  enabled: boolean;

  target_resolution: TargetResolution;
}

export interface VoteData {
  answer_text?: string;

  option_id?: string;
}

export interface WHIPIngress {
  address: string;
}

export interface WSAuthMessage {
  token: string;

  user_details: ConnectUserDetailsRequest;

  products?: string[];
}

export type WSClientEvent =
  | ({ type: 'app.updated' } & AppUpdatedEvent)
  | ({ type: 'feeds.activity.added' } & ActivityAddedEvent)
  | ({ type: 'feeds.activity.deleted' } & ActivityDeletedEvent)
  | ({ type: 'feeds.activity.feedback' } & ActivityFeedbackEvent)
  | ({ type: 'feeds.activity.marked' } & ActivityMarkEvent)
  | ({ type: 'feeds.activity.pinned' } & ActivityPinnedEvent)
  | ({ type: 'feeds.activity.reaction.added' } & ActivityReactionAddedEvent)
  | ({ type: 'feeds.activity.reaction.deleted' } & ActivityReactionDeletedEvent)
  | ({ type: 'feeds.activity.reaction.updated' } & ActivityReactionUpdatedEvent)
  | ({
      type: 'feeds.activity.removed_from_feed';
    } & ActivityRemovedFromFeedEvent)
  | ({ type: 'feeds.activity.restored' } & ActivityRestoredEvent)
  | ({ type: 'feeds.activity.unpinned' } & ActivityUnpinnedEvent)
  | ({ type: 'feeds.activity.updated' } & ActivityUpdatedEvent)
  | ({ type: 'feeds.bookmark.added' } & BookmarkAddedEvent)
  | ({ type: 'feeds.bookmark.deleted' } & BookmarkDeletedEvent)
  | ({ type: 'feeds.bookmark.updated' } & BookmarkUpdatedEvent)
  | ({ type: 'feeds.bookmark_folder.deleted' } & BookmarkFolderDeletedEvent)
  | ({ type: 'feeds.bookmark_folder.updated' } & BookmarkFolderUpdatedEvent)
  | ({ type: 'feeds.comment.added' } & CommentAddedEvent)
  | ({ type: 'feeds.comment.deleted' } & CommentDeletedEvent)
  | ({ type: 'feeds.comment.reaction.added' } & CommentReactionAddedEvent)
  | ({ type: 'feeds.comment.reaction.deleted' } & CommentReactionDeletedEvent)
  | ({ type: 'feeds.comment.reaction.updated' } & CommentReactionUpdatedEvent)
  | ({ type: 'feeds.comment.updated' } & CommentUpdatedEvent)
  | ({ type: 'feeds.feed.created' } & FeedCreatedEvent)
  | ({ type: 'feeds.feed.deleted' } & FeedDeletedEvent)
  | ({ type: 'feeds.feed.updated' } & FeedUpdatedEvent)
  | ({ type: 'feeds.feed_group.changed' } & FeedGroupChangedEvent)
  | ({ type: 'feeds.feed_group.deleted' } & FeedGroupDeletedEvent)
  | ({ type: 'feeds.feed_member.added' } & FeedMemberAddedEvent)
  | ({ type: 'feeds.feed_member.removed' } & FeedMemberRemovedEvent)
  | ({ type: 'feeds.feed_member.updated' } & FeedMemberUpdatedEvent)
  | ({ type: 'feeds.follow.created' } & FollowCreatedEvent)
  | ({ type: 'feeds.follow.deleted' } & FollowDeletedEvent)
  | ({ type: 'feeds.follow.updated' } & FollowUpdatedEvent)
  | ({ type: 'feeds.notification_feed.updated' } & NotificationFeedUpdatedEvent)
  | ({ type: 'feeds.poll.closed' } & PollClosedFeedEvent)
  | ({ type: 'feeds.poll.deleted' } & PollDeletedFeedEvent)
  | ({ type: 'feeds.poll.updated' } & PollUpdatedFeedEvent)
  | ({ type: 'feeds.poll.vote_casted' } & PollVoteCastedFeedEvent)
  | ({ type: 'feeds.poll.vote_changed' } & PollVoteChangedFeedEvent)
  | ({ type: 'feeds.poll.vote_removed' } & PollVoteRemovedFeedEvent)
  | ({ type: 'feeds.stories_feed.updated' } & StoriesFeedUpdatedEvent)
  | ({ type: 'health.check' } & HealthCheckEvent)
  | ({ type: 'moderation.custom_action' } & ModerationCustomActionEvent)
  | ({ type: 'moderation.mark_reviewed' } & ModerationMarkReviewedEvent)
  | ({ type: 'user.updated' } & UserUpdatedEvent);

export type WSEvent =
  | ({ type: 'app.updated' } & AppUpdatedEvent)
  | ({ type: 'feeds.activity.added' } & ActivityAddedEvent)
  | ({ type: 'feeds.activity.deleted' } & ActivityDeletedEvent)
  | ({ type: 'feeds.activity.feedback' } & ActivityFeedbackEvent)
  | ({ type: 'feeds.activity.marked' } & ActivityMarkEvent)
  | ({ type: 'feeds.activity.pinned' } & ActivityPinnedEvent)
  | ({ type: 'feeds.activity.reaction.added' } & ActivityReactionAddedEvent)
  | ({ type: 'feeds.activity.reaction.deleted' } & ActivityReactionDeletedEvent)
  | ({ type: 'feeds.activity.reaction.updated' } & ActivityReactionUpdatedEvent)
  | ({
      type: 'feeds.activity.removed_from_feed';
    } & ActivityRemovedFromFeedEvent)
  | ({ type: 'feeds.activity.restored' } & ActivityRestoredEvent)
  | ({ type: 'feeds.activity.unpinned' } & ActivityUnpinnedEvent)
  | ({ type: 'feeds.activity.updated' } & ActivityUpdatedEvent)
  | ({ type: 'feeds.bookmark.added' } & BookmarkAddedEvent)
  | ({ type: 'feeds.bookmark.deleted' } & BookmarkDeletedEvent)
  | ({ type: 'feeds.bookmark.updated' } & BookmarkUpdatedEvent)
  | ({ type: 'feeds.bookmark_folder.deleted' } & BookmarkFolderDeletedEvent)
  | ({ type: 'feeds.bookmark_folder.updated' } & BookmarkFolderUpdatedEvent)
  | ({ type: 'feeds.comment.added' } & CommentAddedEvent)
  | ({ type: 'feeds.comment.deleted' } & CommentDeletedEvent)
  | ({ type: 'feeds.comment.reaction.added' } & CommentReactionAddedEvent)
  | ({ type: 'feeds.comment.reaction.deleted' } & CommentReactionDeletedEvent)
  | ({ type: 'feeds.comment.reaction.updated' } & CommentReactionUpdatedEvent)
  | ({ type: 'feeds.comment.updated' } & CommentUpdatedEvent)
  | ({ type: 'feeds.feed.created' } & FeedCreatedEvent)
  | ({ type: 'feeds.feed.deleted' } & FeedDeletedEvent)
  | ({ type: 'feeds.feed.updated' } & FeedUpdatedEvent)
  | ({ type: 'feeds.feed_group.changed' } & FeedGroupChangedEvent)
  | ({ type: 'feeds.feed_group.deleted' } & FeedGroupDeletedEvent)
  | ({ type: 'feeds.feed_member.added' } & FeedMemberAddedEvent)
  | ({ type: 'feeds.feed_member.removed' } & FeedMemberRemovedEvent)
  | ({ type: 'feeds.feed_member.updated' } & FeedMemberUpdatedEvent)
  | ({ type: 'feeds.follow.created' } & FollowCreatedEvent)
  | ({ type: 'feeds.follow.deleted' } & FollowDeletedEvent)
  | ({ type: 'feeds.follow.updated' } & FollowUpdatedEvent)
  | ({ type: 'feeds.notification_feed.updated' } & NotificationFeedUpdatedEvent)
  | ({ type: 'feeds.poll.closed' } & PollClosedFeedEvent)
  | ({ type: 'feeds.poll.deleted' } & PollDeletedFeedEvent)
  | ({ type: 'feeds.poll.updated' } & PollUpdatedFeedEvent)
  | ({ type: 'feeds.poll.vote_casted' } & PollVoteCastedFeedEvent)
  | ({ type: 'feeds.poll.vote_changed' } & PollVoteChangedFeedEvent)
  | ({ type: 'feeds.poll.vote_removed' } & PollVoteRemovedFeedEvent)
  | ({ type: 'feeds.stories_feed.updated' } & StoriesFeedUpdatedEvent)
  | ({ type: 'health.check' } & HealthCheckEvent)
  | ({ type: 'moderation.custom_action' } & ModerationCustomActionEvent)
  | ({ type: 'moderation.flagged' } & ModerationFlaggedEvent)
  | ({ type: 'moderation.mark_reviewed' } & ModerationMarkReviewedEvent)
  | ({ type: 'user.banned' } & UserBannedEvent)
  | ({ type: 'user.deactivated' } & UserDeactivatedEvent)
  | ({ type: 'user.muted' } & UserMutedEvent)
  | ({ type: 'user.reactivated' } & UserReactivatedEvent)
  | ({ type: 'user.updated' } & UserUpdatedEvent);

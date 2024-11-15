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

export interface AWSRekognitionConfig {
  enabled: boolean;

  rules: AWSRekognitionRule[];

  async?: boolean;
}

export interface AWSRekognitionRule {
  action: 'flag' | 'shadow' | 'remove';

  label: string;

  min_confidence: number;
}

export interface Action {
  name: string;

  text: string;

  type: string;

  style?: string;

  value?: string;
}

export interface ActionLog {
  created_at: Date;

  id: string;

  reason: string;

  reporter_type: string;

  review_queue_item_id: string;

  target_user_id: string;

  type: string;

  custom: Record<string, any>;

  review_queue_item?: ReviewQueueItem;

  target_user?: User;

  user?: User;
}

export interface ActionLogResponse {
  created_at: Date;

  id: string;

  reason: string;

  target_user_id: string;

  type: string;

  user_id: string;

  custom: Record<string, any>;

  review_queue_item?: ReviewQueueItem;

  target_user?: UserResponse;

  user?: UserResponse;
}

export interface AppResponseFields {
  async_url_enrich_enabled: boolean;

  auto_translation_enabled: boolean;

  moderation_enabled: boolean;

  name: string;

  video_provider: string;

  file_upload_config: FileUploadConfig;

  image_upload_config: FileUploadConfig;
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

  latitude?: number;

  longitude?: number;

  og_scrape_url?: string;

  original_height?: number;

  original_width?: number;

  pretext?: string;

  stopped_sharing?: boolean;

  text?: string;

  thumb_url?: string;

  title?: string;

  title_link?: string;

  type?: string;

  actions?: Action[];

  fields?: Field[];

  giphy?: Images;
}

export interface AutomodPlatformCircumventionConfig {
  enabled: boolean;

  rules: AutomodRule[];

  async?: boolean;
}

export interface AutomodRule {
  action: 'flag' | 'shadow' | 'remove';

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

  ip_ban?: boolean;

  reason?: string;

  shadow?: boolean;

  timeout?: number;
}

export interface BanRequest {
  target_user_id: string;

  banned_by_id?: string;

  channel_cid?: string;

  ip_ban?: boolean;

  reason?: string;

  shadow?: boolean;

  timeout?: number;

  banned_by?: UserRequest;
}

export interface BanResponse {
  duration: string;
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

export interface BlockListRule {
  action: 'flag' | 'shadow' | 'remove';

  name: string;
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

export interface BodyguardConfig {
  enabled: boolean;

  profile: string;

  rules: BodyguardRule[];

  severity_rules: BodyguardSeverityRule[];

  async?: boolean;
}

export interface BodyguardRule {
  action: 'flag' | 'shadow' | 'remove';

  label: string;

  severity_rules: BodyguardSeverityRule[];
}

export interface BodyguardSeverityRule {
  action: 'flag' | 'shadow' | 'remove';

  severity: 'low' | 'medium' | 'high' | 'critical';
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

  last_message_at?: Date;

  member_count?: number;

  team?: string;

  invites?: ChannelMember[];

  members?: ChannelMember[];

  config?: ChannelConfig;

  config_overrides?: ConfigOverrides;

  created_by?: User;

  truncated_by?: User;
}

export interface ChannelConfig {
  automod: 'disabled' | 'simple' | 'AI';

  automod_behavior: 'flag' | 'block' | 'shadow_block';

  connect_events: boolean;

  created_at: Date;

  custom_events: boolean;

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

  skip_last_msg_update_for_system_msgs: boolean;

  typing_events: boolean;

  updated_at: Date;

  uploads: boolean;

  url_enrichment: boolean;

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

  created_at: Date;

  custom_events: boolean;

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

  skip_last_msg_update_for_system_msgs: boolean;

  typing_events: boolean;

  updated_at: Date;

  uploads: boolean;

  url_enrichment: boolean;

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
  CREATE_CALL: 'create-call',
  DELETE_ANY_MESSAGE: 'delete-any-message',
  DELETE_CHANNEL: 'delete-channel',
  DELETE_OWN_MESSAGE: 'delete-own-message',
  FLAG_MESSAGE: 'flag-message',
  FREEZE_CHANNEL: 'freeze-channel',
  JOIN_CALL: 'join-call',
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
  SEND_TYPING_EVENTS: 'send-typing-events',
  SET_CHANNEL_COOLDOWN: 'set-channel-cooldown',
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

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ChannelOwnCapability =
  (typeof ChannelOwnCapability)[keyof typeof ChannelOwnCapability];

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

  mute_expires_at?: Date;

  muted?: boolean;

  team?: string;

  truncated_at?: Date;

  members?: ChannelMember[];

  own_capabilities?: ChannelOwnCapability[];

  config?: ChannelConfigWithInfo;

  created_by?: UserResponse;

  truncated_by?: UserResponse;
}

export interface Command {
  args: string;

  description: string;

  name: string;

  set: string;

  created_at?: Date;

  updated_at?: Date;
}

export interface ConfigOverrides {
  commands: string[];

  grants: Record<string, string[]>;

  blocklist?: string;

  blocklist_behavior?: 'flag' | 'block';

  max_message_length?: number;

  quotes?: boolean;

  reactions?: boolean;

  replies?: boolean;

  typing_events?: boolean;

  uploads?: boolean;

  url_enrichment?: boolean;
}

export interface ConfigResponse {
  async: boolean;

  created_at: Date;

  key: string;

  updated_at: Date;

  automod_platform_circumvention_config?: AutomodPlatformCircumventionConfig;

  automod_semantic_filters_config?: AutomodSemanticFiltersConfig;

  automod_toxicity_config?: AutomodToxicityConfig;

  aws_rekognition_config?: AWSRekognitionConfig;

  block_list_config?: BlockListConfig;

  bodyguard_config?: BodyguardConfig;

  google_vision_config?: GoogleVisionConfig;

  velocity_filter_config?: VelocityFilterConfig;
}

export interface ConnectUserDetailsRequest {
  id: string;

  image?: string;

  invisible?: boolean;

  language?: string;

  name?: string;

  custom?: Record<string, any>;

  privacy_settings?: PrivacySettingsResponse;

  push_notifications?: PushNotificationSettingsInput;
}

export interface CreateDeviceRequest {
  id: string;

  push_provider: 'firebase' | 'apn' | 'huawei' | 'xiaomi';

  push_provider_name?: string;

  voip_token?: boolean;
}

export interface CreateGuestRequest {
  user: UserRequest;
}

export interface CreateGuestResponse {
  access_token: string;

  duration: string;

  user: UserResponse;
}

export interface CustomActionRequest {
  id?: string;

  options?: Record<string, any>;
}

export interface Data {
  id: string;
}

export interface DeleteActivityRequest {
  hard_delete?: boolean;
}

export interface DeleteMessageRequest {
  hard_delete?: boolean;
}

export interface DeleteReactionRequest {
  hard_delete?: boolean;
}

export interface DeleteUserRequest {
  delete_conversation_channels?: boolean;

  delete_feeds_content?: boolean;

  hard_delete?: boolean;

  mark_messages_deleted?: boolean;
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

export interface EnrichedActivity {
  foreign_id?: string;

  id?: string;

  score?: number;

  verb?: string;

  to?: string[];

  actor?: Data;

  latest_reactions?: Record<string, Array<EnrichedReaction | null>>;

  object?: Data;

  origin?: Data;

  own_reactions?: Record<string, Array<EnrichedReaction | null>>;

  reaction_counts?: Record<string, number>;

  target?: Data;
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

  latest_children?: Record<string, Array<EnrichedReaction | null>>;

  own_children?: Record<string, Array<EnrichedReaction | null>>;

  updated_at?: Time;

  user?: Data;
}

export interface EntityCreator {
  ban_count: number;

  banned: boolean;

  deleted_content_count: number;

  id: string;

  online: boolean;

  role: string;

  custom: Record<string, any>;

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

  push_notifications?: PushNotificationSettings;
}

export interface EntityCreatorResponse {
  ban_count: number;

  banned: boolean;

  created_at: Date;

  deleted_content_count: number;

  id: string;

  language: string;

  online: boolean;

  role: string;

  updated_at: Date;

  blocked_user_ids: string[];

  teams: string[];

  custom: Record<string, any>;

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;
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

export interface Flag2 {
  created_at: Date;

  entity_id: string;

  entity_type: string;

  updated_at: Date;

  result: Array<Record<string, any>>;

  entity_creator_id?: string;

  moderation_payload_hash?: string;

  reason?: string;

  review_queue_item_id?: string;

  type?: string;

  labels?: string[];

  custom?: Record<string, any>;

  moderation_payload?: ModerationPayload;

  user?: User;
}

export interface Flag2Response {
  created_at: Date;

  entity_id: string;

  entity_type: string;

  updated_at: Date;

  user_id: string;

  result: Array<Record<string, any>>;

  entity_creator_id?: string;

  reason?: string;

  review_queue_item_id?: string;

  type?: string;

  labels?: string[];

  custom?: Record<string, any>;

  moderation_payload?: ModerationPayload;

  user?: UserResponse;
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

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  latest_hidden_channels?: string[];

  privacy_settings?: PrivacySettingsResponse;

  push_notifications?: PushNotificationSettingsResponse;
}

export interface GetApplicationResponse {
  duration: string;

  app: AppResponseFields;
}

export interface GetBlockedUsersResponse {
  duration: string;

  blocks: BlockedUserResponse[];
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

  latitude?: number;

  longitude?: number;

  og_scrape_url?: string;

  original_height?: number;

  original_width?: number;

  pretext?: string;

  stopped_sharing?: boolean;

  text?: string;

  thumb_url?: string;

  title?: string;

  title_link?: string;

  type?: string;

  actions?: Action[];

  fields?: Field[];

  giphy?: Images;
}

export interface GoogleVisionConfig {
  enabled: boolean;
}

export interface ImageData {
  frames: string;

  height: string;

  size: string;

  url: string;

  width: string;
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

export interface LabelThresholds {
  block?: number;

  flag?: number;
}

export interface ListDevicesResponse {
  duration: string;

  devices: DeviceResponse[];
}

export interface MarkReviewedRequest {
  content_to_mark_as_reviewed_limit?: number;

  disable_marking_content_as_reviewed?: boolean;
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

  custom: Record<string, any>;

  reaction_counts: Record<string, number>;

  reaction_groups: Record<string, ReactionGroupResponse>;

  reaction_scores: Record<string, number>;

  before_message_send_failed?: boolean;

  command?: string;

  deleted_at?: Date;

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

  pinned_by?: User;

  poll?: Poll;

  quoted_message?: Message;

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

  custom: Record<string, any>;

  reaction_counts: Record<string, number>;

  reaction_scores: Record<string, number>;

  user: UserResponse;

  command?: string;

  deleted_at?: Date;

  message_text_updated_at?: Date;

  mml?: string;

  parent_id?: string;

  pin_expires?: Date;

  pinned_at?: Date;

  poll_id?: string;

  quoted_message_id?: string;

  show_in_channel?: boolean;

  thread_participants?: UserResponse[];

  i18n?: Record<string, string>;

  image_labels?: Record<string, string[]>;

  pinned_by?: UserResponse;

  poll?: PollResponseData;

  quoted_message?: MessageResponse;

  reaction_groups?: Record<string, ReactionGroupResponse>;
}

export interface ModerationActionConfig {
  action: string;

  description: string;

  entity_type: string;

  icon: string;

  order: number;

  custom: Record<string, any>;
}

export interface ModerationEvent {
  created_at: Date;

  type: string;

  received_at?: Date;

  flags?: Flag2Response[];

  action?: ActionLogResponse;

  review_queue_item?: ReviewQueueItemResponse;
}

export interface ModerationPayload {
  images?: string[];

  texts?: string[];

  videos?: string[];

  custom?: Record<string, any>;
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

export interface NullBool {
  has_value?: boolean;

  value?: boolean;
}

export interface NullTime {
  has_value?: boolean;

  value?: Date;
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

  deactivated_at?: Date;

  deleted_at?: Date;

  invisible?: boolean;

  last_active?: Date;

  last_engaged_at?: Date;

  blocked_user_ids?: string[];

  latest_hidden_channels?: string[];

  teams?: string[];

  privacy_settings?: PrivacySettings;

  push_notifications?: PushNotificationSettings;
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

  latest_votes_by_option: Record<string, Array<PollVote | null>>;

  vote_counts_by_option: Record<string, number>;

  is_closed?: boolean;

  max_votes_allowed?: number;

  voting_visibility?: string;

  created_by?: User;
}

export interface PollOption {
  id: string;

  text: string;

  custom: Record<string, any>;
}

export interface PollOptionResponseData {
  id: string;

  text: string;

  custom: Record<string, any>;
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

  latest_votes_by_option: Record<string, Array<PollVoteResponseData | null>>;

  vote_counts_by_option: Record<string, number>;

  is_closed?: boolean;

  max_votes_allowed?: number;

  created_by?: UserResponse;
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

export interface PrivacySettings {
  read_receipts?: ReadReceipts;

  typing_indicators?: TypingIndicators;
}

export interface PrivacySettingsResponse {
  read_receipts?: ReadReceiptsResponse;

  typing_indicators?: TypingIndicatorsResponse;
}

export interface PushNotificationSettings {
  disabled?: boolean;

  disabled_until?: Date;
}

export interface PushNotificationSettingsInput {
  disabled?: NullBool;

  disabled_until?: NullTime;
}

export interface PushNotificationSettingsResponse {
  disabled?: boolean;

  disabled_until?: Date;
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

  action_config: Record<string, Array<ModerationActionConfig | null>>;

  stats: Record<string, number>;

  next?: string;

  prev?: string;
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

export interface Reaction {
  created_at: Date;

  message_id: string;

  score: number;

  type: string;

  updated_at: Date;

  custom: Record<string, any>;

  user_id?: string;

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

export interface ReadReceipts {
  enabled: boolean;
}

export interface ReadReceiptsResponse {
  enabled: boolean;
}

export interface Response {
  duration: string;
}

export interface RestoreActionRequest {}

export interface ReviewQueueItem {
  content_changed: boolean;

  created_at: Date;

  entity_id: string;

  entity_type: string;

  has_image: boolean;

  has_text: boolean;

  has_video: boolean;

  id: string;

  moderation_payload_hash: string;

  recommended_action: string;

  reviewed_by: string;

  severity: number;

  status: string;

  updated_at: Date;

  actions: ActionLog[];

  bans: Ban[];

  flags: Flag2[];

  languages: string[];

  completed_at: NullTime;

  reviewed_at: NullTime;

  assigned_to?: User;

  entity_creator?: EntityCreator;

  feeds_v2_activity?: EnrichedActivity;

  feeds_v2_reaction?: Reaction;

  message?: Message;

  moderation_payload?: ModerationPayload;
}

export interface ReviewQueueItemResponse {
  created_at: Date;

  entity_id: string;

  entity_type: string;

  id: string;

  recommended_action: string;

  reviewed_by: string;

  severity: number;

  status: string;

  updated_at: Date;

  actions: ActionLogResponse[];

  bans: Ban[];

  flags: Flag2Response[];

  languages: string[];

  completed_at?: Date;

  entity_creator_id?: string;

  reviewed_at?: Date;

  assigned_to?: UserResponse;

  entity_creator?: EntityCreatorResponse;

  feeds_v2_activity?: EnrichedActivity;

  feeds_v2_reaction?: Reaction;

  message?: MessageResponse;

  moderation_payload?: ModerationPayload;
}

export interface SortParamRequest {
  direction?: number;

  field?: string;
}

export interface SubmitActionRequest {
  action_type:
    | 'mark_reviewed'
    | 'delete_message'
    | 'delete_activity'
    | 'delete_reaction'
    | 'ban'
    | 'custom'
    | 'unban'
    | 'restore'
    | 'delete_user'
    | 'unblock';

  item_id: string;

  ban?: BanActionRequest;

  custom?: CustomActionRequest;

  delete_activity?: DeleteActivityRequest;

  delete_message?: DeleteMessageRequest;

  delete_reaction?: DeleteReactionRequest;

  delete_user?: DeleteUserRequest;

  mark_reviewed?: MarkReviewedRequest;

  unban?: UnbanActionRequest;
}

export interface SubmitActionResponse {
  duration: string;

  item?: ReviewQueueItem;
}

export interface Thresholds {
  explicit?: LabelThresholds;

  spam?: LabelThresholds;

  toxic?: LabelThresholds;
}

export interface Time {}

export interface TypingIndicators {
  enabled: boolean;
}

export interface TypingIndicatorsResponse {
  enabled: boolean;
}

export interface UnbanActionRequest {}

export interface UnblockActionRequest {}

export interface UnblockUsersRequest {
  blocked_user_id: string;
}

export interface UnblockUsersResponse {
  duration: string;
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

export interface User {
  banned: boolean;

  id: string;

  online: boolean;

  role: string;

  custom: Record<string, any>;

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

  push_notifications?: PushNotificationSettings;
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

export interface UserRequest {
  id: string;

  image?: string;

  invisible?: boolean;

  language?: string;

  name?: string;

  custom?: Record<string, any>;

  privacy_settings?: PrivacySettingsResponse;

  push_notifications?: PushNotificationSettingsInput;
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

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;
}

export interface VelocityFilterConfig {
  cascading_actions: boolean;

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

  shadow_ban: boolean;

  slow_spam_threshold: number;

  slow_spam_ttl: number;

  slow_spam_ban_duration?: number;
}

export interface WSAuthMessage {
  token: string;

  user_details: ConnectUserDetailsRequest;

  products?: string[];
}

export interface WebhookEvent {
  type: string;
}

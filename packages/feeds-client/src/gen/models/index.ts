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

export interface Action {
  name: string;

  text: string;

  type: string;

  style?: string;

  value?: string;
}

export interface ActionableFollowRequests {
  invites: FeedFollowRequest[];

  pending: FeedFollowRequest[];
}

export interface Activity {
  created_at: Date;

  id: string;

  object: string;

  origin: string;

  public: boolean;

  updated_at: Date;

  verb: string;

  latest_reactions: Reaction[];

  own_reactions: Reaction[];

  reaction_groups: Record<string, ReactionGroupResponse>;

  user: UserResponse;

  to_targets?: string[];

  custom?: Record<string, any>;
}

export interface ActivityAddedEvent {
  created_at: Date;

  fid: string;

  activity: Activity;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;
}

export interface ActivityReactionDeletedEvent {
  created_at: Date;

  fid: string;

  activity: Activity;

  custom: Record<string, any>;

  reaction: Reaction;

  type: string;

  received_at?: Date;
}

export interface ActivityReactionNewEvent {
  created_at: Date;

  fid: string;

  activity: Activity;

  custom: Record<string, any>;

  reaction: Reaction;

  type: string;

  received_at?: Date;
}

export interface ActivityReactionUpdatedEvent {
  created_at: Date;

  fid: string;

  activity: Activity;

  custom: Record<string, any>;

  reaction: Reaction;

  type: string;

  received_at?: Date;
}

export interface ActivityRemovedEvent {
  created_at: Date;

  fid: string;

  activity: Activity;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;
}

export interface ActivityUpdatedEvent {
  created_at: Date;

  fid: string;

  activity: Activity;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;
}

export interface AddActivityRequest {
  object: string;

  verb: string;

  public?: boolean;

  to_targets?: string[];

  custom?: Record<string, any>;
}

export interface AddActivityResponse {
  duration: string;

  activity: Activity;
}

export interface AddReactionToActivityRequest {
  type: string;

  created_at?: Date;

  enforce_unique?: boolean;

  score?: number;

  updated_at?: Date;

  custom?: Record<string, any>;
}

export interface AddReactionToActivityResponse {
  duration: string;

  activity: Activity;

  reaction: Reaction;
}

export interface AggregatedActivities {
  activity_count: number;

  actor_count: number;

  created_at: Date;

  group: string;

  id: string;

  read: boolean;

  seen: boolean;

  updated_at: Date;

  activities: Activity[];
}

export interface AppResponseFields {
  async_url_enrich_enabled: boolean;

  auto_translation_enabled: boolean;

  moderation_enabled: boolean;

  name: string;

  file_upload_config: FileUploadConfig;

  image_upload_config: FileUploadConfig;
}

export interface BlockListOptions {
  behavior: 'flag' | 'block' | 'shadow_block';

  blocklist: string;
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
  DELETE_ANY_MESSAGE: 'delete-any-message',
  DELETE_CHANNEL: 'delete-channel',
  DELETE_OWN_MESSAGE: 'delete-own-message',
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

export interface DeleteFeedGroupResponse {
  duration: string;
}

export interface DeleteFeedResponse {
  duration: string;

  feed: Feed;
}

export interface DeleteReactionFromActivityResponse {
  duration: string;

  activity: Activity;

  reaction: Reaction;
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

export interface Feed {
  created_at: Date;

  follower_count: number;

  following_count: number;

  group: string;

  id: string;

  type: 'flat' | 'notification';

  updated_at: Date;

  visibility_level: 'public' | 'visible' | 'followers' | 'private';

  invites: FeedMember[];

  members: FeedMember[];

  created_by: UserResponse;

  follow_requests: ActionableFollowRequests;

  deleted_at?: Date;

  custom?: Record<string, any>;
}

export interface FeedFollowRequest {
  created_at: Date;

  source_fid: string;

  source_user_id: string;

  status:
    | 'invited'
    | 'pending'
    | 'accepted'
    | 'accepted_invite'
    | 'rejected'
    | 'revoked'
    | 'rejected_invite'
    | 'cancelled';

  target_fid: string;

  updated_at: Date;

  source_user: UserResponse;
}

export interface FeedGroupInput {
  app_pk: number;

  slug: string;

  type: 'flat' | 'notification';

  aggregation_format?: string;

  fanout_discard_rule?: number;

  fanout_strategy?: number;

  jnf_fallback_init?: boolean;

  max_length?: number;

  origin_tracking_enabled?: boolean;

  prefix?: string;

  private?: boolean;

  realtime_transport?: number;

  realtime_transports?: string;

  shard_id?: string;

  sqs_key?: string;

  sqs_queue_name?: string;

  sqs_region?: string;

  sqs_secret?: string;

  sqs_url?: string;

  timeline_version?: number;

  ttl?: number;

  use_flat_realtime_updates?: boolean;

  use_group_index_for_reads?: boolean;

  use_journaled_class?: boolean;

  use_normalized_storage?: boolean;

  view_version?: number;

  webhook_url?: string;
}

export interface FeedGroupResponse {
  aggregation_format: string;

  app_pk: number;

  created_at: Date;

  id: number;

  jnf_fallback_init: boolean;

  max_length: number;

  origin_tracking_enabled: boolean;

  prefix: string;

  private: boolean;

  realtime_transport: number;

  realtime_transports: string;

  shard_id: string;

  slug: string;

  sqs_key: string;

  sqs_queue_name: string;

  sqs_region: string;

  sqs_secret: string;

  sqs_url: string;

  type: 'flat' | 'notification';

  updated_at: Date;

  use_flat_realtime_updates: boolean;

  use_group_index_for_reads: boolean;

  use_journaled_class: boolean;

  use_normalized_storage: boolean;

  webhook_url: string;

  deleted_at?: Date;

  fanout_discard_rule?: number;

  fanout_strategy?: number;

  timeline_version?: number;

  ttl?: number;

  view_version?: number;
}

export interface FeedMember {
  user_id: string;

  ban_expires_at?: Date;

  ban_reason?: string;

  banned?: boolean;

  created_at?: Date;

  invite_accepted_at?: Date;

  invite_rejected_at?: Date;

  invited?: boolean;

  role?: string;

  shadow_banned?: boolean;

  status?: string;

  updated_at?: Date;

  custom?: Record<string, any>;

  user?: UserResponse;
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

export interface FollowEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  source_feed: Feed;

  target_feed: Feed;

  type: string;

  received_at?: Date;
}

export interface FollowRelationship {
  created_at: Date;

  updated_at: Date;

  feed: Feed;
}

export interface FollowRequest {
  target_group: string;

  target_id: string;

  activity_copy_limit?: number;
}

export interface FollowRequestEvent {
  created_at: Date;

  fid: string;

  status: string;

  custom: Record<string, any>;

  source_feed: Feed;

  target_feed: Feed;

  type: string;

  received_at?: Date;
}

export interface FollowResponse {
  created: boolean;

  duration: string;

  follow_request_status?:
    | 'invited'
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'revoked';
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

export interface GetFeedGroupsResponse {
  duration: string;

  feed_groups: Record<string, FeedGroupResponse>;
}

export interface GetFeedResponse {
  duration: string;

  feed: Feed;
}

export interface GetFollowedFeedsResponse {
  duration: string;

  followed_feeds: FollowRelationship[];
}

export interface GetFollowingFeedsResponse {
  duration: string;

  followers: FollowRelationship[];
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

export interface GetOrCreateFeedRequest {
  visibility_level?: 'public' | 'visible' | 'followers' | 'private';

  watch?: boolean;

  invites?: FeedMember[];

  members?: FeedMember[];

  custom?: Record<string, any>;
}

export interface GetOrCreateFeedResponse {
  duration: string;

  feed: Feed;
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

export interface MemberRequest {
  user_id: string;

  role?: string;

  custom?: Record<string, any>;
}

export interface MemberResponse {
  created_at: Date;

  updated_at: Date;

  user_id: string;

  user: UserResponse;

  deleted_at?: Date;

  role?: string;

  custom?: Record<string, any>;
}

export interface NullBool {
  has_value?: boolean;

  value?: boolean;
}

export interface NullTime {
  has_value?: boolean;

  value?: Date;
}

export interface PrivacySettingsResponse {
  read_receipts?: ReadReceiptsResponse;

  typing_indicators?: TypingIndicatorsResponse;
}

export interface PushNotificationSettingsInput {
  disabled?: NullBool;

  disabled_until?: NullTime;
}

export interface PushNotificationSettingsResponse {
  disabled?: boolean;

  disabled_until?: Date;
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

  activities: Activity[];

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

  feeds: Feed[];

  next?: string;

  prev?: string;
}

export interface QueryFollowRequestsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryFollowRequestsResponse {
  duration: string;

  follow_requests: FeedFollowRequest[];

  next?: string;

  prev?: string;
}

export interface QueryReactionsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryReactionsResponse {
  duration: string;

  reactions: Reaction[];

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

  entity_id: string;

  entity_type: string;

  score: number;

  type: string;

  updated_at: Date;

  user_id: string;

  custom: Record<string, any>;

  user: UserResponse;
}

export interface ReactionGroupResponse {
  count: number;

  first_reaction_at: Date;

  last_reaction_at: Date;

  sum_scores: number;
}

export interface ReadFlatFeedResponse {
  duration: string;

  activities: Activity[];
}

export interface ReadNotificationFeedResponse {
  duration: string;

  unread: number;

  unseen: number;

  groups: AggregatedActivities[];
}

export interface ReadReceiptsResponse {
  enabled: boolean;
}

export interface RemoveActivityFromFeedResponse {
  duration: string;
}

export interface Response {
  duration: string;
}

export interface SortParamRequest {
  direction?: number;

  field?: string;
}

export interface Thresholds {
  explicit?: LabelThresholds;

  spam?: LabelThresholds;

  toxic?: LabelThresholds;
}

export interface TypingIndicatorsResponse {
  enabled: boolean;
}

export interface UnblockUsersRequest {
  blocked_user_id: string;
}

export interface UnblockUsersResponse {
  duration: string;
}

export interface UnfollowEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  source_feed: Feed;

  target_feed: Feed;

  type: string;

  received_at?: Date;
}

export interface UnfollowRequest {
  target_group: string;

  target_id: string;

  keep_history?: boolean;
}

export interface UnfollowResponse {
  duration: string;

  unfollowed: boolean;
}

export interface UpdateActivityRequest {
  object?: string;

  verb?: string;

  add_to_targets?: string[];

  remove_to_targets?: string[];

  replace_to_targets?: string[];

  custom?: Record<string, any>;
}

export interface UpdateActivityResponse {
  duration: string;

  activity: Activity;
}

export interface UpdateFeedMembersRequest {
  remove_members?: string[];

  update_members?: MemberRequest[];
}

export interface UpdateFeedMembersResponse {
  duration: string;

  members: MemberResponse[];
}

export interface UpdateFeedRequest {
  accept_invite?: boolean;

  max_activity_copy_limit_for_invites?: number;

  reject_invite?: boolean;

  accepted_follow_requests?: string[];

  add_members?: FeedMember[];

  assign_roles?: FeedMember[];

  cancelled_pending_follow_requests?: string[];

  invited_follow_requests?: string[];

  invites?: FeedMember[];

  rejected_follow_requests?: string[];

  rejected_invite_follow_requests?: string[];

  remove_members?: string[];

  revoked_follow_requests?: string[];

  custom?: Record<string, any>;
}

export interface UpdateFeedResponse {
  duration: string;

  feed: Feed;
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

export interface UpsertFeedGroupRequest {
  feed_group: FeedGroupInput;
}

export interface UpsertFeedGroupResponse {
  duration: string;

  feed_group?: FeedGroupResponse;
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

export interface WSAuthMessage {
  token: string;

  user_details: ConnectUserDetailsRequest;

  products?: string[];
}

export type WSEvent =
  | ({ type: 'feeds.activity_added' } & ActivityAddedEvent)
  | ({ type: 'feeds.activity_reaction_deleted' } & ActivityReactionDeletedEvent)
  | ({ type: 'feeds.activity_reaction_new' } & ActivityReactionNewEvent)
  | ({ type: 'feeds.activity_reaction_updated' } & ActivityReactionUpdatedEvent)
  | ({ type: 'feeds.activity_removed' } & ActivityRemovedEvent)
  | ({ type: 'feeds.activity_updated' } & ActivityUpdatedEvent)
  | ({ type: 'feeds.follow' } & FollowEvent)
  | ({ type: 'feeds.follow_request_created' } & FollowRequestEvent)
  | ({ type: 'feeds.follow_request_updated' } & FollowRequestEvent)
  | ({ type: 'feeds.unfollow' } & UnfollowEvent);

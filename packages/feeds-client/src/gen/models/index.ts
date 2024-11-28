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

export interface Activity {
  created_at: Date;

  id: string;

  object: string;

  origin: string;

  public: boolean;

  updated_at: Date;

  verb: string;

  user: UserResponse;

  to_targets?: string[];

  custom?: Record<string, any>;
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

export interface DeleteFeedGroupResponse {
  duration: string;
}

export interface DeleteFeedResponse {
  duration: string;

  feed: Feed;
}

export interface Feed {
  created_at: Date;

  follower_count: number;

  following_count: number;

  group: string;

  id: string;

  type: string;

  updated_at: Date;

  visibility_level: string;

  invites: FeedMember[];

  members: FeedMember[];

  created_by: UserResponse;

  deleted_at?: Date;

  custom?: Record<string, any>;
}

export interface FeedGroupInput {
  app_pk: number;

  slug: string;

  type: string;

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

  type: string;

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

export interface FollowRequest {
  target_group: string;

  target_id: string;

  activity_copy_limit?: number;
}

export interface FollowResponse {
  created: boolean;

  duration: string;
}

export interface GetFeedGroupsResponse {
  duration: string;

  feed_groups: Record<string, FeedGroupResponse>;
}

export interface GetFeedResponse {
  duration: string;

  feed: Feed;
}

export interface GetOrCreateFeedRequest {
  visibility_level?:
    | 'public'
    | 'visible'
    | 'followers'
    | 'private'
    | 'restricted';

  invites?: FeedMember[];

  members?: FeedMember[];

  custom?: Record<string, any>;
}

export interface GetOrCreateFeedResponse {
  duration: string;

  feed: Feed;
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

  sort?: SortParamRequest[];

  filter?: Record<string, any>;
}

export interface QueryFeedsResponse {
  duration: string;

  feeds: Feed[];

  next?: string;

  prev?: string;
}

export interface ReactionResponse {
  activity_id: string;

  created_at: Date;

  score: number;

  type: string;

  updated_at: Date;

  user_id: string;

  custom: Record<string, any>;

  user: UserResponse;
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

export interface RemoveActivityFromFeedResponse {
  duration: string;
}

export interface SendReactionRequest {
  type: string;

  created_at?: Date;

  enforce_unique?: boolean;

  score?: number;

  updated_at?: Date;

  custom?: Record<string, any>;
}

export interface SendReactionResponse {
  duration: string;

  reaction: ReactionResponse;
}

export interface SortParamRequest {
  direction?: number;

  field?: string;
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

  reject_invite?: boolean;

  add_members?: FeedMember[];

  assign_roles?: FeedMember[];

  invites?: FeedMember[];

  remove_members?: string[];

  custom?: Record<string, any>;
}

export interface UpdateFeedResponse {
  duration: string;

  feed: Feed;
}

export interface UpsertFeedGroupRequest {
  feed_group: FeedGroupInput;
}

export interface UpsertFeedGroupResponse {
  duration: string;

  feed_group?: FeedGroupResponse;
}

export interface UserResponse {
  banned?: boolean;

  created_at?: Date;

  deactivated_at?: Date;

  deleted_at?: Date;

  id?: string;

  image?: string;

  language?: string;

  last_active?: Date;

  name?: string;

  online?: boolean;

  revoke_tokens_issued_before?: Date;

  role?: string;

  updated_at?: Date;

  blocked_user_ids?: string[];

  teams?: string[];

  custom?: Record<string, any>;
}

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

export interface AcceptFeedMemberRequest {
  user_id: string;
}

export interface AcceptFeedMemberResponse {
  duration: string;

  feed_member: FeedMemberResponse;
}

export interface AcceptFollowRequest {
  source_fid: string;

  target_fid: string;
}

export interface AcceptFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface ActivityAddedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityAnalyserConfig {}

export interface ActivityDeletedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityLocation {
  lat: number;

  lng: number;
}

export interface ActivityPinResponse {
  activity_id: string;

  created_at: Date;

  feed: string;

  updated_at: Date;

  user: UserResponse;
}

export interface ActivityReactionAddedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  reaction: ActivityReactionResponse;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityReactionDeletedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  reaction: ActivityReactionResponse;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityReactionResponse {
  activity_id: string;

  created_at: Date;

  type: string;

  updated_at: Date;

  user: UserResponse;

  custom?: Record<string, any>;
}

export interface ActivityRemovedFromFeedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityRequest {
  type: string;

  fids: string[];

  expires_at?: string;

  id?: string;

  parent_id?: string;

  text?: string;

  visibility?: 'public' | 'private' | 'tag';

  visibility_tag?: string;

  attachments?: Attachment[];

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

  id: string;

  popularity: number;

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

  latest_reactions: ActivityReactionResponse[];

  mentioned_users: UserResponse[];

  own_bookmarks: BookmarkResponse[];

  own_reactions: ActivityReactionResponse[];

  custom: Record<string, any>;

  reaction_groups: Record<string, ReactionGroupResponse>;

  search_data: Record<string, any>;

  user: UserResponse;

  deleted_at?: Date;

  edited_at?: Date;

  expires_at?: Date;

  text?: string;

  visibility_tag?: string;

  current_feed?: FeedResponse;

  location?: ActivityLocation;

  parent?: BaseActivityResponse;
}

export interface ActivitySelectorConfig {
  cutoff_time: Date;

  min_popularity?: number;

  tag_filter_type?: string;

  type?: string;

  tags?: string[];
}

export interface ActivityUpdatedEvent {
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface AddActivityRequest {
  type: string;

  fids: string[];

  expires_at?: string;

  id?: string;

  parent_id?: string;

  text?: string;

  visibility?: 'public' | 'private' | 'tag';

  visibility_tag?: string;

  attachments?: Attachment[];

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

  custom?: Record<string, any>;
}

export interface AddCommentReactionResponse {
  comment_id: string;

  duration: string;

  reaction: ActivityReactionResponse;
}

export interface AddCommentRequest {
  comment: string;

  object_id: string;

  object_type: string;

  parent_id?: string;

  attachment?: Attachment[];

  mentioned_user_ids?: string[];

  custom?: Record<string, any>;
}

export interface AddCommentResponse {
  duration: string;

  comment: CommentResponse;
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

  custom?: Record<string, any>;
}

export interface AddReactionResponse {
  duration: string;

  reaction: ActivityReactionResponse;
}

export interface AggregatedActivityResponse {
  activity_count: number;

  created_at: Date;

  group: string;

  score: number;

  updated_at: Date;

  user_count: number;

  activities: ActivityResponse[];
}

export interface AggregationConfig {
  format?: string;
}

export interface Attachment {
  type: string;

  url: string;

  asset_url?: string;

  image_url?: string;

  live_call_cid?: string;

  custom?: Record<string, any>;
}

export interface BaseActivityResponse {
  bookmark_count: number;

  comment_count: number;

  created_at: Date;

  id: string;

  popularity: number;

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

  latest_reactions: ActivityReactionResponse[];

  mentioned_users: UserResponse[];

  own_bookmarks: BookmarkResponse[];

  own_reactions: ActivityReactionResponse[];

  custom: Record<string, any>;

  reaction_groups: Record<string, ReactionGroupResponse>;

  search_data: Record<string, any>;

  user: UserResponse;

  deleted_at?: Date;

  edited_at?: Date;

  expires_at?: Date;

  text?: string;

  visibility_tag?: string;

  current_feed?: FeedResponse;

  location?: ActivityLocation;

  moderation?: Moderation;
}

export interface BookmarkAddedEvent {
  activity_id: string;

  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkDeletedEvent {
  created_at: Date;

  fid: string;

  bookmark: BookmarkResponse;

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

  custom?: Record<string, any>;
}

export interface BookmarkResponse {
  activity_id: string;

  created_at: Date;

  updated_at: Date;

  folder: BookmarkFolderResponse;

  user: UserResponse;

  custom?: Record<string, any>;
}

export interface BookmarkUpdatedEvent {
  created_at: Date;

  fid: string;

  bookmark: BookmarkResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentAddedEvent {
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentDeletedEvent {
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentReactionAddedEvent {
  comment_id: string;

  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  reaction: ActivityReactionResponse;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentReactionRemovedEvent {
  comment_id: string;

  created_at: Date;

  fid: string;

  user_id: string;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;
}

export interface CommentResponse {
  created_at: Date;

  id: string;

  object_id: string;

  object_type: string;

  reaction_count: number;

  reply_count: number;

  updated_at: Date;

  latest_reactions: ActivityReactionResponse[];

  user: UserResponse;

  deleted_at?: Date;

  parent_id?: string;

  text?: string;

  attachments?: Attachment[];

  mentioned_user_ids?: string[];

  custom?: Record<string, any>;

  reaction_groups?: Record<string, ReactionGroupResponse>;
}

export interface CommentUpdatedEvent {
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CreateManyFeedsRequest {
  feeds: FeedRequest[];
}

export interface CreateManyFeedsResponse {
  duration: string;

  feeds: FeedResponse[];
}

export interface DecayFunctionConfig {
  base: string;

  decay: string;

  direction: string;

  offset: string;

  origin: string;

  scale: string;
}

export interface DeleteActivitiesRequest {
  activity_ids: string[];

  hard_delete?: boolean;
}

export interface DeleteActivitiesResponse {
  duration: string;

  deleted_activity_ids: string[];
}

export interface DeleteActivityReactionResponse {
  activity_id: string;

  duration: string;

  type: string;

  user_id: string;
}

export interface DeleteActivityResponse {
  duration: string;
}

export interface DeleteBookmarkResponse {
  duration: string;

  bookmark: BookmarkResponse;
}

export interface DeleteCommentResponse {
  duration: string;
}

export interface DeleteFeedResponse {
  duration: string;
}

export interface FeedCreatedEvent {
  created_at: Date;

  fid: string;

  members: FeedMemberResponse[];

  custom: Record<string, any>;

  feed: FeedResponse;

  user: UserResponseCommonFields;

  type: string;

  received_at?: Date;
}

export interface FeedDeletedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedGroup {
  aggregation_version: number;

  app_pk: number;

  created_at: Date;

  default_visibility: string;

  id: string;

  updated_at: Date;

  activity_analysers: ActivityAnalyserConfig[];

  activity_selectors: ActivitySelectorConfig[];

  custom: Record<string, any>;

  deleted_at?: Date;

  last_feed_get_at?: Date;

  aggregation?: AggregationConfig;

  notification?: NotificationConfig;

  ranking?: RankingConfig;

  stories?: StoriesConfig;
}

export interface FeedGroupChangedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  type: string;

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

  received_at?: Date;
}

export interface FeedInput {
  visibility?: 'public' | 'visible' | 'followers' | 'private' | 'restricted';

  members?: FeedMemberRequest[];

  custom?: Record<string, any>;
}

export interface FeedMemberRequest {
  user_id: string;

  request?: boolean;

  role?: string;

  custom?: Record<string, any>;
}

export interface FeedMemberResponse {
  created_at: Date;

  role: string;

  status: string;

  updated_at: Date;

  user: UserResponse;

  request?: boolean;

  request_accepted_at?: Date;

  request_rejected_at?: Date;

  custom?: Record<string, any>;
}

export interface FeedRequest {
  feed_group_id: string;

  feed_id: string;

  created_by_id?: string;

  visibility?: 'public' | 'visible' | 'followers' | 'private' | 'restricted';

  members?: FeedMemberRequest[];

  custom?: Record<string, any>;
}

export interface FeedResponse {
  created_at: Date;

  fid: string;

  follower_count: number;

  following_count: number;

  group_id: string;

  id: string;

  member_count: number;

  pin_count: number;

  updated_at: Date;

  created_by: UserResponse;

  deleted_at?: Date;

  visibility?: string;

  custom?: Record<string, any>;
}

export interface FeedUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  feed: FeedResponse;

  user: UserResponseCommonFields;

  type: string;

  received_at?: Date;
}

export interface FollowAddedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FollowBatchRequest {
  follows: FollowRequest[];
}

export interface FollowBatchResponse {
  duration: string;

  follows: FollowResponse[];
}

export interface FollowRemovedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FollowRequest {
  source: string;

  target: string;

  push_preference?: string;

  request?: boolean;

  custom?: Record<string, any>;
}

export interface FollowResponse {
  created_at: Date;

  push_preference: string;

  request: boolean;

  source_fid: string;

  status: string;

  target_fid: string;

  updated_at: Date;

  source_feed: FeedResponse;

  target_feed: FeedResponse;

  request_accepted_at?: Date;

  request_rejected_at?: Date;

  role?: string;

  custom?: Record<string, any>;
}

export interface FollowUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface GetActivityResponse {
  duration: string;

  activity: ActivityResponse;
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

export interface GetFollowSuggestionsResponse {
  duration: string;

  suggestions: FeedResponse[];
}

export interface GetOrCreateFeedRequest {
  comment_limit?: number;

  comment_sort?: 'first' | 'last' | 'popular';

  limit?: number;

  next?: string;

  prev?: string;

  view?: string;

  watch?: boolean;

  data?: FeedInput;

  external_ranking?: Record<string, any>;

  filter?: Record<string, any>;

  follower_pagination?: PagerRequest;

  following_pagination?: PagerRequest;

  member_pagination?: PagerRequest;
}

export interface GetOrCreateFeedResponse {
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

  own_follows?: FollowResponse[];

  followers_pagination?: PagerResponse;

  following_pagination?: PagerResponse;

  member_pagination?: PagerResponse;

  notification_status?: NotificationStatusResponse;

  own_membership?: FeedMemberResponse;
}

export interface MarkActivityRequest {
  mark_all_read?: boolean;

  mark_all_seen?: boolean;

  mark_read?: string[];

  mark_watched?: string[];
}

export interface Moderation {}

export interface NotificationConfig {
  track_read?: boolean;

  track_seen?: boolean;
}

export interface NotificationStatusResponse {
  unread: number;

  unseen: number;

  last_seen_at?: Date;

  read_activities?: string[];
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
  activity_id: string;

  created_at: Date;

  duration: string;

  fid: string;

  user_id: string;
}

export interface QueryActivitiesRequest {
  comment_limit?: number;

  comment_sort?: 'first' | 'last' | 'popular';

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

export interface QueryCommentsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  sort?: 'first' | 'last' | 'reaction_count';

  user_id?: string;

  activity_ids?: string[];

  parent_ids?: string[];
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

  pagination: PagerResponse;
}

export interface QueryFeedsResponse {
  duration: string;

  feeds: FeedResponse[];

  pager: PagerResponse;
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

export interface RankingConfig {
  score: string;

  defaults: Record<string, any>;

  functions: Record<string, DecayFunctionConfig>;

  decay_factor?: number;

  recency_weight?: number;

  type?: string;
}

export interface ReactionGroupResponse {
  count: number;

  first_reaction_at: Date;

  last_reaction_at: Date;
}

export interface RejectFeedMemberRequest {
  user_id: string;
}

export interface RejectFeedMemberResponse {
  duration: string;

  feed_member: FeedMemberResponse;
}

export interface RejectFollowRequest {
  source_fid: string;

  target_fid: string;
}

export interface RejectFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface RemoveCommentReactionResponse {
  duration: string;
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

export interface SingleFollowRequest {
  source: string;

  target: string;

  push_preference?: string;

  request?: boolean;

  custom?: Record<string, any>;
}

export interface SingleFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface SortParamRequest {
  direction?: number;

  field?: string;
}

export interface StoriesConfig {
  expiration_behaviour?: 'hide_for_everyone' | 'visible_for_author';

  skip_watched?: boolean;
}

export interface ThreadedCommentResponse {
  created_at: Date;

  id: string;

  object_id: string;

  object_type: string;

  reaction_count: number;

  reply_count: number;

  updated_at: Date;

  latest_reactions: ActivityReactionResponse[];

  user: UserResponse;

  deleted_at?: Date;

  parent_id?: string;

  text?: string;

  attachments?: Attachment[];

  mentioned_user_ids?: string[];

  replies?: ThreadedCommentResponse[];

  custom?: Record<string, any>;

  meta?: RepliesMeta;

  reaction_groups?: Record<string, ReactionGroupResponse>;
}

export interface UnfollowResponse {
  duration: string;
}

export interface UnpinActivityResponse {
  activity_id: string;

  duration: string;

  fid: string;

  user_id: string;
}

export interface UpdateActivityPartialRequest {
  unset?: string[];

  set?: Record<string, any>;
}

export interface UpdateActivityPartialResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface UpdateActivityRequest {
  expires_at?: Date;

  text?: string;

  visibility?: string;

  attachments?: Attachment[];

  filter_tags?: string[];

  interest_tags?: string[];

  custom?: Record<string, any>;

  location?: ActivityLocation;
}

export interface UpdateActivityResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface UpdateBookmarkRequest {
  feed_id: string;

  feed_type: string;

  custom?: Record<string, any>;
}

export interface UpdateBookmarkResponse {
  duration: string;

  bookmark: BookmarkResponse;
}

export interface UpdateCommentRequest {
  comment?: string;

  custom?: Record<string, any>;
}

export interface UpdateCommentResponse {
  duration: string;

  comment: CommentResponse;
}

export interface UpdateFeedMembersRequest {
  operation: 'add' | 'remove' | 'set';

  limit?: number;

  next?: string;

  prev?: string;

  members?: FeedMemberRequest[];
}

export interface UpdateFeedRequest {
  custom?: Record<string, any>;
}

export interface UpdateFeedResponse {
  duration: string;

  feed: FeedResponse;
}

export interface UpdateFollowRequest {
  push_preference?: string;

  custom?: Record<string, any>;
}

export interface UpdateFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface UpsertActivitiesRequest {
  activities: ActivityRequest[];
}

export interface UpsertActivitiesResponse {
  duration: string;

  activities: ActivityResponse[];
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

  deactivated_at?: Date;

  deleted_at?: Date;

  image?: string;

  last_active?: Date;

  name?: string;

  revoke_tokens_issued_before?: Date;

  teams_role?: Record<string, string>;
}

export type WSClientEvent =
  | ({ type: 'activity.added' } & ActivityAddedEvent)
  | ({ type: 'activity.deleted' } & ActivityDeletedEvent)
  | ({ type: 'activity.reaction.added' } & ActivityReactionAddedEvent)
  | ({ type: 'activity.reaction.deleted' } & ActivityReactionDeletedEvent)
  | ({ type: 'activity.removed_from_feed' } & ActivityRemovedFromFeedEvent)
  | ({ type: 'activity.updated' } & ActivityUpdatedEvent)
  | ({ type: 'bookmark.added' } & BookmarkAddedEvent)
  | ({ type: 'bookmark.deleted' } & BookmarkDeletedEvent)
  | ({ type: 'bookmark.updated' } & BookmarkUpdatedEvent)
  | ({ type: 'comment.added' } & CommentAddedEvent)
  | ({ type: 'comment.deleted' } & CommentDeletedEvent)
  | ({ type: 'comment.reaction.added' } & CommentReactionAddedEvent)
  | ({ type: 'comment.reaction.removed' } & CommentReactionRemovedEvent)
  | ({ type: 'comment.updated' } & CommentUpdatedEvent)
  | ({ type: 'feed.created' } & FeedCreatedEvent)
  | ({ type: 'feed.deleted' } & FeedDeletedEvent)
  | ({ type: 'feed.updated' } & FeedUpdatedEvent)
  | ({ type: 'feed_group.changed' } & FeedGroupChangedEvent)
  | ({ type: 'feed_group.deleted' } & FeedGroupDeletedEvent)
  | ({ type: 'follow.added' } & FollowAddedEvent)
  | ({ type: 'follow.removed' } & FollowRemovedEvent)
  | ({ type: 'follow.updated' } & FollowUpdatedEvent);

export type WSEvent =
  | ({ type: 'activity.added' } & ActivityAddedEvent)
  | ({ type: 'activity.deleted' } & ActivityDeletedEvent)
  | ({ type: 'activity.reaction.added' } & ActivityReactionAddedEvent)
  | ({ type: 'activity.reaction.deleted' } & ActivityReactionDeletedEvent)
  | ({ type: 'activity.removed_from_feed' } & ActivityRemovedFromFeedEvent)
  | ({ type: 'activity.updated' } & ActivityUpdatedEvent)
  | ({ type: 'bookmark.added' } & BookmarkAddedEvent)
  | ({ type: 'bookmark.deleted' } & BookmarkDeletedEvent)
  | ({ type: 'bookmark.updated' } & BookmarkUpdatedEvent)
  | ({ type: 'comment.added' } & CommentAddedEvent)
  | ({ type: 'comment.deleted' } & CommentDeletedEvent)
  | ({ type: 'comment.reaction.added' } & CommentReactionAddedEvent)
  | ({ type: 'comment.reaction.removed' } & CommentReactionRemovedEvent)
  | ({ type: 'comment.updated' } & CommentUpdatedEvent)
  | ({ type: 'feed.created' } & FeedCreatedEvent)
  | ({ type: 'feed.deleted' } & FeedDeletedEvent)
  | ({ type: 'feed.updated' } & FeedUpdatedEvent)
  | ({ type: 'feed_group.changed' } & FeedGroupChangedEvent)
  | ({ type: 'feed_group.deleted' } & FeedGroupDeletedEvent)
  | ({ type: 'follow.added' } & FollowAddedEvent)
  | ({ type: 'follow.removed' } & FollowRemovedEvent)
  | ({ type: 'follow.updated' } & FollowUpdatedEvent);

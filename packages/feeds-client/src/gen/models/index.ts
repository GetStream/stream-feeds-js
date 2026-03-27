export interface AIImageConfig {
  enabled: boolean;

  ocr_rules: OCRRule[];

  rules: AWSRekognitionRule[];

  async?: boolean;
}

export interface AIImageLabelDefinition {
  description: string;

  group: string;

  key: string;

  label: string;
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
  /**
   * API error code
   */
  code: number;

  /**
   * Request duration
   */
  duration: string;

  /**
   * Message describing an error
   */
  message: string;

  /**
   * URL with additional information
   */
  more_info: string;

  /**
   * Response HTTP status code
   */
  status_code: number;

  /**
   * Additional error-specific information
   */
  details: number[];

  /**
   * Flag that indicates if the error is unrecoverable, requests that return unrecoverable errors should not be retried, this error only applies to the request that caused it
   */
  unrecoverable?: boolean;

  /**
   * Additional error info
   */
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

  subclassifications?: Record<string, any>;
}

export interface AcceptFeedMemberInviteRequest {}

export interface AcceptFeedMemberInviteResponse {
  duration: string;

  member: FeedMemberResponse;
}

export interface AcceptFollowRequest {
  /**
   * Fully qualified ID of the source feed
   */
  source: string;

  /**
   * Fully qualified ID of the target feed
   */
  target: string;

  /**
   * Optional role for the follower in the follow relationship
   */
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
  /**
   * Timestamp when the action was taken
   */
  created_at: Date;

  /**
   * Unique identifier of the action log
   */
  id: string;

  /**
   * Reason for the moderation action
   */
  reason: string;

  /**
   * ID of the user who was the target of the action
   */
  target_user_id: string;

  /**
   * Type of moderation action
   */
  type: string;

  /**
   * ID of the user who performed the action
   */
  user_id: string;

  ai_providers: string[];

  /**
   * Additional metadata about the action
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.activity.added" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.activity.deleted" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityFeedbackEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  activity_feedback: ActivityFeedbackEventPayload;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.activity.feedback" in this case
   */
  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityFeedbackEventPayload {
  /**
   * The type of feedback action. One of: hide, show_more, show_less
   */

  action: 'hide' | 'show_more' | 'show_less';

  /**
   * The activity that received feedback
   */
  activity_id: string;

  /**
   * When the feedback was created
   */
  created_at: Date;

  /**
   * When the feedback was last updated
   */
  updated_at: Date;

  /**
   * The feedback value (true/false)
   */
  value: string;

  user: UserResponse;
}

export interface ActivityFeedbackRequest {
  /**
   * Whether to hide this activity
   */
  hide?: boolean;

  /**
   * Whether to show less content like this
   */
  show_less?: boolean;

  /**
   * Whether to show more content like this
   */
  show_more?: boolean;
}

export interface ActivityFeedbackResponse {
  /**
   * The ID of the activity that received feedback
   */
  activity_id: string;

  duration: string;
}

export interface ActivityLocation {
  /**
   * Latitude coordinate
   */
  lat: number;

  /**
   * Longitude coordinate
   */
  lng: number;
}

export interface ActivityMarkEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.activity.marked" in this case
   */
  type: string;

  feed_visibility?: string;

  /**
   * Whether all activities were marked as read
   */
  mark_all_read?: boolean;

  /**
   * Whether all activities were marked as seen
   */
  mark_all_seen?: boolean;

  received_at?: Date;

  /**
   * The IDs of activities marked as read
   */
  mark_read?: string[];

  /**
   * The IDs of activities marked as seen
   */
  mark_seen?: string[];

  /**
   * The IDs of activities marked as watched
   */
  mark_watched?: string[];

  user?: UserResponseCommonFields;
}

export interface ActivityPinResponse {
  /**
   * When the pin was created
   */
  created_at: Date;

  /**
   * ID of the feed where activity is pinned
   */
  feed: string;

  /**
   * When the pin was last updated
   */
  updated_at: Date;

  activity: ActivityResponse;

  user: UserResponse;
}

export interface ActivityPinnedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * The ID of the feed
   */
  fid: string;

  custom: Record<string, any>;

  pinned_activity: PinActivityResponse;

  /**
   * The type of event: "feeds.activity.pinned" in this case
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  /**
   * The type of event: "feeds.activity.reaction.added" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityReactionDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  /**
   * The type of the reaction that was removed
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityReactionUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  /**
   * The type of event: "feeds.activity.reaction.updated" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityRemovedFromFeedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.activity.removed_from_feed" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityRequest {
  /**
   * Type of activity
   */
  type: string;

  /**
   * List of feeds to add the activity to with a default max limit of 25 feeds
   */
  feeds: string[];

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to create notification activities for mentioned users
   */
  create_notification_activity?: boolean;

  /**
   * Expiration time for the activity
   */
  expires_at?: string;

  /**
   * Optional ID for the activity
   */
  id?: string;

  /**
   * ID of parent activity for replies/comments
   */
  parent_id?: string;

  /**
   * ID of a poll to attach to activity
   */
  poll_id?: string;

  /**
   * Controls who can add comments/replies to this activity. One of: everyone, people_i_follow, nobody
   */

  restrict_replies?: 'everyone' | 'people_i_follow' | 'nobody';

  /**
   * Whether to skip URL enrichment for the activity
   */
  skip_enrich_url?: boolean;

  /**
   * Whether to skip push notifications
   */
  skip_push?: boolean;

  /**
   * Text content of the activity
   */
  text?: string;

  /**
   * Visibility setting for the activity. One of: public, private, tag
   */

  visibility?: 'public' | 'private' | 'tag';

  /**
   * If visibility is 'tag', this is the tag name and is required
   */
  visibility_tag?: string;

  /**
   * List of attachments for the activity
   */
  attachments?: Attachment[];

  /**
   * Collections that this activity references
   */
  collection_refs?: string[];

  /**
   * Tags for filtering activities
   */
  filter_tags?: string[];

  /**
   * Tags for indicating user interests
   */
  interest_tags?: string[];

  /**
   * List of users mentioned in the activity
   */
  mentioned_user_ids?: string[];

  /**
   * Custom data for the activity
   */
  custom?: Record<string, any>;

  location?: ActivityLocation;

  /**
   * Additional data for search indexing
   */
  search_data?: Record<string, any>;
}

export interface ActivityResponse {
  /**
   * Number of bookmarks on the activity
   */
  bookmark_count: number;

  /**
   * Number of comments on the activity
   */
  comment_count: number;

  /**
   * When the activity was created
   */
  created_at: Date;

  /**
   * If this activity is hidden by this user (using activity feedback)
   */
  hidden: boolean;

  /**
   * Unique identifier for the activity
   */
  id: string;

  /**
   * Popularity score of the activity
   */
  popularity: number;

  /**
   * If this activity is obfuscated for this user. For premium content where you want to show a preview
   */
  preview: boolean;

  /**
   * Number of reactions to the activity
   */
  reaction_count: number;

  /**
   * Controls who can add comments/replies to this activity. One of: everyone, people_i_follow, nobody
   */

  restrict_replies: 'everyone' | 'people_i_follow' | 'nobody';

  /**
   * Ranking score for this activity
   */
  score: number;

  /**
   * Number of times the activity was shared
   */
  share_count: number;

  /**
   * Type of activity
   */
  type: string;

  /**
   * When the activity was last updated
   */
  updated_at: Date;

  /**
   * Visibility setting for the activity. One of: public, private, tag
   */

  visibility: 'public' | 'private' | 'tag';

  /**
   * Media attachments for the activity
   */
  attachments: Attachment[];

  /**
   * Latest 5 comments of this activity (comment replies excluded)
   */
  comments: CommentResponse[];

  /**
   * List of feed IDs containing this activity
   */
  feeds: string[];

  /**
   * Tags for filtering
   */
  filter_tags: string[];

  /**
   * Tags for user interests
   */
  interest_tags: string[];

  /**
   * Recent reactions to the activity
   */
  latest_reactions: FeedsReactionResponse[];

  /**
   * Users mentioned in the activity
   */
  mentioned_users: UserResponse[];

  /**
   * Current user's bookmarks for this activity
   */
  own_bookmarks: BookmarkResponse[];

  /**
   * Current user's reactions to this activity
   */
  own_reactions: FeedsReactionResponse[];

  /**
   * Enriched collection data referenced by this activity
   */
  collections: Record<string, EnrichedCollectionResponse>;

  /**
   * Custom data for the activity
   */
  custom: Record<string, any>;

  /**
   * Grouped reactions by type
   */
  reaction_groups: Record<string, FeedsReactionGroupResponse>;

  /**
   * Data for search indexing
   */
  search_data: Record<string, any>;

  user: UserResponse;

  /**
   * When the activity was deleted
   */
  deleted_at?: Date;

  /**
   * When the activity was last edited
   */
  edited_at?: Date;

  /**
   * When the activity will expire
   */
  expires_at?: Date;

  /**
   * Total count of reactions from friends on this activity
   */
  friend_reaction_count?: number;

  /**
   * Whether this activity has been read. Only set for feed groups with notification config (track_seen/track_read enabled).
   */
  is_read?: boolean;

  /**
   * Whether this activity has been seen. Only set for feed groups with notification config (track_seen/track_read enabled).
   */
  is_seen?: boolean;

  is_watched?: boolean;

  moderation_action?: string;

  /**
   * Which activity selector provided this activity (e.g., 'following', 'popular', 'interest'). Only set when using multiple activity selectors with ranking.
   */
  selector_source?: string;

  /**
   * Text content of the activity
   */
  text?: string;

  /**
   * If visibility is 'tag', this is the tag name
   */
  visibility_tag?: string;

  /**
   * Reactions from users the current user follows or has mutual follows with
   */
  friend_reactions?: FeedsReactionResponse[];

  current_feed?: FeedResponse;

  location?: ActivityLocation;

  metrics?: Record<string, number>;

  moderation?: ModerationV2Response;

  notification_context?: NotificationContext;

  parent?: ActivityResponse;

  poll?: PollResponseData;

  /**
   * Variable values used at ranking time. Only included when include_score_vars is enabled in enrichment options.
   */
  score_vars?: Record<string, any>;
}

export interface ActivityRestoredEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  /**
   * The type of the event
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * The ID of the feed
   */
  fid: string;

  custom: Record<string, any>;

  pinned_activity: PinActivityResponse;

  /**
   * The type of event: "feeds.activity.unpinned" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface ActivityUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  custom: Record<string, any>;

  /**
   * The type of the event
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface AddActivityRequest {
  /**
   * Type of activity
   */
  type: string;

  /**
   * List of feeds to add the activity to with a default max limit of 25 feeds
   */
  feeds: string[];

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to create notification activities for mentioned users
   */
  create_notification_activity?: boolean;

  enrich_own_fields?: boolean;

  /**
   * Expiration time for the activity
   */
  expires_at?: string;

  /**
   * Optional ID for the activity
   */
  id?: string;

  /**
   * ID of parent activity for replies/comments
   */
  parent_id?: string;

  /**
   * ID of a poll to attach to activity
   */
  poll_id?: string;

  /**
   * Controls who can add comments/replies to this activity. One of: everyone, people_i_follow, nobody
   */

  restrict_replies?: 'everyone' | 'people_i_follow' | 'nobody';

  /**
   * Whether to skip URL enrichment for the activity
   */
  skip_enrich_url?: boolean;

  /**
   * Whether to skip push notifications
   */
  skip_push?: boolean;

  /**
   * Text content of the activity
   */
  text?: string;

  /**
   * Visibility setting for the activity. One of: public, private, tag
   */

  visibility?: 'public' | 'private' | 'tag';

  /**
   * If visibility is 'tag', this is the tag name and is required
   */
  visibility_tag?: string;

  /**
   * List of attachments for the activity
   */
  attachments?: Attachment[];

  /**
   * Collections that this activity references
   */
  collection_refs?: string[];

  /**
   * Tags for filtering activities
   */
  filter_tags?: string[];

  /**
   * Tags for indicating user interests
   */
  interest_tags?: string[];

  /**
   * List of users mentioned in the activity
   */
  mentioned_user_ids?: string[];

  /**
   * Custom data for the activity
   */
  custom?: Record<string, any>;

  location?: ActivityLocation;

  /**
   * Additional data for search indexing
   */
  search_data?: Record<string, any>;
}

export interface AddActivityResponse {
  duration: string;

  activity: ActivityResponse;

  /**
   * Number of mention notification activities created for mentioned users
   */
  mention_notifications_created?: number;
}

export interface AddBookmarkRequest {
  /**
   * ID of the folder to add the bookmark to
   */
  folder_id?: string;

  /**
   * Custom data for the bookmark
   */
  custom?: Record<string, any>;

  new_folder?: AddFolderRequest;
}

export interface AddBookmarkResponse {
  duration: string;

  bookmark: BookmarkResponse;
}

export interface AddCommentReactionRequest {
  /**
   * The type of reaction, eg upvote, like, ...
   */
  type: string;

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to create a notification activity for this reaction
   */
  create_notification_activity?: boolean;

  /**
   * Whether to enforce unique reactions per user (remove other reaction types from the user when adding this one)
   */
  enforce_unique?: boolean;

  skip_push?: boolean;

  /**
   * Optional custom data to add to the reaction
   */
  custom?: Record<string, any>;
}

export interface AddCommentReactionResponse {
  /**
   * Duration of the request
   */
  duration: string;

  comment: CommentResponse;

  reaction: FeedsReactionResponse;

  /**
   * Whether a notification activity was successfully created
   */
  notification_created?: boolean;
}

export interface AddCommentRequest {
  /**
   * Text content of the comment
   */
  comment?: string;

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to create a notification activity for this comment
   */
  create_notification_activity?: boolean;

  /**
   * Optional custom ID for the comment (max 255 characters). If not provided, a UUID will be generated.
   */
  id?: string;

  /**
   * ID of the object to comment on. Required for root comments
   */
  object_id?: string;

  /**
   * Type of the object to comment on. Required for root comments
   */
  object_type?: string;

  /**
   * ID of parent comment for replies. When provided, object_id and object_type are automatically inherited from the parent comment.
   */
  parent_id?: string;

  /**
   * Whether to skip URL enrichment for this comment
   */
  skip_enrich_url?: boolean;

  skip_push?: boolean;

  /**
   * Media attachments for the reply
   */
  attachments?: Attachment[];

  /**
   * List of users mentioned in the reply
   */
  mentioned_user_ids?: string[];

  /**
   * Custom data for the comment
   */
  custom?: Record<string, any>;
}

export interface AddCommentResponse {
  duration: string;

  comment: CommentResponse;

  /**
   * Number of mention notification activities created for mentioned users
   */
  mention_notifications_created?: number;

  /**
   * Whether a notification activity was successfully created
   */
  notification_created?: boolean;
}

export interface AddCommentsBatchRequest {
  /**
   * List of comments to add
   */
  comments: AddCommentRequest[];
}

export interface AddCommentsBatchResponse {
  duration: string;

  /**
   * List of comments added
   */
  comments: CommentResponse[];
}

export interface AddFolderRequest {
  /**
   * Name of the folder
   */
  name: string;

  /**
   * Custom data for the folder
   */
  custom?: Record<string, any>;
}

export interface AddReactionRequest {
  /**
   * Type of reaction
   */
  type: string;

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to create a notification activity for this reaction
   */
  create_notification_activity?: boolean;

  /**
   * Whether to enforce unique reactions per user (remove other reaction types from the user when adding this one)
   */
  enforce_unique?: boolean;

  skip_push?: boolean;

  /**
   * Custom data for the reaction
   */
  custom?: Record<string, any>;
}

export interface AddReactionResponse {
  duration: string;

  activity: ActivityResponse;

  reaction: FeedsReactionResponse;

  /**
   * Whether a notification activity was successfully created
   */
  notification_created?: boolean;
}

export interface AddUserGroupMembersRequest {
  /**
   * List of user IDs to add as members
   */
  member_ids: string[];

  /**
   * Whether to add the members as group admins. Defaults to false
   */
  as_admin?: boolean;

  team_id?: string;
}

export interface AddUserGroupMembersResponse {
  duration: string;

  user_group?: UserGroupResponse;
}

export interface AggregatedActivityResponse {
  /**
   * Number of activities in this aggregation
   */
  activity_count: number;

  /**
   * When the aggregation was created
   */
  created_at: Date;

  /**
   * Grouping identifier
   */
  group: string;

  /**
   * Ranking score for this aggregation
   */
  score: number;

  /**
   * When the aggregation was last updated
   */
  updated_at: Date;

  /**
   * Number of unique users in this aggregation
   */
  user_count: number;

  /**
   * Whether this activity group has been truncated due to exceeding the group size limit
   */
  user_count_truncated: boolean;

  /**
   * List of activities in this aggregation
   */
  activities: ActivityResponse[];

  /**
   * Whether this aggregated group has been read. Only set for feed groups with notification config (track_seen/track_read enabled).
   */
  is_read?: boolean;

  /**
   * Whether this aggregated group has been seen. Only set for feed groups with notification config (track_seen/track_read enabled).
   */
  is_seen?: boolean;

  is_watched?: boolean;
}

export interface AggregationConfig {
  format?: string;

  group_size?: number;

  score_strategy?: string;
}

export interface AppEventResponse {
  /**
   * boolean
   */
  auto_translation_enabled: boolean;

  /**
   * string
   */
  name: string;

  /**
   * boolean
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  app: AppEventResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "app.updated" in this case
   */
  type: string;

  received_at?: Date;
}

export interface AppealItemResponse {
  /**
   * Reason Text of the Appeal Item
   */
  appeal_reason: string;

  /**
   * When the flag was created
   */
  created_at: Date;

  /**
   * ID of the entity
   */
  entity_id: string;

  /**
   * Type of entity
   */
  entity_type: string;

  id: string;

  /**
   * Status of the Appeal Item
   */
  status: string;

  /**
   * When the flag was last updated
   */
  updated_at: Date;

  /**
   * Decision Reason of the Appeal Item
   */
  decision_reason?: string;

  /**
   * Attachments(e.g. Images) of the Appeal Item
   */
  attachments?: string[];

  entity_content?: ModerationPayload;

  user?: UserResponse;
}

export interface AppealRequest {
  /**
   * Explanation for why the content is being appealed
   */
  appeal_reason: string;

  /**
   * Unique identifier of the entity being appealed
   */
  entity_id: string;

  /**
   * Type of entity being appealed (e.g., message, user)
   */
  entity_type: string;

  /**
   * Array of Attachment URLs(e.g., images)
   */
  attachments?: string[];
}

export interface AppealResponse {
  /**
   * Unique identifier of the created Appeal item
   */
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

  /**
   * Attachment type (e.g. image, video, url)
   */
  type?: string;

  actions?: Action[];

  fields?: Field[];

  giphy?: Images;
}

export interface AudioSettingsResponse {
  access_request_enabled: boolean;

  default_device: string;

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
  action:
    | 'flag'
    | 'shadow'
    | 'remove'
    | 'bounce'
    | 'bounce_flag'
    | 'bounce_remove';

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

export interface BanActionRequestPayload {
  /**
   * Ban only from specific channel
   */
  channel_ban_only?: boolean;

  channel_cid?: string;

  /**
   * Message deletion mode: soft, pruning, or hard
   */

  delete_messages?: 'soft' | 'pruning' | 'hard';

  /**
   * Whether to ban by IP address
   */
  ip_ban?: boolean;

  /**
   * Reason for the ban
   */
  reason?: string;

  /**
   * Whether this is a shadow ban
   */
  shadow?: boolean;

  /**
   * Optional: ban user directly without review item
   */
  target_user_id?: string;

  /**
   * Duration of ban in minutes
   */
  timeout?: number;
}

export interface BanInfoResponse {
  /**
   * When the ban was created
   */
  created_at: Date;

  /**
   * When the ban expires
   */
  expires?: Date;

  /**
   * Reason for the ban
   */
  reason?: string;

  /**
   * Whether this is a shadow ban
   */
  shadow?: boolean;

  created_by?: UserResponse;

  user?: UserResponse;
}

export interface BanOptions {
  delete_messages?: 'soft' | 'pruning' | 'hard';

  duration?: number;

  ip_ban?: boolean;

  reason?: string;

  shadow_ban?: boolean;
}

export interface BanRequest {
  /**
   * ID of the user to ban
   */
  target_user_id: string;

  /**
   * ID of the user performing the ban
   */
  banned_by_id?: string;

  /**
   * Channel where the ban applies
   */
  channel_cid?: string;

  delete_messages?: 'soft' | 'pruning' | 'hard';

  /**
   * Whether to ban the user's IP address
   */
  ip_ban?: boolean;

  /**
   * Optional explanation for the ban
   */
  reason?: string;

  /**
   * Whether this is a shadow ban
   */
  shadow?: boolean;

  /**
   * Duration of the ban in minutes
   */
  timeout?: number;

  banned_by?: UserRequest;
}

export interface BanResponse {
  duration: string;
}

export interface BlockActionRequestPayload {
  /**
   * Reason for blocking
   */
  reason?: string;
}

export interface BlockListConfig {
  enabled: boolean;

  rules: BlockListRule[];

  async?: boolean;

  match_substring?: boolean;
}

export interface BlockListOptions {
  /**
   * Blocklist behavior. One of: flag, block, shadow_block
   */

  behavior: 'flag' | 'block' | 'shadow_block';

  /**
   * Blocklist name
   */
  blocklist: string;
}

export interface BlockListResponse {
  is_leet_check_enabled: boolean;

  is_plural_check_enabled: boolean;

  /**
   * Block list name
   */
  name: string;

  /**
   * Block list type. One of: regex, domain, domain_allowlist, email, email_allowlist, word
   */
  type: string;

  /**
   * List of words to block
   */
  words: string[];

  /**
   * Date/time of creation
   */
  created_at?: Date;

  id?: string;

  team?: string;

  /**
   * Date/time of the last update
   */
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
  /**
   * User id to block
   */
  blocked_user_id: string;
}

export interface BlockUsersResponse {
  /**
   * User id who blocked another user
   */
  blocked_by_user_id: string;

  /**
   * User id who got blocked
   */
  blocked_user_id: string;

  /**
   * Timestamp when the user was blocked
   */
  created_at: Date;

  /**
   * Duration of the request in milliseconds
   */
  duration: string;
}

export interface BlockedUserResponse {
  /**
   * ID of the user who got blocked
   */
  blocked_user_id: string;

  created_at: Date;

  /**
   * ID of the user who blocked another user
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  bookmark: BookmarkResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.bookmark.added" in this case
   */
  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  bookmark: BookmarkResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.bookmark.deleted" in this case
   */
  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkFolderDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  bookmark_folder: BookmarkFolderResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.bookmark_folder.deleted" in this case
   */
  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkFolderResponse {
  /**
   * When the folder was created
   */
  created_at: Date;

  /**
   * Unique identifier for the folder
   */
  id: string;

  /**
   * Name of the folder
   */
  name: string;

  /**
   * When the folder was last updated
   */
  updated_at: Date;

  user: UserResponse;

  /**
   * Custom data for the folder
   */
  custom?: Record<string, any>;
}

export interface BookmarkFolderUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  bookmark_folder: BookmarkFolderResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.bookmark_folder.updated" in this case
   */
  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BookmarkResponse {
  /**
   * When the bookmark was created
   */
  created_at: Date;

  /**
   * When the bookmark was last updated
   */
  updated_at: Date;

  activity: ActivityResponse;

  user: UserResponse;

  /**
   * Custom data for the bookmark
   */
  custom?: Record<string, any>;

  folder?: BookmarkFolderResponse;
}

export interface BookmarkUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  bookmark: BookmarkResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.bookmark.updated" in this case
   */
  type: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface BroadcastSettingsResponse {
  enabled: boolean;

  hls: HLSSettingsResponse;

  rtmp: RTMPSettingsResponse;
}

export interface CallActionOptions {
  duration?: number;

  flag_reason?: string;

  kick_reason?: string;

  mute_audio?: boolean;

  mute_video?: boolean;

  reason?: string;

  warning_text?: string;
}

export interface CallCustomPropertyParameters {
  operator?: string;

  property_key?: string;
}

export interface CallIngressResponse {
  rtmp: RTMPIngress;

  srt: SRTIngress;

  whip: WHIPIngress;
}

export interface CallParticipantResponse {
  role: string;

  user_session_id: string;

  joined_at: Timestamp;

  user: UserResponse;
}

export interface CallResponse {
  backstage: boolean;

  captioning: boolean;

  cid: string;

  current_session_id: string;

  id: string;

  recording: boolean;

  transcribing: boolean;

  translating: boolean;

  type: string;

  blocked_user_ids: string[];

  created_at: Timestamp;

  created_by: UserResponse;

  custom: Record<string, any>;

  egress: EgressResponse;

  ingress: CallIngressResponse;

  settings: CallSettingsResponse;

  updated_at: Timestamp;

  channel_cid?: string;

  join_ahead_time_seconds?: number;

  routing_number?: string;

  team?: string;

  ended_at?: Timestamp;

  session?: CallSessionResponse;

  starts_at?: Timestamp;

  thumbnails?: ThumbnailResponse;
}

export interface CallRuleActionSequence {
  violation_number?: number;

  actions?: string[];

  call_options?: CallActionOptions;
}

export interface CallSessionResponse {
  anonymous_participant_count: number;

  id: string;

  participants: CallParticipantResponse[];

  accepted_by: Record<string, Timestamp>;

  missed_by: Record<string, Timestamp>;

  participants_count_by_role: Record<string, number>;

  rejected_by: Record<string, Timestamp>;

  ended_at?: Timestamp;

  live_ended_at?: Timestamp;

  live_started_at?: Timestamp;

  started_at?: Timestamp;

  timer_ends_at?: Timestamp;
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

export interface CallTypeRuleParameters {
  call_type?: string;
}

export interface CallViolationCountParameters {
  threshold?: number;

  time_window?: string;
}

export interface CastPollVoteRequest {
  vote?: VoteData;
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

  push_level?: 'all' | 'all_mentions' | 'mentions' | 'direct_mentions' | 'none';

  allowed_flag_reasons?: string[];

  blocklists?: BlockListOptions[];

  automod_thresholds?: Thresholds;

  chat_preferences?: ChatPreferences;

  grants?: Record<string, string[]>;
}

export interface ChannelMemberResponse {
  /**
   * Whether member is banned this channel or not
   */
  banned: boolean;

  /**
   * Role of the member in the channel
   */
  channel_role: string;

  /**
   * Date/time of creation
   */
  created_at: Date;

  notifications_muted: boolean;

  /**
   * Whether member is shadow banned in this channel or not
   */
  shadow_banned: boolean;

  /**
   * Date/time of the last update
   */
  updated_at: Date;

  custom: Record<string, any>;

  archived_at?: Date;

  /**
   * Expiration date of the ban
   */
  ban_expires?: Date;

  deleted_at?: Date;

  /**
   * Date when invite was accepted
   */
  invite_accepted_at?: Date;

  /**
   * Date when invite was rejected
   */
  invite_rejected_at?: Date;

  /**
   * Whether member was invited or not
   */
  invited?: boolean;

  /**
   * Whether member is channel moderator or not
   */
  is_moderator?: boolean;

  pinned_at?: Date;

  /**
   * Permission level of the member in the channel (DEPRECATED: use channel_role instead). One of: member, moderator, admin, owner
   */
  role?: string;

  status?: string;

  user_id?: string;

  deleted_messages?: string[];

  user?: UserResponse;
}

export interface ChannelMute {
  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * Date/time of the last update
   */
  updated_at: Date;

  /**
   * Date/time of mute expiration
   */
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

export interface ChannelPushPreferencesResponse {
  chat_level?: string;

  disabled_until?: Date;

  chat_preferences?: ChatPreferencesResponse;
}

export interface ChannelResponse {
  /**
   * Channel CID (<type>:<id>)
   */
  cid: string;

  /**
   * Date/time of creation
   */
  created_at: Date;

  disabled: boolean;

  /**
   * Whether channel is frozen or not
   */
  frozen: boolean;

  /**
   * Channel unique ID
   */
  id: string;

  /**
   * Type of the channel
   */
  type: string;

  /**
   * Date/time of the last update
   */
  updated_at: Date;

  /**
   * Custom data for this object
   */
  custom: Record<string, any>;

  /**
   * Whether auto translation is enabled or not
   */
  auto_translation_enabled?: boolean;

  /**
   * Language to translate to when auto translation is active
   */
  auto_translation_language?: string;

  /**
   * Whether this channel is blocked by current user or not
   */
  blocked?: boolean;

  /**
   * Cooldown period after sending each message
   */
  cooldown?: number;

  /**
   * Date/time of deletion
   */
  deleted_at?: Date;

  /**
   * Whether this channel is hidden by current user or not
   */
  hidden?: boolean;

  /**
   * Date since when the message history is accessible
   */
  hide_messages_before?: Date;

  /**
   * Date of the last message sent
   */
  last_message_at?: Date;

  /**
   * Number of members in the channel
   */
  member_count?: number;

  /**
   * Number of messages in the channel
   */
  message_count?: number;

  /**
   * Date of mute expiration
   */
  mute_expires_at?: Date;

  /**
   * Whether this channel is muted or not
   */
  muted?: boolean;

  /**
   * Team the channel belongs to (multi-tenant only)
   */
  team?: string;

  /**
   * Date of the latest truncation of the channel
   */
  truncated_at?: Date;

  /**
   * List of filter tags associated with the channel
   */
  filter_tags?: string[];

  /**
   * List of channel members (max 100)
   */
  members?: ChannelMemberResponse[];

  /**
   * List of channel capabilities of authenticated user
   */
  own_capabilities?: ChannelOwnCapability[];

  config?: ChannelConfigWithInfo;

  created_by?: UserResponse;

  truncated_by?: UserResponse;
}

export interface ChatPreferences {
  channel_mentions?: string;

  default_preference?: string;

  direct_mentions?: string;

  distinct_channel_messages?: string;

  group_mentions?: string;

  here_mentions?: string;

  role_mentions?: string;

  thread_replies?: string;
}

export interface ChatPreferencesInput {
  channel_mentions?: 'all' | 'none';

  default_preference?: 'all' | 'none';

  direct_mentions?: 'all' | 'none';

  group_mentions?: 'all' | 'none';

  here_mentions?: 'all' | 'none';

  role_mentions?: 'all' | 'none';

  thread_replies?: 'all' | 'none';
}

export interface ChatPreferencesResponse {
  channel_mentions?: string;

  default_preference?: string;

  direct_mentions?: string;

  group_mentions?: string;

  here_mentions?: string;

  role_mentions?: string;

  thread_replies?: string;
}

export interface ClosedCaptionRuleParameters {
  threshold?: number;

  harm_labels?: string[];

  llm_harm_labels?: Record<string, string>;
}

export interface CollectionRequest {
  /**
   * Name/type of the collection
   */
  name: string;

  /**
   * Custom data for the collection (required, must contain at least one key)
   */
  custom: Record<string, any>;

  /**
   * Unique identifier for the collection within its name (optional, will be auto-generated if not provided)
   */
  id?: string;
}

export interface CollectionResponse {
  /**
   * Unique identifier for the collection within its name
   */
  id: string;

  /**
   * Name/type of the collection
   */
  name: string;

  /**
   * When the collection was created
   */
  created_at?: Date;

  /**
   * When the collection was last updated
   */
  updated_at?: Date;

  /**
   * ID of the user who owns this collection
   */
  user_id?: string;

  /**
   * Custom data for the collection
   */
  custom?: Record<string, any>;
}

export interface Command {
  /**
   * Arguments help text, shown in commands auto-completion
   */
  args: string;

  /**
   * Description, shown in commands auto-completion
   */
  description: string;

  /**
   * Unique command name
   */
  name: string;

  /**
   * Set name used for grouping commands
   */
  set: string;

  /**
   * Date/time of creation
   */
  created_at?: Date;

  /**
   * Date/time of the last update
   */
  updated_at?: Date;
}

export interface CommentAddedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  comment: CommentResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.comment.added" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.comment.deleted" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentReactionAddedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  comment: CommentResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  /**
   * The type of event: "feeds.comment.reaction.added" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentReactionDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  /**
   * The type of reaction that was removed
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface CommentReactionUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  activity: ActivityResponse;

  comment: CommentResponse;

  custom: Record<string, any>;

  reaction: FeedsReactionResponse;

  /**
   * The type of event: "feeds.comment.reaction.updated" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentResponse {
  /**
   * Confidence score of the comment
   */
  confidence_score: number;

  /**
   * When the comment was created
   */
  created_at: Date;

  /**
   * Number of downvotes for this comment
   */
  downvote_count: number;

  /**
   * Unique identifier for the comment
   */
  id: string;

  /**
   * ID of the object this comment is associated with
   */
  object_id: string;

  /**
   * Type of the object this comment is associated with
   */
  object_type: string;

  /**
   * Number of reactions to this comment
   */
  reaction_count: number;

  /**
   * Number of replies to this comment
   */
  reply_count: number;

  /**
   * Score of the comment based on reactions
   */
  score: number;

  /**
   * Status of the comment. One of: active, deleted, removed, hidden
   */

  status: 'active' | 'deleted' | 'removed' | 'hidden' | 'shadow_blocked';

  /**
   * When the comment was last updated
   */
  updated_at: Date;

  /**
   * Number of upvotes for this comment
   */
  upvote_count: number;

  /**
   * Users mentioned in the comment
   */
  mentioned_users: UserResponse[];

  /**
   * Current user's reactions to this activity
   */
  own_reactions: FeedsReactionResponse[];

  user: UserResponse;

  /**
   * Controversy score of the comment
   */
  controversy_score?: number;

  /**
   * When the comment was deleted
   */
  deleted_at?: Date;

  /**
   * When the comment was last edited
   */
  edited_at?: Date;

  /**
   * ID of parent comment for nested replies
   */
  parent_id?: string;

  /**
   * Text content of the comment
   */
  text?: string;

  /**
   * Attachments associated with the comment
   */
  attachments?: Attachment[];

  /**
   * Recent reactions to the comment
   */
  latest_reactions?: FeedsReactionResponse[];

  /**
   * Custom data for the comment
   */
  custom?: Record<string, any>;

  moderation?: ModerationV2Response;

  /**
   * Grouped reactions by type
   */
  reaction_groups?: Record<string, FeedsReactionGroupResponse>;
}

export interface CommentRestoredEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.comment.restored" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CommentUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  comment: CommentResponse;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.comment.updated" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface CompositeRecordingResponse {
  status: string;
}

export interface ConfigResponse {
  /**
   * Whether moderation should be performed asynchronously
   */
  async: boolean;

  /**
   * When the configuration was created
   */
  created_at: Date;

  /**
   * Unique identifier for the moderation configuration
   */
  key: string;

  /**
   * Team associated with the configuration
   */
  team: string;

  /**
   * When the configuration was last updated
   */
  updated_at: Date;

  supported_video_call_harm_types: string[];

  /**
   * Configurable image moderation label definitions for dashboard rendering
   */
  ai_image_label_definitions?: AIImageLabelDefinition[];

  ai_image_config?: AIImageConfig;

  /**
   * Available L2 subclassifications per L1 image moderation label, based on the active provider
   */
  ai_image_subclassifications?: Record<string, string[]>;

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
  /**
   * Block list name
   */
  name: string;

  /**
   * List of words to block
   */
  words: string[];

  is_leet_check_enabled?: boolean;

  is_plural_check_enabled?: boolean;

  team?: string;

  /**
   * Block list type. One of: regex, domain, domain_allowlist, email, email_allowlist, word
   */

  type?:
    | 'regex'
    | 'domain'
    | 'domain_allowlist'
    | 'email'
    | 'email_allowlist'
    | 'word';
}

export interface CreateBlockListResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  blocklist?: BlockListResponse;
}

export interface CreateCollectionsRequest {
  /**
   * List of collections to create
   */
  collections: CollectionRequest[];
}

export interface CreateCollectionsResponse {
  duration: string;

  /**
   * List of created collections
   */
  collections: CollectionResponse[];
}

export interface CreateDeviceRequest {
  /**
   * Device ID
   */
  id: string;

  /**
   * Push provider
   */

  push_provider: 'firebase' | 'apn' | 'huawei' | 'xiaomi';

  /**
   * Push provider name
   */
  push_provider_name?: string;

  /**
   * When true the token is for Apple VoIP push notifications
   */
  voip_token?: boolean;
}

export interface CreateFeedsBatchRequest {
  /**
   * List of feeds to create
   */
  feeds: FeedRequest[];

  /**
   * If true, enriches the created feeds with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;
}

export interface CreateFeedsBatchResponse {
  duration: string;

  /**
   * List of created feeds
   */
  feeds: FeedResponse[];
}

export interface CreateGuestRequest {
  user: UserRequest;
}

export interface CreateGuestResponse {
  /**
   * the access token to authenticate the user
   */
  access_token: string;

  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  user: UserResponse;
}

export interface CreatePollOptionRequest {
  /**
   * Option text
   */
  text: string;

  custom?: Record<string, any>;
}

export interface CreatePollRequest {
  /**
   * The name of the poll
   */
  name: string;

  /**
   * Indicates whether users can suggest user defined answers
   */
  allow_answers?: boolean;

  allow_user_suggested_options?: boolean;

  /**
   * A description of the poll
   */
  description?: string;

  /**
   * Indicates whether users can cast multiple votes
   */
  enforce_unique_vote?: boolean;

  id?: string;

  /**
   * Indicates whether the poll is open for voting
   */
  is_closed?: boolean;

  /**
   * Indicates the maximum amount of votes a user can cast
   */
  max_votes_allowed?: number;

  voting_visibility?: 'anonymous' | 'public';

  options?: PollOptionInput[];

  custom?: Record<string, any>;
}

export interface CreateUserGroupRequest {
  /**
   * The user friendly name of the user group
   */
  name: string;

  /**
   * An optional description for the group
   */
  description?: string;

  /**
   * Optional user group ID. If not provided, a UUID v7 will be generated
   */
  id?: string;

  /**
   * Optional team ID to scope the group to a team
   */
  team_id?: string;

  /**
   * Optional initial list of user IDs to add as members
   */
  member_ids?: string[];
}

export interface CreateUserGroupResponse {
  duration: string;

  user_group?: UserGroupResponse;
}

export interface CustomActionRequestPayload {
  /**
   * Custom action identifier
   */
  id?: string;

  /**
   * Custom action options
   */
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
  /**
   * List of activity IDs to delete
   */
  ids: string[];

  /**
   * Whether to also delete any notification activities created from mentions in these activities
   */
  delete_notification_activity?: boolean;

  /**
   * Whether to permanently delete the activities
   */
  hard_delete?: boolean;
}

export interface DeleteActivitiesResponse {
  duration: string;

  /**
   * List of activity IDs that were successfully deleted
   */
  deleted_ids: string[];
}

export interface DeleteActivityReactionResponse {
  duration: string;

  activity: ActivityResponse;

  reaction: FeedsReactionResponse;
}

export interface DeleteActivityRequestPayload {
  /**
   * ID of the activity to delete (alternative to item_id)
   */
  entity_id?: string;

  /**
   * Type of the entity (required for delete_activity to distinguish v2 vs v3)
   */
  entity_type?: string;

  /**
   * Whether to permanently delete the activity
   */
  hard_delete?: boolean;

  /**
   * Reason for deletion
   */
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

export interface DeleteCommentRequestPayload {
  /**
   * ID of the comment to delete (alternative to item_id)
   */
  entity_id?: string;

  /**
   * Type of the entity
   */
  entity_type?: string;

  /**
   * Whether to permanently delete the comment
   */
  hard_delete?: boolean;

  /**
   * Reason for deletion
   */
  reason?: string;
}

export interface DeleteCommentResponse {
  duration: string;

  activity: ActivityResponse;

  comment: CommentResponse;
}

export interface DeleteFeedResponse {
  duration: string;

  /**
   * The ID of the async task that will handle feed cleanup and hard deletion
   */
  task_id: string;
}

export interface DeleteMessageRequestPayload {
  /**
   * ID of the message to delete (alternative to item_id)
   */
  entity_id?: string;

  /**
   * Type of the entity
   */
  entity_type?: string;

  /**
   * Whether to permanently delete the message
   */
  hard_delete?: boolean;

  /**
   * Reason for deletion
   */
  reason?: string;
}

export interface DeleteModerationConfigResponse {
  duration: string;
}

export interface DeleteReactionRequestPayload {
  /**
   * ID of the reaction to delete (alternative to item_id)
   */
  entity_id?: string;

  /**
   * Type of the entity
   */
  entity_type?: string;

  /**
   * Whether to permanently delete the reaction
   */
  hard_delete?: boolean;

  /**
   * Reason for deletion
   */
  reason?: string;
}

export interface DeleteUserRequestPayload {
  /**
   * Also delete all user conversations
   */
  delete_conversation_channels?: boolean;

  /**
   * Delete flagged feeds content
   */
  delete_feeds_content?: boolean;

  /**
   * ID of the user to delete (alternative to item_id)
   */
  entity_id?: string;

  /**
   * Type of the entity
   */
  entity_type?: string;

  /**
   * Whether to permanently delete the user
   */
  hard_delete?: boolean;

  /**
   * Also delete all user messages
   */
  mark_messages_deleted?: boolean;

  /**
   * Reason for deletion
   */
  reason?: string;
}

export interface DeliveryReceiptsResponse {
  enabled: boolean;
}

export interface DeviceResponse {
  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * Device ID
   */
  id: string;

  /**
   * Push provider
   */
  push_provider: string;

  /**
   * User ID
   */
  user_id: string;

  /**
   * Whether device is disabled or not
   */
  disabled?: boolean;

  /**
   * Reason explaining why device had been disabled
   */
  disabled_reason?: string;

  /**
   * Push provider name
   */
  push_provider_name?: string;

  /**
   * When true the token is for Apple VoIP push notifications
   */
  voip?: boolean;
}

export interface DraftPayloadResponse {
  /**
   * Message ID is unique string identifier of the message
   */
  id: string;

  /**
   * Text of the message
   */
  text: string;

  custom: Record<string, any>;

  /**
   * Contains HTML markup of the message
   */
  html?: string;

  /**
   * MML content of the message
   */
  mml?: string;

  /**
   * ID of parent message (thread)
   */
  parent_id?: string;

  /**
   * Identifier of the poll to include in the message
   */
  poll_id?: string;

  quoted_message_id?: string;

  /**
   * Whether thread reply should be shown in the channel as well
   */
  show_in_channel?: boolean;

  /**
   * Whether message is silent or not
   */
  silent?: boolean;

  /**
   * Contains type of the message. One of: regular, system
   */
  type?: string;

  /**
   * Array of message attachments
   */
  attachments?: Attachment[];

  /**
   * List of mentioned users
   */
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

  started_at: Timestamp;

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

export interface EnrichedCollection {
  created_at: Date;

  id: string;

  name: string;

  status: string;

  updated_at: Date;

  user_id: string;

  custom: Record<string, any>;
}

export interface EnrichedCollectionResponse {
  /**
   * Unique identifier for the collection within its name
   */
  id: string;

  /**
   * Name/type of the collection
   */
  name: string;

  /**
   * Enrichment status of the collection. One of: ok, notfound
   */

  status: 'ok' | 'notfound';

  /**
   * When the collection was created
   */
  created_at?: Date;

  /**
   * When the collection was last updated
   */
  updated_at?: Date;

  /**
   * ID of the user who owns this collection
   */
  user_id?: string;

  /**
   * Custom data for the collection
   */
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
  /**
   * Default: false. When true, includes fetching and enriching own_followings (follows where activity author's feeds follow current user's feeds).
   */
  enrich_own_followings?: boolean;

  /**
   * Default: false. When true, includes score_vars in activity responses containing variable values used at ranking time.
   */
  include_score_vars?: boolean;

  /**
   * Default: false. When true, skips all activity enrichments.
   */
  skip_activity?: boolean;

  /**
   * Default: false. When true, skips enriching collections on activities.
   */
  skip_activity_collections?: boolean;

  /**
   * Default: false. When true, skips enriching comments on activities.
   */
  skip_activity_comments?: boolean;

  /**
   * Default: false. When true, skips enriching current_feed on activities. Note: CurrentFeed is still computed for permission checks, but enrichment is skipped.
   */
  skip_activity_current_feed?: boolean;

  /**
   * Default: false. When true, skips enriching mentioned users on activities.
   */
  skip_activity_mentioned_users?: boolean;

  /**
   * Default: false. When true, skips enriching own bookmarks on activities.
   */
  skip_activity_own_bookmarks?: boolean;

  /**
   * Default: false. When true, skips enriching parent activities.
   */
  skip_activity_parents?: boolean;

  /**
   * Default: false. When true, skips enriching poll data on activities.
   */
  skip_activity_poll?: boolean;

  /**
   * Default: false. When true, skips fetching and enriching latest and own reactions on activities. Note: If reactions are already denormalized in the database, they will still be included.
   */
  skip_activity_reactions?: boolean;

  /**
   * Default: false. When true, skips refreshing image URLs on activities.
   */
  skip_activity_refresh_image_urls?: boolean;

  /**
   * Default: false. When true, skips all enrichments.
   */
  skip_all?: boolean;

  /**
   * Default: false. When true, skips enriching user data on feed members.
   */
  skip_feed_member_user?: boolean;

  /**
   * Default: false. When true, skips fetching and enriching followers. Note: If followers_pagination is explicitly provided, followers will be fetched regardless of this setting.
   */
  skip_followers?: boolean;

  /**
   * Default: false. When true, skips fetching and enriching following. Note: If following_pagination is explicitly provided, following will be fetched regardless of this setting.
   */
  skip_following?: boolean;

  /**
   * Default: false. When true, skips computing and including capabilities for feeds.
   */
  skip_own_capabilities?: boolean;

  /**
   * Default: false. When true, skips fetching and enriching own_follows (follows where user's feeds follow target feeds).
   */
  skip_own_follows?: boolean;

  /**
   * Default: false. When true, skips enriching pinned activities.
   */
  skip_pins?: boolean;
}

export interface EntityCreatorResponse {
  /**
   * Number of minor actions performed on the user
   */
  ban_count: number;

  banned: boolean;

  created_at: Date;

  /**
   * Number of major actions performed on the user
   */
  deleted_content_count: number;

  /**
   * Number of flag actions performed on the user
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  members: FeedMemberResponse[];

  custom: Record<string, any>;

  feed: FeedResponse;

  user: UserResponseCommonFields;

  /**
   * The type of event: "feeds.feed.created" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FeedDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.feed.deleted" in this case
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.feed_group.changed" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  feed_group?: FeedGroup;

  user?: UserResponseCommonFields;
}

export interface FeedGroupDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  /**
   * The ID of the feed group that was deleted
   */
  group_id: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.feed_group.deleted" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FeedGroupRestoredEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  /**
   * The ID of the feed group that was restored
   */
  group_id: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.feed_group.restored" in this case
   */
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  member: FeedMemberResponse;

  /**
   * The type of event: "feeds.feed_member.added" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedMemberRemovedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  member_id: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.feed_member.removed" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedMemberRequest {
  /**
   * ID of the user to add as a member
   */
  user_id: string;

  /**
   * Whether this is an invite to become a member
   */
  invite?: boolean;

  /**
   * ID of the membership level to assign to the member
   */
  membership_level?: string;

  /**
   * Role of the member in the feed
   */
  role?: string;

  /**
   * Custom data for the member
   */
  custom?: Record<string, any>;
}

export interface FeedMemberResponse {
  /**
   * When the membership was created
   */
  created_at: Date;

  /**
   * Role of the member in the feed
   */
  role: string;

  /**
   * Status of the membership. One of: member, pending, rejected
   */

  status: 'member' | 'pending' | 'rejected';

  /**
   * When the membership was last updated
   */
  updated_at: Date;

  user: UserResponse;

  /**
   * When the invite was accepted
   */
  invite_accepted_at?: Date;

  /**
   * When the invite was rejected
   */
  invite_rejected_at?: Date;

  /**
   * Custom data for the membership
   */
  custom?: Record<string, any>;

  membership_level?: MembershipLevelResponse;
}

export interface FeedMemberUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  member: FeedMemberResponse;

  /**
   * The type of event: "feeds.feed_member.updated" in this case
   */
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
  /**
   * Capabilities the current user has for this feed
   */
  own_capabilities?: FeedOwnCapability[];

  /**
   * Follow relationships where the feed owner's feeds are following the current user's feeds (up to 5 total)
   */
  own_followings?: FollowResponse[];

  /**
   * Follow relationships where the current user's feeds are following this feed
   */
  own_follows?: FollowResponse[];

  own_membership?: FeedMemberResponse;
}

export interface FeedRequest {
  /**
   * ID of the feed group
   */
  feed_group_id: string;

  /**
   * ID of the feed
   */
  feed_id: string;

  /**
   * ID of the feed creator
   */
  created_by_id?: string;

  /**
   * Description of the feed
   */
  description?: string;

  /**
   * Name of the feed
   */
  name?: string;

  /**
   * Visibility setting for the feed. One of: public, visible, followers, members, private
   */

  visibility?: 'public' | 'visible' | 'followers' | 'members' | 'private';

  /**
   * Tags used for filtering feeds
   */
  filter_tags?: string[];

  /**
   * Initial members for the feed
   */
  members?: FeedMemberRequest[];

  /**
   * Custom data for the feed
   */
  custom?: Record<string, any>;
}

export interface FeedResponse {
  activity_count: number;

  /**
   * When the feed was created
   */
  created_at: Date;

  /**
   * Description of the feed
   */
  description: string;

  /**
   * Fully qualified feed ID (group_id:id)
   */
  feed: string;

  /**
   * Number of followers of this feed
   */
  follower_count: number;

  /**
   * Number of feeds this feed follows
   */
  following_count: number;

  /**
   * Group this feed belongs to
   */
  group_id: string;

  /**
   * Unique identifier for the feed
   */
  id: string;

  /**
   * Number of members in this feed
   */
  member_count: number;

  /**
   * Name of the feed
   */
  name: string;

  /**
   * Number of pinned activities in this feed
   */
  pin_count: number;

  /**
   * When the feed was last updated
   */
  updated_at: Date;

  created_by: UserResponse;

  /**
   * When the feed was deleted
   */
  deleted_at?: Date;

  /**
   * Visibility setting for the feed
   */

  visibility?: 'public' | 'visible' | 'followers' | 'members' | 'private';

  /**
   * Tags used for filtering feeds
   */
  filter_tags?: string[];

  /**
   * Capabilities the current user has for this feed
   */
  own_capabilities?: FeedOwnCapability[];

  /**
   * Follow relationships where the feed owner’s feeds are following the current user's feeds
   */
  own_followings?: FollowResponse[];

  /**
   * Follow relationships where the current user's feeds are following this feed
   */
  own_follows?: FollowResponse[];

  /**
   * Custom data for the feed
   */
  custom?: Record<string, any>;

  own_membership?: FeedMemberResponse;
}

export interface FeedSuggestionResponse {
  activity_count: number;

  /**
   * When the feed was created
   */
  created_at: Date;

  /**
   * Description of the feed
   */
  description: string;

  /**
   * Fully qualified feed ID (group_id:id)
   */
  feed: string;

  /**
   * Number of followers of this feed
   */
  follower_count: number;

  /**
   * Number of feeds this feed follows
   */
  following_count: number;

  /**
   * Group this feed belongs to
   */
  group_id: string;

  /**
   * Unique identifier for the feed
   */
  id: string;

  /**
   * Number of members in this feed
   */
  member_count: number;

  /**
   * Name of the feed
   */
  name: string;

  /**
   * Number of pinned activities in this feed
   */
  pin_count: number;

  /**
   * When the feed was last updated
   */
  updated_at: Date;

  created_by: UserResponse;

  /**
   * When the feed was deleted
   */
  deleted_at?: Date;

  reason?: string;

  recommendation_score?: number;

  /**
   * Visibility setting for the feed
   */

  visibility?: 'public' | 'visible' | 'followers' | 'members' | 'private';

  /**
   * Tags used for filtering feeds
   */
  filter_tags?: string[];

  /**
   * Capabilities the current user has for this feed
   */
  own_capabilities?: FeedOwnCapability[];

  /**
   * Follow relationships where the feed owner’s feeds are following the current user's feeds
   */
  own_followings?: FollowResponse[];

  /**
   * Follow relationships where the current user's feeds are following this feed
   */
  own_follows?: FollowResponse[];

  algorithm_scores?: Record<string, number>;

  /**
   * Custom data for the feed
   */
  custom?: Record<string, any>;

  own_membership?: FeedMemberResponse;
}

export interface FeedUpdatedEvent {
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  feed: FeedResponse;

  /**
   * The type of event: "feeds.feed.updated" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  user?: UserResponseCommonFields;
}

export interface FeedsPreferences {
  /**
   * Push notification preference for comments on user's activities. One of: all, none
   */

  comment?: 'all' | 'none';

  /**
   * Push notification preference for mentions in comments. One of: all, none
   */

  comment_mention?: 'all' | 'none';

  /**
   * Push notification preference for reactions on comments. One of: all, none
   */

  comment_reaction?: 'all' | 'none';

  /**
   * Push notification preference for replies to comments. One of: all, none
   */

  comment_reply?: 'all' | 'none';

  /**
   * Push notification preference for new followers. One of: all, none
   */

  follow?: 'all' | 'none';

  /**
   * Push notification preference for mentions in activities. One of: all, none
   */

  mention?: 'all' | 'none';

  /**
   * Push notification preference for reactions on user's activities or comments. One of: all, none
   */

  reaction?: 'all' | 'none';

  /**
   * Push notification preferences for custom activity types. Map of activity type to preference (all or none)
   */
  custom_activity_types?: Record<string, string>;
}

export interface FeedsPreferencesResponse {
  comment?: string;

  comment_mention?: string;

  comment_reaction?: string;

  comment_reply?: string;

  follow?: string;

  mention?: string;

  reaction?: string;

  custom_activity_types?: Record<string, string>;
}

export interface FeedsReactionGroup {
  count: number;

  first_reaction_at: Date;

  last_reaction_at: Date;
}

export interface FeedsReactionGroupResponse {
  /**
   * Number of reactions in this group
   */
  count: number;

  /**
   * Time of the first reaction
   */
  first_reaction_at: Date;

  /**
   * Time of the most recent reaction
   */
  last_reaction_at: Date;
}

export interface FeedsReactionResponse {
  /**
   * ID of the activity that was reacted to
   */
  activity_id: string;

  /**
   * When the reaction was created
   */
  created_at: Date;

  /**
   * Type of reaction
   */
  type: string;

  /**
   * When the reaction was last updated
   */
  updated_at: Date;

  user: UserResponse;

  /**
   * ID of the comment that was reacted to
   */
  comment_id?: string;

  /**
   * Custom data for the reaction
   */
  custom?: Record<string, any>;
}

export interface FeedsV3ActivityResponse {
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

  visibility: string;

  attachments: Attachment[];

  comments: FeedsV3CommentResponse[];

  feeds: string[];

  filter_tags: string[];

  interest_tags: string[];

  latest_reactions: any[];

  mentioned_users: UserResponse[];

  own_bookmarks: any[];

  own_reactions: any[];

  collections: Record<string, EnrichedCollection>;

  custom: Record<string, any>;

  reaction_groups: Record<string, FeedsReactionGroup>;

  search_data: Record<string, any>;

  user: UserResponse;

  deleted_at?: Date;

  edited_at?: Date;

  expires_at?: Date;

  moderation_action?: string;

  text?: string;

  visibility_tag?: string;

  metrics?: Record<string, number>;

  moderation?: ModerationV2Response;
}

export interface FeedsV3CommentResponse {
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

  own_reactions: any[];

  user: UserResponse;

  controversy_score?: number;

  deleted_at?: Date;

  edited_at?: Date;

  parent_id?: string;

  text?: string;

  attachments?: Attachment[];

  custom?: Record<string, any>;

  moderation?: ModerationV2Response;
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
  /**
   * file field
   */
  file?: string;

  user?: OnlyUserID;
}

export interface FileUploadResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  /**
   * URL to the uploaded asset. Should be used to put to `asset_url` attachment field
   */
  file?: string;

  /**
   * URL of the file thumbnail for supported file formats. Should be put to `thumb_url` attachment field
   */
  thumb_url?: string;
}

export interface FilterConfigResponse {
  llm_labels: string[];

  ai_text_labels?: string[];

  config_keys?: string[];
}

export interface FlagCountRuleParameters {
  threshold?: number;
}

export interface FlagRequest {
  /**
   * Unique identifier of the entity being flagged
   */
  entity_id: string;

  /**
   * Type of entity being flagged (e.g., message, user)
   */
  entity_type: string;

  /**
   * ID of the user who created the flagged entity
   */
  entity_creator_id?: string;

  /**
   * Optional explanation for why the content is being flagged
   */
  reason?: string;

  /**
   * Additional metadata about the flag
   */
  custom?: Record<string, any>;

  moderation_payload?: ModerationPayload;
}

export interface FlagResponse {
  duration: string;

  /**
   * Unique identifier of the created moderation item
   */
  item_id: string;
}

export interface FlagUserOptions {
  reason?: string;
}

export interface FollowBatchRequest {
  /**
   * List of follow relationships to create
   */
  follows: FollowRequest[];

  /**
   * If true, enriches the follow's source_feed and target_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;
}

export interface FollowBatchResponse {
  duration: string;

  /**
   * List of newly created follow relationships
   */
  created: FollowResponse[];

  /**
   * List of current follow relationships
   */
  follows: FollowResponse[];
}

export interface FollowCreatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  /**
   * The type of event: "feeds.follow.created" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FollowDeletedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  /**
   * The type of event: "feeds.follow.deleted" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FollowRequest {
  /**
   * Fully qualified ID of the source feed
   */
  source: string;

  /**
   * Fully qualified ID of the target feed
   */
  target: string;

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to create a notification activity for this follow
   */
  create_notification_activity?: boolean;

  /**
   * If true, enriches the follow's source_feed and target_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;

  /**
   * Push preference for the follow relationship
   */

  push_preference?: 'all' | 'none';

  /**
   * Whether to skip push for this follow
   */
  skip_push?: boolean;

  /**
   * Custom data for the follow relationship
   */
  custom?: Record<string, any>;
}

export interface FollowResponse {
  /**
   * When the follow relationship was created
   */
  created_at: Date;

  /**
   * Role of the follower (source user) in the follow relationship
   */
  follower_role: string;

  /**
   * Push preference for notifications. One of: all, none
   */

  push_preference: 'all' | 'none';

  /**
   * Status of the follow relationship. One of: accepted, pending, rejected
   */

  status: 'accepted' | 'pending' | 'rejected';

  /**
   * When the follow relationship was last updated
   */
  updated_at: Date;

  source_feed: FeedResponse;

  target_feed: FeedResponse;

  /**
   * When the follow request was accepted
   */
  request_accepted_at?: Date;

  /**
   * When the follow request was rejected
   */
  request_rejected_at?: Date;

  /**
   * Custom data for the follow relationship
   */
  custom?: Record<string, any>;
}

export interface FollowUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  fid: string;

  custom: Record<string, any>;

  follow: FollowResponse;

  /**
   * The type of event: "feeds.follow.updated" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;
}

export interface FrameRecordingResponse {
  status: string;
}

export interface FrameRecordingSettingsResponse {
  capture_interval_in_seconds: number;

  mode: string;

  quality?: string;
}

export interface FriendReactionsOptions {
  /**
   * Default: false. When true, fetches friend reactions for activities.
   */
  enabled?: boolean;

  /**
   * Default: 3, Max: 10. The maximum number of friend reactions to return per activity.
   */
  limit?: number;

  /**
   * Default: 'following'. The type of friend relationship to use. 'following' = users you follow, 'mutual' = users with mutual follows. One of: following, mutual
   */

  type?: 'following' | 'mutual';
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
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  app: AppResponseFields;
}

export interface GetBlockedUsersResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  /**
   * Array of blocked user object
   */
  blocks: BlockedUserResponse[];
}

export interface GetCommentRepliesResponse {
  duration: string;

  /**
   * Sort order used for the replies (first, last, top, best, controversial)
   */
  sort: string;

  /**
   * Threaded listing of replies to the comment
   */
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

  /**
   * Sort order used for the comments (first, last, top, best, controversial)
   */
  sort: string;

  /**
   * Threaded listing for the activity
   */
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

  /**
   * List of suggested feeds to follow
   */
  suggestions: FeedSuggestionResponse[];

  algorithm_used?: string;
}

export interface GetOGResponse {
  duration: string;

  custom: Record<string, any>;

  /**
   * URL of detected video or audio
   */
  asset_url?: string;

  author_icon?: string;

  /**
   * og:site
   */
  author_link?: string;

  /**
   * og:site_name
   */
  author_name?: string;

  color?: string;

  fallback?: string;

  footer?: string;

  footer_icon?: string;

  /**
   * URL of detected image
   */
  image_url?: string;

  /**
   * extracted url from the text
   */
  og_scrape_url?: string;

  original_height?: number;

  original_width?: number;

  pretext?: string;

  /**
   * og:description
   */
  text?: string;

  /**
   * URL of detected thumb image
   */
  thumb_url?: string;

  /**
   * og:title
   */
  title?: string;

  /**
   * og:url
   */
  title_link?: string;

  /**
   * Attachment type, could be empty, image, audio or video
   */
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

  friend_reactions_options?: FriendReactionsOptions;

  interest_weights?: Record<string, number>;

  member_pagination?: PagerRequest;
}

export interface GetOrCreateFeedResponse {
  created: boolean;

  /**
   * Duration of the request in milliseconds
   */
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

export interface GetUserGroupResponse {
  duration: string;

  user_group?: UserGroupResponse;
}

export interface GoogleVisionConfig {
  enabled?: boolean;
}

export interface HLSSettingsResponse {
  auto_on: boolean;

  enabled: boolean;

  quality_tracks: string[];

  layout: LayoutSettingsResponse;
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
  label_operator?: string;

  min_confidence?: number;

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
  min_confidence?: number;

  threshold?: number;

  time_window?: string;

  harm_labels?: string[];
}

export interface ImageSize {
  /**
   * Crop mode. One of: top, bottom, left, right, center
   */
  crop?: string;

  /**
   * Target image height
   */
  height?: number;

  /**
   * Resize method. One of: clip, crop, scale, fill
   */
  resize?: string;

  /**
   * Target image width
   */
  width?: number;
}

export interface ImageUploadRequest {
  file?: string;

  /**
   * field with JSON-encoded array of image size configurations
   */
  upload_sizes?: ImageSize[];

  user?: OnlyUserID;
}

export interface ImageUploadResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  file?: string;

  thumb_url?: string;

  /**
   * Array of image size configurations
   */
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
  mode: string;

  output_types?: string[];
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

export interface KeyframeRuleParameters {
  min_confidence?: number;

  threshold?: number;

  harm_labels?: string[];
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
  /**
   * Threshold for automatic message block
   */
  block?: number;

  /**
   * Threshold for automatic message flag
   */
  flag?: number;
}

export interface LayoutSettingsResponse {
  external_app_url: string;

  external_css_url: string;

  name: string;

  detect_orientation?: boolean;

  options?: Record<string, any>;
}

export interface LimitsSettingsResponse {
  max_participants_exclude_roles: string[];

  max_duration_seconds?: number;

  max_participants?: number;

  max_participants_exclude_owner?: boolean;
}

export interface ListBlockListResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  blocklists: BlockListResponse[];
}

export interface ListDevicesResponse {
  duration: string;

  /**
   * List of devices
   */
  devices: DeviceResponse[];
}

export interface ListUserGroupsResponse {
  duration: string;

  /**
   * List of user groups
   */
  user_groups: UserGroupResponse[];
}

export interface MarkActivityRequest {
  /**
   * Whether to mark all activities as read
   */
  mark_all_read?: boolean;

  /**
   * Whether to mark all activities as seen
   */
  mark_all_seen?: boolean;

  /**
   * List of activity IDs to mark as read
   */
  mark_read?: string[];

  /**
   * List of activity IDs to mark as seen
   */
  mark_seen?: string[];

  /**
   * List of activity IDs to mark as watched (for stories)
   */
  mark_watched?: string[];
}

export interface MarkReviewedRequestPayload {
  /**
   * Maximum content items to mark as reviewed
   */
  content_to_mark_as_reviewed_limit?: number;

  /**
   * Reason for the appeal decision
   */
  decision_reason?: string;

  /**
   * Skip marking content as reviewed
   */
  disable_marking_content_as_reviewed?: boolean;
}

export interface MembershipLevelResponse {
  /**
   * When the membership level was created
   */
  created_at: Date;

  /**
   * Unique identifier for the membership level
   */
  id: string;

  /**
   * Display name for the membership level
   */
  name: string;

  /**
   * Priority level
   */
  priority: number;

  /**
   * When the membership level was last updated
   */
  updated_at: Date;

  /**
   * Activity tags this membership level gives access to
   */
  tags: string[];

  /**
   * Description of the membership level
   */
  description?: string;

  /**
   * Custom data for the membership level
   */
  custom?: Record<string, any>;
}

export interface MessageResponse {
  /**
   * Channel unique identifier in <type>:<id> format
   */
  cid: string;

  /**
   * Date/time of creation
   */
  created_at: Date;

  deleted_reply_count: number;

  /**
   * Contains HTML markup of the message. Can only be set when using server-side API
   */
  html: string;

  /**
   * Message ID is unique string identifier of the message
   */
  id: string;

  /**
   * Whether the message mentioned the channel tag
   */
  mentioned_channel: boolean;

  /**
   * Whether the message mentioned online users with @here tag
   */
  mentioned_here: boolean;

  /**
   * Whether message is pinned or not
   */
  pinned: boolean;

  /**
   * Number of replies to this message
   */
  reply_count: number;

  /**
   * Whether the message was shadowed or not
   */
  shadowed: boolean;

  /**
   * Whether message is silent or not
   */
  silent: boolean;

  /**
   * Text of the message. Should be empty if `mml` is provided
   */
  text: string;

  /**
   * Contains type of the message. One of: regular, ephemeral, error, reply, system, deleted
   */
  type: string;

  /**
   * Date/time of the last update
   */
  updated_at: Date;

  /**
   * Array of message attachments
   */
  attachments: Attachment[];

  /**
   * List of 10 latest reactions to this message
   */
  latest_reactions: ReactionResponse[];

  /**
   * List of mentioned users
   */
  mentioned_users: UserResponse[];

  /**
   * List of 10 latest reactions of authenticated user to this message
   */
  own_reactions: ReactionResponse[];

  /**
   * A list of user ids that have restricted visibility to the message, if the list is not empty, the message is only visible to the users in the list
   */
  restricted_visibility: string[];

  custom: Record<string, any>;

  /**
   * An object containing number of reactions of each type. Key: reaction type (string), value: number of reactions (int)
   */
  reaction_counts: Record<string, number>;

  /**
   * An object containing scores of reactions of each type. Key: reaction type (string), value: total score of reactions (int)
   */
  reaction_scores: Record<string, number>;

  user: UserResponse;

  /**
   * Contains provided slash command
   */
  command?: string;

  /**
   * Date/time of deletion
   */
  deleted_at?: Date;

  deleted_for_me?: boolean;

  message_text_updated_at?: Date;

  /**
   * Should be empty if `text` is provided. Can only be set when using server-side API
   */
  mml?: string;

  /**
   * ID of parent message (thread)
   */
  parent_id?: string;

  /**
   * Date when pinned message expires
   */
  pin_expires?: Date;

  /**
   * Date when message got pinned
   */
  pinned_at?: Date;

  /**
   * Identifier of the poll to include in the message
   */
  poll_id?: string;

  quoted_message_id?: string;

  /**
   * Whether thread reply should be shown in the channel as well
   */
  show_in_channel?: boolean;

  /**
   * List of user group IDs mentioned in the message. Group members who are also channel members will receive push notifications based on their push preferences. Max 10 groups
   */
  mentioned_group_ids?: string[];

  /**
   * List of roles mentioned in the message (e.g. admin, channel_moderator, custom roles). Members with matching roles will receive push notifications based on their push preferences. Max 10 roles
   */
  mentioned_roles?: string[];

  /**
   * List of users who participate in thread
   */
  thread_participants?: UserResponse[];

  draft?: DraftResponse;

  /**
   * Object with translations. Key `language` contains the original language key. Other keys contain translations
   */
  i18n?: Record<string, string>;

  /**
   * Contains image moderation information
   */
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

export interface ModerationActionConfigResponse {
  /**
   * The action to take
   */
  action: string;

  /**
   * Description of what this action does
   */
  description: string;

  /**
   * Type of entity this action applies to
   */
  entity_type: string;

  /**
   * Icon for the dashboard
   */
  icon: string;

  /**
   * Display order (lower numbers shown first)
   */
  order: number;

  /**
   * Custom data for the action
   */
  custom?: Record<string, any>;
}

export interface ModerationCustomActionEvent {
  /**
   * The ID of the custom action that was executed
   */
  action_id: string;

  created_at: Date;

  custom: Record<string, any>;

  review_queue_item: ReviewQueueItemResponse;

  type: string;

  received_at?: Date;

  /**
   * Additional options passed to the custom action
   */
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

  moderation_payload?: ModerationPayloadResponse;

  review_queue_item?: ReviewQueueItemResponse;

  user?: UserResponse;
}

export interface ModerationFlaggedEvent {
  /**
   * The type of content that was flagged
   */
  content_type: string;

  created_at: Date;

  /**
   * The ID of the flagged content
   */
  object_id: string;

  custom: Record<string, any>;

  type: string;

  received_at?: Date;
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

export interface ModerationPayloadResponse {
  /**
   * Image URLs to moderate
   */
  images?: string[];

  /**
   * Text content to moderate
   */
  texts?: string[];

  /**
   * Video URLs to moderate
   */
  videos?: string[];

  /**
   * Custom data for moderation
   */
  custom?: Record<string, any>;
}

export interface ModerationV2Response {
  action: string;

  original_text: string;

  blocklist_matched?: string;

  platform_circumvented?: boolean;

  semantic_filter_matched?: string;

  blocklists_matched?: string[];

  image_harms?: string[];

  text_harms?: string[];
}

export interface MuteRequest {
  /**
   * User IDs to mute (if multiple users)
   */
  target_ids: string[];

  /**
   * Duration of mute in minutes
   */
  timeout?: number;
}

export interface MuteResponse {
  duration: string;

  /**
   * Object with mutes (if multiple users were muted)
   */
  mutes?: UserMuteResponse[];

  /**
   * A list of users that can't be found. Common cause for this is deleted users
   */
  non_existing_users?: string[];

  own_user?: OwnUserResponse;
}

export interface NoiseCancellationSettings {
  mode: string;
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * The ID of the feed
   */
  fid: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.notification_feed.updated" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  /**
   * Aggregated activities for notification feeds
   */
  aggregated_activities?: AggregatedActivityResponse[];

  notification_status?: NotificationStatusResponse;

  user?: UserResponseCommonFields;
}

export interface NotificationParentActivity {
  id: string;

  text?: string;

  type?: string;

  user_id?: string;

  attachments?: Attachment[];
}

export interface NotificationStatusResponse {
  /**
   * Number of unread notifications
   */
  unread: number;

  /**
   * Number of unseen notifications
   */
  unseen: number;

  /**
   * When notifications were last read
   */
  last_read_at?: Date;

  /**
   * When notifications were last seen
   */
  last_seen_at?: Date;

  /**
   * Deprecated: use is_read on each activity/group instead. IDs of activities that have been read. Capped at ~101 entries for aggregated feeds.
   */
  read_activities?: string[];

  /**
   * Deprecated: use is_seen on each activity/group instead. IDs of activities that have been seen. Capped at ~101 entries for aggregated feeds.
   */
  seen_activities?: string[];
}

export interface NotificationTarget {
  /**
   * The ID of the target (activity ID or user ID)
   */
  id: string;

  /**
   * The name of the target user (for user targets like follows)
   */
  name?: string;

  /**
   * The text content of the target activity (for activity targets)
   */
  text?: string;

  /**
   * The type of the target activity (for activity targets)
   */
  type?: string;

  /**
   * The ID of the user who created the target activity (for activity targets)
   */
  user_id?: string;

  /**
   * Attachments on the target activity (for activity targets)
   */
  attachments?: Attachment[];

  comment?: NotificationComment;

  /**
   * Custom data from the target activity
   */
  custom?: Record<string, any>;

  parent_activity?: NotificationParentActivity;
}

export interface NotificationTrigger {
  /**
   * Human-readable text describing the notification
   */
  text: string;

  /**
   * The type of notification (mention, reaction, comment, follow, etc.)
   */
  type: string;

  comment?: NotificationComment;

  /**
   * Custom data from the trigger object (comment, reaction, etc.)
   */
  custom?: Record<string, any>;
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
  /**
   * List of feed IDs to get own fields for
   */
  feeds: string[];

  /**
   * Optional list of specific fields to return. If not specified, all fields (own_follows, own_followings, own_capabilities, own_membership) are returned
   */
  fields?: string[];
}

export interface OwnBatchResponse {
  duration: string;

  /**
   * Map of feed ID to own fields data
   */
  data: Record<string, FeedOwnData>;
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

export interface PinActivityRequest {
  /**
   * If true, enriches the activity's current_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;
}

export interface PinActivityResponse {
  /**
   * When the activity was pinned
   */
  created_at: Date;

  duration: string;

  /**
   * Fully qualified ID of the feed the activity was pinned to
   */
  feed: string;

  /**
   * ID of the user who pinned the activity
   */
  user_id: string;

  activity: ActivityResponse;
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
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  poll_option: PollOptionResponseData;
}

export interface PollOptionResponseData {
  id: string;

  text: string;

  custom: Record<string, any>;
}

export interface PollResponse {
  /**
   * Duration of the request in milliseconds
   */
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
  /**
   * Duration of the request in milliseconds
   */
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
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  /**
   * Poll votes
   */
  votes: PollVoteResponseData[];

  next?: string;

  prev?: string;
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
  /**
   * Set the level of call push notifications for the user. One of: all, none, default
   */

  call_level?: 'all' | 'none' | 'default';

  /**
   * Set the push preferences for a specific channel. If empty it sets the default for the user
   */
  channel_cid?: string;

  /**
   * Set the level of chat push notifications for the user. Note: "mentions" is deprecated in favor of "direct_mentions". One of: all, mentions, direct_mentions, all_mentions, none, default
   */

  chat_level?:
    | 'all'
    | 'mentions'
    | 'direct_mentions'
    | 'all_mentions'
    | 'none'
    | 'default';

  /**
   * Disable push notifications till a certain time
   */
  disabled_until?: Date;

  /**
   * Set the level of feeds push notifications for the user. One of: all, none, default
   */

  feeds_level?: 'all' | 'none' | 'default';

  /**
   * Remove the disabled until time. (IE stop snoozing notifications)
   */
  remove_disable?: boolean;

  /**
   * The user id for which to set the push preferences. Required when using server side auths, defaults to current user with client side auth.
   */
  user_id?: string;

  chat_preferences?: ChatPreferencesInput;

  feeds_preferences?: FeedsPreferences;
}

export interface PushPreferencesResponse {
  call_level?: string;

  chat_level?: string;

  disabled_until?: Date;

  feeds_level?: string;

  chat_preferences?: ChatPreferencesResponse;

  feeds_preferences?: FeedsPreferencesResponse;
}

export interface QueryActivitiesRequest {
  enrich_own_fields?: boolean;

  include_soft_deleted_activities?: boolean;

  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filters to apply to the query. Supports location-based queries with 'near' and 'within_bounds' operators.
   */
  filter?: Record<string, any>;
}

export interface QueryActivitiesResponse {
  duration: string;

  /**
   * List of activities matching the query
   */
  activities: ActivityResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
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
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  reactions: FeedsReactionResponse[];

  next?: string;

  prev?: string;
}

export interface QueryAppealsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for appeals
   */
  sort?: SortParamRequest[];

  /**
   * Filter conditions for appeals
   */
  filter?: Record<string, any>;
}

export interface QueryAppealsResponse {
  duration: string;

  /**
   * List of Appeal Items
   */
  items: AppealItemResponse[];

  next?: string;

  prev?: string;
}

export interface QueryBookmarkFoldersRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filters to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryBookmarkFoldersResponse {
  duration: string;

  /**
   * List of bookmark folders matching the query
   */
  bookmark_folders: BookmarkFolderResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
  prev?: string;
}

export interface QueryBookmarksRequest {
  enrich_own_fields?: boolean;

  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filters to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryBookmarksResponse {
  duration: string;

  /**
   * List of bookmarks matching the query
   */
  bookmarks: BookmarkResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
  prev?: string;
}

export interface QueryCollectionsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filters to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryCollectionsResponse {
  duration: string;

  /**
   * List of collections matching the query
   */
  collections: CollectionResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
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
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  reactions: FeedsReactionResponse[];

  next?: string;

  prev?: string;
}

export interface QueryCommentsRequest {
  /**
   * MongoDB-style filter for querying comments
   */
  filter: Record<string, any>;

  /**
   * Returns the comment with the specified ID along with surrounding comments for context
   */
  id_around?: string;

  /**
   * Maximum number of comments to return
   */
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * first (oldest), last (newest) or top. One of: first, last, top, best, controversial
   */

  sort?: 'first' | 'last' | 'top' | 'best' | 'controversial';
}

export interface QueryCommentsResponse {
  duration: string;

  /**
   * List of comments matching the query
   */
  comments: CommentResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
  prev?: string;
}

export interface QueryFeedMembersRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sort parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filter parameters for the query
   */
  filter?: Record<string, any>;
}

export interface QueryFeedMembersResponse {
  duration: string;

  /**
   * List of feed members
   */
  members: FeedMemberResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
  prev?: string;
}

export interface QueryFeedsRequest {
  enrich_own_fields?: boolean;

  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Whether to subscribe to realtime updates
   */
  watch?: boolean;

  /**
   * Sorting parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filters to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryFeedsResponse {
  duration: string;

  /**
   * List of feeds matching the query
   */
  feeds: FeedResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
  prev?: string;
}

export interface QueryFollowsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filters to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryFollowsResponse {
  duration: string;

  /**
   * List of follow relationships matching the query
   */
  follows: FollowResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
  prev?: string;
}

export interface QueryModerationConfigsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for the results
   */
  sort?: SortParamRequest[];

  /**
   * Filter conditions for moderation configs
   */
  filter?: Record<string, any>;
}

export interface QueryModerationConfigsResponse {
  duration: string;

  /**
   * List of moderation configurations
   */
  configs: ConfigResponse[];

  next?: string;

  prev?: string;
}

export interface QueryPinnedActivitiesRequest {
  enrich_own_fields?: boolean;

  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Sorting parameters for the query
   */
  sort?: SortParamRequest[];

  /**
   * Filters to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryPinnedActivitiesResponse {
  duration: string;

  /**
   * List of pinned activities matching the query
   */
  pinned_activities: ActivityPinResponse[];

  /**
   * Cursor for next page
   */
  next?: string;

  /**
   * Cursor for previous page
   */
  prev?: string;
}

export interface QueryPollVotesRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Array of sort parameters
   */
  sort?: SortParamRequest[];

  /**
   * Filter to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryPollsRequest {
  limit?: number;

  next?: string;

  prev?: string;

  /**
   * Array of sort parameters
   */
  sort?: SortParamRequest[];

  /**
   * Filter to apply to the query
   */
  filter?: Record<string, any>;
}

export interface QueryPollsResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  /**
   * Polls data returned by the query
   */
  polls: PollResponseData[];

  next?: string;

  prev?: string;
}

export interface QueryReviewQueueRequest {
  limit?: number;

  /**
   * Number of items to lock (1-25)
   */
  lock_count?: number;

  /**
   * Duration for which items should be locked
   */
  lock_duration?: number;

  /**
   * Whether to lock items for review (true), unlock items (false), or just fetch (nil)
   */
  lock_items?: boolean;

  next?: string;

  prev?: string;

  /**
   * Whether to return only statistics
   */
  stats_only?: boolean;

  /**
   * Sorting parameters for the results
   */
  sort?: SortParamRequest[];

  /**
   * Filter conditions for review queue items
   */
  filter?: Record<string, any>;
}

export interface QueryReviewQueueResponse {
  duration: string;

  /**
   * List of review queue items
   */
  items: ReviewQueueItemResponse[];

  /**
   * Configuration for moderation actions
   */
  action_config: Record<string, ModerationActionConfigResponse[]>;

  /**
   * Statistics about the review queue
   */
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
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  /**
   * Array of users as result of filters applied.
   */
  users: FullUserResponse[];
}

export interface RTMPIngress {
  address: string;
}

export interface RTMPSettingsResponse {
  enabled: boolean;

  quality: string;

  layout: LayoutSettingsResponse;
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
  mode: string;
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
  /**
   * Count is the number of reactions of this type.
   */
  count: number;

  /**
   * FirstReactionAt is the time of the first reaction of this type. This is the same also if all reaction of this type are deleted, because if someone will react again with the same type, will be preserved the sorting.
   */
  first_reaction_at: Date;

  /**
   * LastReactionAt is the time of the last reaction of this type.
   */
  last_reaction_at: Date;

  /**
   * SumScores is the sum of all scores of reactions of this type. Medium allows you to clap articles more than once and shows the sum of all claps from all users. For example, you can send `clap` x5 using `score: 5`.
   */
  sum_scores: number;

  /**
   * The most recent users who reacted with this type, ordered by most recent first.
   */
  latest_reactions_by: ReactionGroupUserResponse[];
}

export interface ReactionGroupUserResponse {
  /**
   * The time when the user reacted.
   */
  created_at: Date;

  /**
   * The ID of the user who reacted.
   */
  user_id: string;

  user?: UserResponse;
}

export interface ReactionResponse {
  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * Message ID
   */
  message_id: string;

  /**
   * Score of the reaction
   */
  score: number;

  /**
   * Type of reaction
   */
  type: string;

  /**
   * Date/time of the last update
   */
  updated_at: Date;

  /**
   * User ID
   */
  user_id: string;

  /**
   * Custom data for this object
   */
  custom: Record<string, any>;

  user: UserResponse;
}

export interface ReadCollectionsResponse {
  duration: string;

  /**
   * List of collections matching the references
   */
  collections: CollectionResponse[];
}

export interface ReadReceiptsResponse {
  enabled: boolean;
}

export interface RecordSettingsResponse {
  audio_only: boolean;

  mode: string;

  quality: string;

  layout: LayoutSettingsResponse;
}

export interface RejectAppealRequestPayload {
  /**
   * Reason for rejecting the appeal
   */
  decision_reason: string;
}

export interface RejectFeedMemberInviteRequest {}

export interface RejectFeedMemberInviteResponse {
  duration: string;

  member: FeedMemberResponse;
}

export interface RejectFollowRequest {
  /**
   * Fully qualified ID of the source feed
   */
  source: string;

  /**
   * Fully qualified ID of the target feed
   */
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

export interface RemoveUserGroupMembersRequest {
  /**
   * List of user IDs to remove
   */
  member_ids: string[];

  team_id?: string;
}

export interface RemoveUserGroupMembersResponse {
  duration: string;

  user_group?: UserGroupResponse;
}

export interface RepliesMeta {
  /**
   * True if the subtree was cut because the requested depth was reached.
   */
  depth_truncated: boolean;

  /**
   * True if more siblings exist in the database.
   */
  has_more: boolean;

  /**
   * Number of unread siblings that match current filters.
   */
  remaining: number;

  /**
   * Opaque cursor to request the next page of siblings.
   */
  next_cursor?: string;
}

export interface Response {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;
}

export interface RestoreActionRequestPayload {
  /**
   * Reason for the appeal decision
   */
  decision_reason?: string;
}

export interface RestoreActivityRequest {}

export interface RestoreActivityResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface RestoreCommentRequest {}

export interface RestoreCommentResponse {
  duration: string;

  activity: ActivityResponse;

  comment: CommentResponse;
}

export interface ReviewQueueItemResponse {
  /**
   * AI-determined text severity
   */
  ai_text_severity: string;

  /**
   * When the item was created
   */
  created_at: Date;

  /**
   * ID of the entity being reviewed
   */
  entity_id: string;

  /**
   * Type of entity being reviewed
   */
  entity_type: string;

  flags_count: number;

  /**
   * Unique identifier of the review queue item
   */
  id: string;

  latest_moderator_action: string;

  /**
   * Suggested moderation action
   */
  recommended_action: string;

  /**
   * ID of the moderator who reviewed the item
   */
  reviewed_by: string;

  /**
   * Severity level of the content
   */
  severity: number;

  /**
   * Current status of the review
   */
  status: string;

  /**
   * When the item was last updated
   */
  updated_at: Date;

  /**
   * Moderation actions taken
   */
  actions: ActionLogResponse[];

  /**
   * Associated ban records
   */
  bans: BanInfoResponse[];

  /**
   * Associated flag records
   */
  flags: ModerationFlagResponse[];

  /**
   * Detected languages in the content
   */
  languages: string[];

  /**
   * When the review was completed
   */
  completed_at?: Date;

  config_key?: string;

  /**
   * ID of who created the entity
   */
  entity_creator_id?: string;

  /**
   * When the item was reviewed
   */
  reviewed_at?: Date;

  /**
   * Teams associated with this item
   */
  teams?: string[];

  activity?: EnrichedActivity;

  appeal?: AppealItemResponse;

  assigned_to?: UserResponse;

  call?: CallResponse;

  entity_creator?: EntityCreatorResponse;

  feeds_v2_activity?: EnrichedActivity;

  feeds_v2_reaction?: Reaction;

  feeds_v3_activity?: FeedsV3ActivityResponse;

  feeds_v3_comment?: FeedsV3CommentResponse;

  message?: MessageResponse;

  moderation_payload?: ModerationPayloadResponse;

  reaction?: Reaction;
}

export interface RingSettingsResponse {
  auto_cancel_timeout_ms: number;

  incoming_call_timeout_ms: number;

  missed_call_timeout_ms: number;
}

export interface RuleBuilderAction {
  skip_inbox?: boolean;

  type?:
    | 'ban_user'
    | 'flag_user'
    | 'flag_content'
    | 'block_content'
    | 'shadow_content'
    | 'bounce_flag_content'
    | 'bounce_content'
    | 'bounce_remove_content'
    | 'mute_video'
    | 'mute_audio'
    | 'blur'
    | 'call_blur'
    | 'end_call'
    | 'kick_user'
    | 'warning'
    | 'call_warning'
    | 'webhook_only';

  ban_options?: BanOptions;

  call_options?: CallActionOptions;

  flag_user_options?: FlagUserOptions;
}

export interface RuleBuilderCondition {
  confidence?: number;

  type?: string;

  call_custom_property_params?: CallCustomPropertyParameters;

  call_type_rule_params?: CallTypeRuleParameters;

  call_violation_count_params?: CallViolationCountParameters;

  closed_caption_rule_params?: ClosedCaptionRuleParameters;

  content_count_rule_params?: ContentCountRuleParameters;

  content_flag_count_rule_params?: FlagCountRuleParameters;

  image_content_params?: ImageContentParameters;

  image_rule_params?: ImageRuleParameters;

  keyframe_rule_params?: KeyframeRuleParameters;

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

  cooldown_period?: string;

  id?: string;

  logic?: string;

  action_sequences?: CallRuleActionSequence[];

  conditions?: RuleBuilderCondition[];

  groups?: RuleBuilderConditionGroup[];

  action?: RuleBuilderAction;
}

export interface SRTIngress {
  address: string;
}

export interface ScreensharingSettingsResponse {
  access_request_enabled: boolean;

  enabled: boolean;

  target_resolution?: TargetResolution;
}

export interface SearchUserGroupsResponse {
  duration: string;

  /**
   * List of matching user groups
   */
  user_groups: UserGroupResponse[];
}

export interface SessionSettingsResponse {
  inactivity_timeout_seconds: number;
}

export interface ShadowBlockActionRequestPayload {
  /**
   * Reason for shadow blocking
   */
  reason?: string;
}

export interface SharedLocationResponse {
  /**
   * Channel CID
   */
  channel_cid: string;

  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * Device ID that created the live location
   */
  created_by_device_id: string;

  duration: string;

  /**
   * Latitude coordinate
   */
  latitude: number;

  /**
   * Longitude coordinate
   */
  longitude: number;

  /**
   * Message ID
   */
  message_id: string;

  /**
   * Date/time of the last update
   */
  updated_at: Date;

  /**
   * User ID
   */
  user_id: string;

  /**
   * Time when the live location expires
   */
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

  /**
   * Whether a notification activity was successfully created
   */
  notification_created?: boolean;
}

export interface SortParam {
  direction: number;

  field: string;

  type: string;
}

export interface SortParamRequest {
  /**
   * Direction of sorting, 1 for Ascending, -1 for Descending, default is 1. One of: -1, 1
   */
  direction?: number;

  /**
   * Name of field to sort by
   */
  field?: string;

  /**
   * Type of field to sort by. Empty string or omitted means string type (default). One of: number, boolean
   */
  type?: string;
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
  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * The ID of the feed
   */
  fid: string;

  custom: Record<string, any>;

  /**
   * The type of event: "feeds.stories_feed.updated" in this case
   */
  type: string;

  feed_visibility?: string;

  received_at?: Date;

  /**
   * Individual activities for stories feeds
   */
  activities?: ActivityResponse[];

  /**
   * Aggregated activities for stories feeds
   */
  aggregated_activities?: AggregatedActivityResponse[];

  user?: UserResponseCommonFields;
}

export interface SubmitActionRequest {
  /**
   * Type of moderation action to perform. One of: mark_reviewed, delete_message, delete_activity, delete_comment, delete_reaction, ban, custom, unban, restore, delete_user, unblock, block, shadow_block, unmask, kick_user, end_call
   */

  action_type:
    | 'flag'
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

  /**
   * UUID of the appeal to act on (required for reject_appeal, optional for other actions)
   */
  appeal_id?: string;

  /**
   * UUID of the review queue item to act on
   */
  item_id?: string;

  ban?: BanActionRequestPayload;

  block?: BlockActionRequestPayload;

  custom?: CustomActionRequestPayload;

  delete_activity?: DeleteActivityRequestPayload;

  delete_comment?: DeleteCommentRequestPayload;

  delete_message?: DeleteMessageRequestPayload;

  delete_reaction?: DeleteReactionRequestPayload;

  delete_user?: DeleteUserRequestPayload;

  flag?: FlagRequest;

  mark_reviewed?: MarkReviewedRequestPayload;

  reject_appeal?: RejectAppealRequestPayload;

  restore?: RestoreActionRequestPayload;

  shadow_block?: ShadowBlockActionRequestPayload;

  unban?: UnbanActionRequestPayload;

  unblock?: UnblockActionRequestPayload;
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

  label_operator?: string;

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

  /**
   * Status of the comment. One of: active, deleted, removed, hidden
   */

  status: 'active' | 'deleted' | 'removed' | 'hidden' | 'shadow_blocked';

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

  /**
   * Slice of nested comments (may be empty).
   */
  replies?: ThreadedCommentResponse[];

  custom?: Record<string, any>;

  meta?: RepliesMeta;

  moderation?: ModerationV2Response;

  reaction_groups?: Record<string, FeedsReactionGroupResponse>;
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

export interface Timestamp {
  time?: Date;
}

export interface TrackActivityMetricsEvent {
  /**
   * The ID of the activity to track the metric for
   */
  activity_id: string;

  /**
   * The metric name (e.g. views, clicks, impressions). Alphanumeric and underscores only.
   */
  metric: string;

  /**
   * The amount to increment (positive) or decrement (negative). Defaults to 1. The absolute value counts against rate limits.
   */
  delta?: number;
}

export interface TrackActivityMetricsEventResult {
  /**
   * The activity ID from the request
   */
  activity_id: string;

  /**
   * Whether the metric was counted (false if rate-limited)
   */
  allowed: boolean;

  /**
   * The metric name from the request
   */
  metric: string;

  /**
   * Error message if processing failed
   */
  error?: string;
}

export interface TrackActivityMetricsRequest {
  /**
   * List of metric events to track (max 100 per request)
   */
  events: TrackActivityMetricsEvent[];
}

export interface TrackActivityMetricsResponse {
  duration: string;

  /**
   * Results for each event in the request, in the same order
   */
  results: TrackActivityMetricsEventResult[];
}

export interface TranscriptionSettingsResponse {
  closed_caption_mode: string;

  language: string;

  mode: string;

  speech_segment_config?: SpeechSegmentConfig;

  translation?: TranslationSettings;
}

export interface TranslationSettings {
  enabled: boolean;

  languages: string[];
}

export interface TypingIndicatorsResponse {
  enabled: boolean;
}

export interface UnbanActionRequestPayload {
  /**
   * Channel CID for channel-specific unban
   */
  channel_cid?: string;

  /**
   * Reason for the appeal decision
   */
  decision_reason?: string;
}

export interface UnblockActionRequestPayload {
  /**
   * Reason for the appeal decision
   */
  decision_reason?: string;
}

export interface UnblockUsersRequest {
  blocked_user_id: string;
}

export interface UnblockUsersResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;
}

export interface UnfollowBatchRequest {
  /**
   * List of follow relationships to remove, each with optional keep_history
   */
  follows: UnfollowPair[];

  /**
   * Whether to delete the corresponding notification activity (default: false)
   */
  delete_notification_activity?: boolean;

  /**
   * If true, enriches the follow's source_feed and target_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;
}

export interface UnfollowBatchResponse {
  duration: string;

  /**
   * List of follow relationships that were removed
   */
  follows: FollowResponse[];
}

export interface UnfollowPair {
  /**
   * Fully qualified ID of the source feed
   */
  source: string;

  /**
   * Fully qualified ID of the target feed
   */
  target: string;

  /**
   * When true, activities from the unfollowed feed will remain in the source feed's timeline (default: false)
   */
  keep_history?: boolean;
}

export interface UnfollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface UnpinActivityResponse {
  duration: string;

  /**
   * Fully qualified ID of the feed the activity was unpinned from
   */
  feed: string;

  /**
   * ID of the user who unpinned the activity
   */
  user_id: string;

  activity: ActivityResponse;
}

export interface UpdateActivityPartialRequest {
  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * If true, enriches the activity's current_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;

  /**
   * If true, creates notification activities for newly mentioned users and deletes notifications for users no longer mentioned
   */
  handle_mention_notifications?: boolean;

  /**
   * If true, runs activity processors on the updated activity. Processors will only run if the activity text and/or attachments are changed. Defaults to false.
   */
  run_activity_processors?: boolean;

  /**
   * List of field names to remove. Supported fields: 'custom', 'visibility_tag', 'location', 'expires_at', 'filter_tags', 'interest_tags', 'attachments', 'poll_id', 'mentioned_user_ids', 'search_data'. Use dot-notation for nested custom fields (e.g., 'custom.field_name')
   */
  unset?: string[];

  /**
   * Map of field names to new values. Supported fields: 'text', 'attachments', 'custom', 'visibility', 'visibility_tag', 'restrict_replies' (values: 'everyone', 'people_i_follow', 'nobody'), 'location', 'expires_at', 'filter_tags', 'interest_tags', 'poll_id', 'feeds', 'mentioned_user_ids', 'search_data'. For custom fields, use dot-notation (e.g., 'custom.field_name')
   */
  set?: Record<string, any>;
}

export interface UpdateActivityPartialResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface UpdateActivityRequest {
  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * If true, enriches the activity's current_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;

  /**
   * Time when the activity will expire
   */
  expires_at?: Date;

  /**
   * If true, creates notification activities for newly mentioned users and deletes notifications for users no longer mentioned
   */
  handle_mention_notifications?: boolean;

  /**
   * Poll ID
   */
  poll_id?: string;

  /**
   * Controls who can add comments/replies to this activity. One of: everyone, people_i_follow, nobody
   */

  restrict_replies?: 'everyone' | 'people_i_follow' | 'nobody';

  /**
   * If true, runs activity processors on the updated activity. Processors will only run if the activity text and/or attachments are changed. Defaults to false.
   */
  run_activity_processors?: boolean;

  /**
   * Whether to skip URL enrichment for the activity
   */
  skip_enrich_url?: boolean;

  /**
   * The text content of the activity
   */
  text?: string;

  /**
   * Visibility setting for the activity
   */

  visibility?: 'public' | 'private' | 'tag';

  /**
   * If visibility is 'tag', this is the tag name and is required
   */
  visibility_tag?: string;

  /**
   * List of attachments for the activity
   */
  attachments?: Attachment[];

  /**
   * Collections that this activity references
   */
  collection_refs?: string[];

  /**
   * List of feeds the activity is present in
   */
  feeds?: string[];

  /**
   * Tags used for filtering the activity
   */
  filter_tags?: string[];

  /**
   * Tags indicating interest categories
   */
  interest_tags?: string[];

  /**
   * List of user IDs mentioned in the activity
   */
  mentioned_user_ids?: string[];

  /**
   * Custom data for the activity
   */
  custom?: Record<string, any>;

  location?: ActivityLocation;

  /**
   * Additional data for search indexing
   */
  search_data?: Record<string, any>;
}

export interface UpdateActivityResponse {
  duration: string;

  activity: ActivityResponse;
}

export interface UpdateBlockListRequest {
  is_leet_check_enabled?: boolean;

  is_plural_check_enabled?: boolean;

  team?: string;

  /**
   * List of words to block
   */
  words?: string[];
}

export interface UpdateBlockListResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  blocklist?: BlockListResponse;
}

export interface UpdateBookmarkFolderRequest {
  /**
   * Name of the folder
   */
  name?: string;

  /**
   * Custom data for the folder
   */
  custom?: Record<string, any>;
}

export interface UpdateBookmarkFolderResponse {
  duration: string;

  bookmark_folder: BookmarkFolderResponse;
}

export interface UpdateBookmarkRequest {
  /**
   * ID of the folder to move the bookmark to
   */
  folder_id?: string;

  new_folder_id?: string;

  /**
   * Custom data for the bookmark
   */
  custom?: Record<string, any>;

  new_folder?: AddFolderRequest;
}

export interface UpdateBookmarkResponse {
  duration: string;

  bookmark: BookmarkResponse;
}

export interface UpdateCollectionRequest {
  /**
   * Unique identifier for the collection within its name
   */
  id: string;

  /**
   * Name/type of the collection
   */
  name: string;

  /**
   * Custom data for the collection (required, must contain at least one key)
   */
  custom: Record<string, any>;
}

export interface UpdateCollectionsRequest {
  /**
   * List of collections to update (only custom data is updatable)
   */
  collections: UpdateCollectionRequest[];
}

export interface UpdateCollectionsResponse {
  duration: string;

  /**
   * List of updated collections
   */
  collections: CollectionResponse[];
}

export interface UpdateCommentPartialRequest {
  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to handle mention notification changes
   */
  handle_mention_notifications?: boolean;

  /**
   * Whether to skip URL enrichment
   */
  skip_enrich_url?: boolean;

  /**
   * Whether to skip push notifications
   */
  skip_push?: boolean;

  /**
   * List of field names to remove. Supported fields: 'custom', 'attachments', 'mentioned_user_ids', 'status'. Use dot-notation for nested custom fields (e.g., 'custom.field_name')
   */
  unset?: string[];

  /**
   * Map of field names to new values. Supported fields: 'text', 'attachments', 'custom', 'mentioned_user_ids', 'status'. Use dot-notation for nested custom fields (e.g., 'custom.field_name')
   */
  set?: Record<string, any>;
}

export interface UpdateCommentPartialResponse {
  duration: string;

  comment: CommentResponse;
}

export interface UpdateCommentRequest {
  /**
   * Updated text content of the comment
   */
  comment?: string;

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * If true, creates notification activities for newly mentioned users and deletes notifications for users no longer mentioned
   */
  handle_mention_notifications?: boolean;

  /**
   * Whether to skip URL enrichment for this comment
   */
  skip_enrich_url?: boolean;

  skip_push?: boolean;

  /**
   * Updated media attachments for the comment. Providing this field will replace all existing attachments.
   */
  attachments?: Attachment[];

  /**
   * List of user IDs mentioned in the comment
   */
  mentioned_user_ids?: string[];

  /**
   * Updated custom data for the comment
   */
  custom?: Record<string, any>;
}

export interface UpdateCommentResponse {
  duration: string;

  comment: CommentResponse;
}

export interface UpdateFeedMembersRequest {
  /**
   * Type of update operation to perform. One of: upsert, remove, set
   */

  operation: 'upsert' | 'remove' | 'set';

  limit?: number;

  next?: string;

  prev?: string;

  /**
   * List of members to upsert, remove, or set
   */
  members?: FeedMemberRequest[];
}

export interface UpdateFeedMembersResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  added: FeedMemberResponse[];

  removed_ids: string[];

  updated: FeedMemberResponse[];
}

export interface UpdateFeedRequest {
  /**
   * Description of the feed
   */
  description?: string;

  /**
   * If true, enriches the feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;

  /**
   * Name of the feed
   */
  name?: string;

  /**
   * Tags used for filtering feeds
   */
  filter_tags?: string[];

  /**
   * Custom data for the feed
   */
  custom?: Record<string, any>;
}

export interface UpdateFeedResponse {
  duration: string;

  feed: FeedResponse;
}

export interface UpdateFollowRequest {
  /**
   * Fully qualified ID of the source feed
   */
  source: string;

  /**
   * Fully qualified ID of the target feed
   */
  target: string;

  /**
   * @deprecated
   * Deprecated: use notification_context.trigger.custom and notification_context.target.custom instead
   */
  copy_custom_to_notification?: boolean;

  /**
   * Whether to create a notification activity for this follow
   */
  create_notification_activity?: boolean;

  /**
   * If true, enriches the follow's source_feed and target_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;

  follower_role?: string;

  /**
   * Push preference for the follow relationship
   */

  push_preference?: 'all' | 'none';

  /**
   * Whether to skip push for this follow
   */
  skip_push?: boolean;

  /**
   * Custom data for the follow relationship
   */
  custom?: Record<string, any>;
}

export interface UpdateFollowResponse {
  duration: string;

  follow: FollowResponse;
}

export interface UpdateLiveLocationRequest {
  /**
   * Live location ID
   */
  message_id: string;

  /**
   * Time when the live location expires
   */
  end_at?: Date;

  /**
   * Latitude coordinate
   */
  latitude?: number;

  /**
   * Longitude coordinate
   */
  longitude?: number;
}

export interface UpdatePollOptionRequest {
  /**
   * Option ID
   */
  id: string;

  /**
   * Option text
   */
  text: string;

  custom?: Record<string, any>;
}

export interface UpdatePollPartialRequest {
  /**
   * Array of field names to unset
   */
  unset?: string[];

  /**
   * Sets new field values
   */
  set?: Record<string, any>;
}

export interface UpdatePollRequest {
  /**
   * Poll ID
   */
  id: string;

  /**
   * Poll name
   */
  name: string;

  /**
   * Allow answers
   */
  allow_answers?: boolean;

  /**
   * Allow user suggested options
   */
  allow_user_suggested_options?: boolean;

  /**
   * Poll description
   */
  description?: string;

  /**
   * Enforce unique vote
   */
  enforce_unique_vote?: boolean;

  /**
   * Is closed
   */
  is_closed?: boolean;

  /**
   * Max votes allowed
   */
  max_votes_allowed?: number;

  /**
   * Voting visibility
   */

  voting_visibility?: 'anonymous' | 'public';

  /**
   * Poll options
   */
  options?: PollOptionRequest[];

  custom?: Record<string, any>;
}

export interface UpdateUserGroupRequest {
  /**
   * The new description for the group
   */
  description?: string;

  /**
   * The new name of the user group
   */
  name?: string;

  team_id?: string;
}

export interface UpdateUserGroupResponse {
  duration: string;

  user_group?: UserGroupResponse;
}

export interface UpdateUserPartialRequest {
  /**
   * User ID to update
   */
  id: string;

  unset?: string[];

  set?: Record<string, any>;
}

export interface UpdateUsersPartialRequest {
  users: UpdateUserPartialRequest[];
}

export interface UpdateUsersRequest {
  /**
   * Object containing users
   */
  users: Record<string, UserRequest>;
}

export interface UpdateUsersResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  membership_deletion_task_id: string;

  /**
   * Object containing users
   */
  users: Record<string, FullUserResponse>;
}

export interface UpsertActivitiesRequest {
  /**
   * List of activities to create or update
   */
  activities: ActivityRequest[];

  /**
   * If true, enriches the activities' current_feed with own_* fields (own_follows, own_followings, own_capabilities, own_membership). Defaults to false for performance.
   */
  enrich_own_fields?: boolean;
}

export interface UpsertActivitiesResponse {
  duration: string;

  /**
   * List of created or updated activities
   */
  activities: ActivityResponse[];

  /**
   * Total number of mention notification activities created for mentioned users across all activities
   */
  mention_notifications_created?: number;
}

export interface UpsertConfigRequest {
  /**
   * Unique identifier for the moderation configuration
   */
  key: string;

  /**
   * Whether moderation should be performed asynchronously
   */
  async?: boolean;

  /**
   * Team associated with the configuration
   */
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
  /**
   * A list of push preferences for channels, calls, or the user.
   */
  preferences: PushPreferenceInput[];
}

export interface UpsertPushPreferencesResponse {
  /**
   * Duration of the request in milliseconds
   */
  duration: string;

  /**
   * The channel specific push notification preferences, only returned for channels you've edited.
   */
  user_channel_preferences: Record<
    string,
    Record<string, ChannelPushPreferencesResponse | null>
  >;

  /**
   * The user preferences, always returned regardless if you edited it
   */
  user_preferences: Record<string, PushPreferencesResponse>;
}

export interface User {
  id: string;

  data?: Record<string, any>;
}

export interface UserBannedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  custom: Record<string, any>;

  user: UserResponseCommonFields;

  /**
   * The type of event: "user.banned" in this case
   */
  type: string;

  /**
   * The ID of the channel where the target user was banned
   */
  channel_id?: string;

  channel_member_count?: number;

  channel_message_count?: number;

  /**
   * The type of the channel where the target user was banned
   */
  channel_type?: string;

  /**
   * The CID of the channel where the target user was banned
   */
  cid?: string;

  /**
   * The expiration date of the ban
   */
  expiration?: Date;

  /**
   * The reason for the ban
   */
  reason?: string;

  received_at?: Date;

  /**
   * Whether the user was shadow banned
   */
  shadow?: boolean;

  /**
   * The team of the channel where the target user was banned
   */
  team?: string;

  total_bans?: number;

  channel_custom?: Record<string, any>;

  created_by?: UserResponseCommonFields;
}

export interface UserCreatedWithinParameters {
  max_age?: string;
}

export interface UserCustomPropertyParameters {
  operator?: string;

  property_key?: string;
}

export interface UserDeactivatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  custom: Record<string, any>;

  user: UserResponseCommonFields;

  /**
   * The type of event: "user.deactivated" in this case
   */
  type: string;

  received_at?: Date;

  created_by?: UserResponseCommonFields;
}

export interface UserGroupMember {
  app_pk: number;

  created_at: Date;

  group_id: string;

  is_admin: boolean;

  user_id: string;
}

export interface UserGroupResponse {
  created_at: Date;

  id: string;

  name: string;

  updated_at: Date;

  created_by?: string;

  description?: string;

  team_id?: string;

  members?: UserGroupMember[];
}

export interface UserIdenticalContentCountParameters {
  threshold?: number;

  time_window?: string;
}

export interface UserMuteResponse {
  created_at: Date;

  updated_at: Date;

  expires?: Date;

  target?: UserResponse;

  user?: UserResponse;
}

export interface UserReactivatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  custom: Record<string, any>;

  user: UserResponseCommonFields;

  /**
   * The type of event: "user.reactivated" in this case
   */
  type: string;

  received_at?: Date;

  created_by?: UserResponseCommonFields;
}

export interface UserRequest {
  /**
   * User ID
   */
  id: string;

  /**
   * User's profile image URL
   */
  image?: string;

  invisible?: boolean;

  language?: string;

  /**
   * Optional name of user
   */
  name?: string;

  /**
   * Custom user data
   */
  custom?: Record<string, any>;

  privacy_settings?: PrivacySettingsResponse;
}

export interface UserResponse {
  /**
   * Whether a user is banned or not
   */
  banned: boolean;

  /**
   * Date/time of creation
   */
  created_at: Date;

  /**
   * Unique user identifier
   */
  id: string;

  /**
   * Preferred language of a user
   */
  language: string;

  /**
   * Whether a user online or not
   */
  online: boolean;

  /**
   * Determines the set of user permissions
   */
  role: string;

  /**
   * Date/time of the last update
   */
  updated_at: Date;

  blocked_user_ids: string[];

  /**
   * List of teams user is a part of
   */
  teams: string[];

  /**
   * Custom data for this object
   */
  custom: Record<string, any>;

  avg_response_time?: number;

  /**
   * Date of deactivation
   */
  deactivated_at?: Date;

  /**
   * Date/time of deletion
   */
  deleted_at?: Date;

  image?: string;

  /**
   * Date of last activity
   */
  last_active?: Date;

  /**
   * Optional name of user
   */
  name?: string;

  /**
   * Revocation date for tokens
   */
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

export interface UserUnbannedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  custom: Record<string, any>;

  user: UserResponseCommonFields;

  /**
   * The type of event: "user.unbanned" in this case
   */
  type: string;

  /**
   * The ID of the channel where the target user was unbanned
   */
  channel_id?: string;

  channel_member_count?: number;

  channel_message_count?: number;

  /**
   * The type of the channel where the target user was unbanned
   */
  channel_type?: string;

  /**
   * The CID of the channel where the target user was unbanned
   */
  cid?: string;

  received_at?: Date;

  /**
   * Whether the target user was shadow unbanned
   */
  shadow?: boolean;

  /**
   * The team of the channel where the target user was unbanned
   */
  team?: string;

  channel_custom?: Record<string, any>;

  created_by?: UserResponseCommonFields;
}

export interface UserUpdatedEvent {
  /**
   * Date/time of creation
   */
  created_at: Date;

  custom: Record<string, any>;

  user: UserResponsePrivacyFields;

  /**
   * The type of event: "user.updated" in this case
   */
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
  label_operator?: string;

  harm_labels?: string[];
}

export interface VideoEndCallRequestPayload {}

export interface VideoKickUserRequestPayload {}

export interface VideoRuleParameters {
  threshold?: number;

  time_window?: string;

  harm_labels?: string[];
}

export interface VideoSettingsResponse {
  access_request_enabled: boolean;

  camera_default_on: boolean;

  camera_facing: string;

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
  /**
   * JWT token for authentication
   */
  token: string;

  user_details: ConnectUserDetailsRequest;

  /**
   * List of products to subscribe to. One of: chat, video, feeds
   */
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
  | ({ type: 'feeds.comment.restored' } & CommentRestoredEvent)
  | ({ type: 'feeds.comment.updated' } & CommentUpdatedEvent)
  | ({ type: 'feeds.feed.created' } & FeedCreatedEvent)
  | ({ type: 'feeds.feed.deleted' } & FeedDeletedEvent)
  | ({ type: 'feeds.feed.updated' } & FeedUpdatedEvent)
  | ({ type: 'feeds.feed_group.changed' } & FeedGroupChangedEvent)
  | ({ type: 'feeds.feed_group.deleted' } & FeedGroupDeletedEvent)
  | ({ type: 'feeds.feed_group.restored' } & FeedGroupRestoredEvent)
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
  | ({ type: 'user.reactivated' } & UserReactivatedEvent)
  | ({ type: 'user.unbanned' } & UserUnbannedEvent)
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
  | ({ type: 'feeds.comment.restored' } & CommentRestoredEvent)
  | ({ type: 'feeds.comment.updated' } & CommentUpdatedEvent)
  | ({ type: 'feeds.feed.created' } & FeedCreatedEvent)
  | ({ type: 'feeds.feed.deleted' } & FeedDeletedEvent)
  | ({ type: 'feeds.feed.updated' } & FeedUpdatedEvent)
  | ({ type: 'feeds.feed_group.changed' } & FeedGroupChangedEvent)
  | ({ type: 'feeds.feed_group.deleted' } & FeedGroupDeletedEvent)
  | ({ type: 'feeds.feed_group.restored' } & FeedGroupRestoredEvent)
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
  | ({ type: 'user.reactivated' } & UserReactivatedEvent)
  | ({ type: 'user.unbanned' } & UserUnbannedEvent)
  | ({ type: 'user.updated' } & UserUpdatedEvent);

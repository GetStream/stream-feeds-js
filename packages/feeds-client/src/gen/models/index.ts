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
  created_at: Date;

  duration: string;

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

export interface AddFeedMembersRequest {
  new_members: string[];
}

export interface AddFeedMembersResponse {
  duration: string;
}

export interface DeleteFeedResponse {
  duration: string;
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

  members: FeedMember[];

  created_by: UserResponse;

  custom?: Record<string, any>;
}

export interface FeedMember {
  banned: boolean;

  created_at: Date;

  feed_group: string;

  feed_id: string;

  invited: boolean;

  role: string;

  shadow_banned: boolean;

  status: string;

  updated_at: Date;

  user: UserResponse;

  ban_expires_at?: Date;

  ban_reason?: string;

  invite_accepted_at?: Date;

  invite_rejected_at?: Date;

  custom?: Record<string, any>;
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

export interface GetFeedResponse {
  duration: string;

  feed: Feed;
}

export interface GetOrCreateFeedRequest {
  visibility_level:
    | 'public'
    | 'visible'
    | 'followers'
    | 'private'
    | 'restricted';

  members?: string[];

  custom?: Record<string, any>;
}

export interface GetOrCreateFeedResponse {
  duration: string;

  feed: Feed;
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

export interface ReadFlatFeedResponse {
  duration: string;

  activities: Activity[];
}

export interface RemoveActivityFromFeedResponse {
  duration: string;
}

export interface RemoveFeedMembersResponse {
  duration: string;
}

export interface SortParamRequest {
  direction?: number;

  field?: string;
}

export interface UnfollowResponse {
  duration: string;

  unfollowed: boolean;
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

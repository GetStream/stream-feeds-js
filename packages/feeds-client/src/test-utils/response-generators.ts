import {
  ActivityPinResponse,
  ActivityResponse,
  BookmarkFolderResponse,
  BookmarkResponse,
  FeedMemberResponse,
  CommentResponse,
  FeedResponse,
  FeedsReactionResponse,
  FollowResponse,
  OwnUser,
  OwnUserResponse,
  PinActivityResponse,
  UserResponse,
} from '../gen/models';
import { humanId } from 'human-id';
import { EventPayload } from '../types-internal';

export const getHumanId = () => humanId({ capitalize: false, separator: '-' });

export const generateUserResponse = (
  overrides: Partial<UserResponse> = {},
): UserResponse => ({
  id: `user-${getHumanId()}`,
  name: humanId({ separator: ' ' }),
  created_at: new Date(),
  updated_at: new Date(),
  banned: false,
  language: 'en',
  online: false,
  role: 'user',
  blocked_user_ids: [],
  teams: [],
  custom: {},
  ...overrides,
});

export const generateOwnUserResponse = (
  overrides: Partial<OwnUserResponse> = {},
): OwnUserResponse => ({
  ...generateUserResponse({
    id: `own-user-${getHumanId()}`,
  }),
  invisible: false,
  total_unread_count: 0,
  unread_channels: 0,
  unread_count: 0,
  unread_threads: 0,
  channel_mutes: [],
  devices: [],
  mutes: [],
  ...overrides,
});

export const generateOwnUser = (overrides: Partial<OwnUser> = {}): OwnUser => ({
  ...generateOwnUserResponse(),
  devices: [],
  mutes: [],
  total_unread_count_by_team: {},
  ...overrides,
});

export const generateFeedResponse = (
  overrides: Omit<Partial<FeedResponse>, 'created_by' | 'fid'> & {
    created_by?: Partial<UserResponse>;
  } = {},
): FeedResponse => {
  const id = overrides.id || `feed-${getHumanId()}`;
  const groupId = overrides.group_id || 'user';
  const feed = `${groupId}:${id}`;

  return {
    id,
    group_id: groupId,
    created_at: new Date(),
    updated_at: new Date(),
    description: humanId({
      addAdverb: true,
      adjectiveCount: 4,
      separator: ' ',
    }),
    follower_count: 0,
    following_count: 0,
    member_count: 0,
    name: humanId({ separator: ' ' }),
    pin_count: 0,
    custom: {},
    ...overrides,
    feed,
    created_by: generateUserResponse(overrides.created_by),
  };
};

export const generateFollowResponse = (
  overrides: Partial<FollowResponse> = {},
): FollowResponse => {
  const sourceFeedResponse = generateFeedResponse();
  const targetFeedResponse = generateFeedResponse();

  return {
    created_at: new Date(),
    updated_at: new Date(),
    follower_role: 'user',
    push_preference: 'all',
    status: 'accepted',
    source_feed: sourceFeedResponse,
    target_feed: targetFeedResponse,
    ...overrides,
  };
};

export const generateActivityResponse = (
  overrides: Omit<Partial<ActivityResponse>, 'user'> & {
    user?: Partial<UserResponse>;
  } = {},
): ActivityResponse => {
  return {
    id: getHumanId(),
    type: 'test',
    created_at: new Date(),
    updated_at: new Date(),
    visibility: 'public',
    bookmark_count: 0,
    comment_count: 0,
    reaction_count: 0,
    share_count: 0,
    attachments: [],
    comments: [],
    feeds: [],
    filter_tags: [],
    interest_tags: [],
    latest_reactions: [],
    mentioned_users: [],
    own_bookmarks: [],
    own_reactions: [],
    custom: {},
    reaction_groups: {},
    search_data: {},
    popularity: 0,
    score: 0,
    ...overrides,
    user: generateUserResponse(overrides.user),
  };
};

export const generateFeedReactionResponse = (
  overrides: Omit<Partial<FeedsReactionResponse>, 'user'> & {
    user?: Partial<UserResponse>;
  } = {},
): FeedsReactionResponse => {
  const user = generateUserResponse(overrides.user);
  return {
    type: 'like',
    activity_id: getHumanId(),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
    user,
  };
};

export const generateCommentResponse = (
  overrides: Omit<Partial<CommentResponse>, 'user'> & {
    user?: Parameters<typeof generateUserResponse>[0];
  } = {},
): CommentResponse => {
  const user = generateUserResponse(overrides.user);
  const sharedId = getHumanId();
  return {
    id: `comment-${sharedId}`,
    object_id: `activity-${sharedId}`,
    object_type: 'activity',
    confidence_score: 1,
    created_at: new Date(),
    updated_at: new Date(),
    score: 0,
    reaction_count: 0,
    reply_count: 0,
    upvote_count: 0,
    downvote_count: 0,
    mentioned_users: [],
    own_reactions: [],
    status: '',
    ...overrides,
    user,
  };
};

export const generateActivityPinResponse = (
  overrides: Omit<Partial<ActivityPinResponse>, 'activity' | 'user'> & {
    activity?: Partial<ActivityResponse>;
    user?: Partial<UserResponse>;
  } = {},
): ActivityPinResponse => {
  return {
    created_at: new Date(),
    updated_at: new Date(),
    feed: getHumanId(),
    ...overrides,
    activity: generateActivityResponse(overrides.activity),
    user: generateUserResponse(overrides.user),
  };
};

export const generateBookmarkFolderResponse = (
  overrides: Partial<BookmarkFolderResponse> = {},
): BookmarkFolderResponse => ({
  id: `bookmark-folder-${getHumanId()}`,
  name: humanId(),
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const generateBookmarkResponse = (
  overrides: Omit<Partial<BookmarkResponse>, 'activity' | 'user'> & {
    activity?: Partial<ActivityResponse>;
    user?: Partial<UserResponse>;
  } = {},
): BookmarkResponse => ({
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
  activity: generateActivityResponse(overrides.activity),
  user: generateUserResponse(overrides.user),
});

export const generateFeedMemberResponse = (
  overrides: Omit<Partial<FeedMemberResponse>, 'user'> & {
    user?: Partial<UserResponse>;
  } = {},
): FeedMemberResponse => ({
  created_at: new Date(),
  updated_at: new Date(),
  role: 'feed_member',
  status: 'member',
  custom: {},
  ...overrides,
  user: generateUserResponse(overrides.user),
});

// event generators
export function generateActivityReactionAddedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.activity.reaction.added'>>,
    'activity' | 'type' | 'reaction' | 'user'
  > & {
    activity?: Parameters<typeof generateActivityResponse>[0];
    reaction?: Parameters<typeof generateFeedReactionResponse>[0];
    user?: Parameters<typeof generateUserResponse>[0];
  } = {},
): EventPayload<'feeds.activity.reaction.added'> {
  const activity = generateActivityResponse(overrides.activity);
  const reaction = generateFeedReactionResponse(overrides.reaction);
  const user = generateUserResponse(overrides.user);

  return {
    type: 'feeds.activity.reaction.added',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    user,
    reaction,
    activity,
  };
}

export function generateActivityReactionDeletedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.activity.reaction.deleted'>>,
    'user' | 'activity' | 'reaction'
  > & {
    activity?: Parameters<typeof generateActivityResponse>[0];
    reaction?: Parameters<typeof generateFeedReactionResponse>[0];
    user?: Parameters<typeof generateUserResponse>[0];
  } = {},
): EventPayload<'feeds.activity.reaction.deleted'> {
  const activity = generateActivityResponse(overrides.activity);
  const reaction = generateFeedReactionResponse(overrides.reaction);
  const user = generateUserResponse(overrides.user);
  return {
    type: 'feeds.activity.reaction.deleted',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    user,
    reaction,
    activity,
  };
}

export function generateActivityUpdatedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.activity.updated'>>,
    'activity' | 'type'
  > & {
    activity?: Parameters<typeof generateActivityResponse>[0];
  } = {},
): EventPayload<'feeds.activity.updated'> {
  const activity = generateActivityResponse(overrides.activity);
  return {
    type: 'feeds.activity.updated',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    activity,
  };
}

export function generateActivityAddedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.activity.added'>>,
    'activity' | 'type'
  > & {
    activity?: Parameters<typeof generateActivityResponse>[0];
  } = {},
): EventPayload<'feeds.activity.added'> {
  const activity = generateActivityResponse(overrides.activity);
  return {
    type: 'feeds.activity.added',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    activity,
  };
}

export function generateActivityDeletedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.activity.deleted'>>,
    'activity' | 'type'
  > & {
    activity?: Parameters<typeof generateActivityResponse>[0];
  } = {},
): EventPayload<'feeds.activity.deleted'> {
  const activity = generateActivityResponse(overrides.activity);
  return {
    type: 'feeds.activity.deleted',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    activity,
  };
}

export function generateBookmarkAddedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.bookmark.added'>>,
    'bookmark' | 'user'
  > & {
    bookmark?: Parameters<typeof generateBookmarkResponse>[0];
    user?: Parameters<typeof generateUserResponse>[0];
  } = {},
): EventPayload<'feeds.bookmark.added'> {
  const bookmark = generateBookmarkResponse(overrides.bookmark);
  const user = generateUserResponse(overrides.user);
  return {
    type: 'feeds.bookmark.added',
    created_at: new Date(),
    custom: {},
    ...overrides,
    bookmark,
    user,
  };
}

export function generateBookmarkDeletedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.bookmark.deleted'>>,
    'bookmark' | 'user'
  > & {
    bookmark?: Parameters<typeof generateBookmarkResponse>[0];
    user?: Parameters<typeof generateUserResponse>[0];
  } = {},
): EventPayload<'feeds.bookmark.deleted'> {
  const bookmark = generateBookmarkResponse(overrides.bookmark);
  const user = generateUserResponse(overrides.user);
  return {
    type: 'feeds.bookmark.deleted',
    created_at: new Date(),
    custom: {},
    ...overrides,
    bookmark,
    user,
  };
}

export function generateBookmarkUpdatedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.bookmark.updated'>>,
    'bookmark' | 'user'
  > & {
    bookmark?: Parameters<typeof generateBookmarkResponse>[0];
    user?: Parameters<typeof generateUserResponse>[0];
  } = {},
): EventPayload<'feeds.bookmark.updated'> {
  const bookmark = generateBookmarkResponse(overrides.bookmark);
  const user = generateUserResponse(overrides.user);
  return {
    type: 'feeds.bookmark.updated',
    created_at: new Date(),
    custom: {},
    ...overrides,
    bookmark,
    user,
  };
}

export function generateCommentAddedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.comment.added'>>,
    'comment' | 'type'
  > & { comment?: Parameters<typeof generateCommentResponse>[0] } = {},
): EventPayload<'feeds.comment.added'> {
  const comment = generateCommentResponse(overrides.comment);
  return {
    type: 'feeds.comment.added',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    comment,
  };
}

export function generateCommentDeletedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.comment.deleted'>>,
    'comment' | 'type'
  > & { comment?: Parameters<typeof generateCommentResponse>[0] } = {},
): EventPayload<'feeds.comment.deleted'> {
  const comment = generateCommentResponse(overrides.comment);
  return {
    type: 'feeds.comment.deleted',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    comment,
  };
}

export function generateCommentUpdatedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.comment.updated'>>,
    'comment' | 'type'
  > & { comment?: Parameters<typeof generateCommentResponse>[0] } = {},
): EventPayload<'feeds.comment.updated'> {
  const comment = generateCommentResponse(overrides.comment);
  return {
    type: 'feeds.comment.updated',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    comment,
  };
}

export function generateCommentReactionAddedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.comment.reaction.added'>>,
    'comment' | 'reaction' | 'type'
  > & {
    comment?: Parameters<typeof generateCommentResponse>[0];
    reaction?: Parameters<typeof generateFeedReactionResponse>[0];
  } = {},
): EventPayload<'feeds.comment.reaction.added'> {
  const comment = generateCommentResponse(overrides.comment);
  const reaction = generateFeedReactionResponse(overrides.reaction);
  return {
    type: 'feeds.comment.reaction.added',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    comment,
    reaction,
  };
}

export function generateCommentReactionDeletedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.comment.reaction.deleted'>>,
    'comment' | 'reaction' | 'type'
  > & {
    comment?: Parameters<typeof generateCommentResponse>[0];
    reaction?: Parameters<typeof generateFeedReactionResponse>[0];
  } = {},
): EventPayload<'feeds.comment.reaction.deleted'> {
  const comment = generateCommentResponse(overrides.comment);
  const reaction = generateFeedReactionResponse(overrides.reaction);
  return {
    type: 'feeds.comment.reaction.deleted',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    comment,
    reaction,
  };
}

export function generateFeedMemberAddedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.feed_member.added'>>,
    'member' | 'type'
  > & {
    member?: Parameters<typeof generateFeedMemberResponse>[0];
  } = {},
): EventPayload<'feeds.feed_member.added'> {
  const member = generateFeedMemberResponse(overrides.member);
  return {
    type: 'feeds.feed_member.added',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    member,
  };
}

export function generateFeedMemberRemovedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.feed_member.removed'>>,
    'type'
  > = {},
): EventPayload<'feeds.feed_member.removed'> {
  return {
    member_id: getHumanId(),
    type: 'feeds.feed_member.removed',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
  };
}

export function generateFeedMemberUpdatedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.feed_member.updated'>>,
    'member' | 'type'
  > & {
    member?: Parameters<typeof generateFeedMemberResponse>[0];
  } = {},
): EventPayload<'feeds.feed_member.updated'> {
  const member = generateFeedMemberResponse(overrides.member);
  return {
    type: 'feeds.feed_member.updated',
    created_at: new Date(),
    fid: '',
    custom: {},
    ...overrides,
    member,
  };
}

export function generateActivityPinnedEvent(
  overrides: Omit<
    Partial<EventPayload<'feeds.activity.pinned'>>,
    'pinned_activity' | 'user'
  > & {
    pinned_activity?: Parameters<typeof generateActivityPinResponse>[0];
    user?: Parameters<typeof generateUserResponse>[0];
  } = {},
): EventPayload<'feeds.activity.pinned'> {
  const pinnedActivity = generateActivityPinResponse(overrides.pinned_activity);
  const user = generateUserResponse(overrides.user);

  // FIXME(TEMPORARY): re-map ActivityPinResponse to PinActivityResponse
  const typeAdjustedPinnedActivity: PinActivityResponse = {
    ...pinnedActivity,
    user_id: pinnedActivity.user.id,
    duration: '0',
  };

  return {
    type: 'feeds.activity.pinned',
    created_at: pinnedActivity.created_at,
    fid: pinnedActivity.feed,
    custom: {},
    ...overrides,
    pinned_activity: typeAdjustedPinnedActivity,
    user,
  };
}

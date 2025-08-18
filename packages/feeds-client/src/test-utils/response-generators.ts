import {
  FeedResponse,
  FollowResponse,
  OwnUser,
  OwnUserResponse,
  UserResponse,
} from '../gen/models';
import { humanId } from 'human-id';

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

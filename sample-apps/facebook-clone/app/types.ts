export type FeedCid = string;

export type FollowStatus =
  | 'following'
  | 'follow-request-sent'
  | 'invited'
  | 'needs-invite'
  | 'not-followed';

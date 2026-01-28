export interface User {
  id: string;
  name: string;
  image: string;
  visibility_level: 'visible' | 'private';
}

export interface PollOption {
  text: string;
}

export interface Poll {
  name: string;
  description: string;
  voting_visibility: 'public' | 'anonymous';
  enforce_unique_vote: boolean;
  max_votes_allowed: number;
  allow_user_suggested_options: boolean;
  allow_answers: boolean;
  options: PollOption[];
}

// Note: For Attachment, use the type from @stream-io/node-sdk

export type Feature =
  | 'link'
  | 'attachment'
  | 'mention'
  | 'poll'
  | 'reaction'
  | 'comment'
  | 'bookmark'
  | 'repost';

export interface FeatureProbabilities {
  link: number;
  attachment: number;
  mention: number;
  poll: number;
  reaction: number;
  comment: number;
  bookmark: number;
  repost: number;
}

export interface DownloadResult {
  index: number;
  success: boolean;
  file?: string;
  error?: string;
}

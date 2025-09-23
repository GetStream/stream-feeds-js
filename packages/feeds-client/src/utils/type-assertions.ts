import type {
  AddCommentReactionResponse,
  AddReactionResponse,
  DeleteActivityReactionResponse,
  CommentResponse,
  DeleteCommentReactionResponse,
  FollowResponse,
} from '../gen/models';
import type { StreamFile } from '../types';

export const isFollowResponse = (data: object): data is FollowResponse => {
  return 'source_feed' in data && 'target_feed' in data;
};

export const isReactionResponse = (
  data: object,
): data is
  | AddReactionResponse
  | AddCommentReactionResponse
  | DeleteActivityReactionResponse
  | DeleteCommentReactionResponse => {
  return 'reaction' in data && ('activity' in data || 'comment' in data);
};

export const isCommentResponse = (
  entity: object,
): entity is CommentResponse => {
  return typeof (entity as CommentResponse)?.object_id === 'string';
};

export const isImageFile = (file: StreamFile) => {
  // photoshop files begin with 'image/'
  return file.type.startsWith('image/') && !file.type.endsWith('.photoshop');
};

export const isVideoFile = (file: StreamFile) => {
  return file.type.startsWith('video/');
};

import {
  AddCommentReactionResponse,
  AddReactionResponse,
  CommentResponse,
  DeleteCommentReactionResponse,
  FollowResponse,
} from '../gen/models';
import { StreamFile } from '../types';
import { CommentParent } from '../types';
import { DeleteReactionResponse } from '@stream-io/node-sdk';

export const isFollowResponse = (data: object): data is FollowResponse => {
  return 'source_feed' in data && 'target_feed' in data;
};

export const isReactionResponse = (
  data: object,
): data is (
  | AddReactionResponse
  | AddCommentReactionResponse
  | DeleteReactionResponse
  | DeleteCommentReactionResponse
) => {
  return (
    'reaction' in data &&
    ('activity' in data || 'comment' in data)
  );
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

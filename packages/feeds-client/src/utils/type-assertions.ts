import { CommentResponse, FeedResponse, FollowResponse } from '../gen/models';
import { StreamFile } from '../types';
import { CommentParent } from '../types';

export const isFollowResponse = (data: object): data is FollowResponse => {
  return 'source_feed' in data && 'target_feed' in data;
};

export const isFeedResponse = (data: object): data is FeedResponse => {
  return 'created_by' in data;
};

export const isCommentResponse = (
  entity: CommentParent,
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

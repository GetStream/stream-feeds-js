import { WSEvent } from '../models';
import { decoders } from '../model-decoders/decoders';

const eventDecoderMapping: {
  [key in WSEvent['type']]: (data: Record<string, any>) => WSEvent;
} = {
  'activity.added': (data: Record<string, any>) =>
    decoders.ActivityAddedEvent(data),

  'activity.reaction.added': (data: Record<string, any>) =>
    decoders.ReactionAddedEvent(data),

  'activity.reaction.removed': (data: Record<string, any>) =>
    decoders.ReactionRemovedEvent(data),

  'activity.removed': (data: Record<string, any>) =>
    decoders.ActivityRemovedEvent(data),

  'activity.updated': (data: Record<string, any>) =>
    decoders.ActivityUpdatedEvent(data),

  'bookmark.added': (data: Record<string, any>) =>
    decoders.BookmarkAddedEvent(data),

  'bookmark.removed': (data: Record<string, any>) =>
    decoders.BookmarkRemovedEvent(data),

  'bookmark.updated': (data: Record<string, any>) =>
    decoders.BookmarkUpdatedEvent(data),

  'comment.added': (data: Record<string, any>) =>
    decoders.CommentAddedEvent(data),

  'comment.removed': (data: Record<string, any>) =>
    decoders.CommentRemovedEvent(data),

  'comment.updated': (data: Record<string, any>) =>
    decoders.CommentUpdatedEvent(data),

  'feed.created': (data: Record<string, any>) =>
    decoders.FeedCreatedEvent(data),

  'feed.removed': (data: Record<string, any>) =>
    decoders.FeedRemovedEvent(data),

  'feed_group.changed': (data: Record<string, any>) =>
    decoders.FeedGroupChangedEvent(data),

  'feed_group.removed': (data: Record<string, any>) =>
    decoders.FeedGroupRemovedEvent(data),

  'follow.added': (data: Record<string, any>) =>
    decoders.FollowAddedEvent(data),

  'follow.removed': (data: Record<string, any>) =>
    decoders.FollowRemovedEvent(data),

  'follow.updated': (data: Record<string, any>) =>
    decoders.FollowUpdatedEvent(data),
};

export const decodeWSEvent = (data: { type: string } & Record<string, any>) => {
  if (Object.hasOwn(eventDecoderMapping, data.type)) {
    return eventDecoderMapping[data.type as WSEvent['type']](data);
  } else {
    return data;
  }
};

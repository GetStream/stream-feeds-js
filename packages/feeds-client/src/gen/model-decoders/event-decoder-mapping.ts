import { WSEvent } from '../models';
import { decoders } from '../model-decoders/decoders';

const eventDecoderMapping: {
  [key in WSEvent['type']]: (data: Record<string, any>) => WSEvent;
} = {
  'feeds.activity_added': (data: Record<string, any>) =>
    decoders.ActivityAddedEvent(data),

  'feeds.activity_comment_new': (data: Record<string, any>) =>
    decoders.CommentAddedEvent(data),

  'feeds.activity_comment_removed': (data: Record<string, any>) =>
    decoders.CommentRemovedEvent(data),

  'feeds.activity_comment_updated': (data: Record<string, any>) =>
    decoders.CommentUpdatedEvent(data),

  'feeds.activity_reaction_deleted': (data: Record<string, any>) =>
    decoders.ActivityReactionDeletedEvent(data),

  'feeds.activity_reaction_new': (data: Record<string, any>) =>
    decoders.ActivityReactionNewEvent(data),

  'feeds.activity_reaction_updated': (data: Record<string, any>) =>
    decoders.ActivityReactionUpdatedEvent(data),

  'feeds.activity_removed': (data: Record<string, any>) =>
    decoders.ActivityRemovedEvent(data),

  'feeds.activity_updated': (data: Record<string, any>) =>
    decoders.ActivityUpdatedEvent(data),

  'feeds.comment_reaction_deleted': (data: Record<string, any>) =>
    decoders.CommentReactionDeletedEvent(data),

  'feeds.comment_reaction_new': (data: Record<string, any>) =>
    decoders.CommentReactionNewEvent(data),

  'feeds.comment_reaction_updated': (data: Record<string, any>) =>
    decoders.CommentReactionUpdatedEvent(data),

  'feeds.feed_deleted': (data: Record<string, any>) =>
    decoders.FeedDeletedEvent(data),

  'feeds.member_added': (data: Record<string, any>) =>
    decoders.FeedMemberAddedEvent(data),

  'feeds.member_removed': (data: Record<string, any>) =>
    decoders.FeedMemberRemovedEvent(data),

  'feeds.member_updated': (data: Record<string, any>) =>
    decoders.FeedMemberUpdatedEvent(data),

  'feeds.notification.follow': (data: Record<string, any>) =>
    decoders.NotificationFollowEvent(data),

  'feeds.notification.follow_request_created': (data: Record<string, any>) =>
    decoders.NotificationFollowRequestEvent(data),

  'feeds.notification.follow_request_updated': (data: Record<string, any>) =>
    decoders.NotificationFollowRequestEvent(data),

  'feeds.notification.member_added': (data: Record<string, any>) =>
    decoders.NotificationFeedMemberAddedEvent(data),

  'feeds.notification.member_invited': (data: Record<string, any>) =>
    decoders.NotificationFeedMemberInvitedEvent(data),

  'feeds.notification.member_removed': (data: Record<string, any>) =>
    decoders.NotificationFeedMemberRemovedEvent(data),

  'feeds.notification.unfollow': (data: Record<string, any>) =>
    decoders.NotificationUnfollowEvent(data),
};

export const decodeWSEvent = (data: { type: string } & Record<string, any>) => {
  if (Object.hasOwn(eventDecoderMapping, data.type)) {
    return eventDecoderMapping[data.type as WSEvent['type']](data);
  } else {
    return data;
  }
};

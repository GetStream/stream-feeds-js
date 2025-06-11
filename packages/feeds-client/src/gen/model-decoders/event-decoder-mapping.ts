import { WSEvent } from '../models';
import { decoders } from '../model-decoders/decoders';

const eventDecoderMapping: {
  [key in WSEvent['type']]: (data: Record<string, any>) => WSEvent;
} = {
  'activity.added': (data: Record<string, any>) =>
    decoders.ActivityAddedEvent(data),

  'activity.deleted': (data: Record<string, any>) =>
    decoders.ActivityDeletedEvent(data),

  'activity.reaction.added': (data: Record<string, any>) =>
    decoders.ActivityReactionAddedEvent(data),

  'activity.reaction.deleted': (data: Record<string, any>) =>
    decoders.ActivityReactionDeletedEvent(data),

  'activity.removed_from_feed': (data: Record<string, any>) =>
    decoders.ActivityRemovedFromFeedEvent(data),

  'activity.updated': (data: Record<string, any>) =>
    decoders.ActivityUpdatedEvent(data),

  'bookmark.added': (data: Record<string, any>) =>
    decoders.BookmarkAddedEvent(data),

  'bookmark.deleted': (data: Record<string, any>) =>
    decoders.BookmarkDeletedEvent(data),

  'bookmark.updated': (data: Record<string, any>) =>
    decoders.BookmarkUpdatedEvent(data),

  'comment.added': (data: Record<string, any>) =>
    decoders.CommentAddedEvent(data),

  'comment.deleted': (data: Record<string, any>) =>
    decoders.CommentDeletedEvent(data),

  'comment.reaction.added': (data: Record<string, any>) =>
    decoders.CommentReactionAddedEvent(data),

  'comment.reaction.deleted': (data: Record<string, any>) =>
    decoders.CommentReactionDeletedEvent(data),

  'comment.updated': (data: Record<string, any>) =>
    decoders.CommentUpdatedEvent(data),

  'feed.created': (data: Record<string, any>) =>
    decoders.FeedCreatedEvent(data),

  'feed.deleted': (data: Record<string, any>) =>
    decoders.FeedDeletedEvent(data),

  'feed.updated': (data: Record<string, any>) =>
    decoders.FeedUpdatedEvent(data),

  'feed_group.changed': (data: Record<string, any>) =>
    decoders.FeedGroupChangedEvent(data),

  'feed_group.deleted': (data: Record<string, any>) =>
    decoders.FeedGroupDeletedEvent(data),

  'feed_member.added': (data: Record<string, any>) =>
    decoders.FeedMemberAddedEvent(data),

  'feed_member.removed': (data: Record<string, any>) =>
    decoders.FeedMemberRemovedEvent(data),

  'feed_member.updated': (data: Record<string, any>) =>
    decoders.FeedMemberUpdatedEvent(data),

  'feeds.poll.closed': (data: Record<string, any>) =>
    decoders.PollClosedFeedEvent(data),

  'feeds.poll.deleted': (data: Record<string, any>) =>
    decoders.PollDeletedFeedEvent(data),

  'feeds.poll.updated': (data: Record<string, any>) =>
    decoders.PollUpdatedFeedEvent(data),

  'feeds.poll.vote_casted': (data: Record<string, any>) =>
    decoders.PollVoteCastedFeedEvent(data),

  'feeds.poll.vote_changed': (data: Record<string, any>) =>
    decoders.PollVoteChangedFeedEvent(data),

  'feeds.poll.vote_removed': (data: Record<string, any>) =>
    decoders.PollVoteRemovedFeedEvent(data),

  'follow.created': (data: Record<string, any>) =>
    decoders.FollowCreatedEvent(data),

  'follow.deleted': (data: Record<string, any>) =>
    decoders.FollowDeletedEvent(data),

  'follow.updated': (data: Record<string, any>) =>
    decoders.FollowUpdatedEvent(data),

  'poll.closed': (data: Record<string, any>) => decoders.PollClosedEvent(data),

  'poll.deleted': (data: Record<string, any>) =>
    decoders.PollDeletedEvent(data),

  'poll.updated': (data: Record<string, any>) =>
    decoders.PollUpdatedEvent(data),
};

export const decodeWSEvent = (data: { type: string } & Record<string, any>) => {
  if (Object.hasOwn(eventDecoderMapping, data.type)) {
    return eventDecoderMapping[data.type as WSEvent['type']](data);
  } else {
    return data;
  }
};

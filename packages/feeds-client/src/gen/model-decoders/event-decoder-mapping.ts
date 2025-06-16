import { WSEvent } from '../models';
import { decoders } from '../model-decoders/decoders';

const eventDecoderMapping: {
  [key in WSEvent['type']]: (data: Record<string, any>) => WSEvent;
} = {
  'feeds.activity.added': (data: Record<string, any>) =>
    decoders.ActivityAddedEvent(data),

  'feeds.activity.deleted': (data: Record<string, any>) =>
    decoders.ActivityDeletedEvent(data),

  'feeds.activity.marked': (data: Record<string, any>) =>
    decoders.ActivityMarkEvent(data),

  'feeds.activity.pinned': (data: Record<string, any>) =>
    decoders.ActivityPinnedEvent(data),

  'feeds.activity.reaction.added': (data: Record<string, any>) =>
    decoders.ActivityReactionAddedEvent(data),

  'feeds.activity.reaction.deleted': (data: Record<string, any>) =>
    decoders.ActivityReactionDeletedEvent(data),

  'feeds.activity.removed_from_feed': (data: Record<string, any>) =>
    decoders.ActivityRemovedFromFeedEvent(data),

  'feeds.activity.unpinned': (data: Record<string, any>) =>
    decoders.ActivityUnpinnedEvent(data),

  'feeds.activity.updated': (data: Record<string, any>) =>
    decoders.ActivityUpdatedEvent(data),

  'feeds.bookmark.added': (data: Record<string, any>) =>
    decoders.BookmarkAddedEvent(data),

  'feeds.bookmark.deleted': (data: Record<string, any>) =>
    decoders.BookmarkDeletedEvent(data),

  'feeds.bookmark.updated': (data: Record<string, any>) =>
    decoders.BookmarkUpdatedEvent(data),

  'feeds.comment.added': (data: Record<string, any>) =>
    decoders.CommentAddedEvent(data),

  'feeds.comment.deleted': (data: Record<string, any>) =>
    decoders.CommentDeletedEvent(data),

  'feeds.comment.reaction.added': (data: Record<string, any>) =>
    decoders.CommentReactionAddedEvent(data),

  'feeds.comment.reaction.deleted': (data: Record<string, any>) =>
    decoders.CommentReactionDeletedEvent(data),

  'feeds.comment.updated': (data: Record<string, any>) =>
    decoders.CommentUpdatedEvent(data),

  'feeds.feed.created': (data: Record<string, any>) =>
    decoders.FeedCreatedEvent(data),

  'feeds.feed.deleted': (data: Record<string, any>) =>
    decoders.FeedDeletedEvent(data),

  'feeds.feed.updated': (data: Record<string, any>) =>
    decoders.FeedUpdatedEvent(data),

  'feeds.feed_group.changed': (data: Record<string, any>) =>
    decoders.FeedGroupChangedEvent(data),

  'feeds.feed_group.deleted': (data: Record<string, any>) =>
    decoders.FeedGroupDeletedEvent(data),

  'feeds.feed_member.added': (data: Record<string, any>) =>
    decoders.FeedMemberAddedEvent(data),

  'feeds.feed_member.removed': (data: Record<string, any>) =>
    decoders.FeedMemberRemovedEvent(data),

  'feeds.feed_member.updated': (data: Record<string, any>) =>
    decoders.FeedMemberUpdatedEvent(data),

  'feeds.follow.created': (data: Record<string, any>) =>
    decoders.FollowCreatedEvent(data),

  'feeds.follow.deleted': (data: Record<string, any>) =>
    decoders.FollowDeletedEvent(data),

  'feeds.follow.updated': (data: Record<string, any>) =>
    decoders.FollowUpdatedEvent(data),

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
};

export const decodeWSEvent = (data: { type: string } & Record<string, any>) => {
  if (Object.hasOwn(eventDecoderMapping, data.type)) {
    return eventDecoderMapping[data.type as WSEvent['type']](data);
  } else {
    return data;
  }
};

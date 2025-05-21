type Decoder = (i: any) => any;

type TypeMapping = Record<string, { type: string; isSingle: boolean }>;

export const decoders: Record<string, Decoder> = {};

const decodeDatetimeType = (input: number | string) =>
  typeof input === 'number'
    ? new Date(Math.floor(input / 1000000))
    : new Date(input);

decoders.DatetimeType = decodeDatetimeType;

const decode = (typeMappings: TypeMapping, input?: Record<string, any>) => {
  if (!input || Object.keys(typeMappings).length === 0) return input;

  Object.keys(typeMappings).forEach((key) => {
    if (input[key] != null) {
      if (typeMappings[key]) {
        const decoder = decoders[typeMappings[key].type];
        if (decoder) {
          if (typeMappings[key].isSingle) {
            input[key] = decoder(input[key]);
          } else {
            Object.keys(input[key]).forEach((k) => {
              input[key][k] = decoder(input[key][k]);
            });
          }
        }
      }
    }
  });

  return input;
};

decoders.AcceptFeedMemberResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed_member: { type: 'FeedMember', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AcceptFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'Follow', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Activity = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    comments: { type: 'Comment', isSingle: false },

    latest_reactions: { type: 'ActivityReaction', isSingle: false },

    mentioned_users: { type: 'UserResponse', isSingle: false },

    own_bookmarks: { type: 'Bookmark', isSingle: false },

    own_reactions: { type: 'ActivityReaction', isSingle: false },

    reaction_groups: { type: 'ReactionGroup', isSingle: false },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    edited_at: { type: 'DatetimeType', isSingle: true },

    expires_at: { type: 'DatetimeType', isSingle: true },

    current_feed: { type: 'Feed', isSingle: true },

    parent: { type: 'BaseActivity', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'Activity', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'Activity', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityPin = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityReaction = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityReactionAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    reaction: { type: 'ActivityReaction', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityReactionDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    reaction: { type: 'ActivityReaction', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityRemovedFromFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'Activity', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'Activity', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'Activity', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddBookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark: { type: 'Bookmark', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddCommentReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reaction: { type: 'ActivityReaction', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comment: { type: 'Comment', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddCommentsBatchResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'Comment', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.AddReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reaction: { type: 'ActivityReaction', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AggregatedActivity = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    activities: { type: 'Activity', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.BaseActivity = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    comments: { type: 'Comment', isSingle: false },

    latest_reactions: { type: 'ActivityReaction', isSingle: false },

    mentioned_users: { type: 'UserResponse', isSingle: false },

    own_bookmarks: { type: 'Bookmark', isSingle: false },

    own_reactions: { type: 'ActivityReaction', isSingle: false },

    reaction_groups: { type: 'ReactionGroup', isSingle: false },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    edited_at: { type: 'DatetimeType', isSingle: true },

    expires_at: { type: 'DatetimeType', isSingle: true },

    current_feed: { type: 'Feed', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Bookmark = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    folder: { type: 'BookmarkFolder', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    bookmark: { type: 'Bookmark', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkFolder = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    bookmark: { type: 'Bookmark', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Comment = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    latest_reactions: { type: 'ActivityReaction', isSingle: false },

    reaction_groups: { type: 'ReactionGroup', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.CommentAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'Comment', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'Comment', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentReactionAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    reaction: { type: 'ActivityReaction', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentReactionRemovedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'Comment', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CreateManyFeedsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feeds: { type: 'Feed', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.DeleteBookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark: { type: 'Bookmark', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Feed = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    owner: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedCreatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    members: { type: 'FeedMember', isSingle: false },

    feed: { type: 'Feed', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedGroupChangedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedGroupDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedMember = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    request_accepted_at: { type: 'DatetimeType', isSingle: true },

    request_rejected_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    feed: { type: 'Feed', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Follow = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    source_feed: { type: 'Feed', isSingle: true },

    target_feed: { type: 'Feed', isSingle: true },

    request_accepted_at: { type: 'DatetimeType', isSingle: true },

    request_rejected_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    follow: { type: 'Follow', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowManyResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follows: { type: 'Follow', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.FollowRemovedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    follow: { type: 'Follow', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'Follow', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    follow: { type: 'Follow', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'Activity', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetCommentRepliesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'ThreadedComment', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.GetCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comment: { type: 'Comment', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetCommentsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'ThreadedComment', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.GetFollowSuggestionsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    suggestions: { type: 'Feed', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.GetOrCreateFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'Activity', isSingle: false },

    aggregated_activities: { type: 'AggregatedActivity', isSingle: false },

    followers: { type: 'Follow', isSingle: false },

    following: { type: 'Follow', isSingle: false },

    members: { type: 'FeedMember', isSingle: false },

    pinned_activities: { type: 'ActivityPin', isSingle: false },

    feed: { type: 'Feed', isSingle: true },

    own_follows: { type: 'Follow', isSingle: false },

    notification_status: { type: 'NotificationStatus', isSingle: true },

    own_membership: { type: 'FeedMember', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.NotificationStatus = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    last_seen_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PinActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.QueryActivitiesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'Activity', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryCommentsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'Comment', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryFollowsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follows: { type: 'Follow', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.ReactionGroup = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    first_reaction_at: { type: 'DatetimeType', isSingle: true },

    last_reaction_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.RejectFeedMemberResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed_member: { type: 'FeedMember', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.RejectFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'Follow', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ThreadedComment = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    latest_reactions: { type: 'ActivityReaction', isSingle: false },

    replies: { type: 'ThreadedComment', isSingle: false },

    reaction_groups: { type: 'ReactionGroup', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.UpdateActivityPartialResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'Activity', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'Activity', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateBookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark: { type: 'Bookmark', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comment: { type: 'Comment', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed: { type: 'Feed', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'Follow', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpsertActivitiesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'Activity', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.UserResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    deactivated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    last_active: { type: 'DatetimeType', isSingle: true },

    revoke_tokens_issued_before: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

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
    feed_member: { type: 'FeedMemberResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AcceptFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityPinResponse = (input?: Record<string, any>) => {
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

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityReactionDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityRemovedFromFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    comments: { type: 'CommentResponse', isSingle: false },

    latest_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    mentioned_users: { type: 'UserResponse', isSingle: false },

    own_bookmarks: { type: 'BookmarkResponse', isSingle: false },

    own_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    reaction_groups: { type: 'ReactionGroupResponse', isSingle: false },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    edited_at: { type: 'DatetimeType', isSingle: true },

    expires_at: { type: 'DatetimeType', isSingle: true },

    current_feed: { type: 'FeedResponse', isSingle: true },

    parent: { type: 'BaseActivityResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'ActivityResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddBookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark: { type: 'BookmarkResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddCommentReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reaction: { type: 'FeedsReactionResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comment: { type: 'CommentResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddCommentsBatchResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'CommentResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.AddReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reaction: { type: 'FeedsReactionResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AggregatedActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    activities: { type: 'ActivityResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.BaseActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    comments: { type: 'CommentResponse', isSingle: false },

    latest_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    mentioned_users: { type: 'UserResponse', isSingle: false },

    own_bookmarks: { type: 'BookmarkResponse', isSingle: false },

    own_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    reaction_groups: { type: 'ReactionGroupResponse', isSingle: false },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    edited_at: { type: 'DatetimeType', isSingle: true },

    expires_at: { type: 'DatetimeType', isSingle: true },

    current_feed: { type: 'FeedResponse', isSingle: true },
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

    bookmark: { type: 'BookmarkResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkFolderResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    folder: { type: 'BookmarkFolderResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    bookmark: { type: 'BookmarkResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'CommentResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'CommentResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentReactionAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

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

decoders.CommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    latest_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    reaction_groups: { type: 'ReactionGroupResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.CommentUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'CommentResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CreateFeedsBatchResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feeds: { type: 'FeedResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.DeleteBookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark: { type: 'BookmarkResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedCreatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    members: { type: 'FeedMemberResponse', isSingle: false },

    feed: { type: 'FeedResponse', isSingle: true },

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

decoders.FeedMemberResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    request_accepted_at: { type: 'DatetimeType', isSingle: true },

    request_rejected_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    created_by: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    feed: { type: 'FeedResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedsReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowBatchResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follows: { type: 'FollowResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.FollowCreatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    follow: { type: 'FollowResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    follow: { type: 'FollowResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    source_feed: { type: 'FeedResponse', isSingle: true },

    target_feed: { type: 'FeedResponse', isSingle: true },

    request_accepted_at: { type: 'DatetimeType', isSingle: true },

    request_rejected_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FollowUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    follow: { type: 'FollowResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'ActivityResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetCommentRepliesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'ThreadedCommentResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.GetCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comment: { type: 'CommentResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetCommentsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'ThreadedCommentResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.GetFollowSuggestionsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    suggestions: { type: 'FeedResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.GetOrCreateFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'ActivityResponse', isSingle: false },

    aggregated_activities: {
      type: 'AggregatedActivityResponse',
      isSingle: false,
    },

    followers: { type: 'FollowResponse', isSingle: false },

    following: { type: 'FollowResponse', isSingle: false },

    members: { type: 'FeedMemberResponse', isSingle: false },

    pinned_activities: { type: 'ActivityPinResponse', isSingle: false },

    feed: { type: 'FeedResponse', isSingle: true },

    own_follows: { type: 'FollowResponse', isSingle: false },

    notification_status: { type: 'NotificationStatusResponse', isSingle: true },

    own_membership: { type: 'FeedMemberResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.NotificationStatusResponse = (input?: Record<string, any>) => {
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
    activities: { type: 'ActivityResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryActivityReactionsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reactions: { type: 'FeedsReactionResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryCommentReactionsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reactions: { type: 'FeedsReactionResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryCommentsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comments: { type: 'CommentResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryFollowsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follows: { type: 'FollowResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.ReactionGroupResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    first_reaction_at: { type: 'DatetimeType', isSingle: true },

    last_reaction_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.RejectFeedMemberResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed_member: { type: 'FeedMemberResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.RejectFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.SingleFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ThreadedCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    latest_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    replies: { type: 'ThreadedCommentResponse', isSingle: false },

    reaction_groups: { type: 'ReactionGroupResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.UpdateActivityPartialResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'ActivityResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'ActivityResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateBookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark: { type: 'BookmarkResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comment: { type: 'CommentResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed: { type: 'FeedResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpsertActivitiesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'ActivityResponse', isSingle: false },
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

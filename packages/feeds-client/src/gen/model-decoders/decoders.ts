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

decoders.AcceptFeedMemberInviteResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    member: { type: 'FeedMemberResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AcceptFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActionLogResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    review_queue_item: { type: 'ReviewQueueItemResponse', isSingle: true },

    target_user: { type: 'UserResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
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

decoders.ActivityMarkEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityPinResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityPinnedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    pinned_activity: { type: 'PinActivityResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityReactionAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityReactionDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityReactionUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

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

    parent: { type: 'ActivityResponse', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ActivityUnpinnedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    pinned_activity: { type: 'PinActivityResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
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
    comment: { type: 'CommentResponse', isSingle: true },

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
    activity: { type: 'ActivityResponse', isSingle: true },

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

decoders.AppUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Ban = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    expires: { type: 'DatetimeType', isSingle: true },

    channel: { type: 'Channel', isSingle: true },

    created_by: { type: 'User', isSingle: true },

    target: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BlockListResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BlockUsersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BlockedUserResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    blocked_user: { type: 'UserResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    bookmark: { type: 'BookmarkResponse', isSingle: true },

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

decoders.BookmarkFolderDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    bookmark_folder: { type: 'BookmarkFolderResponse', isSingle: true },

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

decoders.BookmarkFolderUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    bookmark_folder: { type: 'BookmarkFolderResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.BookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    folder: { type: 'BookmarkFolderResponse', isSingle: true },
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

decoders.CallParticipantResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    joined_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CallResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    created_by: { type: 'UserResponse', isSingle: true },

    ended_at: { type: 'DatetimeType', isSingle: true },

    starts_at: { type: 'DatetimeType', isSingle: true },

    session: { type: 'CallSessionResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CallSessionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    participants: { type: 'CallParticipantResponse', isSingle: false },

    accepted_by: { type: 'DatetimeType', isSingle: false },

    missed_by: { type: 'DatetimeType', isSingle: false },

    rejected_by: { type: 'DatetimeType', isSingle: false },

    ended_at: { type: 'DatetimeType', isSingle: true },

    live_ended_at: { type: 'DatetimeType', isSingle: true },

    live_started_at: { type: 'DatetimeType', isSingle: true },

    started_at: { type: 'DatetimeType', isSingle: true },

    timer_ends_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Channel = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    last_message_at: { type: 'DatetimeType', isSingle: true },

    active_live_locations: { type: 'SharedLocation', isSingle: false },

    invites: { type: 'ChannelMember', isSingle: false },

    members: { type: 'ChannelMember', isSingle: false },

    config: { type: 'ChannelConfig', isSingle: true },

    created_by: { type: 'User', isSingle: true },

    truncated_by: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ChannelConfig = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ChannelConfigWithInfo = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    commands: { type: 'Command', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.ChannelMember = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    archived_at: { type: 'DatetimeType', isSingle: true },

    ban_expires: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    invite_accepted_at: { type: 'DatetimeType', isSingle: true },

    invite_rejected_at: { type: 'DatetimeType', isSingle: true },

    pinned_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ChannelMute = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    expires: { type: 'DatetimeType', isSingle: true },

    channel: { type: 'ChannelResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ChannelResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    hide_messages_before: { type: 'DatetimeType', isSingle: true },

    last_message_at: { type: 'DatetimeType', isSingle: true },

    mute_expires_at: { type: 'DatetimeType', isSingle: true },

    truncated_at: { type: 'DatetimeType', isSingle: true },

    members: { type: 'ChannelMember', isSingle: false },

    config: { type: 'ChannelConfigWithInfo', isSingle: true },

    created_by: { type: 'UserResponse', isSingle: true },

    truncated_by: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Command = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
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

    comment: { type: 'CommentResponse', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentReactionDeletedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'CommentResponse', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentReactionUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    comment: { type: 'CommentResponse', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    mentioned_users: { type: 'UserResponse', isSingle: false },

    own_reactions: { type: 'FeedsReactionResponse', isSingle: false },

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

decoders.ConfigResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CreateBlockListResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    blocklist: { type: 'BlockListResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.CreateFeedsBatchResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feeds: { type: 'FeedResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.CreateGuestResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.DeleteActivityReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'ActivityResponse', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.DeleteBookmarkResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark: { type: 'BookmarkResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.DeleteCommentReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    comment: { type: 'CommentResponse', isSingle: true },

    reaction: { type: 'FeedsReactionResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Device = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.DeviceResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.DraftPayloadResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    mentioned_users: { type: 'UserResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.DraftResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    message: { type: 'DraftPayloadResponse', isSingle: true },

    channel: { type: 'ChannelResponse', isSingle: true },

    parent_message: { type: 'MessageResponse', isSingle: true },

    quoted_message: { type: 'MessageResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.EgressRTMPResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    started_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.EntityCreatorResponse = (input?: Record<string, any>) => {
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

decoders.FeedMemberAddedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    member: { type: 'FeedMemberResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedMemberRemovedEvent = (input?: Record<string, any>) => {
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

    invite_accepted_at: { type: 'DatetimeType', isSingle: true },

    invite_rejected_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedMemberUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    member: { type: 'FeedMemberResponse', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    created_by: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    own_follows: { type: 'FollowResponse', isSingle: false },
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

decoders.FullUserResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    channel_mutes: { type: 'ChannelMute', isSingle: false },

    devices: { type: 'DeviceResponse', isSingle: false },

    mutes: { type: 'UserMuteResponse', isSingle: false },

    ban_expires: { type: 'DatetimeType', isSingle: true },

    deactivated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    last_active: { type: 'DatetimeType', isSingle: true },

    revoke_tokens_issued_before: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'ActivityResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetBlockedUsersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    blocks: { type: 'BlockedUserResponse', isSingle: false },
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

decoders.GetConfigResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    config: { type: 'ConfigResponse', isSingle: true },
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

decoders.HealthCheckEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ListBlockListResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    blocklists: { type: 'BlockListResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.ListDevicesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    devices: { type: 'DeviceResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.Message = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    latest_reactions: { type: 'Reaction', isSingle: false },

    mentioned_users: { type: 'User', isSingle: false },

    own_reactions: { type: 'Reaction', isSingle: false },

    reaction_groups: { type: 'ReactionGroupResponse', isSingle: false },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    message_text_updated_at: { type: 'DatetimeType', isSingle: true },

    pin_expires: { type: 'DatetimeType', isSingle: true },

    pinned_at: { type: 'DatetimeType', isSingle: true },

    thread_participants: { type: 'User', isSingle: false },

    pinned_by: { type: 'User', isSingle: true },

    poll: { type: 'Poll', isSingle: true },

    quoted_message: { type: 'Message', isSingle: true },

    reminder: { type: 'MessageReminder', isSingle: true },

    shared_location: { type: 'SharedLocation', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.MessageReminder = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    remind_at: { type: 'DatetimeType', isSingle: true },

    channel: { type: 'Channel', isSingle: true },

    message: { type: 'Message', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.MessageResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    latest_reactions: { type: 'ReactionResponse', isSingle: false },

    mentioned_users: { type: 'UserResponse', isSingle: false },

    own_reactions: { type: 'ReactionResponse', isSingle: false },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    message_text_updated_at: { type: 'DatetimeType', isSingle: true },

    pin_expires: { type: 'DatetimeType', isSingle: true },

    pinned_at: { type: 'DatetimeType', isSingle: true },

    thread_participants: { type: 'UserResponse', isSingle: false },

    draft: { type: 'DraftResponse', isSingle: true },

    pinned_by: { type: 'UserResponse', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },

    quoted_message: { type: 'MessageResponse', isSingle: true },

    reaction_groups: { type: 'ReactionGroupResponse', isSingle: false },

    reminder: { type: 'ReminderResponseData', isSingle: true },

    shared_location: { type: 'SharedLocationResponseData', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ModerationCustomActionEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    message: { type: 'Message', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ModerationFlagResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    review_queue_item: { type: 'ReviewQueueItemResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ModerationFlaggedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ModerationMarkReviewedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    message: { type: 'Message', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.MuteResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    mutes: { type: 'UserMute', isSingle: false },

    own_user: { type: 'OwnUser', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.NotificationFeedUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },

    aggregated_activities: {
      type: 'AggregatedActivityResponse',
      isSingle: false,
    },

    notification_status: { type: 'NotificationStatusResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.NotificationStatusResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    last_read_at: { type: 'DatetimeType', isSingle: true },

    last_seen_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.OwnUser = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    channel_mutes: { type: 'ChannelMute', isSingle: false },

    devices: { type: 'Device', isSingle: false },

    mutes: { type: 'UserMute', isSingle: false },

    deactivated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    last_active: { type: 'DatetimeType', isSingle: true },

    last_engaged_at: { type: 'DatetimeType', isSingle: true },

    push_preferences: { type: 'PushPreferences', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PinActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    activity: { type: 'ActivityResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Poll = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    latest_answers: { type: 'PollVote', isSingle: false },

    own_votes: { type: 'PollVote', isSingle: false },

    created_by: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollClosedFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollDeletedFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    poll: { type: 'PollResponseData', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollResponseData = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    latest_answers: { type: 'PollVoteResponseData', isSingle: false },

    own_votes: { type: 'PollVoteResponseData', isSingle: false },

    created_by: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollUpdatedFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollVote = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollVoteCastedFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },

    poll_vote: { type: 'PollVoteResponseData', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollVoteChangedFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },

    poll_vote: { type: 'PollVoteResponseData', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollVoteRemovedFeedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    poll: { type: 'PollResponseData', isSingle: true },

    poll_vote: { type: 'PollVoteResponseData', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollVoteResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    vote: { type: 'PollVoteResponseData', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollVoteResponseData = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.PollVotesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    votes: { type: 'PollVoteResponseData', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.PushPreferences = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    disabled_until: { type: 'DatetimeType', isSingle: true },
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

decoders.QueryBookmarkFoldersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark_folders: { type: 'BookmarkFolderResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryBookmarksResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmarks: { type: 'BookmarkResponse', isSingle: false },
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

decoders.QueryFeedMembersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    members: { type: 'FeedMemberResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryFeedsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feeds: { type: 'FeedResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryFollowsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follows: { type: 'FollowResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryModerationConfigsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    configs: { type: 'ConfigResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryPollsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    polls: { type: 'PollResponseData', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryReviewQueueResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    items: { type: 'ReviewQueueItemResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryUsersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    users: { type: 'FullUserResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.Reaction = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'User', isSingle: true },
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

decoders.ReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.RejectFeedMemberInviteResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    member: { type: 'FeedMemberResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.RejectFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ReminderResponseData = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    remind_at: { type: 'DatetimeType', isSingle: true },

    channel: { type: 'ChannelResponse', isSingle: true },

    message: { type: 'Message', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ReviewQueueItemResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    actions: { type: 'ActionLogResponse', isSingle: false },

    bans: { type: 'Ban', isSingle: false },

    flags: { type: 'ModerationFlagResponse', isSingle: false },

    completed_at: { type: 'DatetimeType', isSingle: true },

    reviewed_at: { type: 'DatetimeType', isSingle: true },

    assigned_to: { type: 'UserResponse', isSingle: true },

    call: { type: 'CallResponse', isSingle: true },

    entity_creator: { type: 'EntityCreatorResponse', isSingle: true },

    feeds_v2_reaction: { type: 'Reaction', isSingle: true },

    message: { type: 'MessageResponse', isSingle: true },

    reaction: { type: 'Reaction', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.SharedLocation = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    end_at: { type: 'DatetimeType', isSingle: true },

    channel: { type: 'Channel', isSingle: true },

    message: { type: 'Message', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.SharedLocationResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    end_at: { type: 'DatetimeType', isSingle: true },

    channel: { type: 'ChannelResponse', isSingle: true },

    message: { type: 'MessageResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.SharedLocationResponseData = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    end_at: { type: 'DatetimeType', isSingle: true },

    channel: { type: 'ChannelResponse', isSingle: true },

    message: { type: 'MessageResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.SharedLocationsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    active_live_locations: {
      type: 'SharedLocationResponseData',
      isSingle: false,
    },
  };
  return decode(typeMappings, input);
};

decoders.SingleFollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.SubmitActionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    item: { type: 'ReviewQueueItemResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.ThreadedCommentResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    mentioned_users: { type: 'UserResponse', isSingle: false },

    own_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    latest_reactions: { type: 'FeedsReactionResponse', isSingle: false },

    replies: { type: 'ThreadedCommentResponse', isSingle: false },

    reaction_groups: { type: 'ReactionGroupResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.UnfollowResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    follow: { type: 'FollowResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UnpinActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'ActivityResponse', isSingle: true },
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

decoders.UpdateBlockListResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    blocklist: { type: 'BlockListResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateBookmarkFolderResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    bookmark_folder: { type: 'BookmarkFolderResponse', isSingle: true },
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

decoders.UpdateFeedMembersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    added: { type: 'FeedMemberResponse', isSingle: false },

    updated: { type: 'FeedMemberResponse', isSingle: false },
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

decoders.UpdateUsersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    users: { type: 'FullUserResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.UpsertActivitiesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'ActivityResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.UpsertConfigResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    config: { type: 'ConfigResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.User = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    ban_expires: { type: 'DatetimeType', isSingle: true },

    created_at: { type: 'DatetimeType', isSingle: true },

    deactivated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    last_active: { type: 'DatetimeType', isSingle: true },

    last_engaged_at: { type: 'DatetimeType', isSingle: true },

    revoke_tokens_issued_before: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UserBannedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    created_by: { type: 'User', isSingle: true },

    expiration: { type: 'DatetimeType', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UserDeactivatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    created_by: { type: 'User', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UserMute = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    expires: { type: 'DatetimeType', isSingle: true },

    target: { type: 'User', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UserMuteResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    expires: { type: 'DatetimeType', isSingle: true },

    target: { type: 'UserResponse', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UserMutedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'User', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UserReactivatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'User', isSingle: true },
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

decoders.UserUpdatedEvent = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    received_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

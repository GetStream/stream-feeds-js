type Decoder = (i: any) => any;

type TypeMapping = Record<string, {type: string, isSingle: boolean}>

export const decoders: Record<string, Decoder> = {};

const decodeDatetimeType = (input: number | string) => typeof input === 'number' ? new Date(Math.floor(input / 1000000)) : new Date(input);

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
                Object.keys(input[key]).forEach(k => {
                    input[key][k] = decoder(input[key][k])
                })
            }
        }
      }
    }
  });

  return input;
};



  decoders['AcceptFeedMemberInviteResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "member": {type: "FeedMemberResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['AcceptFollowResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ActionLogResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
                "review_queue_item": {type: "ReviewQueueItemResponse", isSingle: true},
            
        
                "target_user": {type: "UserResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityAddedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityFeedbackEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityMarkEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityPinResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityPinnedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "pinned_activity": {type: "PinActivityResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityReactionAddedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityReactionDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityReactionUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityRemovedFromFeedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
              "comments": {type: "CommentResponse", isSingle: false},
            
        
        
        
        
              "latest_reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
              "mentioned_users": {type: "UserResponse", isSingle: false},
            
        
              "own_bookmarks": {type: "BookmarkResponse", isSingle: false},
            
        
              "own_reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
              "collections": {type: "EnrichedCollectionResponse", isSingle: false},
            
        
        
              "reaction_groups": {type: "FeedsReactionGroupResponse", isSingle: false},
            
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
                "edited_at": {type: "DatetimeType", isSingle: true},
            
        
                "expires_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
              "friend_reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
                "current_feed": {type: "FeedResponse", isSingle: true},
            
        
        
        
        
        
                "parent": {type: "ActivityResponse", isSingle: true},
            
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityRestoredEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityUnpinnedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "pinned_activity": {type: "PinActivityResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ActivityUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['AddActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['AddBookmarkResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "bookmark": {type: "BookmarkResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['AddCommentReactionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['AddCommentResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['AddCommentsBatchResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "comments": {type: "CommentResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['AddReactionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['AddUserGroupMembersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "user_group": {type: "UserGroupResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['AggregatedActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
              "activities": {type: "ActivityResponse", isSingle: false},
            
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['AppUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['AppealItemResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['BanInfoResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "expires": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "created_by": {type: "UserResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['BlockListResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['BlockUsersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['BlockedUserResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "blocked_user": {type: "UserResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['BookmarkAddedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "bookmark": {type: "BookmarkResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['BookmarkDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "bookmark": {type: "BookmarkResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['BookmarkFolderDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "bookmark_folder": {type: "BookmarkFolderResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['BookmarkFolderResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['BookmarkFolderUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "bookmark_folder": {type: "BookmarkFolderResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['BookmarkResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        
        
                "folder": {type: "BookmarkFolderResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['BookmarkUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "bookmark": {type: "BookmarkResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['CallParticipantResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "joined_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CallResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "created_by": {type: "UserResponse", isSingle: true},
            
        
        
        
        
        
        
                "ended_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "starts_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "session": {type: "CallSessionResponse", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['CallSessionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
              "participants": {type: "CallParticipantResponse", isSingle: false},
            
        
              "accepted_by": {type: "DatetimeType", isSingle: false},
            
        
              "missed_by": {type: "DatetimeType", isSingle: false},
            
        
        
              "rejected_by": {type: "DatetimeType", isSingle: false},
            
        
                "ended_at": {type: "DatetimeType", isSingle: true},
            
        
                "live_ended_at": {type: "DatetimeType", isSingle: true},
            
        
                "live_started_at": {type: "DatetimeType", isSingle: true},
            
        
                "started_at": {type: "DatetimeType", isSingle: true},
            
        
                "timer_ends_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ChannelConfigWithInfo'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
              "commands": {type: "Command", isSingle: false},
            
        
        
        
        
        
        
        
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['ChannelMemberResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "archived_at": {type: "DatetimeType", isSingle: true},
            
        
                "ban_expires": {type: "DatetimeType", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
                "invite_accepted_at": {type: "DatetimeType", isSingle: true},
            
        
                "invite_rejected_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "pinned_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ChannelMute'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "expires": {type: "DatetimeType", isSingle: true},
            
        
                "channel": {type: "ChannelResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ChannelResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "hide_messages_before": {type: "DatetimeType", isSingle: true},
            
        
                "last_message_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "mute_expires_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "truncated_at": {type: "DatetimeType", isSingle: true},
            
        
        
              "members": {type: "ChannelMemberResponse", isSingle: false},
            
        
        
                "config": {type: "ChannelConfigWithInfo", isSingle: true},
            
        
                "created_by": {type: "UserResponse", isSingle: true},
            
        
                "truncated_by": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CollectionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['Command'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CommentAddedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['CommentDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['CommentReactionAddedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['CommentReactionDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CommentReactionUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['CommentResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
              "mentioned_users": {type: "UserResponse", isSingle: false},
            
        
              "own_reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
                "edited_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
              "latest_reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
        
        
              "reaction_groups": {type: "FeedsReactionGroupResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CommentUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ConfigResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['CreateBlockListResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "blocklist": {type: "BlockListResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CreateCollectionsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "collections": {type: "CollectionResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CreateFeedsBatchResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "feeds": {type: "FeedResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CreateGuestResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['CreateUserGroupResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "user_group": {type: "UserGroupResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['DeleteActivityReactionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['DeleteBookmarkResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "bookmark": {type: "BookmarkResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['DeleteCommentReactionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        
                "reaction": {type: "FeedsReactionResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['DeleteCommentResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['DeviceResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['DraftPayloadResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
        
        
        
        
        
        
        
        
        
              "mentioned_users": {type: "UserResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['DraftResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "message": {type: "DraftPayloadResponse", isSingle: true},
            
        
        
                "channel": {type: "ChannelResponse", isSingle: true},
            
        
                "parent_message": {type: "MessageResponse", isSingle: true},
            
        
                "quoted_message": {type: "MessageResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['EgressRTMPResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "started_at": {type: "DatetimeType", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['EnrichedCollectionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['EntityCreatorResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "deactivated_at": {type: "DatetimeType", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "last_active": {type: "DatetimeType", isSingle: true},
            
        
        
                "revoke_tokens_issued_before": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['FeedCreatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
              "members": {type: "FeedMemberResponse", isSingle: false},
            
        
        
                "feed": {type: "FeedResponse", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['FeedGroupChangedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['FeedGroupDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedGroupRestoredEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedMemberAddedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "member": {type: "FeedMemberResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['FeedMemberRemovedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['FeedMemberResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        
                "invite_accepted_at": {type: "DatetimeType", isSingle: true},
            
        
                "invite_rejected_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "membership_level": {type: "MembershipLevelResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedMemberUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "member": {type: "FeedMemberResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['FeedOwnData'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "own_followings": {type: "FollowResponse", isSingle: false},
            
        
              "own_follows": {type: "FollowResponse", isSingle: false},
            
        
                "own_membership": {type: "FeedMemberResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "created_by": {type: "UserResponse", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
              "own_followings": {type: "FollowResponse", isSingle: false},
            
        
              "own_follows": {type: "FollowResponse", isSingle: false},
            
        
        
                "own_membership": {type: "FeedMemberResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedSuggestionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "created_by": {type: "UserResponse", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
              "own_followings": {type: "FollowResponse", isSingle: false},
            
        
              "own_follows": {type: "FollowResponse", isSingle: false},
            
        
        
        
                "own_membership": {type: "FeedMemberResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "feed": {type: "FeedResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['FeedsReactionGroupResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "first_reaction_at": {type: "DatetimeType", isSingle: true},
            
        
                "last_reaction_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FeedsReactionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['FollowBatchResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "created": {type: "FollowResponse", isSingle: false},
            
        
              "follows": {type: "FollowResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FollowCreatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FollowDeletedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FollowResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "source_feed": {type: "FeedResponse", isSingle: true},
            
        
                "target_feed": {type: "FeedResponse", isSingle: true},
            
        
                "request_accepted_at": {type: "DatetimeType", isSingle: true},
            
        
                "request_rejected_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['FollowUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['FullUserResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
              "channel_mutes": {type: "ChannelMute", isSingle: false},
            
        
              "devices": {type: "DeviceResponse", isSingle: false},
            
        
              "mutes": {type: "UserMuteResponse", isSingle: false},
            
        
        
        
        
                "ban_expires": {type: "DatetimeType", isSingle: true},
            
        
                "deactivated_at": {type: "DatetimeType", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "last_active": {type: "DatetimeType", isSingle: true},
            
        
        
                "revoke_tokens_issued_before": {type: "DatetimeType", isSingle: true},
            
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['GetActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['GetAppealResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "item": {type: "AppealItemResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['GetBlockedUsersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "blocks": {type: "BlockedUserResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['GetCommentRepliesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
              "comments": {type: "ThreadedCommentResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['GetCommentResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['GetCommentsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
              "comments": {type: "ThreadedCommentResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['GetConfigResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "config": {type: "ConfigResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['GetFollowSuggestionsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "suggestions": {type: "FeedSuggestionResponse", isSingle: false},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['GetOrCreateFeedResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
              "activities": {type: "ActivityResponse", isSingle: false},
            
        
              "aggregated_activities": {type: "AggregatedActivityResponse", isSingle: false},
            
        
              "followers": {type: "FollowResponse", isSingle: false},
            
        
              "following": {type: "FollowResponse", isSingle: false},
            
        
              "members": {type: "FeedMemberResponse", isSingle: false},
            
        
              "pinned_activities": {type: "ActivityPinResponse", isSingle: false},
            
        
                "feed": {type: "FeedResponse", isSingle: true},
            
        
        
        
        
        
        
                "notification_status": {type: "NotificationStatusResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['GetUserGroupResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "user_group": {type: "UserGroupResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['HealthCheckEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
                "me": {type: "OwnUserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ListBlockListResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "blocklists": {type: "BlockListResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ListDevicesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "devices": {type: "DeviceResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ListUserGroupsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "user_groups": {type: "UserGroupResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['MembershipLevelResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['MessageResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
              "latest_reactions": {type: "ReactionResponse", isSingle: false},
            
        
              "mentioned_users": {type: "UserResponse", isSingle: false},
            
        
              "own_reactions": {type: "ReactionResponse", isSingle: false},
            
        
        
        
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "message_text_updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "pin_expires": {type: "DatetimeType", isSingle: true},
            
        
                "pinned_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
              "thread_participants": {type: "UserResponse", isSingle: false},
            
        
                "draft": {type: "DraftResponse", isSingle: true},
            
        
        
        
                "member": {type: "ChannelMemberResponse", isSingle: true},
            
        
        
                "pinned_by": {type: "UserResponse", isSingle: true},
            
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
                "quoted_message": {type: "MessageResponse", isSingle: true},
            
        
              "reaction_groups": {type: "ReactionGroupResponse", isSingle: false},
            
        
                "reminder": {type: "ReminderResponseData", isSingle: true},
            
        
                "shared_location": {type: "SharedLocationResponseData", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ModerationCustomActionEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "review_queue_item": {type: "ReviewQueueItemResponse", isSingle: true},
            
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "message": {type: "MessageResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ModerationFlagResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
                "review_queue_item": {type: "ReviewQueueItemResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ModerationFlaggedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ModerationMarkReviewedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "item": {type: "ReviewQueueItemResponse", isSingle: true},
            
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
                "message": {type: "MessageResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['MuteResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "mutes": {type: "UserMuteResponse", isSingle: false},
            
        
        
                "own_user": {type: "OwnUserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['NotificationFeedUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
              "aggregated_activities": {type: "AggregatedActivityResponse", isSingle: false},
            
        
                "notification_status": {type: "NotificationStatusResponse", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['NotificationStatusResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "last_read_at": {type: "DatetimeType", isSingle: true},
            
        
                "last_seen_at": {type: "DatetimeType", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['OwnBatchResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "data": {type: "FeedOwnData", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['OwnUserResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
              "channel_mutes": {type: "ChannelMute", isSingle: false},
            
        
              "devices": {type: "DeviceResponse", isSingle: false},
            
        
              "mutes": {type: "UserMuteResponse", isSingle: false},
            
        
        
        
        
                "deactivated_at": {type: "DatetimeType", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "last_active": {type: "DatetimeType", isSingle: true},
            
        
        
                "revoke_tokens_issued_before": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "push_preferences": {type: "PushPreferencesResponse", isSingle: true},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['PinActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollClosedFeedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollDeletedFeedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollResponseData'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
              "latest_answers": {type: "PollVoteResponseData", isSingle: false},
            
        
        
              "own_votes": {type: "PollVoteResponseData", isSingle: false},
            
        
        
        
        
        
        
                "created_by": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollUpdatedFeedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollVoteCastedFeedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
                "poll_vote": {type: "PollVoteResponseData", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollVoteChangedFeedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
                "poll_vote": {type: "PollVoteResponseData", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollVoteRemovedFeedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
                "poll_vote": {type: "PollVoteResponseData", isSingle: true},
            
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollVoteResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "poll": {type: "PollResponseData", isSingle: true},
            
        
                "vote": {type: "PollVoteResponseData", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollVoteResponseData'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['PollVotesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "votes": {type: "PollVoteResponseData", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['PushPreferencesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
                "disabled_until": {type: "DatetimeType", isSingle: true},
            
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryActivitiesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "activities": {type: "ActivityResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryActivityReactionsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryAppealsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "items": {type: "AppealItemResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryBookmarkFoldersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "bookmark_folders": {type: "BookmarkFolderResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryBookmarksResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "bookmarks": {type: "BookmarkResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryCollectionsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "collections": {type: "CollectionResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryCommentReactionsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryCommentsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "comments": {type: "CommentResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryFeedMembersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "members": {type: "FeedMemberResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryFeedsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "feeds": {type: "FeedResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryFollowsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "follows": {type: "FollowResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryModerationConfigsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "configs": {type: "ConfigResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryPinnedActivitiesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "pinned_activities": {type: "ActivityPinResponse", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryPollsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "polls": {type: "PollResponseData", isSingle: false},
            
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['QueryUsersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "users": {type: "FullUserResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['Reaction'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['ReactionGroupResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "first_reaction_at": {type: "DatetimeType", isSingle: true},
            
        
                "last_reaction_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['ReactionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ReadCollectionsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "collections": {type: "CollectionResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['RejectFeedMemberInviteResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "member": {type: "FeedMemberResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['RejectFollowResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ReminderResponseData'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "remind_at": {type: "DatetimeType", isSingle: true},
            
        
                "channel": {type: "ChannelResponse", isSingle: true},
            
        
                "message": {type: "MessageResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['RemoveUserGroupMembersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "user_group": {type: "UserGroupResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['RestoreActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ReviewQueueItemResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
              "actions": {type: "ActionLogResponse", isSingle: false},
            
        
              "bans": {type: "BanInfoResponse", isSingle: false},
            
        
              "flags": {type: "ModerationFlagResponse", isSingle: false},
            
        
        
                "completed_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "reviewed_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "appeal": {type: "AppealItemResponse", isSingle: true},
            
        
                "assigned_to": {type: "UserResponse", isSingle: true},
            
        
                "call": {type: "CallResponse", isSingle: true},
            
        
                "entity_creator": {type: "EntityCreatorResponse", isSingle: true},
            
        
        
                "feeds_v2_reaction": {type: "Reaction", isSingle: true},
            
        
                "feeds_v3_activity": {type: "ActivityResponse", isSingle: true},
            
        
                "feeds_v3_comment": {type: "CommentResponse", isSingle: true},
            
        
                "message": {type: "MessageResponse", isSingle: true},
            
        
        
                "reaction": {type: "Reaction", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['SearchUserGroupsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "user_groups": {type: "UserGroupResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['SharedLocationResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "end_at": {type: "DatetimeType", isSingle: true},
            
        
                "channel": {type: "ChannelResponse", isSingle: true},
            
        
                "message": {type: "MessageResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['SharedLocationResponseData'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "end_at": {type: "DatetimeType", isSingle: true},
            
        
                "channel": {type: "ChannelResponse", isSingle: true},
            
        
                "message": {type: "MessageResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['SharedLocationsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "active_live_locations": {type: "SharedLocationResponseData", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['SingleFollowResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['StoriesFeedUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
              "activities": {type: "ActivityResponse", isSingle: false},
            
        
              "aggregated_activities": {type: "AggregatedActivityResponse", isSingle: false},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['SubmitActionResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "appeal_item": {type: "AppealItemResponse", isSingle: true},
            
        
                "item": {type: "ReviewQueueItemResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['ThreadedCommentResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
              "mentioned_users": {type: "UserResponse", isSingle: false},
            
        
              "own_reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
                "edited_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
              "latest_reactions": {type: "FeedsReactionResponse", isSingle: false},
            
        
              "replies": {type: "ThreadedCommentResponse", isSingle: false},
            
        
        
        
        
              "reaction_groups": {type: "FeedsReactionGroupResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UnfollowBatchResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "follows": {type: "FollowResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UnfollowResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UnpinActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateActivityPartialResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateActivityResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "activity": {type: "ActivityResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateBlockListResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "blocklist": {type: "BlockListResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateBookmarkFolderResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "bookmark_folder": {type: "BookmarkFolderResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateBookmarkResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "bookmark": {type: "BookmarkResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateCollectionsResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "collections": {type: "CollectionResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateCommentResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "comment": {type: "CommentResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateFeedMembersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "added": {type: "FeedMemberResponse", isSingle: false},
            
        
        
              "updated": {type: "FeedMemberResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateFeedResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "feed": {type: "FeedResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateFollowResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "follow": {type: "FollowResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateUserGroupResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "user_group": {type: "UserGroupResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpdateUsersResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
              "users": {type: "FullUserResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpsertActivitiesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
              "activities": {type: "ActivityResponse", isSingle: false},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['UpsertConfigResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "config": {type: "ConfigResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UpsertPushPreferencesResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
        
              "user_preferences": {type: "PushPreferencesResponse", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UserBannedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
                "expiration": {type: "DatetimeType", isSingle: true},
            
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['UserDeactivatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['UserGroupMember'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['UserGroupResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
              "members": {type: "UserGroupMember", isSingle: false},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UserMuteResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
                "expires": {type: "DatetimeType", isSingle: true},
            
        
                "target": {type: "UserResponse", isSingle: true},
            
        
                "user": {type: "UserResponse", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

  decoders['UserReactivatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['UserResponse'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
        
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "updated_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
                "deactivated_at": {type: "DatetimeType", isSingle: true},
            
        
                "deleted_at": {type: "DatetimeType", isSingle: true},
            
        
        
                "last_active": {type: "DatetimeType", isSingle: true},
            
        
        
                "revoke_tokens_issued_before": {type: "DatetimeType", isSingle: true},
            
        
        }
    return decode(typeMappings, input)
  }

  decoders['UserUnbannedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
        }
    return decode(typeMappings, input)
  }

  decoders['UserUpdatedEvent'] = (input?: {[key: string]: any}) => {
    const typeMappings: TypeMapping = {
                "created_at": {type: "DatetimeType", isSingle: true},
            
        
        
        
        
                "received_at": {type: "DatetimeType", isSingle: true},
            
        }
    return decode(typeMappings, input)
  }

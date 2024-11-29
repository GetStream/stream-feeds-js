type Decoder = (i: any) => any;

type TypeMapping = Record<string, { type: string; isSingle: boolean }>;

export const decoders: Record<string, Decoder> = {};

const decodeDatetimeType = (input: number) =>
  new Date(Math.floor(input / 1000000));

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

decoders.Activity = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AddActivityResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activity: { type: 'Activity', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.AggregatedActivities = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    activities: { type: 'Activity', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.DeleteFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed: { type: 'Feed', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.Feed = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    invites: { type: 'FeedMember', isSingle: false },

    members: { type: 'FeedMember', isSingle: false },

    created_by: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedGroupResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.FeedMember = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    ban_expires_at: { type: 'DatetimeType', isSingle: true },

    created_at: { type: 'DatetimeType', isSingle: true },

    invite_accepted_at: { type: 'DatetimeType', isSingle: true },

    invite_rejected_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetFeedGroupsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed_groups: { type: 'FeedGroupResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.GetFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed: { type: 'Feed', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.GetOrCreateFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed: { type: 'Feed', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.MemberResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },

    user: { type: 'UserResponse', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.QueryActivitiesResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'Activity', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryFeedsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feeds: { type: 'Feed', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.QueryReactionsResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reactions: { type: 'ReactionResponse', isSingle: false },
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

decoders.ReadFlatFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    activities: { type: 'Activity', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.ReadNotificationFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    groups: { type: 'AggregatedActivities', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.SendReactionResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    reaction: { type: 'ReactionResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpdateFeedMembersResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    members: { type: 'MemberResponse', isSingle: false },
  };
  return decode(typeMappings, input);
};

decoders.UpdateFeedResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed: { type: 'Feed', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UpsertFeedGroupResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    feed_group: { type: 'FeedGroupResponse', isSingle: true },
  };
  return decode(typeMappings, input);
};

decoders.UserResponse = (input?: Record<string, any>) => {
  const typeMappings: TypeMapping = {
    created_at: { type: 'DatetimeType', isSingle: true },

    deactivated_at: { type: 'DatetimeType', isSingle: true },

    deleted_at: { type: 'DatetimeType', isSingle: true },

    last_active: { type: 'DatetimeType', isSingle: true },

    revoke_tokens_issued_before: { type: 'DatetimeType', isSingle: true },

    updated_at: { type: 'DatetimeType', isSingle: true },
  };
  return decode(typeMappings, input);
};

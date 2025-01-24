import { WSEvent } from '../models';
import { decoders } from '../model-decoders/decoders';

const eventDecoderMapping: {
  [key in WSEvent['type']]: (data: Record<string, any>) => WSEvent;
} = {
  'feeds.activity_added': (data: Record<string, any>) =>
    decoders.ActivityAddedEvent(data),

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

  'feeds.follow': (data: Record<string, any>) => decoders.FollowEvent(data),

  'feeds.follow_request_created': (data: Record<string, any>) =>
    decoders.FollowRequestEvent(data),

  'feeds.follow_request_updated': (data: Record<string, any>) =>
    decoders.FollowRequestEvent(data),

  'feeds.unfollow': (data: Record<string, any>) => decoders.UnfollowEvent(data),
};

export const decodeWSEvent = (data: { type: string } & Record<string, any>) => {
  if (Object.hasOwn(eventDecoderMapping, data.type)) {
    return eventDecoderMapping[data.type as WSEvent['type']](data);
  } else {
    return data;
  }
};

import { WSEvent } from '../models';
import { decoders } from '../model-decoders/decoders';

const eventDecoderMapping: {
  [key in WSEvent['type']]: (data: Record<string, any>) => WSEvent;
} = {
  'feeds.activity_added': (data: Record<string, any>) =>
    decoders.ActivityAddedEvent(data),

  'feeds.activity_removed': (data: Record<string, any>) =>
    decoders.ActivityRemovedEvent(data),

  'feeds.activity_updated': (data: Record<string, any>) =>
    decoders.ActivityUpdatedEvent(data),
};

export const decodeWSEvent = (data: { type: string } & Record<string, any>) => {
  if (Object.hasOwn(eventDecoderMapping, data.type)) {
    return eventDecoderMapping[data.type as WSEvent['type']](data);
  } else {
    return data;
  }
};

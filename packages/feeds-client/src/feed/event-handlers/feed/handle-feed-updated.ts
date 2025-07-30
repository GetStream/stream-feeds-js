import { Feed } from '../../../feed';
import { EventPayload } from '../../../types-internal';

export function handleFeedUpdated(
  this: Feed,
  event: EventPayload<'feeds.feed.updated'>,
) {
  this.state.partialNext({ ...event.feed });
}

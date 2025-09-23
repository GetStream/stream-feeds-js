import type { Feed } from '../../../feed';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';

export function handleFeedUpdated(
  this: Feed,
  event: PartializeAllBut<EventPayload<'feeds.feed.updated'>, 'feed'>,
) {
  this.state.partialNext({ ...event.feed });
}

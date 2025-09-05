import { Feed } from '../../../feed';
import { EventPayload, PartializeAllBut } from '../../../types-internal';

export function handleFeedUpdated(
  this: Feed,
  event: PartializeAllBut<EventPayload<'feeds.feed.updated'>, 'feed'>,
) {
  this.state.partialNext({ ...event.feed });
}

import type { Feed } from '../../../feed';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';

export function handleFeedUpdated(
  this: Feed,
  event: PartializeAllBut<EventPayload<'feeds.feed.updated'>, 'feed'>,
) {
  const currentUpdatedAt = this.currentState.updated_at;
  if (
    currentUpdatedAt &&
    event.feed.updated_at &&
    currentUpdatedAt.getTime() >= event.feed.updated_at.getTime()
  ) {
    return;
  }
  this.state.partialNext({ ...event.feed });
}

import type { Feed } from '../../../feed';
import type { EventPayload } from '../../../types-internal';

export function handleFeedDeleted(
  this: Feed,
  event: Pick<EventPayload<'feeds.feed.deleted'>, 'created_at'>,
) {
  if (this.currentState.deleted_at) {
    return;
  }
  this.state.partialNext({ deleted_at: event.created_at });
}

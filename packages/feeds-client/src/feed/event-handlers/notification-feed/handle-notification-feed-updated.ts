import type { Feed } from '../../../feed';
import type { EventPayload } from '../../../types-internal';

export function handleNotificationFeedUpdated(
  this: Feed,
  event: EventPayload<'feeds.notification_feed.updated'>,
) {
  console.info('notification feed updated', event);
  // TODO: handle notification feed updates
}

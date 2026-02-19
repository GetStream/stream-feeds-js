import type { Feed } from '../feed/feed';
import type { ActivityResponse } from '../gen/models';

export function applyNewActivityToActiveFeeds(
  this: Feed,
  activity: ActivityResponse,
): void {
  return this.addActivityFromHTTPResponse(activity);
}

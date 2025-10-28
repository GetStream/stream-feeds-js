import { StateStore } from '@stream-io/state-store';
import type { Feed } from '../feed';
import type { FeedsClient } from '../feeds-client';
import type { ActivityResponse } from '../gen/models';

export type ActivityState = {
  /**
   * True when being synchronized after connection recovered
   */
  is_loading: boolean;
  // TODO: add more state properties here
};

export class Activity {
  readonly id: string;
  readonly state = new StateStore<ActivityState>({
    is_loading: false,
  });

  constructor(
    initialState: ActivityResponse,
    public readonly feed: Feed,
    feedsClient: FeedsClient,
  ) {
    this.id = initialState.id;
  }

  synchronize() {}
}

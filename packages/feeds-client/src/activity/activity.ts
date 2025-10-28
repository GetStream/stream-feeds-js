import type { Feed } from '../feed';
import type { FeedsClient } from '../feeds-client';
import type { ActivityResponse } from '../gen/models';

export type ActivityState = {
  /**
   * True when being synchronized after connection recovered
   */
  is_loading: boolean;
};

export class Activity {
  readonly id: string;
  re;

  constructor(
    initialState: ActivityResponse,
    public readonly feed: Feed,
    feedsClient: FeedsClient,
  ) {
    this.id = initialState.id;
  }

  synchronize() {}
}

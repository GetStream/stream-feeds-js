import { BaseSearchSource } from './BaseSearchSource';
import type { SearchSourceOptions } from './BaseSearchSource';

import { FeedsClient } from '../FeedsClient';
import { ActivityResponse } from '../gen/models';

export class ActivitySearchSource extends BaseSearchSource<ActivityResponse> {
  readonly type = 'activity' as const;
  private readonly client: FeedsClient;
  // messageSearchChannelFilters: ChannelFilters | undefined;
  // messageSearchFilters: MessageFilters | undefined;
  // messageSearchSort: SearchMessageSort | undefined;
  // channelQueryFilters: ChannelFilters | undefined;
  // channelQuerySort: ChannelSort | undefined;
  // channelQueryOptions: Omit<ChannelOptions, 'limit' | 'offset'> | undefined;

  constructor(client: FeedsClient, options?: SearchSourceOptions) {
    super(options);
    this.client = client;
  }

  protected async query(searchQuery: string) {
    const { connectedUser } = this.client.state.getLatestValue();
    if (!connectedUser) return { items: [] };

    const { activities: items, next } = await this.client.queryActivities({
      sort: [{ direction: -1, field: 'created_at' }],
      filter: { text: { $autocomplete: searchQuery } },
      limit: 10,
      next: this.next ?? undefined,
    });

    return { items, next };
  }

  protected filterQueryResults(items: ActivityResponse[]) {
    return items;
  }
}

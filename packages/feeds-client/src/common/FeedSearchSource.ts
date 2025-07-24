import { BaseSearchSource } from './BaseSearchSource';
import type { SearchSourceOptions } from './BaseSearchSource';

import { FeedsClient } from '../FeedsClient';
import { Feed } from '../Feed';

export class FeedSearchSource extends BaseSearchSource<Feed> {
  readonly type = 'feed' as const;
  private readonly client: FeedsClient;

  constructor(client: FeedsClient, options?: SearchSourceOptions) {
    super(options);
    this.client = client;
  }

  protected async query(searchQuery: string) {
    const { connected_user: connectedUser } = this.client.state.getLatestValue();
    if (!connectedUser) return { items: [] };

    const { feeds: items, next } = await this.client.queryFeeds({
      filter: {
        group_id: 'user',
        $or: [
          { name: { $autocomplete: searchQuery } },
          { description: { $autocomplete: searchQuery } },
          { 'created_by.name': { $autocomplete: searchQuery } },
        ],
      },
    });

    return { items, next };
  }

  protected filterQueryResults(items: Feed[]) {
    return items;
  }
}

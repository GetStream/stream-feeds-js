import { BaseSearchSource } from './BaseSearchSource';
import type { SearchSourceOptions } from './BaseSearchSource';

import { FeedsClient } from '../FeedsClient';
import { Feed } from '../Feed';

export type FeedSearchSourceOptions = SearchSourceOptions & {
  groupId?: string;
};

export class FeedSearchSource extends BaseSearchSource<Feed> {
  readonly type = 'feed' as const;
  private readonly client: FeedsClient;
  private readonly feedGroupId?: string | undefined;

  constructor(client: FeedsClient, options?: FeedSearchSourceOptions) {
    super(options);
    this.client = client;
    this.feedGroupId = options?.groupId;
  }

  protected async query(searchQuery: string) {
    const { connected_user: connectedUser } =
      this.client.state.getLatestValue();
    if (!connectedUser) return { items: [] };

    const { feeds: items, next } = await this.client.queryFeeds({
      filter: {
        ...(this.feedGroupId ? { group_id: this.feedGroupId } : {}),
        ...(!this.allowEmptySearchString || searchQuery.length > 0
          ? {
              $or: [
                { name: { $autocomplete: searchQuery } },
                { description: { $autocomplete: searchQuery } },
                { 'created_by.name': { $autocomplete: searchQuery } },
              ],
            }
          : {}),
      },
    });

    return { items, next };
  }

  protected filterQueryResults(items: Feed[]) {
    return items;
  }
}

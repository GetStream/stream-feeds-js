import { BaseSearchSource } from './BaseSearchSource';
import type { SearchSourceOptions } from './types';

import { FeedsClient } from '../../feeds-client';
import { Feed } from '../../feed';

export type FeedSearchSourceOptions = SearchSourceOptions & {
  groupId?: string;
};

export class FeedSearchSource extends BaseSearchSource<Feed> {
  readonly type: string;
  readonly feedGroupId?: string | undefined;
  private readonly client: FeedsClient;

  constructor(client: FeedsClient, options?: FeedSearchSourceOptions) {
    super(options);
    this.client = client;
    this.feedGroupId = options?.groupId;
    this.type = `${this.feedGroupId}-feed`;
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
      next: this.next ?? undefined,
    });

    return { items, next };
  }

  protected filterQueryResults(items: Feed[]) {
    return items;
  }
}

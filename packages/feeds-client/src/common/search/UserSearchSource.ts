import { BaseSearchSource } from './BaseSearchSource';
import type { SearchSourceOptions } from './types';

import type { FeedsClient } from '../../feeds-client';
import type { UserResponse } from '../../gen/models';

export class UserSearchSource extends BaseSearchSource<UserResponse> {
  readonly type = 'user' as const;
  private readonly client: FeedsClient;

  constructor(client: FeedsClient, options?: SearchSourceOptions) {
    super(options);
    this.client = client;
  }

  protected async query(searchQuery: string) {
    const { connected_user: connectedUser } =
      this.client.state.getLatestValue();
    if (!connectedUser) return { items: [] };

    const { users: items } = await this.client.queryUsers({
      payload: {
        filter_conditions: {
          ...(!this.allowEmptySearchString || searchQuery.length > 0
            ? {
                name: {
                  $autocomplete: searchQuery,
                },
              }
            : {}),
        },
      },
    });

    return { items, next: undefined };
  }

  protected filterQueryResults(items: UserResponse[]) {
    return items;
  }
}

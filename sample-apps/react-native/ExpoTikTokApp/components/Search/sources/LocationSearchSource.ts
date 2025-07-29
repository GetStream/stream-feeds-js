import { BaseSearchSource } from '@stream-io/feeds-react-native-sdk';
import type {
  SearchSourceOptions,
  FeedsClient,
  ActivityResponse,
} from '@stream-io/feeds-react-native-sdk';

export class LocationSearchSource extends BaseSearchSource<ActivityResponse> {
  readonly type = 'activity-location' as const;
  private readonly client: FeedsClient;

  constructor(client: FeedsClient, options?: SearchSourceOptions) {
    super(options);
    this.client = client;
  }

  protected async query(searchQuery: string) {
    const { connected_user: connectedUser } =
      this.client.state.getLatestValue();
    if (!connectedUser) return { items: [] };

    // TODO: Try to make this work with fuzzy searching and autocompletes, currently it only
    //       accepts full names.
    const { activities: items, next } = await this.client.queryActivities({
      sort: [{ direction: -1, field: 'created_at' }],
      ...(!this.allowEmptySearchString || searchQuery.length > 0
        ? {
            filter: {
              search_data: {
                $contains: { locationName: searchQuery },
              },
            },
          }
        : {}),
      limit: 10,
      next: this.next ?? undefined,
    });

    return { items, next };
  }

  protected filterQueryResults(items: ActivityResponse[]) {
    return items;
  }
}

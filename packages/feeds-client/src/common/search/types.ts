export type SearchSourceState<T = any> = {
  hasNext: boolean;
  isActive: boolean;
  isLoading: boolean;
  items: T[] | undefined;
  searchQuery: string;
  lastQueryError?: Error;
  next?: string | null;
  offset?: number;
};

export type SearchSourceOptions = {
  /** The number of milliseconds to debounce the search query. The default interval is 300ms. */
  debounceMs?: number;
  pageSize?: number;
  allowEmptySearchString?: boolean;
};

export type SearchSourceType = 'activity' | 'user' | 'feed' | (string & {});
export type QueryReturnValue<T> = { items: T[]; next?: string | null };

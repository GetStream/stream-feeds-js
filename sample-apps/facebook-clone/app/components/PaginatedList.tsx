import { ReactElement } from 'react';
import { LoadingIndicator } from './LoadingIndicator';

export function PaginatedList<T>({
  hasNext,
  isLoading,
  error,
  renderItem,
  items,
  onLoadMore,
  listContainerClassNames = '',
}: {
  hasNext: boolean;
  isLoading: boolean;
  error?: Error;
  items: T[];
  renderItem: (item: T, index: number) => ReactElement;
  onLoadMore: () => void;
  listContainerClassNames?: string;
}) {
  return (
    <div className="w-full flex flex-col items-center">
      {isLoading && items.length === 0 && (
        <LoadingIndicator color="blue"></LoadingIndicator>
      )}
      {items.length === 0 && !isLoading && !error && (
        <div className="text-center">This list is empty</div>
      )}
      {items.length > 0 && (
        <ul className={`w-full flex flex-col gap-3 ${listContainerClassNames}`}>
          {items.map((item, index) => renderItem(item, index))}
        </ul>
      )}
      {items.length > 0 && hasNext && (
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => onLoadMore()}
          disabled={isLoading}
        >
          {isLoading ? <LoadingIndicator></LoadingIndicator> : 'Load more'}
        </button>
      )}
    </div>
  );
}

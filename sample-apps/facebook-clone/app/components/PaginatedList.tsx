import { ReactElement, useEffect } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { useErrorContext } from '../error-context';

export function PaginatedList<T>({
  hasNext,
  isLoading,
  error,
  renderItem,
  items,
  onLoadMore,
  listContainerClassNames = '',
  itemsName = 'items',
}: {
  hasNext: boolean;
  isLoading: boolean;
  error?: Error;
  items: T[];
  renderItem: (item: T, index: number) => ReactElement;
  onLoadMore: () => void;
  listContainerClassNames?: string;
  itemsName?: string;
}) {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();

  useEffect(() => {
    if (!error) {
      return;
    }
    if (error) {
      if (items.length === 0) {
        logError(error);
      } else {
        logErrorAndDisplayNotification(error, (error as Error).message);
      }
    }
  }, [error, items]);
  return (
    <div className="w-full flex flex-col items-center">
      {isLoading && items.length === 0 && (
        <LoadingIndicator color="blue"></LoadingIndicator>
      )}
      {items.length === 0 && !isLoading && !error && (
        <div className="text-center">{`No ${itemsName}`}</div>
      )}
      {items.length === 0 && !isLoading && error && (
        <>
          <div>{`Failed to load ${itemsName}`}</div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => onLoadMore()}
            disabled={isLoading}
          >
            {isLoading ? <LoadingIndicator></LoadingIndicator> : 'Retry'}
          </button>
        </>
      )}
      {items.length > 0 && (
        <ul className={`w-full flex flex-col gap-3 ${listContainerClassNames}`}>
          {items.map((item, index) => renderItem(item, index))}
        </ul>
      )}
      {items.length > 0 && hasNext && (
        <button
          type="submit"
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => onLoadMore()}
          disabled={isLoading}
        >
          {isLoading ? <LoadingIndicator></LoadingIndicator> : 'Load more'}
        </button>
      )}
    </div>
  );
}

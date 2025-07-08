import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import type { SearchControllerState } from '@stream-io/feeds-client';
import { useStateStore } from '@stream-io/feeds-client/react-bindings';

import { useSearchContext } from '../SearchContext';
import { useSearchQueriesInProgress } from '../hooks';
import { SearchSourceFilters } from '../SearchResults';

const searchControllerStateSelector = (nextValue: SearchControllerState) => ({
  isActive: nextValue.isActive,
  searchQuery: nextValue.searchQuery,
});

export const SearchBar = () => {
  const { disabled, exitSearchOnInputBlur, placeholder, searchController } =
    useSearchContext();
  const queriesInProgress = useSearchQueriesInProgress(searchController);

  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const { isActive, searchQuery } = useStateStore(
    searchController.state,
    searchControllerStateSelector,
  );

  useEffect(() => {
    if (!input) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        input.blur();
        searchController.exit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchController, input]);

  return (
    <div className={clsx('flex ', { '': isActive })} data-testid="search-bar">
      <div className="flex items-center justify-start w-full px-2 gap-2 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="material-symbols-outlined">search</span>
        <SearchSourceFilters />
        <input
          className="outline-none"
          data-testid="search-input"
          disabled={disabled}
          onBlur={() => {
            if (exitSearchOnInputBlur) searchController.exit();
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.value) {
              void searchController.search(event.target.value);
            } else if (!event.target.value) {
              searchController.clear();
            }
          }}
          onFocus={searchController.activate}
          placeholder={placeholder ?? 'Search'}
          ref={setInput}
          type="text"
          value={searchQuery}
        />
        {searchQuery && (
          <button
            className="flex"
            data-testid="clear-input-button"
            disabled={queriesInProgress.length > 0} // prevent user from clearing the input while query is in progress and avoid out-of-sync UX
            onClick={() => {
              searchController.clear();
              input?.focus();
            }}
          >
            <span className="material-symbols-outlined">clear</span>
          </button>
        )}
      </div>
    </div>
  );
};

//  <div className="text-black relative">
//           <input
//             type="text"
//             placeholder="Search..."
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <ul className="absolute mt-2 bg-white border border-gray-200 rounded-md shadow">
//             <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
//               Item 1
//             </li>
//             <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
//               Item 2
//             </li>
//             <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
//               Item 3
//             </li>
//           </ul>
//         </div>

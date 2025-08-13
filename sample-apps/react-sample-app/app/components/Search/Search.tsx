import clsx from 'clsx';
import React from 'react';
import type {
  SearchController,
  SearchControllerState,
} from '@stream-io/feeds-react-sdk';
import { useStateStore } from '@stream-io/feeds-react-sdk';

import { SearchBar } from './SearchBar/SearchBar';
import { SearchResults } from './SearchResults/SearchResults';
import { SearchContextProvider } from './SearchContext';

type SearchControllerStateSelectorReturnValue = {
  isActive: boolean;
};

const searchControllerStateSelector = (
  nextValue: SearchControllerState,
): SearchControllerStateSelectorReturnValue => ({
  isActive: nextValue.isActive,
});

export type SearchProps = {
  directMessagingChannelType?: string;
  /** Sets the input element into disabled state */
  disabled?: boolean;
  /** Clear search state / results on every click outside the search input, defaults to false */
  exitSearchOnInputBlur?: boolean;
  /** Custom placeholder text to be displayed in the search input */
  placeholder?: string;
  searchController: SearchController;
};

export const Search = ({
  directMessagingChannelType = 'messaging',
  disabled,
  exitSearchOnInputBlur,
  placeholder,
  searchController,
}: SearchProps) => {
  const { isActive } = useStateStore<
    SearchControllerState,
    SearchControllerStateSelectorReturnValue
  >(searchController.state, searchControllerStateSelector);

  return (
    <SearchContextProvider
      value={{
        directMessagingChannelType,
        disabled,
        exitSearchOnInputBlur,
        placeholder,
        searchController,
      }}
    >
      <div
        className={clsx('text-gray-900 relative flex flex-col', {
          '': isActive,
        })}
        data-testid="search"
      >
        <SearchBar />
        <SearchResults />
      </div>
    </SearchContextProvider>
  );
};

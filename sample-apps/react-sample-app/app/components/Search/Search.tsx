import clsx from 'clsx';
import React from 'react';
import type {
  SearchController,
  SearchControllerState,
} from '@stream-io/feeds-client';

import { SearchBar } from './SearchBar/SearchBar';
import { SearchResults } from './SearchResults/SearchResults';
import { SearchContextProvider } from './SearchContext';
import { useStateStore } from '@/app/hooks/useStateStore';

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
        className={clsx('text-black', {
          'str-chat__search--active': isActive,
        })}
        data-testid="search"
      >
        <SearchBar />
        <SearchResults />
      </div>
    </SearchContextProvider>
  );
};

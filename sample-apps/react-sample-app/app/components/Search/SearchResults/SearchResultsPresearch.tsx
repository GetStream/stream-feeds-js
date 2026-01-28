import type { SearchSource } from '@stream-io/feeds-react-sdk';

export type SearchResultsPresearchProps = {
  activeSources: SearchSource[];
};

export const SearchResultsPresearch = (_props: SearchResultsPresearchProps) => {
  return (
    <div className="str-chat__search-results-presearch">
      {'Start typing to search'}
    </div>
  );
};

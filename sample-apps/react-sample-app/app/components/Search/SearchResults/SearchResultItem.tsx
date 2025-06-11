import { ComponentType } from 'react';
import {
  ActivityResponse,
  FeedResponse,
  UserResponse,
} from '@stream-io/feeds-client';

export type SearchResultItemComponents = Record<
  string,
  ComponentType<{ item: any }>
>;

export type UserSearchResultItemProps = {
  item: UserResponse;
};

export type FeedSearchResultItemProps = {
  item: FeedResponse;
};

export type ActivitySearchResultItemProps = {
  item: ActivityResponse;
};

export const UserSearchResultItem = ({ item }: UserSearchResultItemProps) => {
  return (
    <button
      aria-label={`Select User Channel: ${item.name ?? ''}`}
      className="str-chat__search-result"
      data-testid="search-result-user"
      role="option"
    >
      <div className="str-chat__search-result--display-name">
        {item.name ?? item.id}
      </div>
    </button>
  );
};

export const FeedSearchResultItem = ({ item }: FeedSearchResultItemProps) => {
  return (
    <button
      className="str-chat__search-result"
      data-testid="search-result-user"
      role="option"
    >
      <div className="str-chat__search-result--display-name">{item.fid}</div>
    </button>
  );
};

export const ActivitySearchResultItem = ({
  item,
}: ActivitySearchResultItemProps) => {
  return (
    <button
      className="str-chat__search-result"
      data-testid="search-result-user"
      role="option"
    >
      <div className="str-chat__search-result--display-name">{item.text}</div>
    </button>
  );
};

export const DefaultSearchResultItems: SearchResultItemComponents = {
  feed: FeedSearchResultItem,
  activity: ActivitySearchResultItem,
  user: UserSearchResultItem,
};

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
      className="text-left flex gap-2 p-1 items-center rounded-md hover:bg-slate-100"
      role="option"
    >
      <div className="w-5 h-5 items-center flex">
        <img className="rounded-full" src={item.image}></img>
      </div>
      <div className="">{item.name ?? item.id}</div>
    </button>
  );
};

export const FeedSearchResultItem = ({ item }: FeedSearchResultItemProps) => {
  return (
    <button
      className="text-left"
      data-testid="search-result-feed"
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
      className="text-left flex gap-2 p-1 items-center rounded-md hover:bg-slate-100"
      data-testid="search-result-activity"
      role="option"
    >
      <div className="">{item.text}</div>
      <div></div>
    </button>
  );
};

export const DefaultSearchResultItems: SearchResultItemComponents = {
  feed: FeedSearchResultItem,
  activity: ActivitySearchResultItem,
  user: UserSearchResultItem,
};

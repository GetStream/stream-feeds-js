import type { ComponentType } from 'react';
import type {
  Feed,
  FeedState} from '@stream-io/feeds-react-sdk';
import {
  useStateStore,
  type ActivityResponse,
} from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { useOwnFeedsContext } from '@/app/own-feeds-context';

export type SearchResultItemComponents = Record<
  string,
  ComponentType<{ item: any }>
>;

export type FeedSearchResultItemProps = {
  item: Feed;
};

export type ActivitySearchResultItemProps = {
  item: ActivityResponse;
};

const selector = (nextValue: FeedState) => ({
  own_follows: nextValue.own_follows ?? [],
  created_by: nextValue.created_by,
});
export const FeedSearchResultItem = ({ item }: FeedSearchResultItemProps) => {
  const { ownTimeline } = useOwnFeedsContext();

  const { own_follows: ownFollows, created_by: createdBy } = useStateStore(
    item.state,
    selector,
  );

  const isFollowing =
    ownFollows.some(
      (follow) => follow.source_feed.feed === ownTimeline?.feed,
    ) ?? false;

  return (
    <div
      className="text-left justify-between flex items-center p-1"
      data-testid="search-result-feed"
      role="option"
    >
      <Link className="underline text-blue-500" href={`/users/${item.id}`}>
        {createdBy?.name ?? item.id}
      </Link>
      <button
        className="text-sm px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        onClick={() => {
          if (isFollowing) {
            ownTimeline?.unfollow(item.feed);
          } else {
            ownTimeline?.follow(item.feed, {
              create_notification_activity: true,
            });
          }
        }}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export const ActivitySearchResultItem = ({
  item,
}: ActivitySearchResultItemProps) => {
  return (
    <Link href={`/activity/${item.id}`}>
      <button
        className="text-left flex gap-2 p-1 items-center rounded-md hover:bg-slate-100"
        data-testid="search-result-activity"
        role="option"
      >
        <div className="">{item.text}</div>
        <div></div>
      </button>
    </Link>
  );
};

export const DefaultSearchResultItems: SearchResultItemComponents = {
  'user-feed': FeedSearchResultItem,
  activity: ActivitySearchResultItem,
};

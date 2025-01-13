'use client';
import { useEffect, useState } from 'react';
import { Feed } from '../components/Feed';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useFeedContext } from '../feed-context';
import Link from 'next/link';

export default function Home() {
  const { ownTimeline } = useFeedContext();
  const [followingCount, setFollowingCount] = useState<number>();

  useEffect(() => {
    if (!ownTimeline) {
      return;
    }
    const unsubscribe = ownTimeline.state.subscribeWithSelector(
      (state) => ({
        following_count: state.following_count,
      }),
      (state) => {
        setFollowingCount(state.following_count);
      },
    );

    return unsubscribe;
  }, [ownTimeline]);

  if (!ownTimeline) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  if (followingCount === 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div>Your timeline is empty</div>
        <Link href="/users" className="underline">
          Start following people
        </Link>
      </div>
    );
  }

  return <Feed feed={ownTimeline} onNewPost="show-notification"></Feed>;
}

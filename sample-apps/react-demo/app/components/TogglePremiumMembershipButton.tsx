import { useCallback, useState } from 'react';
import type { Feed, FeedState } from '@stream-io/feeds-react-sdk';
import { useClientConnectedUser, useStateStore } from '@stream-io/feeds-react-sdk';
import { ErrorToast } from './utility/ErrorToast';
import { useOwnFeedsContext } from '../own-feeds-context';

const selector = ({ own_membership }: FeedState) => ({
  own_membership,
});

export const TogglePremiumMembershipButton = ({
  feed,
  userId,
}: {
  feed: Feed;
  userId: string;
}) => {
  const currentUser = useClientConnectedUser();
  const { own_membership } = useStateStore(feed.state, selector) ?? {};
  const isPremium = own_membership?.membership_level?.id === 'premium';
  const { reloadTimelines } = useOwnFeedsContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const toggleMembership = useCallback(async () => {
    if (isLoading || !currentUser?.id) return;
    setError(undefined);
    setIsLoading(true);

    try {
      const res = await fetch('/api/premium-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedOwnerId: userId,
          userId: currentUser.id,
          action: isPremium ? 'remove' : 'add',
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? 'Failed to update membership');
      }

      void feed.getOrCreate();
      void reloadTimelines();
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Something went wrong. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentUser?.id, userId, isPremium, feed, reloadTimelines]);

  const baseStyles =
    'flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-200 select-none';

  const membershipStyles = isPremium
    ? 'bg-transparent text-base-content border-2 border-base-300 hover:border-base-content/50 hover:bg-base-300 active:scale-[0.98] active:bg-base-300'
    : 'bg-base-content text-base-100 border-2 border-transparent hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] active:brightness-95';

  const loadingStyles = isLoading ? 'pointer-events-none opacity-70 cursor-wait' : 'cursor-pointer';

  return (
    <>
      <button
        type="button"
        className={`${baseStyles} ${membershipStyles} ${loadingStyles}`}
        onClick={toggleMembership}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={
          isLoading ? 'Updating…' : isPremium ? 'Remove premium membership' : 'Become a premium member'
        }
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm" aria-hidden />
        ) : (
          <>
            {isPremium ? 'Premium member' : 'Become a premium member'}
          </>
        )}
      </button>
      <ErrorToast error={error} />
    </>
  );
};

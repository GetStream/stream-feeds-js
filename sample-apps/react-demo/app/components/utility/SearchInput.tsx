import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

export const SearchInput = () => {
  const router = useRouter();
  const currentUser = useClientConnectedUser();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchClicked = useCallback(() => {
    const query = searchInputRef.current?.value ?? '';
    if (query) {
      router.push(
        `/search?q=${encodeURIComponent(query)}&user_id=${currentUser?.id}`,
      );
    }
  }, [router, currentUser?.id]);

  return (
    <div className="join w-full">
      <div className="w-full">
        <label className="input join-item w-full">
          <input
            className="w-full"
            ref={searchInputRef}
            placeholder="🔍 Search..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                searchClicked();
              }
            }}
          />{' '}
        </label>
      </div>
      <button
        onClick={searchClicked}
        className="btn btn-soft btn-primary join-item"
      >
        Search
      </button>
    </div>
  );
};

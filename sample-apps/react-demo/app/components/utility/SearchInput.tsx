import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

export const SearchInput = () => {
  const router = useRouter();
  const currentUser = useClientConnectedUser();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const searchClicked = useCallback(() => {
    const query = searchInputRef.current?.value ?? '';
    if (query) {
      router.push(
        `/search?q=${encodeURIComponent(query)}&user_id=${currentUser?.id}`,
      );
    }
  }, [router, currentUser?.id]);

  return (
    <div
      className={`
        search-input flex items-center gap-3 w-full px-4 py-3
        bg-base-200 rounded-full transition-all duration-200
        border border-transparent dark:border-base-content/20
        ${isFocused ? 'bg-base-100 ring-2 ring-primary border-primary' : ''}
      `}
    >
      <span className={`material-symbols-outlined text-xl ${isFocused ? 'text-primary' : 'text-base-content/50'}`}>
        search
      </span>
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search"
        className="flex-1 bg-transparent text-[15px] placeholder:text-base-content/50"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            searchClicked();
          }
        }}
      />
    </div>
  );
};

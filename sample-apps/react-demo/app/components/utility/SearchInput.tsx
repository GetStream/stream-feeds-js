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
        search-input flex items-center gap-2.5 w-full px-4 py-2.5
        bg-base-100 rounded-full transition-all duration-200
        border border-base-content/10
        ${isFocused ? 'border-primary ring-1 ring-primary' : ''}
      `}
    >
      <span className={`material-symbols-outlined text-[18px]! ${isFocused ? 'text-primary' : 'text-base-content/60'}`}>
        search
      </span>
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search"
        className="flex-1 bg-transparent text-[13px] placeholder:text-base-content/60"
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

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Feed } from '@stream-io/feeds-react-sdk';
import type { CaretPosition } from './useCaretPosition';

const DROPDOWN_WIDTH = 256;
const DROPDOWN_MAX_HEIGHT = 200;
const VIEWPORT_PADDING = 8;

type DropdownPosition = {
  top: number;
  left: number;
  openUpward: boolean;
};

function calculateDropdownPosition(
  caretPos: CaretPosition,
  dropdownHeight: number,
): DropdownPosition {
  const spaceBelow = window.innerHeight - caretPos.top - caretPos.height;
  const openUpward = spaceBelow < dropdownHeight && caretPos.top > dropdownHeight;

  let left = caretPos.left;
  if (left + DROPDOWN_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left = window.innerWidth - DROPDOWN_WIDTH - VIEWPORT_PADDING;
  }
  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }

  const top = openUpward
    ? caretPos.top - dropdownHeight
    : caretPos.top + caretPos.height;

  return { top, left, openUpward };
}

export type HashtagSuggestionListProps = {
  suggestions: Feed[];
  selectedIndex: number;
  isLoading: boolean;
  isCreating: boolean;
  createError: Error | undefined;
  query: string;
  caretPosition: CaretPosition | null;
  onSelect: (feed: Feed) => void;
  onCreateHashtag: (name: string) => void;
  onHover: (index: number) => void;
  portalContainer?: HTMLElement | null;
};

export const HashtagSuggestionList = ({
  suggestions,
  selectedIndex,
  isLoading,
  isCreating,
  createError,
  query,
  caretPosition,
  onSelect,
  onCreateHashtag,
  onHover,
  portalContainer,
}: HashtagSuggestionListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);

  const showCreateOption = suggestions.length === 0 && !isLoading && query.length > 0;

  useEffect(() => {
    if (!caretPosition) {
      setDropdownPosition(null);
      return;
    }

    const itemCount = suggestions.length + (showCreateOption ? 1 : 0);
    const estimatedHeight = Math.min(
      itemCount * 44 + (isLoading ? 44 : 0) + (createError ? 32 : 0) + 16,
      DROPDOWN_MAX_HEIGHT,
    );

    setDropdownPosition(calculateDropdownPosition(caretPosition, estimatedHeight));
  }, [caretPosition, suggestions.length, isLoading, showCreateOption, createError]);

  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!caretPosition || !dropdownPosition) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={listRef}
      className="rounded-box bg-base-100 shadow-lg border border-base-300 py-2"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: DROPDOWN_WIDTH,
        maxHeight: DROPDOWN_MAX_HEIGHT,
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 9999,
      }}
    >
      {isLoading && suggestions.length === 0 && (
        <div className="px-3 py-2 text-base-content/60 flex items-center gap-2">
          <span className="loading loading-spinner loading-sm"></span>
          Searching...
        </div>
      )}

      {suggestions.map((feed, index) => (
        <button
          key={feed.id}
          type="button"
          className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-base-200 cursor-pointer text-left ${index === selectedIndex ? 'bg-base-200' : ''}`}
          onClick={() => onSelect(feed)}
          onMouseEnter={() => onHover(index)}
        >
          <span className="material-symbols-outlined text-base text-primary">tag</span>
          <span className="truncate">{feed.state.getLatestValue().name ?? feed.id}</span>
        </button>
      ))}

      {showCreateOption && (
        <button
          type="button"
          className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-base-200 cursor-pointer text-left ${suggestions.length === selectedIndex ? 'bg-base-200' : ''}`}
          onClick={() => onCreateHashtag(query)}
          onMouseEnter={() => onHover(suggestions.length)}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <span className="loading loading-spinner loading-sm text-primary"></span>
              <span className="text-base-content/60">Creating #{query}...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base text-primary">add</span>
              <span className="truncate">Create #{query}</span>
            </>
          )}
        </button>
      )}

      {createError && (
        <div className="px-3 py-1 text-xs text-error">
          Failed to create: {createError.message}
        </div>
      )}
    </div>,
    portalContainer ?? document.body,
  );
};

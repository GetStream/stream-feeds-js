import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { UserResponse } from '@stream-io/feeds-react-sdk';
import type { CaretPosition } from './useCaretPosition';
import { Avatar } from '../../utility/Avatar';

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

export type MentionSuggestionListProps = {
  suggestions: UserResponse[];
  selectedIndex: number;
  isLoading: boolean;
  caretPosition: CaretPosition | null;
  onSelect: (user: UserResponse) => void;
  onHover: (index: number) => void;
};

export const MentionSuggestionList = ({
  suggestions,
  selectedIndex,
  isLoading,
  caretPosition,
  onSelect,
  onHover,
}: MentionSuggestionListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);

  // Calculate position when caret position changes
  useEffect(() => {
    if (!caretPosition) {
      setDropdownPosition(null);
      return;
    }

    // Use actual dropdown height or estimate
    const estimatedHeight = Math.min(
      suggestions.length * 44 + (isLoading ? 44 : 0) + 16, // 44px per item + padding
      DROPDOWN_MAX_HEIGHT,
    );

    setDropdownPosition(calculateDropdownPosition(caretPosition, estimatedHeight));
  }, [caretPosition, suggestions.length, isLoading]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!caretPosition || !dropdownPosition) return null;
  if (typeof document === 'undefined') return null;

  const isEmpty = suggestions.length === 0 && !isLoading;

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

      {isEmpty && (
        <div className="px-3 py-2 text-base-content/60">No users found</div>
      )}

      {suggestions.map((user, index) => (
        <button
          key={user.id}
          type="button"
          className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-base-200 cursor-pointer text-left ${index === selectedIndex ? 'bg-base-200' : ''}`}
          onClick={() => onSelect(user)}
          onMouseEnter={() => onHover(index)}
        >
          <Avatar user={user} className="w-6 h-6" />
          <span className="truncate">{user.name || user.id}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
};

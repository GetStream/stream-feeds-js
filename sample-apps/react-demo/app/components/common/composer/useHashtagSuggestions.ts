import { useState, useCallback, useRef, useEffect } from 'react';
import { useFeedsClient, type Feed } from '@stream-io/feeds-react-sdk';

export type HashtagSession = {
  active: boolean;
  triggerIndex: number;
  query: string;
};

type HashtagDetectionResult = {
  triggerIndex: number;
  query: string;
} | null;

function detectHashtag(
  text: string,
  cursorPosition: number,
): HashtagDetectionResult {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const lastHashIndex = textBeforeCursor.lastIndexOf('#');

  if (lastHashIndex === -1) return null;

  const charBefore = text[lastHashIndex - 1];
  const isWordBoundary = lastHashIndex === 0 || /\s/.test(charBefore);
  const query = textBeforeCursor.slice(lastHashIndex + 1);
  const hasSpace = /\s/.test(query);

  if (isWordBoundary && !hasSpace) {
    return { triggerIndex: lastHashIndex, query };
  }
  return null;
}

export type UseHashtagSuggestionsOptions = {
  debounceMs?: number;
  /** When provided, allows creating new hashtags. May return { id, name } so the correct feed id is used when posting. */
  onCreateHashtag?: (name: string) => Promise<{ id: string; name: string } | void>;
};

export const useHashtagSuggestions = (
  options: UseHashtagSuggestionsOptions = {},
) => {
  const { debounceMs = 300, onCreateHashtag } = options;
  const client = useFeedsClient();

  const [hashtagSession, setHashtagSession] = useState<HashtagSession>({
    active: false,
    triggerIndex: -1,
    query: '',
  });
  const [suggestions, setSuggestions] = useState<Feed[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | undefined>(undefined);
  const [selectedHashtags, setSelectedHashtags] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>('');

  const closeHashtagSession = useCallback(() => {
    setHashtagSession({ active: false, triggerIndex: -1, query: '' });
    setSuggestions([]);
    setSelectedIndex(0);
    setCreateError(undefined);
    lastQueryRef.current = '';
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const queryHashtags = useCallback(
    async (query: string) => {
      if (!client) return;

      if (query === lastQueryRef.current) return;
      lastQueryRef.current = query;

      if (query.length === 0) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await client.queryFeeds({
          filter: {
            group_id: 'hashtag',
            name: { $autocomplete: query },
          },
        });
        setSuggestions(response.feeds ?? []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Failed to query hashtags:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const removeDeletedHashtags = useCallback(
    (text: string): void => {
      const filtered = selectedHashtags.filter((h) =>
        text.includes(`#${h.name}`),
      );
      setSelectedHashtags(filtered);
    },
    [selectedHashtags],
  );

  const handleTextChange = useCallback(
    (text: string, cursorPosition: number) => {
      const detection = detectHashtag(text, cursorPosition);

      if (detection) {
        setHashtagSession({
          active: true,
          triggerIndex: detection.triggerIndex,
          query: detection.query,
        });

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          queryHashtags(detection.query);
        }, debounceMs);
      } else {
        closeHashtagSession();
      }
      removeDeletedHashtags(text);
    },
    [queryHashtags, debounceMs, closeHashtagSession, removeDeletedHashtags],
  );

  const selectHashtag = useCallback(
    (feed: Feed, currentText: string): string => {
      if (!hashtagSession.active) return currentText;

      const beforeHashtag = currentText.slice(0, hashtagSession.triggerIndex);
      const afterHashtag = currentText.slice(
        hashtagSession.triggerIndex + 1 + hashtagSession.query.length,
      );
      const hashtagName = feed.state.getLatestValue().name ?? '';
      const newText = `${beforeHashtag}#${hashtagName} ${afterHashtag}`;

      if (!selectedHashtags.some((h) => h.id === feed.id)) {
        setSelectedHashtags((prev) => [...prev, { id: feed.id, name: hashtagName }]);
      }

      closeHashtagSession();
      return newText;
    },
    [hashtagSession, selectedHashtags, closeHashtagSession],
  );

  const createHashtag = useCallback(
    async (name: string, currentText: string): Promise<string> => {
      if (!onCreateHashtag) return currentText;

      setIsCreating(true);
      setCreateError(undefined);
      try {
        const created = await onCreateHashtag(name);
        const { id: feedId, name: displayName } = created ?? { id: name, name };

        // After creation, insert the hashtag into text
        if (!hashtagSession.active) return currentText;

        const beforeHashtag = currentText.slice(0, hashtagSession.triggerIndex);
        const afterHashtag = currentText.slice(
          hashtagSession.triggerIndex + 1 + hashtagSession.query.length,
        );
        const newText = `${beforeHashtag}#${displayName} ${afterHashtag}`;

        if (!selectedHashtags.some((h) => h.id === feedId)) {
          setSelectedHashtags((prev) => [...prev, { id: feedId, name: displayName }]);
        }

        closeHashtagSession();
        return newText;
      } catch (error) {
        setCreateError(error as Error);
        return currentText;
      } finally {
        setIsCreating(false);
      }
    },
    [onCreateHashtag, hashtagSession, selectedHashtags, closeHashtagSession],
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      currentText: string,
      setText: (text: string) => void,
    ): void => {
      if (!hashtagSession.active) return;

      const totalItems =
        suggestions.length +
        (suggestions.length === 0 && !isLoading && hashtagSession.query
          ? 1
          : 0);
      if (totalItems === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
        case 'Tab':
          {
            e.preventDefault();
            if (selectedIndex < suggestions.length) {
              const selectedFeed = suggestions[selectedIndex];
              if (selectedFeed) {
                const newText = selectHashtag(selectedFeed, currentText);
                setText(newText);
              }
            } else if (suggestions.length === 0 && hashtagSession.query) {
              // "Create hashtag" option selected
              createHashtag(hashtagSession.query, currentText).then(
                (newText) => {
                  setText(newText);
                },
              );
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeHashtagSession();
          break;
      }
    },
    [
      hashtagSession.active,
      hashtagSession.query,
      suggestions,
      selectedIndex,
      isLoading,
      selectHashtag,
      createHashtag,
      closeHashtagSession,
    ],
  );

  const resetSelectedHashtags = useCallback(() => {
    setSelectedHashtags([]);
  }, []);

  const initializeSelectedHashtags = useCallback(
    (hashtags: Array<{ id: string; name: string }>) => {
      setSelectedHashtags(hashtags);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    hashtagSession,
    suggestions,
    selectedIndex,
    isLoading,
    isCreating,
    createError,
    selectedHashtags,
    handleTextChange,
    handleKeyDown,
    selectHashtag,
    createHashtag,
    closeHashtagSession,
    resetSelectedHashtags,
    initializeSelectedHashtags,
    setSelectedIndex,
  };
};

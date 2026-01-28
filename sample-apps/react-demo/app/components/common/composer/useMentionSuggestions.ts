import { useState, useCallback, useRef, useEffect } from 'react';
import { useFeedsClient, type UserResponse } from '@stream-io/feeds-react-sdk';

export type MentionSession = {
  active: boolean;
  triggerIndex: number;
  query: string;
};

type MentionDetectionResult = {
  triggerIndex: number;
  query: string;
} | null;

function detectMention(
  text: string,
  cursorPosition: number,
): MentionDetectionResult {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex === -1) return null;

  const charBefore = text[lastAtIndex - 1];
  const isWordBoundary = lastAtIndex === 0 || /\s/.test(charBefore);
  const query = textBeforeCursor.slice(lastAtIndex + 1);
  const hasSpace = /\s/.test(query);

  if (isWordBoundary && !hasSpace) {
    return { triggerIndex: lastAtIndex, query };
  }
  return null;
}

export type UseMentionSuggestionsOptions = {
  debounceMs?: number;
};

export const useMentionSuggestions = (
  options: UseMentionSuggestionsOptions = {},
) => {
  const { debounceMs = 300 } = options;
  const client = useFeedsClient();

  const [mentionSession, setMentionSession] = useState<MentionSession>({
    active: false,
    triggerIndex: -1,
    query: '',
  });
  const [suggestions, setSuggestions] = useState<UserResponse[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>('');

  const closeMentionSession = useCallback(() => {
    setMentionSession({ active: false, triggerIndex: -1, query: '' });
    setSuggestions([]);
    setSelectedIndex(0);
    lastQueryRef.current = '';
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const queryUsers = useCallback(
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
        const { users } = await client.queryUsers({
          payload: {
            filter_conditions: {
              name: { $autocomplete: query },
            },
          },
        });
        setSuggestions(users ?? []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Failed to query users:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [client],
  );

  const removeDeletedMentionedUsers = useCallback(
    (text: string): void => {
      const filteredUsers = mentionedUsers.filter((user) =>
        text.includes(`@${user.name}`),
      );
      setMentionedUsers(filteredUsers);
    },
    [mentionedUsers],
  );

  const handleTextChange = useCallback(
    (text: string, cursorPosition: number) => {
      const detection = detectMention(text, cursorPosition);

      if (detection) {
        setMentionSession({
          active: true,
          triggerIndex: detection.triggerIndex,
          query: detection.query,
        });

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          queryUsers(detection.query);
        }, debounceMs);
      } else {
        closeMentionSession();
      }
      removeDeletedMentionedUsers(text);
    },
    [queryUsers, debounceMs, closeMentionSession, removeDeletedMentionedUsers],
  );

  const selectUser = useCallback(
    (user: UserResponse, currentText: string): string => {
      if (!mentionSession.active) return currentText;

      const beforeMention = currentText.slice(0, mentionSession.triggerIndex);
      const afterMention = currentText.slice(
        mentionSession.triggerIndex + 1 + mentionSession.query.length,
      );
      const username = user.name!;
      const newText = `${beforeMention}@${username} ${afterMention}`;

      if (!mentionedUsers.some((u) => u.id === user.id)) {
        setMentionedUsers((prev) => [...prev, { id: user.id, name: username }]);
      }

      closeMentionSession();
      return newText;
    },
    [mentionSession, mentionedUsers, closeMentionSession],
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      currentText: string,
      setText: (text: string) => void,
    ): void => {
      if (!mentionSession.active || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + suggestions.length) % suggestions.length,
          );
          break;
        case 'Enter':
        case 'Tab':
          {
            e.preventDefault();
            const selectedUser = suggestions[selectedIndex];
            if (selectedUser) {
              const newText = selectUser(selectedUser, currentText);
              setText(newText);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeMentionSession();
          break;
      }
    },
    [
      mentionSession.active,
      suggestions,
      selectedIndex,
      selectUser,
      closeMentionSession,
    ],
  );

  const resetMentionedUsers = useCallback(() => {
    setMentionedUsers([]);
  }, []);

  const initializeMentionedUsers = useCallback(
    (users: Array<{ id: string; name: string }>) => {
      setMentionedUsers(users);
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
    mentionSession,
    suggestions,
    selectedIndex,
    isLoading,
    mentionedUsers,
    handleTextChange,
    handleKeyDown,
    selectUser,
    closeMentionSession,
    resetMentionedUsers,
    initializeMentionedUsers,
    setSelectedIndex,
  };
};

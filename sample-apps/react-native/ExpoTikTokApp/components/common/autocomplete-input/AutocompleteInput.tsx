import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
  TextInputProps,
  Platform,
} from 'react-native';
import { AutocompleteSearch } from '@/components/common/autocomplete-input/AutocompleteSearch';
import { AutocompleteSearchResults } from '@/components/common/autocomplete-input/AutocompleteSearchResults';
import {
  useSearchContext,
  useSearchResult,
} from '@stream-io/feeds-react-native-sdk';
import {
  Suggestion,
  SuggestionsList,
} from '@/components/common/autocomplete-input/SuggestionsList';
import { useStableCallback } from '@/hooks/useStableCallback';

const ALLOWED_CHARS = /[A-Za-z0-9_.]/;

type AutocompleteInputProps = TextInputProps & {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  enabledSuggestions?: Record<string, { name: string }>;
  height?: number;
};

const DEFAULT_ENABLED_SUGGESTIONS = {
  '@': { name: 'mention' },
  '#': { name: 'hashtag' },
};
const SUGGESTION_SESSION_CHARACTERS = Object.keys(DEFAULT_ENABLED_SUGGESTIONS);

const AutocompleteInputInner = ({
  text,
  setText,
  height = 300,
  enabledSuggestions = DEFAULT_ENABLED_SUGGESTIONS,
  ...textInputProps
}: AutocompleteInputProps) => {
  const searchController = useSearchContext();
  const { items: suggestions, error } = useSearchResult();
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const [layoutH, setLayoutH] = useState(0);

  const [session, setSession] = useState<null | {
    start: number;
    prefix: string;
  }>(null);

  const prevTextRef = useRef(text);
  const prevSelRef = useRef(selection);

  const query = useMemo(() => {
    if (!session) return null;

    const from = session.start + 1;
    const to = selection.start;

    if (to < from) return null;

    const slice = text.slice(from, to);

    for (let i = 0; i < slice.length; i++) {
      if (!ALLOWED_CHARS.test(slice[i])) return null;
    }
    return slice;
  }, [session, selection.start, text]);

  const onSelectionChange = useStableCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const sel = e.nativeEvent.selection;
      setSelection(sel);
      prevSelRef.current = sel;

      if (session) {
        const from = session.start + 1;
        const end = sel.start;
        const within =
          end >= from &&
          [...text.slice(from, end)].every((ch) => ALLOWED_CHARS.test(ch));

        if (!within) {
          setSession(null);
        }
      }
    },
  );

  const onChangeText = useStableCallback((next: string) => {
    const prev = prevTextRef.current;
    const selBefore = prevSelRef.current;

    const insertedOneChar =
      next.length === prev.length + 1 && selBefore.start === selBefore.end;

    const deletedOneChar =
      next.length === prev.length - 1 && selBefore.start === selBefore.end;

    if (insertedOneChar) {
      // handle adding characters
      const insertIndex = selBefore.start;
      const ch = next[insertIndex];
      const prevChar = insertIndex > 0 ? next[insertIndex - 1] : '';

      if (
        SUGGESTION_SESSION_CHARACTERS.includes(ch) &&
        (!prevChar ||
          (!ALLOWED_CHARS.test(prevChar) &&
            !SUGGESTION_SESSION_CHARACTERS.includes(prevChar)))
      ) {
        // start the session if we open with a suggestion character
        const suggestionType = enabledSuggestions[ch]?.name ?? '';
        if (suggestionType === 'mention') {
          searchController?.activateSource('user');
        } else if (suggestionType === 'hashtag') {
          searchController?.activateSource('hashtag-feed');
        }
        setSession({ start: insertIndex, prefix: ch });
      } else if (session) {
        const caretAfter = insertIndex + 1;
        const from = session.start + 1;
        const typedAllowed = ALLOWED_CHARS.test(ch);
        const stillExtending =
          caretAfter >= from && caretAfter === selection.start + 1;
        if (!(typedAllowed && stillExtending)) setSession(null);
      }
    } else if (deletedOneChar) {
      // handle removing characters
      if (session) {
        const from = session.start + 1;
        const caretBefore = selBefore.start;
        const caretAfter = Math.max(caretBefore - 1, 0);

        if (caretAfter >= from) {
          // still inside the mention query -> keep session and move caret left
          setSelection({ start: caretAfter, end: caretAfter });
          prevSelRef.current = { start: caretAfter, end: caretAfter };
          // search will run via the useEffect tied to `query`
        } else {
          // deleted '@' or stepped before it -> end session
          setSession(null);
        }
      }
    } else {
      // multi-char edits, paste, selection replaces, etc. -> exit session
      if (session) setSession(null);
    }

    setText(next);
    prevTextRef.current = next;
  });

  const pick = useStableCallback((u: Suggestion) => {
    if (!session) return;
    const from = session.start;
    const to = selection.start;
    const insert = `${session.prefix}${u.id} `;
    const newText = text.slice(0, from) + insert + text.slice(to);
    const caret = from + insert.length;
    setText(newText);
    setSelection({ start: caret, end: caret });
    setSession(null);
    prevTextRef.current = newText;
    prevSelRef.current = { start: caret, end: caret };
  });

  useEffect(() => {
    if (!session) {
      searchController?.clear();
      return;
    }
    searchController?.search(query ?? '');
  }, [query, session, searchController]);

  return (
    <>
      {session &&
        query !== null &&
        !error &&
        (suggestions ?? []).length > 0 && (
          <View style={[styles.suggestionsShadow, { bottom: layoutH + 25 }]}>
            <View style={[styles.suggestionsCard, { height }]}>
              <SuggestionsList
                onPress={pick}
                suggestions={suggestions as Suggestion[]}
              />
            </View>
          </View>
        )}

      <TextInput
        value={text}
        onChangeText={onChangeText}
        selection={selection}
        onSelectionChange={onSelectionChange}
        scrollEnabled
        onLayout={(e) => setLayoutH(e.nativeEvent.layout.height)}
        {...textInputProps}
      />
    </>
  );
};

const AutocompleteInput = (props: AutocompleteInputProps) => {
  return (
    <AutocompleteSearch>
      <AutocompleteSearchResults>
        <AutocompleteInputInner {...props} />
      </AutocompleteSearchResults>
    </AutocompleteSearch>
  );
};

export default AutocompleteInput;

const styles = StyleSheet.create({
  composer: { flex: 1 },
  suggestionsShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 10, borderRadius: 12 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.32,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },

  suggestionsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
});

import type { Attachment, Feed } from '@stream-io/feeds-react-sdk';
import type { ReactNode } from 'react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { LoadingIndicator } from '../../utility/LoadingIndicator';
import { FileUpload } from './FileUpload';
import { AttachmentPreviewList, type AttachmentPreviewListHandle } from '../attachments/AttachmentPreviewList';
import { useMentionSuggestions } from './useMentionSuggestions';
import { useHashtagSuggestions, type UseHashtagSuggestionsOptions } from './useHashtagSuggestions';
import { useCaretPosition, type CaretPosition } from './useCaretPosition';
import { MentionSuggestionList } from './MentionSuggestionList';
import { HashtagSuggestionList } from './HashtagSuggestionList';
import type { PollData } from '../../poll/PollComposerModal';
import type { LocationData } from '../../activity/LocationModal';

type ComposerVariant = 'activity' | 'comment';

const EMPTY_HASHTAGS: Array<{ id: string; name: string }> = [];

export type ComposerProps = {
  variant: ComposerVariant;
  placeholder?: string;
  submitLabel?: string;
  initialText?: string;
  initialAttachments?: Attachment[];
  initialMentionedUsers?: Array<{ id: string; name: string }>;
  initialSelectedHashtags?: Array<{ id: string; name: string }>;
  onSubmit: (text: string, attachments: Attachment[], mentionedUserIds: string[], selectedHashtagIds: string[]) => Promise<void>;
  allowEmptyText?: boolean;
  portalContainer?: HTMLElement | null;
  rows?: number;
  children?: ReactNode;
  attachedPoll?: PollData | null;
  onRemovePoll?: () => void;
  attachedLocation?: LocationData | null;
  onRemoveLocation?: () => void;
  enableHashtags?: boolean;
  onCreateHashtag?: (name: string) => Promise<{ id: string; name: string } | void>;
};

export const Composer = ({
  variant,
  placeholder = variant === 'comment' ? 'Post your reply' : 'What is happening?',
  submitLabel = variant === 'comment' ? 'Reply' : 'Post',
  initialText = '',
  initialAttachments = [],
  initialMentionedUsers = [],
  initialSelectedHashtags = EMPTY_HASHTAGS,
  onSubmit,
  allowEmptyText = false,
  portalContainer,
  rows,
  children,
  attachedPoll,
  onRemovePoll,
  attachedLocation,
  onRemoveLocation,
  enableHashtags = false,
  onCreateHashtag,
}: ComposerProps) => {
  const [text, setText] = useState(initialText);
  const [completedAttachments, setCompletedAttachments] = useState<Attachment[]>(initialAttachments);
  const [hasInFlightUploads, setHasInFlightUploads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caretPosition, setCaretPosition] = useState<CaretPosition | null>(null);
  const attachmentListRef = useRef<AttachmentPreviewListHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { getCaretPosition } = useCaretPosition();
  const {
    mentionSession,
    suggestions: mentionSuggestions,
    selectedIndex: mentionSelectedIndex,
    isLoading: mentionIsLoading,
    mentionedUsers,
    handleTextChange: handleMentionTextChange,
    handleKeyDown: handleMentionKeyDown,
    selectUser,
    resetMentionedUsers,
    setSelectedIndex: setMentionSelectedIndex,
    initializeMentionedUsers,
  } = useMentionSuggestions();

  const hashtagOptions: UseHashtagSuggestionsOptions = { onCreateHashtag };
  const {
    hashtagSession,
    suggestions: hashtagSuggestions,
    selectedIndex: hashtagSelectedIndex,
    isLoading: hashtagIsLoading,
    isCreating: hashtagIsCreating,
    createError: hashtagCreateError,
    handleTextChange: handleHashtagTextChange,
    handleKeyDown: handleHashtagKeyDown,
    selectHashtag,
    createHashtag,
    selectedHashtags,
    resetSelectedHashtags,
    initializeSelectedHashtags,
    setSelectedIndex: setHashtagSelectedIndex,
  } = useHashtagSuggestions(enableHashtags ? hashtagOptions : {});

  useEffect(() => {
    setText(initialText);
    setCompletedAttachments(initialAttachments);
    initializeMentionedUsers(initialMentionedUsers);
    initializeSelectedHashtags(initialSelectedHashtags);
  }, [initialText, initialAttachments, initialMentionedUsers, initializeMentionedUsers, initialSelectedHashtags, initializeSelectedHashtags]);

  // Update caret position when mention or hashtag session is active
  useEffect(() => {
    if (mentionSession.active && textareaRef.current) {
      const pos = getCaretPosition(textareaRef.current, mentionSession.triggerIndex);
      setCaretPosition(pos);
    } else if (enableHashtags && hashtagSession.active && textareaRef.current) {
      const pos = getCaretPosition(textareaRef.current, hashtagSession.triggerIndex);
      setCaretPosition(pos);
    } else {
      setCaretPosition(null);
    }
  }, [mentionSession.active, mentionSession.triggerIndex, hashtagSession.active, hashtagSession.triggerIndex, enableHashtags, getCaretPosition]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(undefined);
    try {
      await onSubmit(text, completedAttachments, mentionedUsers.map((u) => u.id), selectedHashtags.map((h) => h.id));
      setText('');
      setCompletedAttachments([]);
      resetMentionedUsers();
      resetSelectedHashtags();
      attachmentListRef.current?.reset();
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [text, completedAttachments, mentionedUsers, selectedHashtags, onSubmit, resetMentionedUsers, resetSelectedHashtags]);

  const handleFileSelected = useCallback((files: File[]) => {
    attachmentListRef.current?.uploadFiles(files);
  }, []);

  const handleAttachmentsChange = useCallback((attachments: Attachment[]) => {
    setCompletedAttachments(attachments);
  }, []);

  const handleHasInFlightUploadsChange = useCallback((hasUploads: boolean) => {
    setHasInFlightUploads(hasUploads);
  }, []);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);
      const cursorPos = e.target.selectionStart ?? newText.length;
      handleMentionTextChange(newText, cursorPos);
      if (enableHashtags) {
        handleHashtagTextChange(newText, cursorPos);
      }
    },
    [handleMentionTextChange, handleHashtagTextChange, enableHashtags],
  );

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionSession.active) {
        handleMentionKeyDown(e, text, setText);
      } else if (enableHashtags && hashtagSession.active) {
        handleHashtagKeyDown(e, text, setText);
      }
    },
    [handleMentionKeyDown, handleHashtagKeyDown, text, mentionSession.active, hashtagSession.active, enableHashtags],
  );

  const handleTextareaClick = useCallback(() => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart ?? text.length;
      handleMentionTextChange(text, cursorPos);
      if (enableHashtags) {
        handleHashtagTextChange(text, cursorPos);
      }
    }
  }, [handleMentionTextChange, handleHashtagTextChange, text, enableHashtags]);

  const handleTextareaKeyUp = useCallback(() => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart ?? text.length;
      handleMentionTextChange(text, cursorPos);
      if (enableHashtags) {
        handleHashtagTextChange(text, cursorPos);
      }
    }
  }, [handleMentionTextChange, handleHashtagTextChange, text, enableHashtags]);

  const handleSelectUser = useCallback(
    (user: Parameters<typeof selectUser>[0]) => {
      const newText = selectUser(user, text);
      setText(newText);
      textareaRef.current?.focus();
    },
    [selectUser, text],
  );

  const handleSelectHashtag = useCallback(
    (feed: Feed) => {
      const newText = selectHashtag(feed, text);
      setText(newText);
      textareaRef.current?.focus();
    },
    [selectHashtag, text],
  );

  const handleCreateHashtag = useCallback(
    (name: string) => {
      createHashtag(name, text).then((newText) => {
        setText(newText);
        textareaRef.current?.focus();
      });
    },
    [createHashtag, text],
  );

  const isComment = variant === 'comment';

  return (
    <div className="composer w-full flex flex-col gap-1 rounded-xl border border-base-content/10 p-4 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={`
            w-full flex-1 text-base leading-relaxed bg-transparent
            placeholder:text-base-content/70 resize-none outline-none
            ${isComment ? 'min-h-[40px] text-[15px]' : 'min-h-[80px]'}
          `}
          rows={rows ?? (isComment ? 1 : 2)}
          placeholder={placeholder}
          value={text}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          onClick={handleTextareaClick}
          onKeyUp={handleTextareaKeyUp}
        />
        {mentionSession.active && (
          <MentionSuggestionList
            suggestions={mentionSuggestions}
            selectedIndex={mentionSelectedIndex}
            isLoading={mentionIsLoading}
            caretPosition={caretPosition}
            onSelect={handleSelectUser}
            onHover={setMentionSelectedIndex}
            portalContainer={portalContainer}
          />
        )}
        {enableHashtags && hashtagSession.active && hashtagSession.query.length > 0 && !mentionSession.active && (
          <HashtagSuggestionList
            suggestions={hashtagSuggestions}
            selectedIndex={hashtagSelectedIndex}
            isLoading={hashtagIsLoading}
            isCreating={hashtagIsCreating}
            createError={hashtagCreateError}
            query={hashtagSession.query}
            caretPosition={caretPosition}
            onSelect={handleSelectHashtag}
            onCreateHashtag={handleCreateHashtag}
            onHover={setHashtagSelectedIndex}
            portalContainer={portalContainer}
          />
        )}
      </div>
      <AttachmentPreviewList
        ref={attachmentListRef}
        initialAttachments={initialAttachments}
        onAttachmentsChange={handleAttachmentsChange}
        onHasInFlightUploadsChange={handleHasInFlightUploadsChange}
        size="small"
      />
      {attachedPoll && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <span className="material-symbols-outlined text-primary text-xl shrink-0">ballot</span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-sm font-medium break-words">{attachedPoll.name}</div>
            {attachedPoll.description && (
              <div className="text-xs text-base-content/70 break-words">{attachedPoll.description}</div>
            )}
            <div className="text-xs text-base-content/60">
              {attachedPoll.options.length} options
              {!attachedPoll.enforce_unique_vote && ' · Multiple votes allowed'}
              {attachedPoll.allow_user_suggested_options && ' · Voters can suggest options'}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-error shrink-0"
            onClick={onRemovePoll}
            aria-label="Remove poll"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      )}
      {attachedLocation && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <span className="material-symbols-outlined text-primary text-xl shrink-0">location_on</span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-sm font-medium break-words">{attachedLocation.city}</div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-error shrink-0"
            onClick={onRemoveLocation}
            aria-label="Remove location"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      )}
      {error && (
        <div className="text-sm text-error">
          Failed to save: {error.message}
        </div>
      )}
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-1">
          <FileUpload
            onFileSelected={handleFileSelected}
            multiple={true}
            className="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary transition-colors"
          />
          {children}
        </div>
        <button
          className={`
            px-4 py-1.5 rounded-full font-semibold text-[15px]
            bg-primary text-primary-content
            hover:bg-primary/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
          onClick={handleSubmit}
          disabled={(!allowEmptyText && !text.trim()) || isSubmitting || hasInFlightUploads}
        >
          {isSubmitting ? <LoadingIndicator /> : submitLabel}
        </button>
      </div>
    </div>
  );
};

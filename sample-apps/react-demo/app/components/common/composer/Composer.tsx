import type { Attachment } from '@stream-io/feeds-react-sdk';
import { useCallback, useState, useEffect, useRef } from 'react';
import { LoadingIndicator } from '../../utility/LoadingIndicator';
import { FileUpload } from './FileUpload';
import { AttachmentPreviewList, type AttachmentPreviewListHandle } from '../attachments/AttachmentPreviewList';
import { useMentionSuggestions } from './useMentionSuggestions';
import { useCaretPosition, type CaretPosition } from './useCaretPosition';
import { MentionSuggestionList } from './MentionSuggestionList';

type ComposerVariant = 'activity' | 'comment';

export type ComposerProps = {
  variant: ComposerVariant;
  placeholder?: string;
  submitLabel?: string;
  initialText?: string;
  initialAttachments?: Attachment[];
  initialMentionedUsers?: Array<{ id: string; name: string }>;
  onSubmit: (text: string, attachments: Attachment[], mentionedUserIds: string[]) => Promise<void>;
  allowEmptyText?: boolean;
  portalContainer?: HTMLElement | null;
  rows?: number;
};

export const Composer = ({
  variant,
  placeholder = variant === 'comment' ? 'Post your reply' : 'What is happening?',
  submitLabel = variant === 'comment' ? 'Reply' : 'Post',
  initialText = '',
  initialAttachments = [],
  initialMentionedUsers = [],
  onSubmit,
  allowEmptyText = false,
  portalContainer,
  rows,
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
    suggestions,
    selectedIndex,
    isLoading,
    mentionedUsers,
    handleTextChange,
    handleKeyDown,
    selectUser,
    resetMentionedUsers,
    setSelectedIndex,
    initializeMentionedUsers,
  } = useMentionSuggestions();

  useEffect(() => {
    setText(initialText);
    setCompletedAttachments(initialAttachments);
    initializeMentionedUsers(initialMentionedUsers);
  }, [initialText, initialAttachments, initialMentionedUsers, initializeMentionedUsers]);

  // Update caret position when mention session is active
  useEffect(() => {
    if (mentionSession.active && textareaRef.current) {
      const pos = getCaretPosition(textareaRef.current, mentionSession.triggerIndex);
      setCaretPosition(pos);
    } else {
      setCaretPosition(null);
    }
  }, [mentionSession.active, mentionSession.triggerIndex, getCaretPosition]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(undefined);
    try {
      await onSubmit(text, completedAttachments, mentionedUsers.map((u) => u.id));
      setText('');
      setCompletedAttachments([]);
      resetMentionedUsers();
      attachmentListRef.current?.reset();
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }, [text, completedAttachments, mentionedUsers, onSubmit, resetMentionedUsers]);

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
      handleTextChange(newText, e.target.selectionStart ?? newText.length);
    },
    [handleTextChange],
  );

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      handleKeyDown(e, text, setText);
    },
    [handleKeyDown, text],
  );

  const handleTextareaClick = useCallback(() => {
    if (textareaRef.current) {
      handleTextChange(text, textareaRef.current.selectionStart ?? text.length);
    }
  }, [handleTextChange, text]);

  const handleTextareaKeyUp = useCallback(() => {
    // Re-check mention detection on cursor movement
    if (textareaRef.current) {
      handleTextChange(text, textareaRef.current.selectionStart ?? text.length);
    }
  }, [handleTextChange, text]);

  const handleSelectUser = useCallback(
    (user: Parameters<typeof selectUser>[0]) => {
      const newText = selectUser(user, text);
      setText(newText);
      textareaRef.current?.focus();
    },
    [selectUser, text],
  );

  const isComment = variant === 'comment';

  return (
    <div className="composer w-full flex flex-col gap-1 rounded-xl border border-base-content/20 p-4 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={`
            w-full flex-1 text-xl leading-relaxed bg-transparent
            placeholder:text-base-content/50 resize-none outline-none
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
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            isLoading={isLoading}
            caretPosition={caretPosition}
            onSelect={handleSelectUser}
            onHover={setSelectedIndex}
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
      {error && (
        <div className="text-sm text-error">
          Failed to save: {error.message}
        </div>
      )}
      <div className="w-full flex justify-between items-center">
        <FileUpload
          onFileSelected={handleFileSelected}
          multiple={true}
          className="w-9 h-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-primary transition-colors"
        />
        <button
          className={`
            px-4 py-1.5 rounded-full font-bold text-[15px]
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

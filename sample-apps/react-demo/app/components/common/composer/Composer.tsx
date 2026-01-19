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
  textareaBorder?: boolean;
};

export const Composer = ({
  variant,
  placeholder = variant === 'comment' ? 'Post your reply' : 'What is happening?',
  submitLabel = variant === 'comment' ? 'Reply' : 'Post',
  initialText = '',
  initialAttachments = [],
  initialMentionedUsers = [],
  onSubmit,
  textareaBorder = true,
}: ComposerProps) => {
  const [text, setText] = useState(initialText);
  const [completedAttachments, setCompletedAttachments] = useState<Attachment[]>(initialAttachments);
  const [hasInFlightUploads, setHasInFlightUploads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caretPosition, setCaretPosition] = useState<CaretPosition | null>(null);
  const attachmentListRef = useRef<AttachmentPreviewListHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    try {
      await onSubmit(text, completedAttachments, mentionedUsers.map((u) => u.id));
      setText('');
      setCompletedAttachments([]);
      resetMentionedUsers();
      attachmentListRef.current?.reset();
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
  const buttonSize = isComment ? 'btn-sm' : '';

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={`w-full textarea flex-1 text-base ${isComment ? 'min-h-[40px]' : 'min-h-[60px]'} ${textareaBorder ? 'textarea-bordered' : 'textarea-ghost'}`}
          rows={isComment ? 1 : 3}
          placeholder={placeholder}
          value={text}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          onClick={handleTextareaClick}
          onKeyUp={handleTextareaKeyUp}
          style={{ resize: 'none' }}
        />
        {mentionSession.active && (
          <MentionSuggestionList
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            isLoading={isLoading}
            caretPosition={caretPosition}
            onSelect={handleSelectUser}
            onHover={setSelectedIndex}
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
      <div className="w-full flex justify-end items-center gap-2">
        <FileUpload
          onFileSelected={handleFileSelected}
          multiple={true}
          className={isComment ? 'btn btn-secondary btn-sm' : undefined}
        />
        <button
          className={`btn btn-primary flex-shrink-0 ${buttonSize}`}
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting || hasInFlightUploads}
        >
          {isSubmitting ? <LoadingIndicator /> : submitLabel}
        </button>
      </div>
    </div>
  );
};

import type { Attachment as AttachmentType } from '@stream-io/feeds-react-sdk';
import { useState, useCallback } from 'react';
import { Attachment } from './Attachment';
import { ImageViewer } from './ImageViewer';

export type AttachmentListProps = {
  attachments: AttachmentType[];
  size?: 'small' | 'medium' | 'large';
};

export const AttachmentList = ({
  attachments,
  size = 'medium',
}: AttachmentListProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const hasMultiple = attachments.length > 1;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
  }, [attachments.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
  }, [attachments.length]);

  const handleImageClick = useCallback(() => {
    const currentAttachment = attachments[currentIndex];
    if (currentAttachment.type !== 'video') {
      const imageOnlyIndex = attachments
        .filter((a) => a.type !== 'video')
        .findIndex((a) => a === currentAttachment);
      setViewerInitialIndex(imageOnlyIndex >= 0 ? imageOnlyIndex : 0);
      setIsViewerOpen(true);
    }
  }, [attachments, currentIndex]);

  if (attachments.length === 0) return null;

  const currentAttachment = attachments[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-full overflow-hidden">
      <div className="flex items-stretch gap-1">
        {hasMultiple && (
          <button
            className="cursor-pointer flex items-center justify-center px-2 hover:bg-base-200/50 rounded-lg transition-colors"
            onClick={goToPrevious}
            aria-label="Previous attachment"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}

        <div className="flex-shrink min-w-0">
          <Attachment
            attachment={currentAttachment}
            size={size}
            onClick={currentAttachment.type !== 'video' ? handleImageClick : undefined}
          />
        </div>

        {hasMultiple && (
          <button
            className="cursor-pointer flex items-center justify-center px-2 hover:bg-base-200/50 rounded-lg transition-colors"
            onClick={goToNext}
            aria-label="Next attachment"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>

      {hasMultiple && (
        <div className="flex justify-center gap-1 mt-2">
          {attachments.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-primary' : 'bg-base-300'
                }`}
            />
          ))}
        </div>
      )}

      <ImageViewer
        attachments={attachments}
        initialIndex={viewerInitialIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};

import type { Attachment as AttachmentType } from '@stream-io/feeds-react-sdk';
import { useState, useCallback, useMemo } from 'react';
import { Attachment } from './Attachment';
import { ImageViewer } from './ImageViewer';
import { SIZE_DIMENSIONS } from './sizes';
import {
  buildImageUrl,
  useImagePreloader,
} from '../../../utility/useImagePreloader';
import { useSwipeNavigation } from '../../../utility/useSwipeNavigation';

export type AttachmentListProps = {
  attachments: AttachmentType[];
  size?: 'small' | 'medium' | 'large' | 'extraLarge';
  disableButtons?: boolean;
};

export const AttachmentList = ({
  attachments,
  size = 'medium',
  disableButtons = false,
}: AttachmentListProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const hasMultiple = attachments.length > 1;

  const urlsToPreload = useMemo(() => {
    if (attachments.length <= 1) return [];
    const prevIdx =
      currentIndex === 0 ? attachments.length - 1 : currentIndex - 1;
    const nextIdx =
      currentIndex === attachments.length - 1 ? 0 : currentIndex + 1;

    const { width, height } = SIZE_DIMENSIONS[size];
    return [prevIdx, nextIdx]
      .map((idx) => attachments[idx])
      .filter((a) => a.type !== 'video' && a.image_url)
      .map((a) => buildImageUrl(a.image_url, width, height));
  }, [attachments, currentIndex, size]);

  useImagePreloader(urlsToPreload);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
  }, [attachments.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
  }, [attachments.length]);

  const swipeHandlers = useSwipeNavigation({
    threshold: 10,
    requireHorizontalDominance: true,
    enabled: hasMultiple,
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
  });

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
    <div className="flex flex-col w-full max-w-full overflow-hidden">
      <div
        className="relative w-full touch-pan-y"
        {...swipeHandlers}
      >
        {hasMultiple && !disableButtons && (
          <button
            className={`absolute left-0 z-10 flex items-center justify-center px-2 cursor-pointer ${currentAttachment.type === 'video'
              ? 'top-24 bottom-24' /* inset so video controls stay clickable */
              : 'top-0 h-full'
              }`}
            onClick={goToPrevious}
            aria-label="Previous attachment"
          >
            <span className="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 border-none shadow-md">
              <span className="material-symbols-outlined">chevron_left</span>
            </span>
          </button>
        )}

        <Attachment
          attachment={currentAttachment}
          size={size}
          onClick={!disableButtons && currentAttachment.type !== 'video' ? handleImageClick : undefined}
        />

        {hasMultiple && !disableButtons && (
          <button
            className={`absolute right-0 z-10 flex items-center justify-center px-2 cursor-pointer ${currentAttachment.type === 'video'
              ? 'top-24 bottom-24' /* inset so video controls stay clickable */
              : 'top-0 h-full'
              }`}
            onClick={goToNext}
            aria-label="Next attachment"
          >
            <span className="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 border-none shadow-md">
              <span className="material-symbols-outlined">chevron_right</span>
            </span>
          </button>
        )}

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
      </div>

      <ImageViewer
        attachments={attachments}
        initialIndex={viewerInitialIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};

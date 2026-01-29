import type { Attachment as AttachmentType } from '@stream-io/feeds-react-sdk';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  buildImageUrl,
  useImagePreloader,
} from '../../../utility/useImagePreloader';

const VIEWER_SIZE = { width: 1200, height: 1200 };

export type ImageViewerProps = {
  attachments: AttachmentType[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

export const ImageViewer = ({
  attachments,
  initialIndex,
  isOpen,
  onClose,
}: ImageViewerProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const imageAttachments = attachments.filter((a) => a.type !== 'video');
  const hasMultiple = imageAttachments.length > 1;
  const currentAttachment = imageAttachments[currentIndex];

  const urlsToPreload = useMemo(() => {
    if (imageAttachments.length <= 1) return [];
    const prevIdx =
      currentIndex === 0 ? imageAttachments.length - 1 : currentIndex - 1;
    const nextIdx =
      currentIndex === imageAttachments.length - 1 ? 0 : currentIndex + 1;

    return [prevIdx, nextIdx]
      .map((idx) => imageAttachments[idx])
      .map((a) => buildImageUrl(a.image_url, VIEWER_SIZE.width, VIEWER_SIZE.height));
  }, [imageAttachments, currentIndex]);

  useImagePreloader(urlsToPreload);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageAttachments.length - 1 : prev - 1));
  }, [imageAttachments.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === imageAttachments.length - 1 ? 0 : prev + 1));
  }, [imageAttachments.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext]);

  if (imageAttachments.length === 0) return null;

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <button
        className="btn btn-circle btn-sm fixed right-4 top-4 z-50 bg-base-100/80 hover:bg-base-100"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="modal-box w-full max-w-full p-4 overflow-hidden">
        <div className="relative flex items-center justify-center max-h-[80vh]">
          {hasMultiple && (
            <button
              className="absolute left-0 top-0 h-full z-10 flex items-center justify-center px-2"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <span className="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 border-none shadow-md">
                <span className="material-symbols-outlined">chevron_left</span>
              </span>
            </button>
          )}

          <img
            src={
              buildImageUrl(
                currentAttachment?.image_url,
                VIEWER_SIZE.width,
                VIEWER_SIZE.height,
              ) ?? ''
            }
            alt="Attachment"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          {hasMultiple && (
            <button
              className="absolute right-0 top-0 h-full z-10 flex items-center justify-center px-2"
              onClick={goToNext}
              aria-label="Next image"
            >
              <span className="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 border-none shadow-md">
                <span className="material-symbols-outlined">chevron_right</span>
              </span>
            </button>
          )}
        </div>

        {hasMultiple && (
          <div className="flex justify-center gap-1 mt-4">
            {imageAttachments.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-primary' : 'bg-base-300'
                  }`}
              />
            ))}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

import type { Attachment } from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';
import { SIZE_CLASSES, SIZE_DIMENSIONS } from './sizes';

export type AttachmentPreviewProps = {
  attachment: Attachment;
  onDelete?: () => void;
  size?: 'small' | 'medium' | 'large';
};

export const AttachmentPreview = ({
  attachment,
  onDelete,
  size = 'medium',
}: AttachmentPreviewProps) => {

  const buttonPosition = size === 'small' ? 'top-1 right-1' : 'top-2 right-2';
  const buttonSize = size === 'small' ? 'btn-xs' : 'btn-sm';
  const iconSize = size === 'small' ? 'text-sm' : '';

  const isVideo = attachment.type === 'video';
  const poster = attachment.thumb_url;

  const url = useMemo(() => {
    if (isVideo) {
      return attachment.asset_url;
    }

    return attachment.image_url + `&w=${SIZE_DIMENSIONS[size].width}&h=${SIZE_DIMENSIONS[size].height}`;
  }, [attachment?.image_url, attachment?.asset_url, isVideo, size]);

  if (!url) {
    return null;
  }

  return (
    <div className="relative flex-shrink-0">
      {isVideo ? (
        <video
          src={url}
          poster={poster}
          controls
          className={`${SIZE_CLASSES[size]} object-cover rounded-lg`}
        />
      ) : (
        <img
          src={url}
          alt="Attachment"
          className={`${SIZE_CLASSES[size]} object-cover rounded-lg`}
        />
      )}
      {onDelete && (
        <button
          className={`absolute ${buttonPosition} btn ${buttonSize} btn-circle`}
          onClick={onDelete}
          aria-label="Delete attachment"
        >
          <span className={`material-symbols-outlined ${iconSize}`}>close</span>
        </button>
      )}
    </div>
  );
};

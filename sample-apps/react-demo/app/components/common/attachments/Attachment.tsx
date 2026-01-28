import type { Attachment as AttachmentType } from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';
import { SIZE_CLASSES, SIZE_DIMENSIONS } from './sizes';

export type AttachmentProps = {
  attachment: AttachmentType;
  size?: 'small' | 'medium' | 'large' | 'extraLarge';
  onClick?: () => void;
};

export const Attachment = ({
  attachment,
  size = 'medium',
  onClick,
}: AttachmentProps) => {
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
          onClick={onClick}
          className={`${SIZE_CLASSES[size]} object-cover rounded-lg ${onClick ? 'cursor-pointer' : ''}`}
        />
      )}
    </div>
  );
};

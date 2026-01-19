import type { Attachment as AttachmentType } from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';

export type OGAttachmentProps = {
  attachment: AttachmentType;
  size?: 'small' | 'medium' | 'large';
};

export const OGAttachment = ({
  attachment,
  size = 'medium',
}: OGAttachmentProps) => {
  const { title, text, image_url, thumb_url, og_scrape_url, title_link } =
    attachment;

  const linkUrl = title_link || og_scrape_url;
  const imageUrl = image_url || thumb_url;

  const domain = useMemo(() => {
    if (!linkUrl) return null;
    try {
      const url = new URL(linkUrl);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }, [linkUrl]);

  if (!linkUrl || (!title && !text && !imageUrl)) {
    return null;
  }

  const sizeClasses = {
    small: {
      container: 'max-w-xs',
      image: 'h-24',
      title: 'text-sm',
      text: 'text-xs line-clamp-2',
    },
    medium: {
      container: 'max-w-sm',
      image: 'h-32',
      title: 'text-base',
      text: 'text-sm line-clamp-3',
    },
    large: {
      container: 'max-w-md',
      image: 'h-40',
      title: 'text-lg',
      text: 'text-base line-clamp-4',
    },
  };

  const classes = sizeClasses[size];

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full h-full block ${classes.container} rounded-lg border border-base-300 overflow-hidden hover:border-primary/50 hover:shadow-md transition-all bg-base-100`}
      aria-label={title ? `Link to ${title}` : `Link to ${domain}`}
    >
      {imageUrl && (
        <div className={`${classes.image} w-full overflow-hidden bg-base-200`}>
          <img
            src={imageUrl}
            alt={title || 'Link preview'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3 flex flex-col gap-1">
        {domain && (
          <div className="flex items-center gap-1.5 text-xs text-base-content/60">
            <span className="material-symbols-outlined text-sm">link</span>
            <span className="truncate">{domain}</span>
          </div>
        )}

        {title && (
          <h4
            className={`${classes.title} font-semibold text-base-content line-clamp-2`}
          >
            {title}
          </h4>
        )}

        {text && (
          <p className={`${classes.text} text-base-content/70`}>{text}</p>
        )}
      </div>
    </a>
  );
};

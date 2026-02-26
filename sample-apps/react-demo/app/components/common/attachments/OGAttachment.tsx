import type { Attachment as AttachmentType } from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';

export type OGAttachmentProps = {
  attachment: AttachmentType;
  size?: 'small' | 'medium' | 'large';
  withoutLinks?: boolean;
};

export const OGAttachment = ({
  attachment,
  size = 'medium',
  withoutLinks = false,
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
      container: '',
      image: 'h-28',
      title: 'text-sm',
      text: 'text-xs line-clamp-2',
    },
    medium: {
      container: '',
      image: 'h-36',
      title: 'text-[15px]',
      text: 'text-sm line-clamp-3',
    },
    large: {
      container: '',
      image: 'h-44',
      title: 'text-base',
      text: 'text-sm line-clamp-4',
    },
  };

  const classes = sizeClasses[size];

  const content = (
    <>
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

      <div className="p-4 flex flex-col gap-1.5">
        {domain && (
          <div className="flex items-center gap-1.5 text-xs text-base-content/70 font-medium uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]!">link</span>
            <span className="truncate">{domain}</span>
          </div>
        )}

        {title && (
          <h4
            className={`${classes.title} font-semibold text-base-content line-clamp-2 leading-snug`}
          >
            {title}
          </h4>
        )}

        {text && (
          <p className={`${classes.text} text-base-content/60 leading-relaxed`}>{text}</p>
        )}
      </div>
    </>
  );

  if (withoutLinks) {
    return (
      <div
        className={`w-full h-full block ${classes.container} rounded-xl border border-base-200 overflow-hidden bg-base-100`}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group w-full h-full block ${classes.container} rounded-xl border border-base-200 overflow-hidden hover:border-base-content/20 hover:shadow-sm transition-all duration-200 bg-base-100`}
      aria-label={title ? `Link to ${title}` : `Link to ${domain}`}
    >
      {content}
    </a>
  );
};

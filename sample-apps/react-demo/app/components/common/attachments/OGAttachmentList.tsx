import type { Attachment as AttachmentType } from '@stream-io/feeds-react-sdk';
import { OGAttachment } from './OGAttachment';

export type OGAttachmentListProps = {
  attachments: AttachmentType[];
  size?: 'small' | 'medium' | 'large';
  withoutLinks?: boolean;
};

export const OGAttachmentList = ({
  attachments,
  size = 'medium',
  withoutLinks = false,
}: OGAttachmentListProps) => {
  if (attachments.length === 0) return null;

  return (
    <div className="w-full flex flex-row gap-2 items-start justify-stretch">
      {attachments.map((attachment, index) => (
        <OGAttachment
          key={attachment.og_scrape_url || attachment.title_link || index}
          attachment={attachment}
          size={size}
          withoutLinks={withoutLinks}
        />
      ))}
    </div>
  );
};

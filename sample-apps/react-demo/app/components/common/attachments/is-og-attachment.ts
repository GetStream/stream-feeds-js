import type { Attachment } from '@stream-io/feeds-react-sdk';

export const isOGAttachment = (attachment: Attachment): boolean => {
  return Boolean(attachment.og_scrape_url || attachment.title_link);
};

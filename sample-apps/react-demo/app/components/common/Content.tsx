import type { Attachment, ModerationV2Response, UserResponse } from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { AttachmentList } from './attachments/AttachmentList';
import { OGAttachmentList } from './attachments/OGAttachmentList';
import { NavLink } from '../utility/NavLink';
import { isOGAttachment } from './attachments/is-og-attachment';

type ContentProps = {
  text?: string;
  attachments?: Attachment[];
  moderation?: ModerationV2Response;
  location: 'comment' | 'activity';
  mentioned_users?: UserResponse[];
  withoutLinks?: boolean;
};

export const Content = ({ text, attachments, moderation, location, mentioned_users = [], withoutLinks = false }: ContentProps) => {
  const { mediaAttachments, ogAttachments } = useMemo(() => {
    if (!attachments) {
      return { mediaAttachments: [], ogAttachments: [] };
    }
    const media: Attachment[] = [];
    const og: Attachment[] = [];
    for (const attachment of attachments) {
      if (isOGAttachment(attachment)) {
        og.push(attachment);
      } else {
        media.push(attachment);
      }
    }
    return { mediaAttachments: media, ogAttachments: og };
  }, [attachments]);

  const renderedText = useMemo(() => {
    if (!text) {
      return text;
    }

    // Create a map of username -> user for quick lookup
    const userMap = new Map<string, UserResponse>();
    mentioned_users.forEach((user) => {
      if (user.name) {
        userMap.set(user.name.toLowerCase(), user);
      }
    });

    // URL regex pattern - matches http(s):// URLs and www. URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    // Mention regex pattern
    const mentionRegex = /@(\w+)/g;

    // Collect all matches (mentions and URLs) with their positions
    interface Match {
      index: number;
      length: number;
      type: 'mention' | 'url';
      content: string;
      username?: string;
    }

    const matches: Match[] = [];

    // Find all mention matches
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: 'mention',
        content: match[0],
        username: match[1],
      });
    }

    // Find all URL matches
    while ((match = urlRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: 'url',
        content: match[0],
      });
    }

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    // Remove overlapping matches (keep the first one)
    const nonOverlappingMatches: Match[] = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.index >= lastEnd) {
        nonOverlappingMatches.push(m);
        lastEnd = m.index + m.length;
      }
    }

    // If no matches found, return the original text
    if (nonOverlappingMatches.length === 0) {
      return text;
    }

    // Build the parts array
    const parts: Array<string | ReactElement> = [];
    let lastIndex = 0;
    let partIndex = 0;

    for (const m of nonOverlappingMatches) {
      // Add text before the match
      if (m.index > lastIndex) {
        const textBefore = text.slice(lastIndex, m.index);
        if (textBefore) {
          parts.push(textBefore);
        }
      }

      if (m.type === 'mention') {
        const username = m.username!;
        const user = userMap.get(username.toLowerCase());

        if (user) {
          if (withoutLinks) {
            parts.push(
              <span
                key={`mention-${partIndex}-${m.index}`}
                className="text-primary"
              >
                @{username}
              </span>
            );
          } else {
            // Create a link for the mentioned user
            parts.push(
              <NavLink
                key={`mention-${partIndex}-${m.index}`}
                href={`/profile/${user.id}`}
                className="text-primary font-semibold hover:underline"
              >
                @{username}
              </NavLink>
            );
          }
        } else {
          // If user not found in mentioned_users, just show the text without link
          parts.push(`@${username}`);
        }
      } else if (m.type === 'url') {
        if (withoutLinks) {
          parts.push(
            <span
              key={`url-${partIndex}-${m.index}`}
              className="text-primary break-all"
            >
              {m.content}
            </span>
          );
        } else {
          // Normalize URL (add https:// if it starts with www.)
          let url = m.content;
          if (url.startsWith('www.')) {
            url = `https://${url}`;
          }

          parts.push(
            <a
              key={`url-${partIndex}-${m.index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {m.content}
            </a>
          );
        }
      }

      lastIndex = m.index + m.length;
      partIndex++;
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts;
  }, [text, mentioned_users, withoutLinks]);

  if (moderation?.action === 'remove') {
    return (
      <div role="alert" className="alert alert-error alert-soft w-full">
        This post was removed because it violated our community guidelines.
      </div>
    );
  }

  const mediaAttachmentSize = location === 'comment' ? 'medium' : 'large';
  const ogAttachmentSize = location === 'comment' ? 'small' : (mediaAttachments.length > 0 ? 'medium' : 'small');

  return (
    <>
      <p className="w-full text-md">{renderedText}</p>
      {mediaAttachments.length > 0 && (
        <div className="w-full">
          <AttachmentList attachments={mediaAttachments} size={mediaAttachmentSize} />
        </div>
      )}
      {ogAttachments.length > 0 && (
        <OGAttachmentList attachments={ogAttachments} size={ogAttachmentSize} withoutLinks={withoutLinks} />
      )}
    </>
  );
};

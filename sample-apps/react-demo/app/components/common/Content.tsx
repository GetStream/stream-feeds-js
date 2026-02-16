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
  withoutInteractions?: boolean;
  linkHashtags?: boolean;
};

export const Content = ({ text, attachments, moderation, location, mentioned_users = [], withoutInteractions = false, linkHashtags = false }: ContentProps) => {
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
    // Mention regex pattern (allow letters, digits, underscore and hyphen in usernames)
    const mentionRegex = /@([\w-]+)/g;

    // Hashtag regex pattern
    const hashtagRegex = /#([\w-]+)/g;

    // Collect all matches (mentions, URLs, and hashtags) with their positions
    interface Match {
      index: number;
      length: number;
      type: 'mention' | 'url' | 'hashtag';
      content: string;
      username?: string;
      hashtag?: string;
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

    // Find all hashtag matches
    if (linkHashtags) {
      while ((match = hashtagRegex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: 'hashtag',
          content: match[0],
          hashtag: match[1],
        });
      }
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
          if (withoutInteractions) {
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
                className="text-primary font-medium hover:underline underline-offset-2"
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
        if (withoutInteractions) {
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
              className="text-primary hover:underline underline-offset-2 break-all"
            >
              {m.content}
            </a>
          );
        }
      } else if (m.type === 'hashtag') {
        const hashtag = m.hashtag!;
        if (withoutInteractions) {
          parts.push(
            <span
              key={`hashtag-${partIndex}-${m.index}`}
              className="text-primary font-medium"
            >
              #{hashtag}
            </span>
          );
        } else {
          parts.push(
            <NavLink
              key={`hashtag-${partIndex}-${m.index}`}
              href={`/hashtag/${hashtag}`}
              className="text-primary font-medium hover:underline underline-offset-2"
            >
              #{hashtag}
            </NavLink>
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
  }, [text, mentioned_users, withoutInteractions, linkHashtags]);

  if (moderation?.action === 'remove') {
    return (
      <div role="alert" className="w-full px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
        This post was removed because it violated our community guidelines.
      </div>
    );
  }

  const mediaAttachmentSize = location === 'comment' ? 'medium' : 'large';
  const ogAttachmentSize = location === 'comment' ? 'small' : (mediaAttachments.length > 0 ? 'medium' : 'small');

  return (
    <div className="space-y-3">
      {renderedText && (
        <p className="w-full text-[15px] leading-relaxed text-base-content whitespace-pre-wrap">
          {renderedText}
        </p>
      )}
      {mediaAttachments.length > 0 && (
        <div className="w-full rounded-xl overflow-hidden">
          <AttachmentList attachments={mediaAttachments} size={mediaAttachmentSize} disableButtons={withoutInteractions} />
        </div>
      )}
      {ogAttachments.length > 0 && (
        <OGAttachmentList attachments={ogAttachments} size={ogAttachmentSize} withoutLinks={withoutInteractions} />
      )}
    </div>
  );
};

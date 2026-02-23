import type { CommentResponse } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { ContentMetadata } from '../common/ContentMetadata';
import { CommentComposer } from './CommentComposer';
import { CommentReplies } from './CommentReplies';
import { CommentInteractions } from './comment-interactions/CommentInteractions';
import { CommentActions } from './comment-interactions/CommentActions';
import { Content } from '../common/Content';
import { Avatar } from '../utility/Avatar';
import { NavLink } from '../utility/NavLink';

export const Comment = ({
  comment,
  depth = 0,
}: {
  comment: CommentResponse;
  depth?: number;
}) => {
  const [isReplying, setIsReplying] = useState(false);

  const handleToggleReplying = useCallback(() => {
    setIsReplying((prev) => !prev);
  }, []);

  const handleReplySubmitted = useCallback(() => {
    setIsReplying(false);
  }, []);

  return (
    <div className="w-full flex gap-3">
      <div className="flex-shrink-0">
        <NavLink href={`/profile/${comment.user.id}`}>
          <Avatar user={comment.user} className="size-10" />
        </NavLink>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <ContentMetadata
          created_at={comment.created_at}
          user={comment.user}
          location="comment"
          edited_at={comment.edited_at}
          withAvatar={false}
        >
          <CommentActions comment={comment} />
        </ContentMetadata>
        <Content
          text={comment.text}
          attachments={comment.attachments}
          moderation={comment.moderation}
          location="comment"
          mentioned_users={comment.mentioned_users}
        />
        <CommentInteractions comment={comment} isReplying={isReplying} onToggleReplying={handleToggleReplying} />
        {isReplying && (
          <div className="w-full pl-2 border-l-2 border-primary">
            <CommentComposer
              parentComment={comment}
              onSubmitted={handleReplySubmitted}
            />
          </div>
        )}
        <CommentReplies
          parentComment={comment}
          depth={depth + 1}
        />
      </div>
    </div>
  );
};

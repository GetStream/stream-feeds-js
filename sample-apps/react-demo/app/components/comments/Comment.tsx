import type { CommentResponse } from '@stream-io/feeds-react-sdk';
import { ContentMetadata } from '../utility/ContentMetadata';

export const Comment = ({ comment }: { comment: CommentResponse }) => {
  return (
    <div className="flex flex-col gap-2">
      <ContentMetadata
        created_at={comment.created_at}
        user={comment.user}
        location="comment"
      ></ContentMetadata>
      <p className="w-full text-md">{comment.text}</p>
    </div>
  );
};

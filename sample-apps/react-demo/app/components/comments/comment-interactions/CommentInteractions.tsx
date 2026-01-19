import { type CommentResponse } from "@stream-io/feeds-react-sdk";
import { ToggleCommentReaction } from "./ToggleCommentReaction";
import { ReplyToComment } from "./ReplyToComment";

export const CommentInteractions = ({
  comment,
  isReplying,
  onToggleReplying,
}: {
  comment: CommentResponse;
  isReplying: boolean;
  onToggleReplying: () => void;
}) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <ToggleCommentReaction className="-ml-2" comment={comment} />
      <ReplyToComment
        comment={comment}
        isReplying={isReplying}
        onToggleReplying={onToggleReplying}
      />
    </div>
  );
};
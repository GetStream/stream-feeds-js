import { Comment } from '../gen/models';
import { UpdateStateResult } from '../types-internal';

export const addCommentsToState = (
  newComments: Comment[],
  comments: Comment[] | undefined,
) => {
  let result: UpdateStateResult<{ comments: Comment[] }>;
  if (comments === undefined) {
    comments = [];
    result = {
      changed: true,
      comments,
    };
  } else {
    result = {
      changed: false,
      comments,
    };
  }
  const newCommentsDeduplicated: Comment[] = [];
  newComments.forEach((newComment) => {
    const index = comments.findIndex((a) => a.id === newComment.id);
    if (index === -1) {
      newCommentsDeduplicated.push(newComment);
    }
  });

  if (newCommentsDeduplicated.length > 0) {
    // TODO: we might need to optimize this
    const updatedComments = [...comments, ...newComments];
    updatedComments.sort(
      (c1, c2) => c2.created_at.getTime() - c1.created_at.getTime(),
    );
    result = {
      changed: true,
      comments: updatedComments,
    };
  }

  return result;
};

export const updateCommentInState = (
  updatedComment: Comment,
  comments: Comment[],
) => {
  const index = comments.findIndex((a) => a.id === updatedComment.id);
  if (index !== -1) {
    const newComments = [...comments];
    newComments[index] = updatedComment;
    return { changed: true, comments: newComments };
  } else {
    return { changed: false, comments };
  }
};

export const removeCommentFromState = (
  comment: Comment,
  comments: Comment[],
) => {
  const index = comments.findIndex((a) => a.id === comment.id);
  if (index !== -1) {
    const newComments = [...comments];
    newComments.splice(index, 1);
    return { changed: true, comments: newComments };
  } else {
    return { changed: false, comments };
  }
};

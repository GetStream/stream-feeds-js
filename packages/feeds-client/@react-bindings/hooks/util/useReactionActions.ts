import { useCallback, useMemo } from 'react';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import { CommentParent } from '../../../src/types';
import { isCommentResponse } from '../../../src/utils';
import { useOwnCapabilities } from '../feed-state-hooks';

/**
 * A utility hook that takes in an entity and a reaction type, and creates reaction actions
 * that can then be used on the UI. The entity can be either an ActivityResponse or a CommentResponse
 * as the hook determines internally which APIs it is supposed to use, while taking the
 * correct ownCapabilities into account.
 * @param entity - The entity to which we want to add a reaction, can be either ActivityResponse or CommentResponse.
 * @param type - The type of reaction we want to add or remove.
 */
export const useReactionActions = ({
  entity,
  type,
}: {
  entity: CommentParent;
  type: string;
}) => {
  const client = useFeedsClient();
  const ownCapabilities = useOwnCapabilities();

  const isComment = isCommentResponse(entity);
  const hasOwnReaction = useMemo(
    () => !!entity.own_reactions?.find((r) => r.type === type),
    [entity.own_reactions, type],
  );

  const canAddReaction = isComment
    ? ownCapabilities.canAddCommentReaction
    : ownCapabilities.canAddActivityReaction;
  const canRemoveReaction = isComment
    ? ownCapabilities.canRemoveCommentReaction
    : ownCapabilities.canRemoveActivityReaction;

  const addReaction = useCallback(async () => {
    if (!canAddReaction) {
      console.warn('The current user does not have the capability to add reactions.')
      return;
    }
    try {
      await (isComment
        ? client?.addCommentReaction({ comment_id: entity.id, type })
        : client?.addReaction({ activity_id: entity.id, type }));
    } catch (error) {
      console.error(error as Error);
    }
  }, [canAddReaction, client, isComment, entity.id, type]);

  const removeReaction = useCallback(async () => {
    if (!canRemoveReaction) {
      console.warn('The current user does not have the capability to remove reactions.')
      return;
    }
    try {
      await (isComment
        ? client?.deleteCommentReaction({ comment_id: entity.id, type })
        : client?.deleteActivityReaction({
            activity_id: entity.id,
            type,
          }));
    } catch (error) {
      console.error(error as Error);
    }
  }, [canRemoveReaction, client, isComment, entity.id, type]);

  const toggleReaction = useCallback(async () => {
    if (hasOwnReaction) {
      await removeReaction();
    } else {
      await addReaction();
    }
  }, [addReaction, hasOwnReaction, removeReaction]);

  return useMemo(
    () => ({ addReaction, removeReaction, toggleReaction }),
    [addReaction, removeReaction, toggleReaction],
  );
};

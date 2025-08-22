import { useMemo } from 'react';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import { CommentParent } from '../../../src/types';
import { useStableCallback } from '../internal';
import { isCommentResponse } from '../../../src/utils';

/**
 * A utility hook that takes in an entity and a reaction type, and creates reaction actions
 * that can then be used on the UI. The entity can be either an ActivityResponse or a CommentResponse
 * as the hook determines internally which APIs it is supposed to use, while taking the
 * correct ownCapabilities into account.
 * @param entity - The entity to which we want to apply reaction actions, can be either ActivityResponse or CommentResponse.
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

  const isComment = isCommentResponse(entity);
  const hasOwnReaction = useMemo(
    () => !!entity.own_reactions?.find((r) => r.type === type),
    [entity.own_reactions, type],
  );

  const addReaction = useStableCallback(async () => {
    await (isComment
      ? client?.addCommentReaction({ id: entity.id, type })
      : client?.addReaction({ activity_id: entity.id, type }));
  });

  const removeReaction = useStableCallback(async () => {
    await (isComment
      ? client?.deleteCommentReaction({ id: entity.id, type })
      : client?.deleteActivityReaction({
          activity_id: entity.id,
          type,
        }));
  });

  const toggleReaction = useStableCallback(async () => {
    if (hasOwnReaction) {
      await removeReaction();
    } else {
      await addReaction();
    }
  });

  return useMemo(
    () => ({ addReaction, removeReaction, toggleReaction }),
    [addReaction, removeReaction, toggleReaction],
  );
};

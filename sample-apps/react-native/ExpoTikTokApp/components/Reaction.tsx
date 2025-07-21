import {
  ActivityResponse,
  CommentResponse,
  useOwnCapabilities,
  useReactionActions,
  isCommentResponse,
} from '@stream-io/feeds-react-native-sdk';
import { useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const iconMap = {
  like: {
    active: <Ionicons name="heart" size={20} color="white" />,
    inactive: <Ionicons name="heart-outline" size={20} color="white" />,
  },
};

type IconType = keyof typeof iconMap;

export const Reaction = ({
  type,
  entity,
}: {
  type: IconType;
  entity: ActivityResponse | CommentResponse;
}) => {
  const ownCapabilities = useOwnCapabilities();

  const isComment = isCommentResponse(entity);
  const hasOwnReaction = useMemo(
    () => !!entity.own_reactions?.find((r) => r.type === type),
    [entity.own_reactions, type],
  );

  const canAddReaction = isComment
    ? ownCapabilities.can_add_comment_reaction
    : ownCapabilities.can_add_activity_reaction;
  const canRemoveReaction = isComment
    ? ownCapabilities.can_remove_comment_reaction
    : ownCapabilities.can_remove_activity_reaction;

  const { toggleReaction } = useReactionActions({ entity, type });

  const handleReactionToggle = useCallback(async () => {
    const canDoReactionAction =
      (!hasOwnReaction && canAddReaction) ||
      (hasOwnReaction && canRemoveReaction);
    if (canDoReactionAction) {
      await toggleReaction();
    }
  }, [hasOwnReaction, canAddReaction, canRemoveReaction, toggleReaction]);

  return (
    <TouchableOpacity onPress={handleReactionToggle}>
      {iconMap[type][hasOwnReaction ? 'active' : 'inactive']}
    </TouchableOpacity>
  );
};

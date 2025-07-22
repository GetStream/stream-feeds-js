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
    active: ({ size, color }: IconProps) => (
      <Ionicons name="heart" size={size} color={color} />
    ),
    inactive: ({ size, color }: IconProps) => (
      <Ionicons name="heart-outline" size={size} color={color} />
    ),
  },
};

type IconType = keyof typeof iconMap;

type IconProps = { size: number; color: string };

export const Reaction = ({
  type,
  entity,
  size = 20,
  color = 'white',
}: {
  type: IconType;
  entity: ActivityResponse | CommentResponse;
} & Partial<IconProps>) => {
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

  const IconComponent = iconMap[type][hasOwnReaction ? 'active' : 'inactive'];

  return (
    <TouchableOpacity onPress={handleReactionToggle}>
      <IconComponent size={size} color={color} />
    </TouchableOpacity>
  );
};

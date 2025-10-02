import {
  ActivityResponse,
  CommentResponse,
  useOwnCapabilities,
  isCommentResponse,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useStableCallback } from '@/hooks/useStableCallback';

const iconMap = {
  like: {
    active: ({ size, color }: IconProps) => (
      <Ionicons name="heart" size={size} color={color} />
    ),
    inactive: ({ size, color }: IconProps) => (
      <Ionicons name="heart-outline" size={size} color={color} />
    ),
  },
  downvote: {
    active: ({ size, color }: IconProps) => (
      <Ionicons name="thumbs-down" size={size} color={color} />
    ),
    inactive: ({ size, color }: IconProps) => (
      <Ionicons name="thumbs-down-outline" size={size} color={color} />
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
    ? ownCapabilities.can_delete_own_comment_reaction
    : ownCapabilities.can_delete_own_activity_reaction;

  const client = useFeedsClient();

  const addReaction = useStableCallback(async () => {
    await (isComment
      ? client?.addCommentReaction({
          id: entity.id,
          type,
          create_notification_activity: true,
        })
      : client?.addActivityReaction({
          activity_id: entity.id,
          type,
          create_notification_activity: true,
        }));
  });

  const removeReaction = useStableCallback(async () => {
    await (isComment
      ? client?.deleteCommentReaction({ id: entity.id, type })
      : client?.deleteActivityReaction({
          activity_id: entity.id,
          type,
        }));
  });

  const handleReactionToggle = useStableCallback(async () => {
    const canDoReactionAction =
      (!hasOwnReaction && canAddReaction) ||
      (hasOwnReaction && canRemoveReaction);
    if (canDoReactionAction) {
      try {
        if (hasOwnReaction && canRemoveReaction) {
          await removeReaction();
        } else if (!hasOwnReaction && canAddReaction) {
          await addReaction();
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  const IconComponent = iconMap[type][hasOwnReaction ? 'active' : 'inactive'];

  return (
    <TouchableOpacity onPress={handleReactionToggle}>
      <IconComponent size={size} color={color} />
    </TouchableOpacity>
  );
};

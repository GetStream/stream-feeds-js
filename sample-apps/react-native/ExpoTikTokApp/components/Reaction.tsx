import {
  ActivityResponse,
  CommentResponse,
  FeedOwnCapability,
  useFeedsClient,
  useOwnCapabilities,
} from '@stream-io/feeds-react-native-sdk';
import { useCallback } from 'react';
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
  isComment = false,
}: {
  type: IconType;
  entity: ActivityResponse | CommentResponse;
  isComment?: boolean;
}) => {
  const client = useFeedsClient();
  const ownCapabilities = useOwnCapabilities();

  const counts = entity.reaction_groups?.[type]?.count ?? 0;
  const hasOwnReaction = !!entity.own_reactions?.find((r) => r.type === type);
  const canAddReaction = isComment
    ? ownCapabilities.canAddCommentReaction
    : ownCapabilities.canAddActivityReaction;
  const canRemoveReaction = isComment
    ? ownCapabilities.canRemoveCommentReaction
    : ownCapabilities.canRemoveActivityReaction;

  const addReaction = useCallback(async () => {
    if (!canAddReaction) {
      return;
    }
    try {
      await (isComment
        ? client?.addCommentReaction({ comment_id: entity.id, type })
        : client?.addReaction({ activity_id: entity.id, type }));
    } catch (error) {
      console.error(error as Error);
    }
  }, [canAddReaction, client, entity.id, isComment, type]);

  const removeReaction = useCallback(async () => {
    if (!canRemoveReaction) {
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
  }, [canRemoveReaction, client, entity.id, isComment, type]);

  const toggleReaction = useCallback(async () => {
    if (hasOwnReaction) {
      await removeReaction();
    } else {
      await addReaction();
    }
  }, [addReaction, hasOwnReaction, removeReaction]);

  return (
    <TouchableOpacity onPress={toggleReaction}>
      {iconMap[type][hasOwnReaction ? 'active' : 'inactive']}
    </TouchableOpacity>
  );
};

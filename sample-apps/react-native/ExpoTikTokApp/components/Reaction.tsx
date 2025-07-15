import {
  ActivityResponse,
  CommentResponse,
  useFeedsClient,
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
  const counts = entity.reaction_groups?.[type]?.count ?? 0;
  const hasOwnReaction = !!entity.own_reactions?.find((r) => r.type === type);

  const addReaction = useCallback(async () => {
    try {
      await (isComment
        ? client?.addCommentReaction({ comment_id: entity.id, type })
        : client?.addReaction({ activity_id: entity.id, type }));
    } catch (error) {
      console.error(error as Error);
    }
  }, [client, entity.id, isComment, type]);

  const removeReaction = useCallback(async () => {
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
  }, [client, entity.id, isComment, type]);

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

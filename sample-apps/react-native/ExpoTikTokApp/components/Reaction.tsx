import {
  ActivityResponse,
  CommentResponse,
  useReactionActions,
} from '@stream-io/feeds-react-native-sdk';
import { useMemo } from 'react';
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
  const hasOwnReaction = useMemo(
    () => !!entity.own_reactions?.find((r) => r.type === type),
    [entity.own_reactions, type],
  );

  const { toggleReaction } = useReactionActions({ entity, type });

  return (
    <TouchableOpacity onPress={toggleReaction}>
      {iconMap[type][hasOwnReaction ? 'active' : 'inactive']}
    </TouchableOpacity>
  );
};

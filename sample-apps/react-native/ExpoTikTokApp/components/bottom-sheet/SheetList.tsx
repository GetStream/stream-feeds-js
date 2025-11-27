import type { ReactElement } from 'react';
import { FlatList, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Themed';
import type { StableCallback} from '@/hooks/useStableCallback';
import { useStableCallback } from '@/hooks/useStableCallback';
import { closeSheet, setHeight } from '@/store/bottom-sheet-state-store';

type ActionType = () => void | Promise<void>;

export type SheetItemType = {
  title: string;
  action: StableCallback<[], ActionType> | ActionType;
  icon?: ReactElement;
  preventAutoclose?: boolean;
  id: string;
};

const SheetListItem = ({ item }: { item: SheetItemType }) => {
  const onPress = useStableCallback(() => {
    item.action();
    if (!item.preventAutoclose) {
      closeSheet();
    }
  });

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <Text style={styles.itemText}>{item.title}</Text>
      {item.icon}
    </TouchableOpacity>
  );
};

const renderItem = ({ item }: { item: SheetItemType }) => (
  <SheetListItem item={item} />
);

const keyExtractor = (item: SheetItemType) => item.id;

export const SheetList = ({ items }: { items: SheetItemType[] }) => {
  return (
    <FlatList
      contentContainerStyle={styles.listContentContainer}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onContentSizeChange={(_, height) => setHeight(height)}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: { paddingBottom: Platform.OS === 'ios' ? 50 : 75 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemText: { fontSize: 16, fontWeight: 500 },
});

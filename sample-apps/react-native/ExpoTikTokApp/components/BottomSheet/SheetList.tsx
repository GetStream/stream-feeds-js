import { ReactElement } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useStableCallback } from '@/hooks/useStableCallback';
import { closeSheet } from '@/store/bottom-sheet-state-store';

export type SheetItemType = {
  title: string;
  action: () => void | Promise<void>;
  icon?: ReactElement;
  preventAutoclose?: boolean;
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

export const SheetList = ({ items }: { items: SheetItemType[] }) => {
  return (
    <FlatList
      contentContainerStyle={styles.listContentContainer}
      data={items}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: { flex: 1 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemText: { fontSize: 16, fontWeight: 500 },
});

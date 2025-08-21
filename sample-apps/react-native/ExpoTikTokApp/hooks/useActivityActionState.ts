import type { ActivityActionState } from '@/store/activity-action-state-store';
import { store } from '@/store/activity-action-state-store';
import { useStateStore } from '@stream-io/feeds-react-native-sdk';

const selector = ({ editingActivity }: ActivityActionState) => ({
  editingActivity,
});

export const useActivityActionState = () => {
  return useStateStore(store, selector);
};

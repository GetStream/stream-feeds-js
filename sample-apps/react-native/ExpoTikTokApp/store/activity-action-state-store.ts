import {
  ActivityResponse,
  StateStore,
} from '@stream-io/feeds-react-native-sdk';

export type ActivityActionState = {
  editingActivity?: ActivityResponse;
};

const DEFAULT_STATE: ActivityActionState = {
  editingActivity: undefined,
};

export const store = new StateStore<ActivityActionState>(DEFAULT_STATE);

export const setEditingActivity = (
  activity: ActivityActionState['editingActivity'],
) => store.partialNext({ editingActivity: activity });

export const resetState = () => store.partialNext(DEFAULT_STATE);

import { useStateStore } from '@stream-io/state-store/react-bindings';

import type {
  SearchController,
  SearchControllerState,
} from '../../../../common/search';
import { useSearchContext } from '../../contexts/StreamSearchContext';

export const useSearchQuery = (controllerFromProps?: SearchController) => {
  const controllerFromState = useSearchContext();
  const controller = controllerFromProps ?? controllerFromState;

  return useStateStore(controller?.state, selector);
};

const selector = ({ searchQuery }: SearchControllerState) => ({
  searchQuery,
});

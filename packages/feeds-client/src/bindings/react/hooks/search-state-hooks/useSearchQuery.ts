import type { SearchController, SearchControllerState } from '@self';
import { useSearchContext } from '../../contexts/StreamSearchContext';
import { useStateStore } from '../useStateStore';

export const useSearchQuery = (controllerFromProps?: SearchController) => {
  const controllerFromState = useSearchContext();
  const controller = controllerFromProps ?? controllerFromState;

  return useStateStore(controller?.state, selector);
};

const selector = ({ searchQuery }: SearchControllerState) => ({
  searchQuery,
});

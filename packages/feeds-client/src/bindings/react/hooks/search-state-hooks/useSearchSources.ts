import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useSearchContext } from '../../contexts/StreamSearchContext';
import type { SearchController, SearchControllerState } from '../../../../common/search';

export const useSearchSources = (controllerFromProps?: SearchController) => {
  const controllerFromState = useSearchContext();
  const controller = controllerFromProps ?? controllerFromState;

  return useStateStore(controller?.state, selector);
};

const selector = ({ sources }: SearchControllerState) => ({
  sources,
});

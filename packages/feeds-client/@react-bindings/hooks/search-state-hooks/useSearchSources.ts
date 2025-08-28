import type {
  SearchController,
  SearchControllerState,
} from '../../../src/common/search';
import { useSearchContext } from '../../contexts/StreamSearchContext';
import { useStateStore } from '../useStateStore';

export const useSearchSources = (controllerFromProps?: SearchController) => {
  const controllerFromState = useSearchContext();
  const controller = controllerFromProps ?? controllerFromState;

  return useStateStore(controller?.state, selector);
};

const selector = ({ sources }: SearchControllerState) => ({
  sources,
});

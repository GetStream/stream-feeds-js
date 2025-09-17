import type {
  SearchController,
  SearchControllerState,
} from '@self';
import { useSearchContext } from '../../contexts/StreamSearchContext';
import { useStateStore } from '@stream-io/state-store/react-bindings';

export const useSearchSources = (controllerFromProps?: SearchController) => {
  const controllerFromState = useSearchContext();
  const controller = controllerFromProps ?? controllerFromState;

  return useStateStore(controller?.state, selector);
};

const selector = ({ sources }: SearchControllerState) => ({
  sources,
});

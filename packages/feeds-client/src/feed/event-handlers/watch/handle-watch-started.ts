import type { Feed } from '../../feed';

export function handleWatchStarted(
  this: Feed,
  {
    setWatchIntent = false,
  }: {
    /**
     * Also restores the watch intent in `last_get_or_create_request_config`, so a
     * feed that was explicitly stop-watched and is now watched again is re-fetched
     * by `synchronize()` on the next reconnect. Only meaningful when a config is
     * already stored — feeds watched solely through `queryFeeds` have none.
     */
    setWatchIntent?: boolean;
  } = {},
) {
  if (!setWatchIntent) {
    this.state.partialNext({ watch: true });
    return;
  }

  this.state.next((currentState) => ({
    ...currentState,
    watch: true,
    last_get_or_create_request_config:
      currentState.last_get_or_create_request_config && {
        ...currentState.last_get_or_create_request_config,
        watch: true,
      },
  }));
}

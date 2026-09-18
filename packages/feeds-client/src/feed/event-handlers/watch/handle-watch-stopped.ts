import type { Feed } from '../../feed';

export function handleWatchStopped(
  this: Feed,
  {
    clearWatchIntent = false,
  }: {
    /**
     * Also clears the watch intent stored in `last_get_or_create_request_config`,
     * so the feed is not re-fetched (and silently re-watched) by `synchronize()`
     * on the next reconnect. Pass `true` only when the caller explicitly stopped
     * watching — a lost connection must keep the intent so recovery can restore it.
     */
    clearWatchIntent?: boolean;
  } = {},
) {
  if (!clearWatchIntent) {
    this.state.partialNext({ watch: false });
    return;
  }

  this.state.next((currentState) => ({
    ...currentState,
    watch: false,
    last_get_or_create_request_config:
      currentState.last_get_or_create_request_config && {
        ...currentState.last_get_or_create_request_config,
        watch: false,
      },
  }));
}

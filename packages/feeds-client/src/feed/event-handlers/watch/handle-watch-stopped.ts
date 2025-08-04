import { Feed } from '../../feed';

export function handleWatchStopped(this: Feed) {
  this.state.partialNext({ watch: false });
}

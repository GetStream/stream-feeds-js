import { Feed } from '../../feed';

export function handleWatchStarted(this: Feed) {
  this.state.partialNext({ watch: true });
}

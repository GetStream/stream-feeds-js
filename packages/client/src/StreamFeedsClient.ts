import {
  EventDispatcher,
  StateStore,
  StreamClient,
  StreamClientOptions,
  StreamClientState,
  UserRequest,
} from '@stream-io/common';
import { StreamFeedsEvent } from './types';

export type StreamFeedsClientState = StreamClientState & {
  // TODO remove this, this is just a test property to test the architecture
  color: string;
};

export class StreamFeedsClient {
  readonly state: StateStore<StreamFeedsClientState>;
  readonly common: StreamClient;
  private readonly eventDispatcher: EventDispatcher<
    StreamFeedsEvent['type'],
    StreamFeedsEvent
  > = new EventDispatcher<StreamFeedsEvent['type'], StreamFeedsEvent>();

  constructor(commonClient: StreamClient);
  constructor(apiKey: string, options?: StreamClientOptions);
  constructor(
    apiKeyOrClient: StreamClient | string,
    options?: StreamClientOptions,
  ) {
    if (typeof apiKeyOrClient === 'string') {
      this.common = new StreamClient(apiKeyOrClient, options);
    } else {
      this.common = apiKeyOrClient;
    }
    this.state = new StateStore({
      ...this.common.state.getLatestValue(),
      color: 'red',
    });
    this.common.state.subscribe((state) => {
      this.state.partialNext(state);
    });
    this.common.on('all', (event) => this.eventDispatcher.dispatch(event));
  }

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  // Proxy WS methods for ease of use
  connectUser = (
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ) => {
    return this.common.connectUser(user, tokenProvider);
  };

  disconnectUser = () => {
    return this.common.disconnectUser();
  };
}

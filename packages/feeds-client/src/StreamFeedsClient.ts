import {
  EventDispatcher,
  ModerationClient,
  ProductApiInferface,
  StateStore,
  StreamClient,
  StreamClientOptions,
  StreamClientState,
  UserRequest,
} from '@stream-io/common';
import { StreamFeedsEvent } from './types';
import { FeedsApi } from './gen/feeds/FeedsApi';
import { StreamFeed } from './StreamFeed';
import { StreamNotificationFeed } from './StreamNotificationFeed';

export type StreamFeedsClientState = StreamClientState & {
  // TODO remove this, this is just a test property to test the architecture
  color: string;
};

export class StreamFeedsClient extends FeedsApi implements ProductApiInferface {
  readonly state: StateStore<StreamFeedsClientState>;
  readonly moderation: ModerationClient;
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
    let streamClient: StreamClient;
    if (typeof apiKeyOrClient === 'string') {
      streamClient = new StreamClient(apiKeyOrClient, options);
    } else {
      streamClient = apiKeyOrClient;
    }
    super(streamClient);
    this.moderation = this.streamClient.moderation;
    this.state = new StateStore({
      ...this.streamClient.state.getLatestValue(),
      color: 'red',
    });
    this.streamClient.state.subscribe((state) => {
      this.state.partialNext(state);
    });
    this.streamClient.on('all', (event) =>
      this.eventDispatcher.dispatch(event),
    );
  }

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  feed = (group: string, id: string) => {
    return new StreamFeed(this, group, id);
  };

  notificationFeed = (group: string, id: string) => {
    return new StreamNotificationFeed(this, group, id);
  };

  connectUser = (
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ) => {
    return this.streamClient.connectUser(user, tokenProvider);
  };

  disconnectUser(): Promise<void> {
    return this.streamClient.disconnectUser();
  }

  upsertUsers = (users: UserRequest[]) => {
    return this.streamClient.upsertUsers(users);
  };
}

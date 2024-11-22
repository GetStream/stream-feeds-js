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
import { StreamFlatFeed } from './StreamFlatFeed';
import { StreamNotificationFeed } from './StreamNotificationFeed';
import { QueryFeedsRequest } from './gen/models';

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
    return new StreamFlatFeed(this, group, id);
  };

  notificationFeed = (group: string, id: string) => {
    return new StreamNotificationFeed(this, group, id);
  };

  async _queryFeeds(request?: QueryFeedsRequest) {
    const response = await this.queryFeeds(request);

    const feeds = response.feeds.map((f) => {
      switch (f.type) {
        case 'flat':
          return new StreamFlatFeed(this, f.group, f.id, f);
        case 'notification':
          return new StreamNotificationFeed(this, f.group, f.id, f);
        default:
          throw new Error(`This SDK doesn't yet support ${f.type} type`);
      }
    });

    return feeds;
  }

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

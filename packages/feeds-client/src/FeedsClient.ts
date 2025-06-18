import { FeedsApi } from './gen/feeds/FeedsApi';
import {
  FeedResponse,
  QueryFeedsRequest,
  UserRequest,
  WSEvent,
} from './gen/models';
import { FeedsEvent, OwnUser } from './types';
import { StateStore } from './common/StateStore';
import { TokenManager } from './common/TokenManager';
import { ConnectionIdManager } from './common/ConnectionIdManager';
import { StableWSConnection } from './common/real-time/StableWSConnection';
import { EventDispatcher } from './common/EventDispatcher';
import { ApiClient } from './common/ApiClient';
import {
  addConnectionEventListeners,
  removeConnectionEventListeners,
} from './common/utils';
import { decodeWSEvent } from './gen/model-decoders/event-decoder-mapping';
import { Feed } from './Feed';
import { FeedsClientOptions, NetworkChangedEvent } from './common/types';

export type FeedsClientState = {
  connectedUser: OwnUser | undefined;
};

type FID = string;

export class FeedsClient extends FeedsApi {
  readonly state: StateStore<FeedsClientState>;

  private readonly tokenManager: TokenManager;
  private wsConnection?: StableWSConnection;
  private readonly connectionIdManager: ConnectionIdManager;
  private readonly eventDispatcher: EventDispatcher<
    FeedsEvent['type'],
    FeedsEvent
  > = new EventDispatcher<FeedsEvent['type'], FeedsEvent>();

  private activeFeeds: Record<FID, Feed> = {};

  constructor(apiKey: string, options?: FeedsClientOptions) {
    const tokenManager = new TokenManager();
    const connectionIdManager = new ConnectionIdManager();
    const apiClient = new ApiClient(
      apiKey,
      tokenManager,
      connectionIdManager,
      options,
    );
    super(apiClient);
    this.state = new StateStore<FeedsClientState>({
      connectedUser: undefined,
    });
    this.tokenManager = tokenManager;
    this.connectionIdManager = connectionIdManager;
    this.on('all', (event) => {
      if (Object.hasOwn(event, 'fid')) {
        const feed =
          this.activeFeeds[(event as unknown as WSEvent & { fid: string }).fid];
        if (feed) {
          {
            feed.handleWSEvent(event as unknown as WSEvent);
            if (event.type === 'feeds.feed.deleted') {
              delete this.activeFeeds[
                (event as unknown as WSEvent & { fid: string }).fid
              ];
            }
          }
        } else if (event.type === 'feeds.feed.created') {
          this.getOrCreateActiveFeed(
            event.feed.group_id,
            event.feed.id,
            event.feed,
          );
        }
      }
    });
  }

  connectUser = async (
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ) => {
    if (
      this.state.getLatestValue().connectedUser !== undefined ||
      this.wsConnection
    ) {
      throw new Error(`Can't connect a new user, call "disconnectUser" first`);
    }

    this.tokenManager.setTokenOrProvider(tokenProvider);

    try {
      addConnectionEventListeners(this.updateNetworkConnectionStatus);
      this.wsConnection = new StableWSConnection(
        {
          user,
          baseUrl: this.apiClient.webSocketBaseUrl,
        },
        this.tokenManager,
        this.connectionIdManager,
        [decodeWSEvent],
      );
      this.wsConnection.on('all', (event) =>
        this.eventDispatcher.dispatch(event),
      );
      const connectedEvent = await this.wsConnection.connect();
      this.state.partialNext({ connectedUser: connectedEvent?.me });
    } catch (err) {
      await this.disconnectUser();
      throw err;
    }
  };

  disconnectUser = async () => {
    if (this.wsConnection) {
      this.wsConnection?.offAll();
      await this.wsConnection?.disconnect();
      this.wsConnection = undefined;
    }
    removeConnectionEventListeners(this.updateNetworkConnectionStatus);

    this.connectionIdManager.reset();
    this.tokenManager.reset();
    this.state.partialNext({ connectedUser: undefined });
  };

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  feed = (group: string, id: string) => {
    return this.getOrCreateActiveFeed(group, id);
  };

  async queryFeeds(request?: QueryFeedsRequest) {
    const response = await this.feedsQueryFeeds(request);

    const feeds = response.feeds.map((f) =>
      this.getOrCreateActiveFeed(f.group_id, f.id, f),
    );

    return {
      feeds,
      next: response.next,
      prev: response.prev,
      metadata: response.metadata,
      duration: response.duration,
    };
  }

  private readonly getOrCreateActiveFeed = (
    group: string,
    id: string,
    data?: FeedResponse,
  ) => {
    const fid = `${group}:${id}`;
    if (this.activeFeeds[fid]) {
      return this.activeFeeds[fid];
    } else {
      const feed = new Feed(this, group, id, data);
      this.activeFeeds[fid] = feed;
      return feed;
    }
  };

  private readonly updateNetworkConnectionStatus = (
    event: { type: 'online' | 'offline' } | Event,
  ) => {
    const networkEvent: NetworkChangedEvent = {
      type: 'network.changed',
      online: event.type === 'online',
    };
    this.eventDispatcher.dispatch(networkEvent);
  };
}

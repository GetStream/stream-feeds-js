import { ApiClient } from './ApiClient';
import { ConnectionIdManager } from './ConnectionIdManager';
import { EventDispatcher } from './EventDispatcher';
import { CommonApi } from './gen/common/CommonApi';
import { OwnUser, UserRequest } from './gen/models';
import { ModerationClient } from './ModerationClient';
import { StableWSConnection } from './real-time/StableWSConnection';
import { StateStore } from './StateStore';
import { TokenManager } from './TokenManager';
import { StreamClientOptions, StreamEvent } from './types';
import {
  addConnectionEventListeners,
  removeConnectionEventListeners,
} from './utils';

export type StreamClientState = {
  connectedUser: OwnUser | undefined;
};

export class StreamClient extends CommonApi {
  readonly state = new StateStore<StreamClientState>({
    connectedUser: undefined,
  });
  readonly moderation: ModerationClient;

  private readonly tokenManager: TokenManager;
  private wsConnection?: StableWSConnection;
  private readonly connectionIdManager: ConnectionIdManager;
  private readonly eventDispatcher: EventDispatcher<
    StreamEvent['type'],
    StreamEvent
  > = new EventDispatcher<StreamEvent['type'], StreamEvent>();

  constructor(
    public readonly apiKey: string,
    options?: StreamClientOptions,
  ) {
    const tokenManager = new TokenManager();
    const connectionIdManager = new ConnectionIdManager();
    const apiClient = new ApiClient(
      apiKey,
      tokenManager,
      connectionIdManager,
      options,
    );
    super(apiClient);
    this.tokenManager = tokenManager;
    this.connectionIdManager = connectionIdManager;
    this.moderation = new ModerationClient(this.apiClient);
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

  private readonly updateNetworkConnectionStatus = (
    event: { type: 'online' | 'offline' } | Event,
  ) => {
    if (event.type === 'offline') {
      // TODO: add logging
      // this.logger('debug', 'device went offline');
      this.eventDispatcher.dispatch({ type: 'network.changed', online: false });
    } else if (event.type === 'online') {
      // this.logger('debug', 'device went online');
      this.eventDispatcher.dispatch({ type: 'network.changed', online: true });
    }
  };
}

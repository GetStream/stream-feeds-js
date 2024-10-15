import { ApiClient } from './ApiClient';
import { CommonApi } from './gen/common/CommonApi';
import { OwnUser, UserRequest } from './gen/models';
import { ModerationClient } from './ModerationClient';
import { StateStore } from './StateStore';
import { TokenManager } from './TokenManager';
import { StreamClientOptions } from './types';

export interface StreamClientState {
  connectedUser: OwnUser | undefined;
  userConnectionState:
    | 'disconnected'
    | 'connected'
    | 'connecting'
    | 'disconnecting';
}

export class StreamClient extends CommonApi {
  readonly state = new StateStore<StreamClientState>({
    connectedUser: undefined,
    userConnectionState: 'disconnected',
  });

  readonly tokenManager: TokenManager;
  readonly moderation: ModerationClient;

  constructor(
    public readonly apiKey: string,
    options?: StreamClientOptions,
  ) {
    const tokenManager = new TokenManager();
    const apiClient = new ApiClient(apiKey, tokenManager, options);
    super(apiClient);
    this.tokenManager = tokenManager;
    this.apiClient = apiClient;
    this.moderation = new ModerationClient(this.apiClient);
  }

  connectUser(
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ) {
    void this.tokenManager.setTokenOrProvider(tokenProvider);

    if (this.state.getLatestValue().userConnectionState !== 'disconnected') {
      throw new Error(
        `Can't connect a new user while the connection state is ${this.state.getLatestValue().userConnectionState}`,
      );
    }
  }
}

import { FeedsApi } from './gen/feeds/FeedsApi';
import { Feed, WSEvent } from './gen/models';
import { FeedsEvent, StreamFeedClient } from './types';
import { StateStore } from './common/StateStore';
import { ModerationClient } from './common/ModerationClient';
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
import { FlatFeed } from './FlatFeed';
import { NotificationFeed } from './NotificationFeed';
import {
  UserRequest,
  BlockUsersRequest,
  BlockUsersResponse,
  CreateBlockListRequest,
  CreateBlockListResponse,
  CreateDeviceRequest,
  CreateGuestRequest,
  CreateGuestResponse,
  GetApplicationResponse,
  GetBlockedUsersResponse,
  GetOGResponse,
  ListBlockListResponse,
  ListDevicesResponse,
  OwnUser,
  QueryUsersPayload,
  QueryUsersResponse,
  UnblockUsersRequest,
  UnblockUsersResponse,
  UpdateBlockListRequest,
  UpdateBlockListResponse,
  UpdateUsersPartialRequest,
  UpdateUsersRequest,
  UpdateUsersResponse,
  WSAuthMessage,
} from './common/gen/models';
import { decoders } from './gen/model-decoders/decoders';
import {
  FeedsClientOptions,
  StreamResponse,
  NetworkChangedEvent,
} from './common/types';

export type FeedsClientState = {
  connectedUser: OwnUser | undefined;
};

type FID = string;

export class FeedsClient extends FeedsApi {
  readonly state: StateStore<FeedsClientState>;
  readonly moderation: ModerationClient;

  private readonly tokenManager: TokenManager;
  private wsConnection?: StableWSConnection;
  private readonly connectionIdManager: ConnectionIdManager;
  private readonly eventDispatcher: EventDispatcher<
    FeedsEvent['type'],
    FeedsEvent
  > = new EventDispatcher<FeedsEvent['type'], FeedsEvent>();

  private activeFeeds: Record<FID, StreamFeedClient> = {};

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
    this.moderation = new ModerationClient(this.apiClient);
    this.on('all', (event) => {
      if (Object.hasOwn(event, 'fid')) {
        const feed = this.activeFeeds[(event as unknown as WSEvent).fid];
        if (feed) {
          feed.handleWSEvent(event as unknown as WSEvent);
        }
      }
    });
  }

  upsertUsers = (users: UserRequest[]) => {
    const payload: Record<string, UserRequest> = {};

    users.forEach((u) => {
      payload[u.id] = u;
    });

    return this.updateUsers({ users: payload });
  };

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
    return this.getOrCreateActiveFeed(group, id, 'flat') as FlatFeed;
  };

  notificationFeed = (group: string, id: string) => {
    return this.getOrCreateActiveFeed(
      group,
      id,
      'notification',
    ) as NotificationFeed;
  };

  async queryFeeds(request?: { connection_id?: string }) {
    const response = await this.feedsQueryFeeds(request);

    // TODO: we need type here
    const feeds = response.feeds.map((f) =>
      this.getOrCreateActiveFeed(f.group_id, f.id, 'flat', f),
    );

    return {
      feeds,
      next: response.pager.next,
      prev: response.pager.prev,
      metadata: response.metadata,
      duration: response.duration,
    };
  }

  private readonly getOrCreateActiveFeed = (
    group: string,
    id: string,
    type: 'flat' | 'notification',
    data?: Feed,
  ) => {
    const fid = `${group}:${id}`;
    if (this.activeFeeds[fid]) {
      return this.activeFeeds[fid];
    } else {
      let feed: StreamFeedClient;
      switch (type) {
        case 'flat':
          feed = new FlatFeed(this, group, id, data);
          break;
        case 'notification':
          feed = new NotificationFeed(this, group, id, data);
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`This SDK doesn't yet support ${type} type`);
      }
      this.activeFeeds[fid] = feed;
      return feed;
    }
  };

  // TODO: common methods should be generated, but they're not part of feeds API spec
  async getApp(): Promise<StreamResponse<GetApplicationResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<GetApplicationResponse>
    >('GET', '/api/v2/app', undefined, undefined);

    decoders.GetApplicationResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async listBlockLists(request?: {
    team?: string;
  }): Promise<StreamResponse<ListBlockListResponse>> {
    const queryParams = {
      team: request?.team,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<ListBlockListResponse>
    >('GET', '/api/v2/blocklists', undefined, queryParams);

    decoders.ListBlockListResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createBlockList(
    request: CreateBlockListRequest,
  ): Promise<StreamResponse<CreateBlockListResponse>> {
    const body = {
      name: request?.name,
      words: request?.words,
      team: request?.team,
      type: request?.type,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<CreateBlockListResponse>
    >('POST', '/api/v2/blocklists', undefined, undefined, body);

    decoders.CreateBlockListResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteBlockList(request: {
    name: string;
    team?: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      team: request?.team,
    };
    const pathParams = {
      name: request?.name,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/blocklists/{name}',
      pathParams,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateBlockList(
    request: UpdateBlockListRequest & { name: string },
  ): Promise<StreamResponse<UpdateBlockListResponse>> {
    const pathParams = {
      name: request?.name,
    };
    const body = {
      team: request?.team,
      words: request?.words,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateBlockListResponse>
    >('PUT', '/api/v2/blocklists/{name}', pathParams, undefined, body);

    decoders.UpdateBlockListResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async deleteDevice(request: {
    id: string;
  }): Promise<StreamResponse<Response>> {
    const queryParams = {
      id: request?.id,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'DELETE',
      '/api/v2/devices',
      undefined,
      queryParams,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async listDevices(): Promise<StreamResponse<ListDevicesResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<ListDevicesResponse>
    >('GET', '/api/v2/devices', undefined, undefined);

    decoders.ListDevicesResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createDevice(
    request: CreateDeviceRequest,
  ): Promise<StreamResponse<Response>> {
    const body = {
      id: request?.id,
      push_provider: request?.push_provider,
      push_provider_name: request?.push_provider_name,
      voip_token: request?.voip_token,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<Response>>(
      'POST',
      '/api/v2/devices',
      undefined,
      undefined,
      body,
    );

    decoders.Response?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async createGuest(
    request: CreateGuestRequest,
  ): Promise<StreamResponse<CreateGuestResponse>> {
    const body = {
      user: request?.user,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<CreateGuestResponse>
    >('POST', '/api/v2/guest', undefined, undefined, body);

    decoders.CreateGuestResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async longPoll(request?: {
    connection_id?: string;
    json?: WSAuthMessage;
  }): Promise<StreamResponse<{}>> {
    const queryParams = {
      connection_id: request?.connection_id,
      json: request?.json,
    };

    const response = await this.apiClient.sendRequest<StreamResponse<{}>>(
      'GET',
      '/api/v2/longpoll',
      undefined,
      queryParams,
    );

    decoders['{}']?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getOG(request: {
    url: string;
  }): Promise<StreamResponse<GetOGResponse>> {
    const queryParams = {
      url: request?.url,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<GetOGResponse>
    >('GET', '/api/v2/og', undefined, queryParams);

    decoders.GetOGResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async queryUsers(request?: {
    payload?: QueryUsersPayload;
  }): Promise<StreamResponse<QueryUsersResponse>> {
    const queryParams = {
      payload: request?.payload,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<QueryUsersResponse>
    >('GET', '/api/v2/users', undefined, queryParams);

    decoders.QueryUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateUsersPartial(
    request: UpdateUsersPartialRequest,
  ): Promise<StreamResponse<UpdateUsersResponse>> {
    const body = {
      users: request?.users,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateUsersResponse>
    >('PATCH', '/api/v2/users', undefined, undefined, body);

    decoders.UpdateUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async updateUsers(
    request: UpdateUsersRequest,
  ): Promise<StreamResponse<UpdateUsersResponse>> {
    const body = {
      users: request?.users,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UpdateUsersResponse>
    >('POST', '/api/v2/users', undefined, undefined, body);

    decoders.UpdateUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async getBlockedUsers(): Promise<StreamResponse<GetBlockedUsersResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<GetBlockedUsersResponse>
    >('GET', '/api/v2/users/block', undefined, undefined);

    decoders.GetBlockedUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async blockUsers(
    request: BlockUsersRequest,
  ): Promise<StreamResponse<BlockUsersResponse>> {
    const body = {
      blocked_user_id: request?.blocked_user_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<BlockUsersResponse>
    >('POST', '/api/v2/users/block', undefined, undefined, body);

    decoders.BlockUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

  async unblockUsers(
    request: UnblockUsersRequest,
  ): Promise<StreamResponse<UnblockUsersResponse>> {
    const body = {
      blocked_user_id: request?.blocked_user_id,
    };

    const response = await this.apiClient.sendRequest<
      StreamResponse<UnblockUsersResponse>
    >('POST', '/api/v2/users/unblock', undefined, undefined, body);

    decoders.UnblockUsersResponse?.(response.body);

    return { ...response.body, metadata: response.metadata };
  }

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

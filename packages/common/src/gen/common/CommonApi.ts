import { ApiClient, StreamResponse } from '../../gen-imports';
import {
  CreateDeviceRequest,
  CreateGuestRequest,
  CreateGuestResponse,
  GetApplicationResponse,
  GetOGResponse,
  ListDevicesResponse,
  QueryUsersPayload,
  QueryUsersResponse,
  Response,
  UpdateUsersPartialRequest,
  UpdateUsersRequest,
  UpdateUsersResponse,
  WSAuthMessage,
} from '../models';
import { decoders } from '../model-decoders/decoders';

export class CommonApi {
  constructor(public readonly apiClient: ApiClient) {}

  async getApp(): Promise<StreamResponse<GetApplicationResponse>> {
    const response = await this.apiClient.sendRequest<
      StreamResponse<GetApplicationResponse>
    >('GET', '/api/v2/app', undefined, undefined);

    decoders.GetApplicationResponse?.(response.body);

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
}

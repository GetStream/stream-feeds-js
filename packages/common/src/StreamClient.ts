import { CommonApi } from './gen/common/CommonApi';
import { UserRequest } from './gen/models';
import { ModerationClient } from './ModerationClient';
import { StreamClientOptions } from './types';
import axios from 'axios';

export class StreamClient extends CommonApi {
  user?: UserRequest;
  readonly moderation: ModerationClient;

  constructor(apiKey: string, options?: StreamClientOptions) {
    const axiosInstance = axios.create({
      baseURL: options?.baseUrl || 'https://chat.stream-io-api.com',
      timeout: options?.timeout || 3000,
    });
    super(axiosInstance, apiKey);
    this.moderation = new ModerationClient(axiosInstance, apiKey);
  }

  connectUser(
    user: UserRequest,
    tokenProvider: string | (() => string | Promise<string>),
  ) {
    this.user = user;
    this.tokenProvider =
      typeof tokenProvider === 'string' ? () => tokenProvider : tokenProvider;
    // TODO: copy WebSocket logic here
  }
}

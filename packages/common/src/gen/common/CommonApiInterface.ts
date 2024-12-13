import { StreamResponse } from '../../gen-imports';
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

export interface CommonApiInterface {
  getApp: () => Promise<StreamResponse<GetApplicationResponse>>;

  deleteDevice: (request: { id: string }) => Promise<StreamResponse<Response>>;

  listDevices: () => Promise<StreamResponse<ListDevicesResponse>>;

  createDevice: (
    request: CreateDeviceRequest,
  ) => Promise<StreamResponse<Response>>;

  createGuest: (
    request: CreateGuestRequest,
  ) => Promise<StreamResponse<CreateGuestResponse>>;

  longPoll: (request?: {
    connection_id?: string;
    json?: WSAuthMessage;
  }) => Promise<StreamResponse<{}>>;

  getOG: (request: { url: string }) => Promise<StreamResponse<GetOGResponse>>;

  queryUsers: (request?: {
    payload?: QueryUsersPayload;
  }) => Promise<StreamResponse<QueryUsersResponse>>;

  updateUsersPartial: (
    request: UpdateUsersPartialRequest,
  ) => Promise<StreamResponse<UpdateUsersResponse>>;

  updateUsers: (
    request: UpdateUsersRequest,
  ) => Promise<StreamResponse<UpdateUsersResponse>>;
}

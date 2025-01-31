import { StreamResponse } from '../../gen-imports';
import {
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
  QueryUsersPayload,
  QueryUsersResponse,
  Response,
  UnblockUsersRequest,
  UnblockUsersResponse,
  UpdateBlockListRequest,
  UpdateBlockListResponse,
  UpdateUsersPartialRequest,
  UpdateUsersRequest,
  UpdateUsersResponse,
  WSAuthMessage,
} from '../models';

export interface CommonApiInterface {
  getApp: () => Promise<StreamResponse<GetApplicationResponse>>;

  listBlockLists: (request?: {
    team?: string;
  }) => Promise<StreamResponse<ListBlockListResponse>>;

  createBlockList: (
    request: CreateBlockListRequest,
  ) => Promise<StreamResponse<CreateBlockListResponse>>;

  deleteBlockList: (request: {
    name: string;
    team?: string;
  }) => Promise<StreamResponse<Response>>;

  updateBlockList: (
    request: UpdateBlockListRequest & { name: string },
  ) => Promise<StreamResponse<UpdateBlockListResponse>>;

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

  getBlockedUsers: () => Promise<StreamResponse<GetBlockedUsersResponse>>;

  blockUsers: (
    request: BlockUsersRequest,
  ) => Promise<StreamResponse<BlockUsersResponse>>;

  unblockUsers: (
    request: UnblockUsersRequest,
  ) => Promise<StreamResponse<UnblockUsersResponse>>;
}

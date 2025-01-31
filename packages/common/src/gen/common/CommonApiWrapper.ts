import { StreamClient } from '../../gen-imports';
import {
  BlockUsersRequest,
  CreateBlockListRequest,
  CreateDeviceRequest,
  CreateGuestRequest,
  QueryUsersPayload,
  UnblockUsersRequest,
  UpdateBlockListRequest,
  UpdateUsersPartialRequest,
  UpdateUsersRequest,
  WSAuthMessage,
} from '../models';

export class CommonApiWrapper {
  constructor(protected readonly streamClient: StreamClient) {}

  getApp = () => {
    return this.streamClient.getApp();
  };

  listBlockLists = (request?: { team?: string }) => {
    return this.streamClient.listBlockLists(request);
  };

  createBlockList = (request: CreateBlockListRequest) => {
    return this.streamClient.createBlockList(request);
  };

  deleteBlockList = (request: { name: string; team?: string }) => {
    return this.streamClient.deleteBlockList(request);
  };

  updateBlockList = (request: UpdateBlockListRequest & { name: string }) => {
    return this.streamClient.updateBlockList(request);
  };

  deleteDevice = (request: { id: string }) => {
    return this.streamClient.deleteDevice(request);
  };

  listDevices = () => {
    return this.streamClient.listDevices();
  };

  createDevice = (request: CreateDeviceRequest) => {
    return this.streamClient.createDevice(request);
  };

  createGuest = (request: CreateGuestRequest) => {
    return this.streamClient.createGuest(request);
  };

  longPoll = (request?: { connection_id?: string; json?: WSAuthMessage }) => {
    return this.streamClient.longPoll(request);
  };

  getOG = (request: { url: string }) => {
    return this.streamClient.getOG(request);
  };

  queryUsers = (request?: { payload?: QueryUsersPayload }) => {
    return this.streamClient.queryUsers(request);
  };

  updateUsersPartial = (request: UpdateUsersPartialRequest) => {
    return this.streamClient.updateUsersPartial(request);
  };

  updateUsers = (request: UpdateUsersRequest) => {
    return this.streamClient.updateUsers(request);
  };

  getBlockedUsers = () => {
    return this.streamClient.getBlockedUsers();
  };

  blockUsers = (request: BlockUsersRequest) => {
    return this.streamClient.blockUsers(request);
  };

  unblockUsers = (request: UnblockUsersRequest) => {
    return this.streamClient.unblockUsers(request);
  };
}

import { StreamClient } from '../../gen-imports';
import {
  CreateDeviceRequest,
  CreateGuestRequest,
  QueryUsersPayload,
  UpdateUsersPartialRequest,
  UpdateUsersRequest,
  WSAuthMessage,
} from '../models';

export class CommonApiWrapper {
  constructor(protected readonly streamClient: StreamClient) {}

  getApp = () => {
    return this.streamClient.getApp();
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
}

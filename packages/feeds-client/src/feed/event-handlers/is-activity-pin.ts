import type { ActivityPinResponse, ActivityResponse } from '../../gen/models';

export const isPin = (
  entity: ActivityResponse | ActivityPinResponse,
): entity is ActivityPinResponse => {
  return 'activity' in entity;
};

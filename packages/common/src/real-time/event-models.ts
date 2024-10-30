import { APIError, OwnUser, UserObject, UserResponse } from '../gen/models';

/**
 * This event is sent when the WS connection fails
 * @export
 * @interface ConnectionErrorEvent
 */
export interface ConnectionErrorEvent {
  /**
   *
   * @type {string}
   * @memberof ConnectionErrorEvent
   */
  connection_id: string;
  /**
   *
   * @type {string}
   * @memberof ConnectionErrorEvent
   */
  created_at: string;
  /**
   *
   * @type {APIError}
   * @memberof ConnectionErrorEvent
   */
  error: APIError;
  /**
   * The type of event: "connection.ok" in this case
   * @type {string}
   * @memberof ConnectionErrorEvent
   */
  type: string;
}

/**
 * This event is sent when the WS connection is established and authenticated, this event contains the full user object as it is stored on the server
 * @export
 * @interface ConnectedEvent
 */
export interface ConnectedEvent {
  /**
   * The connection_id for this client
   * @type {string}
   * @memberof ConnectedEvent
   */
  connection_id: string;
  /**
   *
   * @type {string}
   * @memberof ConnectedEvent
   */
  created_at: string;
  /**
   *
   * @type {OwnUserResponse}
   * @memberof ConnectedEvent
   */
  me: OwnUser;
  /**
   * The type of event: "connection.ok" in this case
   * @type {string}
   * @memberof ConnectedEvent
   */
  type: string;
}

/**
 * A custom event, this event is used to send custom events to other participants in the call.
 * @export
 * @interface CustomEvent
 */
export interface CustomEvent {
  /**
   *
   * @type {string}
   * @memberof CustomEvent
   */
  call_cid: string;
  /**
   *
   * @type {string}
   * @memberof CustomEvent
   */
  created_at: string;
  /**
   * Custom data for this object
   * @type {{ [key: string]: any; }}
   * @memberof CustomEvent
   */
  custom: Record<string, any>;
  /**
   * The type of event, "custom" in this case
   * @type {string}
   * @memberof CustomEvent
   */
  type: string;
  /**
   *
   * @type {UserResponse}
   * @memberof CustomEvent
   */
  user: UserResponse;
}

/**
 *
 * @export
 * @interface HealthCheckEvent
 */
export interface HealthCheckEvent {
  /**
   *
   * @type {string}
   * @memberof HealthCheckEvent
   */
  cid: string;
  /**
   *
   * @type {string}
   * @memberof HealthCheckEvent
   */
  connection_id: string;
  /**
   *
   * @type {string}
   * @memberof HealthCheckEvent
   */
  created_at: string;
  /**
   *
   * @type {OwnUser}
   * @memberof HealthCheckEvent
   */
  me?: OwnUser;
  /**
   *
   * @type {string}
   * @memberof HealthCheckEvent
   */
  type: string;
}

/**
 *
 * @export
 * @interface UserBannedEvent
 */
export interface UserBannedEvent {
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  channel_id: string;
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  channel_type: string;
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  cid: string;
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  created_at: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserBannedEvent
   */
  created_by: UserObject;
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  expiration?: string;
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  reason?: string;
  /**
   *
   * @type {boolean}
   * @memberof UserBannedEvent
   */
  shadow: boolean;
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  team?: string;
  /**
   *
   * @type {string}
   * @memberof UserBannedEvent
   */
  type: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserBannedEventß
   */
  user?: UserObject;
}

/**
 *
 * @export
 * @interface UserDeactivatedEvent
 */
export interface UserDeactivatedEvent {
  /**
   *
   * @type {string}
   * @memberof UserDeactivatedEvent
   */
  created_at: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserDeactivatedEvent
   */
  created_by: UserObject;
  /**
   *
   * @type {string}
   * @memberof UserDeactivatedEvent
   */
  type: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserDeactivatedEvent
   */
  user?: UserObject;
}

/**
 *
 * @export
 * @interface UserDeletedEvent
 */
export interface UserDeletedEvent {
  /**
   *
   * @type {string}
   * @memberof UserDeletedEvent
   */
  created_at: string;
  /**
   *
   * @type {boolean}
   * @memberof UserDeletedEvent
   */
  delete_conversation_channels: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UserDeletedEvent
   */
  hard_delete: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UserDeletedEvent
   */
  mark_messages_deleted: boolean;
  /**
   *
   * @type {string}
   * @memberof UserDeletedEvent
   */
  type: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserDeletedEvent
   */
  user?: UserObject;
}

/**
 *
 * @export
 * @interface UserPresenceChangedEvent
 */
export interface UserPresenceChangedEvent {
  /**
   *
   * @type {string}
   * @memberof UserPresenceChangedEvent
   */
  created_at: string;
  /**
   *
   * @type {string}
   * @memberof UserPresenceChangedEvent
   */
  type: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserPresenceChangedEvent
   */
  user?: UserObject;
}

/**
 *
 * @export
 * @interface UserReactivatedEvent
 */
export interface UserReactivatedEvent {
  /**
   *
   * @type {string}
   * @memberof UserReactivatedEvent
   */
  created_at: string;
  /**
   *
   * @type {string}
   * @memberof UserReactivatedEvent
   */
  type: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserReactivatedEvent
   */
  user?: UserObject;
}

/**
 *
 * @export
 * @interface UserUnbannedEvent
 */
export interface UserUnbannedEvent {
  /**
   *
   * @type {string}
   * @memberof UserUnbannedEvent
   */
  channel_id: string;
  /**
   *
   * @type {string}
   * @memberof UserUnbannedEvent
   */
  channel_type: string;
  /**
   *
   * @type {string}
   * @memberof UserUnbannedEvent
   */
  cid: string;
  /**
   *
   * @type {string}
   * @memberof UserUnbannedEvent
   */
  created_at: string;
  /**
   *
   * @type {boolean}
   * @memberof UserUnbannedEvent
   */
  shadow: boolean;
  /**
   *
   * @type {string}
   * @memberof UserUnbannedEvent
   */
  team?: string;
  /**
   *
   * @type {string}
   * @memberof UserUnbannedEvent
   */
  type: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserUnbannedEvent
   */
  user?: UserObject;
}

/**
 *
 * @export
 * @interface UserUpdatedEvent
 */
export interface UserUpdatedEvent {
  /**
   *
   * @type {string}
   * @memberof UserUpdatedEvent
   */
  created_at: string;
  /**
   *
   * @type {string}
   * @memberof UserUpdatedEvent
   */
  received_at?: string;
  /**
   *
   * @type {string}
   * @memberof UserUpdatedEvent
   */
  type: string;
  /**
   *
   * @type {UserObject}
   * @memberof UserUpdatedEvent
   */
  user?: UserObject;
}

export type WSEvent =
  | ({ type: 'connection.error' } & ConnectionErrorEvent)
  | ({ type: 'connection.ok' } & ConnectedEvent)
  | ({ type: 'custom' } & CustomEvent)
  | ({ type: 'health.check' } & HealthCheckEvent)
  | ({ type: 'user.banned' } & UserBannedEvent)
  | ({ type: 'user.deactivated' } & UserDeactivatedEvent)
  | ({ type: 'user.deleted' } & UserDeletedEvent)
  | ({ type: 'user.presence.changed' } & UserPresenceChangedEvent)
  | ({ type: 'user.reactivated' } & UserReactivatedEvent)
  | ({ type: 'user.unbanned' } & UserUnbannedEvent)
  | ({ type: 'user.updated' } & UserUpdatedEvent);

export interface ConnectionChangedEvent {
  type: 'connection.changed';
  online: boolean;
}

export type StreamWSEvent = WSEvent | ConnectionChangedEvent;

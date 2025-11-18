import type { ConnectedUser } from '@self';
import type { StreamApiError } from '@self';

export interface ConnectionChangedEvent {
  type: 'connection.changed';
  online: boolean;
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
  me: ConnectedUser;
  /**
   * The type of event: "connection.ok" in this case
   * @type {string}
   * @memberof ConnectedEvent
   */
  type: string;
}

export enum UnhandledErrorType {
  ReconnectionReconciliation = 'reconnection-reconciliation',
  FetchingOwnCapabilitiesOnNewActivity = 'fetching-own-capabilities-on-new-activity',
}

export type SyncFailure = {
  feed: string;
  reason: unknown;
  activity_id?: string;
};

export type UnhandledErrorEvent = {
  type: 'errors.unhandled';
  error_type: UnhandledErrorType;
} & (
  | {
      error_type: UnhandledErrorType.ReconnectionReconciliation;
      failures: SyncFailure[];
    }
  | {
      error_type: UnhandledErrorType.FetchingOwnCapabilitiesOnNewActivity;
      error: StreamApiError;
    }
);

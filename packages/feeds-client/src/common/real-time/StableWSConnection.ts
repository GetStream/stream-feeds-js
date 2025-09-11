import {
  addConnectionEventListeners,
  KnownCodes,
  randomId,
  removeConnectionEventListeners,
  retryInterval,
  sleep,
} from '../utils';
import type { UserRequest } from '../../gen/models';
import { TokenManager } from '../TokenManager';
import { EventDispatcher } from '../EventDispatcher';
import { ConnectionIdManager } from '../ConnectionIdManager';
import { ConnectedEvent } from './event-models';
import { getLogger } from '../../utils/logger';

// Type guards to check WebSocket error type
const isCloseEvent = (
  res: CloseEvent | Event | ErrorEvent,
): res is CloseEvent => (res as CloseEvent).code !== undefined;

const isErrorEvent = (
  res: CloseEvent | Event | ErrorEvent,
): res is ErrorEvent => (res as ErrorEvent).error !== undefined;

const isWSError = (error: WSError | any): error is WSError =>
  typeof error.isWSFailure !== 'undefined' ||
  typeof error.code !== 'undefined' ||
  typeof error.StatusCode !== 'undefined';

export type WSConfig = {
  baseUrl: string;
  user: UserRequest;
};

type WSError = Error & {
  code?: string | number;
  isWSFailure?: boolean;
  StatusCode?: string | number;
};

/**
 * StableWSConnection - A WS connection that reconnects upon failure.
 * - the browser will sometimes report that you're online or offline
 * - the WS connection can break and fail (there is a 30s health check)
 * - sometimes your WS connection will seem to work while the user is in fact offline
 * - to speed up online/offline detection you can use the window.addEventListener('offline');
 *
 * There are 4 ways in which a connection can become unhealthy:
 * - websocket.onerror is called
 * - websocket.onclose is called
 * - the health check fails and no event is received for ~40 seconds
 * - the browser indicates the connection is now offline
 *
 * There are 2 assumptions we make about the server:
 * - state can be recovered by querying the channel again
 * - if the servers fails to publish a message to the client, the WS connection is destroyed
 */
export class StableWSConnection {
  // local vars
  connectionID?: string;
  connectionOpen?: Promise<ConnectedEvent>;
  authenticationSent: boolean;
  consecutiveFailures: number;
  pingInterval: number;
  healthCheckTimeoutRef?: NodeJS.Timeout;
  isConnecting: boolean;
  isDisconnected: boolean;
  isHealthy: boolean;
  isResolved?: boolean;
  lastEvent: Date | null;
  connectionCheckTimeout: number;
  connectionCheckTimeoutRef?: NodeJS.Timeout;
  rejectPromise?: (reason?: WSError) => void;
  requestID: string | undefined;
  resolvePromise?: (value: ConnectedEvent) => void;
  totalFailures: number;
  ws?: WebSocket;
  wsID: number;
  private readonly dispatcher = new EventDispatcher();
  private readonly clientId: string;
  private readonly logger = getLogger('stable-ws-connection');

  constructor(
    private readonly config: WSConfig,
    private readonly tokenManager: TokenManager,
    private readonly connectionIdManager: ConnectionIdManager,
    private readonly decoders: Array<(event: any) => any> = [],
  ) {
    /** consecutive failures influence the duration of the timeout */
    this.consecutiveFailures = 0;
    /** keep track of the total number of failures */
    this.totalFailures = 0;
    /** We only make 1 attempt to reconnect at the same time.. */
    this.isConnecting = false;
    /** True after the auth payload is sent to the server */
    this.authenticationSent = false;
    /** To avoid reconnect if client is disconnected */
    this.isDisconnected = false;
    /** Boolean that indicates if the connection promise is resolved */
    this.isResolved = false;
    /** Boolean that indicates if we have a working connection to the server */
    this.isHealthy = false;
    /** Incremented when a new WS connection is made */
    this.wsID = 1;
    /** Store the last event time for health checks */
    this.lastEvent = null;
    /** Send a health check message every 25 seconds */
    this.pingInterval = 25 * 1000;
    this.connectionCheckTimeout = this.pingInterval + 10 * 1000;
    this.clientId = `${config.user.id}-${randomId()}`;

    addConnectionEventListeners(this.onlineStatusChanged);
  }

  on = this.dispatcher.on;
  off = this.dispatcher.off;
  offAll = this.dispatcher.offAll;

  /**
   * connect - Connect to the WS URL
   * the default 15s timeout allows between 2~3 tries
   * @return {ConnectAPIResponse<ConnectedEvent>} Promise that completes once the first health check message is received
   */
  async connect(timeout = 15000) {
    const logger = this.logger.withExtraTags('connect');
    if (this.isConnecting) {
      throw Error(
        `You've called connect twice, can only attempt 1 connection at the time`,
      );
    }

    this.isDisconnected = false;

    if (!this.connectionIdManager.loadConnectionIdPromise) {
      this.connectionIdManager.resetConnectionIdPromise();
    }

    try {
      const healthCheck = await this._connect();
      this.consecutiveFailures = 0;

      logger.debug(`Established ws connection with healthcheck`, healthCheck);
    } catch (error) {
      this.isHealthy = false;
      this.consecutiveFailures += 1;

      if (isWSError(error)) {
        if (
          error.code === KnownCodes.TOKEN_EXPIRED &&
          !this.tokenManager.isStatic()
        ) {
          logger.debug(
            'WS failure due to expired token, so going to try to reload token and reconnect',
          );
          void this._reconnect({ refreshToken: true });
        } else {
          if (!error.isWSFailure) {
            // API rejected the connection and we should not retry
            throw new Error(
              JSON.stringify({
                code: error.code,
                StatusCode: error.StatusCode,
                message: error.message,
                isWSFailure: error.isWSFailure,
              }),
            );
          }
        }
      } else {
        throw error;
      }
    }

    return await this._waitForHealthy(timeout);
  }

  /**
   * _waitForHealthy polls the promise connection to see if its resolved until it times out
   * the default 15s timeout allows between 2~3 tries
   * @param timeout duration(ms)
   */
  async _waitForHealthy(timeout = 15000) {
    return await Promise.race([
      (async () => {
        const interval = 50; // ms
        for (let i = 0; i <= timeout; i += interval) {
          try {
            return await this.connectionOpen;
          } catch (error: any) {
            if (i === timeout) {
              throw new Error(
                JSON.stringify({
                  code: error.code,
                  StatusCode: error.StatusCode,
                  message: error.message,
                  isWSFailure: error.isWSFailure,
                }),
              );
            }
            await sleep(interval);
          }
        }
      })(),
      (async () => {
        await sleep(timeout);
        this.isConnecting = false;
        throw new Error(
          JSON.stringify({
            code: '',
            StatusCode: '',
            message: 'initial WS connection could not be established',
            isWSFailure: true,
          }),
        );
      })(),
    ]);
  }

  /**
   * disconnect - Disconnect the connection and doesn't recover...
   *
   */
  disconnect(timeout?: number) {
    const logger = this.logger.withExtraTags('disconnect');
    logger.debug(`Closing the WS connection for wsID ${this.wsID}`);

    this.wsID += 1;
    this.isConnecting = false;
    this.isDisconnected = true;

    // start by removing all the listeners
    if (this.healthCheckTimeoutRef) {
      clearInterval(this.healthCheckTimeoutRef);
    }
    if (this.connectionCheckTimeoutRef) {
      clearInterval(this.connectionCheckTimeoutRef);
    }

    removeConnectionEventListeners(this.onlineStatusChanged);

    this.isHealthy = false;

    // remove ws handlers...
    if (this.ws) {
      this.ws.onclose = () => {};
      this.ws.onerror = () => {};
      this.ws.onmessage = () => {};
    }

    let isClosedPromise: Promise<void>;
    // and finally close...
    // Assigning to local here because we will remove it from this before the
    // promise resolves.
    const { ws } = this;
    if (ws?.close && ws.readyState === ws.OPEN) {
      isClosedPromise = new Promise((resolve) => {
        const onclose = (event: CloseEvent) => {
          logger.debug(
            `resolving isClosedPromise ${
              event ? 'with' : 'without'
            } close frame`,
            { event },
          );
          resolve();
        };

        ws.onclose = onclose;
        // In case we don't receive close frame websocket server in time,
        // lets not wait for more than 1 second.
        setTimeout(onclose, timeout ?? 1000);
      });

      logger.debug(`Manually closed connection by calling client.disconnect()`);

      ws.close(
        KnownCodes.WS_CLOSED_SUCCESS,
        'Manually closed connection by calling client.disconnect()',
      );
    } else {
      logger.debug(`WS connection doesn't exist or it is already closed.`);
      isClosedPromise = Promise.resolve();
    }

    delete this.ws;

    return isClosedPromise;
  }

  /**
   * _connect - Connect to the WS endpoint
   *
   * @return {ConnectAPIResponse<ConnectedEvent>} Promise that completes once the first health check message is received
   */
  async _connect() {
    const logger = this.logger.withExtraTags('_connect');
    if (this.isConnecting) return; // simply ignore _connect if it's currently trying to connect
    this.isConnecting = true;
    this.requestID = randomId();
    let isTokenReady = false;
    try {
      logger.debug(`waiting for token`);
      await this.tokenManager.getToken();
      isTokenReady = true;
    } catch (_) {
      // token provider has failed before, so try again
    }

    try {
      if (!isTokenReady) {
        logger.debug(`tokenProvider failed before, so going to retry`);
        await this.tokenManager.loadToken();
      }

      this._setupConnectionPromise();
      const wsURL = this.config.baseUrl;
      logger.debug(`Connecting to ${wsURL}`, {
        wsURL,
        requestID: this.requestID,
      });
      this.ws = new WebSocket(wsURL);
      this.ws.onopen = this.onopen.bind(this, this.wsID);
      this.ws.onclose = this.onclose.bind(this, this.wsID);
      this.ws.onerror = this.onerror.bind(this, this.wsID);
      this.ws.onmessage = this.onmessage.bind(this, this.wsID);
      const response = await this.connectionOpen;
      this.isConnecting = false;

      if (response) {
        return response;
      }
    } catch (err) {
      this.isConnecting = false;
      throw err;
    }
  }

  /**
   * _reconnect - Retry the connection to WS endpoint
   *
   * @param {{ interval?: number; refreshToken?: boolean }} options Following options are available
   *
   * - `interval`	{int}			number of ms that function should wait before reconnecting
   * - `refreshToken` {boolean}	reload/refresh user token be refreshed before attempting reconnection.
   */
  async _reconnect(
    options: { interval?: number; refreshToken?: boolean } = {},
  ): Promise<void> {
    const logger = this.logger.withExtraTags('_reconnect');

    logger.debug('Initiating the reconnect');

    // only allow 1 connection at the time
    if (this.isConnecting || this.isHealthy) {
      logger.debug('Abort (1) since already connecting or healthy');
      return;
    }

    // reconnect in case of on error or on close
    // also reconnect if the health check cycle fails
    let interval = options.interval;
    if (!interval) {
      interval = retryInterval(this.consecutiveFailures);
    }
    // reconnect, or try again after a little while...
    await sleep(interval);

    // Check once again if by some other call to _reconnect is active or connection is
    // already restored, then no need to proceed.
    if (this.isConnecting || this.isHealthy) {
      logger.debug('Abort (2) since already connecting or healthy');
      return;
    }

    if (this.isDisconnected) {
      logger.debug('Abort (3) since disconnect() is called');
      return;
    }

    logger.debug('Destroying current WS connection');

    // cleanup the old connection
    this._destroyCurrentWSConnection();

    if (options.refreshToken) {
      await this.tokenManager.loadToken();
    }

    try {
      await this._connect();
      // logger.debug('Waiting for recoverCallBack');
      // await this.client.recoverState();
      // logger.debug('Finished recoverCallBack');

      this.consecutiveFailures = 0;
    } catch (error: any) {
      this.isHealthy = false;
      this.consecutiveFailures += 1;
      if (
        error.code === KnownCodes.TOKEN_EXPIRED &&
        !this.tokenManager.isStatic()
      ) {
        logger.debug(
          'WS failure due to expired token, so going to try to reload token and reconnect',
        );

        return await this._reconnect({ refreshToken: true });
      }

      // reconnect on WS failures, don't reconnect if there is a code bug
      if (error.isWSFailure) {
        logger.debug('WS failure, so going to try to reconnect');

        void this._reconnect();
      }
    }
    logger.debug('== END ==');
  }

  /**
   * onlineStatusChanged - this function is called when the browser connects or disconnects from the internet.
   *
   * @param {Event} event Event with type online or offline
   *
   */
  onlineStatusChanged = (event: Event) => {
    const logger = this.logger.withExtraTags('onlineStatusChanged');

    if (event.type === 'offline') {
      // mark the connection as down
      logger.debug('Status changing to offline');
      // we know that the app is offline so dispatch the unhealthy connection event immediately
      this._setHealth(false, true);
    } else if (event.type === 'online') {
      // retry right now...
      // We check this.isHealthy, not sure if it's always
      // smart to create a new WS connection if the old one is still up and running.
      // it's possible we didn't miss any messages, so this process is just expensive and not needed.
      logger.debug(`Status changing to online. isHealthy: ${this.isHealthy}`);
      if (!this.isHealthy) {
        void this._reconnect({ interval: 10 });
      }
    }
  };

  onopen = async (wsID: number) => {
    const logger = this.logger.withExtraTags('onopen');

    if (this.wsID !== wsID) return;

    const user = this.config.user;
    if (!user) {
      logger.warn(`User not set, can't connect to WS`);
      return;
    }

    const token = await this.tokenManager.getToken();
    if (!token) {
      logger.warn(`Token not set, can't connect authenticate`);
      return;
    }

    const authMessage = {
      token,
      user_details: {
        id: user.id,
        name: user.name,
        image: user.image,
        custom: user.custom,
      },
      products: ['feeds'],
    };

    this.authenticationSent = true;
    this.ws?.send(JSON.stringify(authMessage));
    logger.debug('onopen callback', { wsID });
  };

  onmessage = (wsID: number, event: MessageEvent) => {
    const logger = this.logger.withExtraTags('onmessage');

    if (this.wsID !== wsID) return;

    logger.debug('onmessage callback', {
      event: { ...event, data: JSON.parse(event.data) },
      wsID,
    });
    let data = typeof event.data === 'string' ? JSON.parse(event.data) : null;
    this.decoders.forEach((decode) => {
      data = decode(data);
    });

    // we wait till the first message before we consider the connection open.
    // the reason for this is that auth errors and similar errors trigger a ws.onopen and immediately
    // after that a ws.onclose.
    if (!this.isResolved && data && data.type === 'connection.error') {
      this.isResolved = true;
      if (data.error) {
        this.rejectPromise?.(this._errorFromWSEvent(data, false));
        return;
      }
    }

    // trigger the event..
    this.lastEvent = new Date();

    if (
      data &&
      (data.type === 'health.check' || data.type === 'connection.ok')
    ) {
      // the initial health-check should come from the client
      this.scheduleNextPing();
    }

    if (data && data.type === 'connection.ok') {
      this.resolvePromise?.(data);
      this.connectionID = (data as ConnectedEvent).connection_id;
      this._setHealth(true);
    }

    if (data && data.type === 'connection.error' && data.error) {
      const { code } = data.error;
      this.isHealthy = false;
      this.isConnecting = false;
      this.consecutiveFailures += 1;
      if (code === KnownCodes.TOKEN_EXPIRED && !this.tokenManager.isStatic()) {
        clearTimeout(this.connectionCheckTimeoutRef);
        logger.debug(
          'WS failure due to expired token, so going to try to reload token and reconnect',
        );
        void this._reconnect({ refreshToken: true });
      }
    }

    if (data) {
      data.received_at = new Date();
      this.dispatcher.dispatch(data);
    }
    this.scheduleConnectionCheck();
  };

  onclose = (wsID: number, event: CloseEvent) => {
    const logger = this.logger.withExtraTags('onclose');

    if (this.wsID !== wsID) return;

    logger.debug('onclose callback - ' + event.code, {
      event,
      wsID,
    });

    if (event.code === KnownCodes.WS_CLOSED_SUCCESS) {
      // this is a permanent error raised by stream..
      // usually caused by invalid auth details
      this.rejectPromise?.(this._errorFromWSEvent(event));
      logger.debug(`WS connection reject with error ${event.reason}`, {
        event,
      });
    } else {
      this.consecutiveFailures += 1;
      this.totalFailures += 1;
      this._setHealth(false);
      this.isConnecting = false;

      this.rejectPromise?.(this._errorFromWSEvent(event));

      logger.debug(`WS connection closed. Calling reconnect ...`, {
        event,
      });

      // reconnect if its an abnormal failure
      void this._reconnect();
    }
  };

  onerror = (wsID: number, event: Event) => {
    if (this.wsID !== wsID) return;

    this.consecutiveFailures += 1;
    this.totalFailures += 1;
    this._setHealth(false);
    this.isConnecting = false;
    this.rejectPromise?.(this._errorFromWSEvent(event));
    this.logger
      .withExtraTags('onerror')
      .debug(`WS connection resulted into error`, {
        event,
      });

    void this._reconnect();
  };

  /**
   * _setHealth - Sets the connection to healthy or unhealthy.
   * Broadcasts an event in case the connection status changed.
   *
   * @param {boolean} healthy boolean indicating if the connection is healthy or not
   * @param {boolean} dispatchImmediately boolean indicating to dispatch event immediately even if the connection is unhealthy
   *
   */
  _setHealth = (healthy: boolean, dispatchImmediately = false) => {
    if (healthy === this.isHealthy) return;

    this.isHealthy = healthy;

    if (this.isHealthy || dispatchImmediately) {
      this.dispatchConnectionChanged();
      return;
    }

    // we're offline, wait few seconds and fire and event if still offline
    setTimeout(() => {
      if (this.isHealthy) return;
      this.dispatchConnectionChanged();
    }, 5000);
  };

  dispatchConnectionChanged = () => {
    if (this.isHealthy) {
      if (this.connectionID) {
        this.connectionIdManager?.resolveConnectionidPromise(this.connectionID);
      } else {
        throw new Error(
          `Stream error: WebSocket connection is healthy, but connection id isn't set`,
        );
      }
    } else {
      if (this.connectionIdManager.loadConnectionIdPromise) {
        this.connectionIdManager.rejectConnectionIdPromise(
          new Error(
            `Stream error: Failed to get WebSocket connection id because WebSocket connection failed`,
          ),
        );
      }
      this.connectionIdManager.reset();
    }
    this.dispatcher.dispatch({
      type: 'connection.changed',
      online: this.isHealthy,
    });
  };

  /**
   * _errorFromWSEvent - Creates an error object for the WS event
   *
   */
  _errorFromWSEvent = (
    event: CloseEvent | Event | ErrorEvent,
    isWSFailure = true,
  ): WSError => {
    let code;
    let statusCode;
    let message;
    if (isCloseEvent(event)) {
      code = event.code;
      statusCode = 'unknown';
      message = event.reason;
    }

    if (isErrorEvent(event)) {
      code = event.error.code;
      statusCode = event.error.StatusCode;
      message = event.error.message;
    }

    // Keeping this `warn` level log, to avoid cluttering of error logs from ws failures.
    this.logger
      .withExtraTags('_errorFromWSEvent')
      .debug(`WS failed with code ${code}`, {
        event,
      });

    const error = new Error(
      `WS failed with code ${code} and reason - ${message}`,
    ) as Error & {
      code?: string | number;
      isWSFailure?: boolean;
      StatusCode?: string | number;
    };
    error.code = code;
    /**
     * StatusCode does not exist on any event types but has been left
     * as is to preserve JS functionality during the TS implementation
     */
    error.StatusCode = statusCode;
    error.isWSFailure = isWSFailure;
    return error;
  };

  /**
   * _destroyCurrentWSConnection - Removes the current WS connection
   *
   */
  _destroyCurrentWSConnection() {
    // increment the ID, meaning we will ignore all messages from the old
    // ws connection from now on.
    this.wsID += 1;

    try {
      if (this.ws) {
        this.ws.onclose = () => {};
        this.ws.onerror = () => {};
        this.ws.onmessage = () => {};
        this.ws.onopen = () => {};
        this.ws.close();
      }
    } catch (_) {
      // we don't care
    }
  }

  /**
   * _setupPromise - sets up the this.connectOpen promise
   */
  _setupConnectionPromise = () => {
    this.isResolved = false;
    /** a promise that is resolved once ws.open is called */
    this.connectionOpen = new Promise<ConnectedEvent>((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });
  };

  /**
   * Schedules a next health check ping for websocket.
   */
  scheduleNextPing = () => {
    if (this.healthCheckTimeoutRef) {
      clearTimeout(this.healthCheckTimeoutRef);
    }

    // 30 seconds is the recommended interval (messenger uses this)
    this.healthCheckTimeoutRef = setTimeout(() => {
      // send the healthcheck..., server replies with a health check event
      const data = [{ type: 'health.check', client_id: this.clientId }];
      // try to send on the connection
      try {
        this.ws?.send(JSON.stringify(data));
      } catch (_) {
        // error will already be detected elsewhere
      }
    }, this.pingInterval);
  };

  /**
   * scheduleConnectionCheck - schedules a check for time difference between last received event and now.
   * If the difference is more than 35 seconds, it means our health check logic has failed and websocket needs
   * to be reconnected.
   */
  scheduleConnectionCheck = () => {
    if (this.connectionCheckTimeoutRef) {
      clearTimeout(this.connectionCheckTimeoutRef);
    }

    this.connectionCheckTimeoutRef = setTimeout(() => {
      const now = new Date();
      if (
        this.lastEvent &&
        now.getTime() - this.lastEvent.getTime() > this.connectionCheckTimeout
      ) {
        this.logger
          .withExtraTags('scheduleConnectionCheck')
          .debug('going to reconnect');
        this._setHealth(false);
        void this._reconnect();
      }
    }, this.connectionCheckTimeout);
  };
}

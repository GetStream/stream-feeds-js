import { feedsLoggerSystem } from '../utils/logger';
import { isFunction, sleep } from './utils';

/**
 * TokenManager
 *
 * Handles all the operations around user token.
 */
export class TokenManager {
  loadTokenPromise: Promise<string> | null;
  type: 'static' | 'provider';
  token?: string;
  tokenProvider?: string | (() => Promise<string>);
  private _isAnonymous: boolean = false;
  private readonly logger = feedsLoggerSystem.getLogger('token-manager');

  constructor() {
    this.loadTokenPromise = null;

    this.type = 'static';
  }

  get isAnonymous() {
    return this._isAnonymous;
  }

  /**
   * Set the static string token or token provider.
   * Token provider should return a token string or a promise which resolves to string token.
   *
   * @param {TokenOrProvider} tokenOrProvider - the token or token provider. Providing `undefined` will set the token manager to anonymous mode.
   */
  setTokenOrProvider = (tokenOrProvider?: string | (() => Promise<string>)) => {
    if (tokenOrProvider === undefined) {
      this._isAnonymous = true;
      tokenOrProvider = '';
    } else {
      this._isAnonymous = false;
    }

    if (isFunction(tokenOrProvider)) {
      this.tokenProvider = tokenOrProvider;
      this.type = 'provider';
    }

    if (typeof tokenOrProvider === 'string') {
      this.token = tokenOrProvider;
      this.type = 'static';
    }
  };

  /**
   * Resets the token manager.
   * Useful for client disconnection or switching user.
   */
  reset = () => {
    this._isAnonymous = false;
    this.token = undefined;
    this.tokenProvider = undefined;
    this.loadTokenPromise = null;
  };

  // Fetches a token from tokenProvider function and sets in tokenManager.
  // In case of static token, it will simply resolve to static token.
  loadToken = () => {
    this.logger.info('Loading a new token');

    if (this.loadTokenPromise) {
      return this.loadTokenPromise;
    }

    this.loadTokenPromise = new Promise(async (resolve, reject) => {
      if (this.type === 'static') {
        this.loadTokenPromise = null;
        return resolve(this.token!);
      }

      if (this.tokenProvider && typeof this.tokenProvider !== 'string') {
        this.token = undefined;
        const tokenProvider = this.tokenProvider;
        const loadTokenWithRetries = async (previousFailuresCount = 0) => {
          try {
            this.token = await tokenProvider();
          } catch (e) {
            const numberOfFailures = ++previousFailuresCount;
            await sleep(1000);
            if (numberOfFailures === 3) {
              this.loadTokenPromise = null;
              return reject(
                new Error(
                  `Stream error: tried to get token ${numberOfFailures} times, but it failed with ${e}. Check your token provider`,
                  { cause: e },
                ),
              );
            } else {
              return await loadTokenWithRetries(numberOfFailures);
            }
          }
          this.loadTokenPromise = null;
          resolve(this.token);
        };
        return await loadTokenWithRetries();
      }
    });

    return this.loadTokenPromise;
  };

  // Returns the current token, or fetches in a new one if there is no current token
  getToken = () => {
    if (this._isAnonymous) {
      return '';
    }

    if (this.token) {
      return this.token;
    }

    if (this.tokenProvider) {
      if (this.loadTokenPromise) {
        return this.loadTokenPromise;
      } else {
        return this.loadToken();
      }
    }

    throw new Error(`Can't get token because token provider isn't set`);
  };

  isStatic = () => this.type === 'static';
}

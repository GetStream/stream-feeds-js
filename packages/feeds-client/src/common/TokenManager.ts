import { getLogger } from '../utils/logger';
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
  private readonly logger = getLogger(TokenManager.name);

  constructor() {
    this.loadTokenPromise = null;

    this.type = 'static';
  }

  /**
   * Set the static string token or token provider.
   * Token provider should return a token string or a promise which resolves to string token.
   *
   * @param {TokenOrProvider} tokenOrProvider - the token or token provider.
   * @param {UserResponse} user - the user object.
   * @param {boolean} isAnonymous - whether the user is anonymous or not.
   */
  setTokenOrProvider = (tokenOrProvider?: string | (() => Promise<string>)) => {
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
    this.token = undefined;
    this.loadTokenPromise = null;
  };

  // Fetches a token from tokenProvider function and sets in tokenManager.
  // In case of static token, it will simply resolve to static token.
  loadToken = () => {
    this.logger('debug', 'Loading a new token');

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
                this.logger.logAndReturn(
                  new Error(
                    `Stream error: tried to get token ${numberOfFailures} times, but it failed with ${e}. Check your token provider`,
                    { cause: e },
                  ),
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

    throw this.logger.logAndReturn(
      new Error(`Can't get token because token provider isn't set`),
    );
  };

  isStatic = () => this.type === 'static';
}

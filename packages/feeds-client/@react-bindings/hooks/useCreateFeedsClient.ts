import { useEffect, useState } from 'react';

import { FeedsClient } from '../../src/FeedsClient';
import type { UserRequest } from '../../src/gen/models';
import type { TokenOrProvider } from '../../src/types';
import type { FeedsClientOptions } from '../../src/common/types';

/**
 * A React hook to create, connect and return an instance of `FeedsClient`.
 */
export const useCreateFeedsClient = ({
  apiKey,
  tokenOrProvider,
  userData,
  options,
}: {
  apiKey: string;
  tokenOrProvider: TokenOrProvider;
  userData: UserRequest;
  options?: FeedsClientOptions;
}) => {
  const [client, setClient] = useState<FeedsClient | null>(() => new FeedsClient(apiKey, options));
  const [cachedUserData, setCachedUserData] = useState(userData);

  const [cachedOptions] = useState(options);

  if (userData.id !== cachedUserData.id) {
    setCachedUserData(userData);
  }

  useEffect(() => {
    const _client = new FeedsClient(apiKey, cachedOptions);
    let didUserConnectInterrupt = false;

    const connectionPromise = _client.connectUser(
      cachedUserData,
      tokenOrProvider,
    ).then(() => {
      console.log('Successfully connected user: ', cachedUserData.id)
    }).catch(error => {
      if (error) throw error;
    });

    if (!didUserConnectInterrupt) setClient(_client);

    return () => {
      didUserConnectInterrupt = true;
      setClient(null);
      connectionPromise
        .then(() => _client.disconnectUser())
        .then(() => {
          console.log(
            `Connection for user "${cachedUserData.id}" has been closed`,
          );
        });
    };
  }, [apiKey, cachedUserData, cachedOptions, tokenOrProvider]);

  return client;
};

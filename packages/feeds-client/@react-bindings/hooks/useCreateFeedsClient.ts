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
  const [client, setClient] = useState<FeedsClient | null>(
    () => new FeedsClient(apiKey, options),
  );
  const [error, setError] = useState<Error | null>(null);
  const [cachedUserData, setCachedUserData] = useState(userData);

  const [cachedOptions] = useState(options);

  if (error) {
    throw error;
  }

  if (userData.id !== cachedUserData.id) {
    setCachedUserData(userData);
  }

  useEffect(() => {
    const _client = new FeedsClient(apiKey, cachedOptions);

    const connectionPromise = _client
      .connectUser(cachedUserData, tokenOrProvider)
      .then(() => {
        setError(null);
        console.log('Successfully connected user: ', cachedUserData.id);
      })
      .catch((err) => {
        setError(err);
      });

    setClient(_client);

    return () => {
      setClient(null);
      connectionPromise
        .then(() => {
          setError(null);
          return _client.disconnectUser();
        })
        .catch((err) => {
          setError(err);
        })
        .then(() => {
          console.log(
            `Connection for user "${cachedUserData.id}" has been closed`,
          );
        });
    };
  }, [apiKey, cachedUserData, cachedOptions, tokenOrProvider]);

  return client;
};

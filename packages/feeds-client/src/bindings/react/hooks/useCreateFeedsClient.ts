import { useEffect, useState } from 'react';

import { FeedsClient } from '../../../feeds-client';
import type { TokenOrProvider } from '../../../types';
import type { UserRequest } from '../../../gen/models';
import type { FeedsClientOptions } from '../../../common/types';

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
  const [client, setClient] = useState<FeedsClient | null>(null);
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
        });
    };
  }, [apiKey, cachedUserData, cachedOptions, tokenOrProvider]);

  return client;
};

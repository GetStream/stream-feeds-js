import { useEffect, useState } from 'react';
import {
  FeedsClient,
  type FeedsClientOptions,
  type UserRequest,
  type TokenOrProvider,
} from '@self';

/**
 * A React hook to create, connect and return an instance of `FeedsClient`.
 */
export const useCreateFeedsClient = ({
  apiKey,
  tokenOrProvider,
  userData: userDataOrAnonymous,
  options,
}: {
  apiKey: string;
  tokenOrProvider?: TokenOrProvider;
  userData: UserRequest | 'anonymous';
  options?: FeedsClientOptions;
}) => {
  const userData =
    userDataOrAnonymous === 'anonymous' ? undefined : userDataOrAnonymous;

  if (userDataOrAnonymous === 'anonymous' && !tokenOrProvider) {
    throw new Error(
      'Token provider can only be emitted when connecting anonymous user',
    );
  }

  const [client, setClient] = useState<FeedsClient | null>(
    () => new FeedsClient(apiKey, options),
  );
  const [error, setError] = useState<Error | null>(null);
  const [cachedUserData, setCachedUserData] = useState(userData);

  const [cachedOptions] = useState(options);

  if (error) {
    throw error;
  }

  if (userData?.id !== cachedUserData?.id) {
    setCachedUserData(userData);
  }

  useEffect(() => {
    const _client = new FeedsClient(apiKey, cachedOptions);

    const connectionPromise = cachedUserData
      ? _client
          .connectUser(cachedUserData, tokenOrProvider)
          .then(() => {
            setError(null);
          })
          .catch((err) => {
            setError(err);
          })
      : _client.connectAnonymous();

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

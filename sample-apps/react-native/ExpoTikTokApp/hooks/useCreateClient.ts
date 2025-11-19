import { useCallback } from 'react';
import type { ConfigureLoggersOptions } from '@stream-io/feeds-react-native-sdk';
import { useCreateFeedsClient } from '@stream-io/feeds-react-native-sdk';
import { apiKey, baseUrl, tokenCreationUrl } from '@/constants/stream';
import type { LocalUser } from '@/contexts/UserContext';

const tokenProviderFactory = (userId: string) => async () => {
  if (!tokenCreationUrl) {
    throw new Error('Token creation url is missing');
  }

  try {
    const tokenGeneratorUrl = new URL(tokenCreationUrl);
    tokenGeneratorUrl.searchParams.set('api_key', apiKey);
    tokenGeneratorUrl.searchParams.set('user_id', userId);
    const response = await fetch(tokenGeneratorUrl.toString());
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('An error has occurred while generating a token: ', error);
  }
};

const CLIENT_OPTIONS = {
  configure_loggers_options: {
    default: { level: 'debug' },
  } as ConfigureLoggersOptions,
  ...(baseUrl ? { base_url: baseUrl } : {}),
  timeout: 10000,
};

export const useCreateClient = (user: LocalUser) => {
  const tokenProvider = useCallback(() => {
    const provider = tokenProviderFactory(user.id);
    return provider();
  }, [user.id]);

  const userData = { id: user.id, image: user.image, name: user.name };

  const client = useCreateFeedsClient({
    userData,
    tokenOrProvider: user.token ?? tokenProvider,
    options: CLIENT_OPTIONS,
    apiKey,
  });

  // @ts-expect-error We want to hijack globalThis for debugging purposes.
  globalThis.client = client;

  return client;
};

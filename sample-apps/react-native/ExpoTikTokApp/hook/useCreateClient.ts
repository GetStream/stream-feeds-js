import { useCallback } from 'react';
import {
  useCreateFeedsClient
} from '@stream-io/feeds-react-native-sdk';
import type { UserRequest } from '@stream-io/feeds-react-native-sdk';
import { apiKey, apiUrl, tokenCreationUrl } from '@/constants/stream';

const tokenProviderFactory = (userId: string) => async () => {
  const tokenGeneratorUrl = new URL(tokenCreationUrl);
  tokenGeneratorUrl.searchParams.set('api_key', apiKey);
  tokenGeneratorUrl.searchParams.set('user_id', userId);
  const response = await fetch(tokenGeneratorUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.status}`);
  }
  const data = await response.json();
  return data.token;
};

const CLIENT_OPTIONS = {
  base_url: apiUrl,
};

export const useCreateClient = (user: UserRequest) => {
  const tokenProvider = useCallback(() => {
    const provider = tokenProviderFactory(user.id);
    return provider();
  }, [user.id]);

  return useCreateFeedsClient({
    userData: user,
    tokenOrProvider: tokenProvider,
    options: CLIENT_OPTIONS,
    apiKey,
  });
}

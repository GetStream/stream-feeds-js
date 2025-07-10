import './polyfills';

export * from '@stream-io/feeds-client';
export * from '@stream-io/feeds-client/react-bindings';

import { StreamFeeds as SDKStreamFeeds } from './wrappers/StreamFeeds';

export const StreamFeeds = SDKStreamFeeds;

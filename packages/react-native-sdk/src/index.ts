// polyfills
import './polyfills';
// default exports
export * from '@stream-io/feeds-client';
export * from '@stream-io/feeds-client/react-bindings';

// overrides
import { StreamFeeds as SDKStreamFeeds } from './wrappers/StreamFeeds';

export const StreamFeeds = SDKStreamFeeds;

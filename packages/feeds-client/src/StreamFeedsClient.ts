import {
  EventDispatcher,
  ModerationClient,
  ProductApiInferface,
  StateStore,
  StreamClient,
  StreamClientOptions,
  StreamClientState,
  UserRequest,
} from '@stream-io/common';
import { FeedsApi } from './gen/feeds/FeedsApi';
import { StreamFlatFeedClient } from './StreamFlatFeedClient';
import { StreamNotificationFeedClient } from './StreamNotificationFeedClient';
import { Feed, QueryFeedsRequest, WSEvent } from './gen/models';
import { decodeWSEvent } from './gen/model-decoders/event-decoder-mapping';
import { StreamFeedsEvent } from './types';

export type StreamFeedsClientState = StreamClientState;

type FID = string;

export class StreamFeedsClient extends FeedsApi implements ProductApiInferface {
  readonly state: StateStore<StreamFeedsClientState>;
  readonly moderation: ModerationClient;
  private readonly eventDispatcher: EventDispatcher<
    StreamFeedsEvent['type'],
    StreamFeedsEvent
  > = new EventDispatcher<StreamFeedsEvent['type'], StreamFeedsEvent>();

  private activeFeeds: Record<
    FID,
    StreamFlatFeedClient | StreamNotificationFeedClient
  > = {};

  constructor(apiKey: string, options?: StreamClientOptions);
  constructor(commonClient: StreamClient);
  constructor(
    apiKeyOrClient: StreamClient | string,
    options?: StreamClientOptions,
  ) {
    let streamClient: StreamClient;
    if (typeof apiKeyOrClient === 'string') {
      streamClient = new StreamClient(apiKeyOrClient, options);
    } else {
      streamClient = apiKeyOrClient;
    }
    streamClient.addEventDecoder(decodeWSEvent);
    super(streamClient);
    this.moderation = this.streamClient.moderation;
    this.state = new StateStore({
      ...this.streamClient.state.getLatestValue(),
    });
    this.streamClient.state.subscribe((state) => {
      this.state.partialNext(state);
    });
    this.streamClient.on('all', (event) => {
      if (Object.hasOwn(event, 'fid')) {
        const feed = this.activeFeeds[(event as unknown as WSEvent).fid];
        if (feed) {
          feed.handleWSEvent(event as unknown as WSEvent);
        }
      }
      this.eventDispatcher.dispatch(event);
    });
  }

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  feed = (group: string, id: string) => {
    return this.getOrCreateActiveFeed(
      group,
      id,
      'flat',
    ) as StreamFlatFeedClient;
  };

  notificationFeed = (group: string, id: string) => {
    return this.getOrCreateActiveFeed(
      group,
      id,
      'notification',
    ) as StreamNotificationFeedClient;
  };

  async _queryFeeds(request?: QueryFeedsRequest) {
    const response = await this.queryFeeds(request);

    const feeds = response.feeds.map((f) =>
      this.getOrCreateActiveFeed(f.group, f.id, f.type, f),
    );

    return feeds;
  }

  connectUser = (
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ) => {
    return this.streamClient.connectUser(user, tokenProvider);
  };

  disconnectUser = () => {
    return this.streamClient.disconnectUser();
  };

  upsertUsers = (users: UserRequest[]) => {
    return this.streamClient.upsertUsers(users);
  };

  private readonly getOrCreateActiveFeed = (
    group: string,
    id: string,
    type: 'flat' | 'notification',
    data?: Feed,
  ) => {
    const fid = `${group}:${id}`;
    if (this.activeFeeds[fid]) {
      return this.activeFeeds[fid];
    } else {
      let feed: StreamFlatFeedClient | StreamNotificationFeedClient;
      switch (type) {
        case 'flat':
          feed = new StreamFlatFeedClient(this, group, id, data);
          break;
        case 'notification':
          feed = new StreamNotificationFeedClient(this, group, id, data);
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`This SDK doesn't yet support ${type} type`);
      }
      this.activeFeeds[fid] = feed;
      return feed;
    }
  };
}

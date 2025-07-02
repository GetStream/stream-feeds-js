import { FeedsApi } from './gen/feeds/FeedsApi';
import {
  ActivityResponse,
  FeedResponse,
  OwnUser, PollResponse, PollVotesResponse,
  QueryFeedsRequest, QueryPollVotesRequest,
  UserRequest,
  WSEvent,
} from './gen/models';
import { FeedsEvent } from './types';
import { StateStore } from './common/StateStore';
import { TokenManager } from './common/TokenManager';
import { ConnectionIdManager } from './common/ConnectionIdManager';
import { StableWSConnection } from './common/real-time/StableWSConnection';
import { EventDispatcher } from './common/EventDispatcher';
import { ApiClient } from './common/ApiClient';
import {
  addConnectionEventListeners,
  removeConnectionEventListeners,
} from './common/utils';
import { decodeWSEvent } from './gen/model-decoders/event-decoder-mapping';
import { Feed } from './Feed';
import {
  FeedsClientOptions,
  NetworkChangedEvent,
  StreamResponse,
} from './common/types';
import { ModerationClient } from './ModerationClient';
import { StreamPoll } from './common/Poll';

export type FeedsClientState = {
  connectedUser: OwnUser | undefined;
};

type FID = string;

export class FeedsClient extends FeedsApi {
  readonly state: StateStore<FeedsClientState>;
  readonly moderation: ModerationClient;

  private readonly tokenManager: TokenManager;
  private wsConnection?: StableWSConnection;
  private readonly connectionIdManager: ConnectionIdManager;
  private readonly eventDispatcher: EventDispatcher<
    FeedsEvent['type'],
    FeedsEvent
  > = new EventDispatcher<FeedsEvent['type'], FeedsEvent>();

  private readonly polls_by_id: Map<string, StreamPoll>;

  private activeFeeds: Record<FID, Feed> = {};

  constructor(apiKey: string, options?: FeedsClientOptions) {
    const tokenManager = new TokenManager();
    const connectionIdManager = new ConnectionIdManager();
    const apiClient = new ApiClient(
      apiKey,
      tokenManager,
      connectionIdManager,
      options,
    );
    super(apiClient);
    this.state = new StateStore<FeedsClientState>({
      connectedUser: undefined,
    });
    this.moderation = new ModerationClient(apiClient);
    this.tokenManager = tokenManager;
    this.connectionIdManager = connectionIdManager;
    this.polls_by_id = new Map();
    this.on('all', (event) => {
      // @ts-expect-error fid may be present, type mismatch
      const fid: unknown = event.fid;

      if (typeof fid !== 'string') return;

      const feed: Feed | undefined = this.activeFeeds[fid];

      switch (event.type) {
        case 'feeds.feed.created': {
          if (feed) break;

          this.getOrCreateActiveFeed(
            event.feed.group_id,
            event.feed.id,
            event.feed,
          );

          break;
        }
        case 'feeds.feed.deleted': {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this.activeFeeds[fid];
          break;
        }
        case 'feeds.poll.closed': {
          if (event.poll?.id) {
            this.pollFromState(event.poll.id)?.handlePollClosed(event);
          }
          break;
        }
        case 'feeds.poll.deleted': {
          if (event.poll?.id) {
            this.polls_by_id.delete(event.poll.id);

            for (const feed of Object.values(this.activeFeeds)) {
              const currentActivities = feed.currentState.activities;
              if (currentActivities) {
                const newActivities = [];
                let changed = false;
                for (const activity of currentActivities) {
                  if (activity.poll?.id === event.poll.id) {
                    delete activity.poll
                    changed = true;
                  }
                  newActivities.push(activity)
                }
                if (changed) {
                  feed.state.partialNext({ activities: newActivities });
                }
              }
            }
          }
          break;
        }
        case 'feeds.poll.updated': {
          if (event.poll?.id) {
            this.pollFromState(event.poll.id)?.handlePollUpdated(event);
          }
          break;
        }
        case 'feeds.poll.vote_casted': {
          if (event.poll?.id) {
            this.pollFromState(event.poll.id)?.handleVoteCasted(event);
          }
          break;
        }
        case 'feeds.poll.vote_changed': {
          if (event.poll?.id) {
            this.pollFromState(event.poll.id)?.handleVoteChanged(event);
          }
          break;
        }
        case 'feeds.poll.vote_removed': {
          if (event.poll?.id) {
            this.pollFromState(event.poll.id)?.handleVoteRemoved(event);
          }
          break;
        }
        default: {
          feed?.handleWSEvent(event as unknown as WSEvent);
        }
      }
    });
  }

  public pollFromState = (id: string) => this.polls_by_id.get(id);

  public hydratePollCache(activities: ActivityResponse[]) {
    for (const activity of activities) {
      if (!activity.poll) {
        continue;
      }
      const pollResponse = activity.poll;
      const pollFromCache = this.pollFromState(pollResponse.id);
      if (!pollFromCache) {
        const poll = new StreamPoll({ client: this, poll: pollResponse });
        this.polls_by_id.set(poll.id, poll);
      } else {
        pollFromCache.reinitializeState(pollResponse);
      }
    }
  }

  connectUser = async (
    user: UserRequest,
    tokenProvider: string | (() => Promise<string>),
  ) => {
    if (
      this.state.getLatestValue().connectedUser !== undefined ||
      this.wsConnection
    ) {
      throw new Error(`Can't connect a new user, call "disconnectUser" first`);
    }

    this.tokenManager.setTokenOrProvider(tokenProvider);

    try {
      addConnectionEventListeners(this.updateNetworkConnectionStatus);
      this.wsConnection = new StableWSConnection(
        {
          user,
          baseUrl: this.apiClient.webSocketBaseUrl,
        },
        this.tokenManager,
        this.connectionIdManager,
        [decodeWSEvent],
      );
      this.wsConnection.on('all', (event) =>
        this.eventDispatcher.dispatch(event),
      );
      const connectedEvent = await this.wsConnection.connect();
      this.state.partialNext({ connectedUser: connectedEvent?.me });
    } catch (err) {
      await this.disconnectUser();
      throw err;
    }
  };

  closePoll = async (request: {
    poll_id: string;
  }): Promise<StreamResponse<PollResponse>> => {
    return await this.updatePollPartial({
      poll_id: request.poll_id,
      set: {
        is_closed: true,
      },
    });
  }

  queryPollAnswers = async (
    request: QueryPollVotesRequest & { poll_id: string; user_id?: string },
  ): Promise<StreamResponse<PollVotesResponse>> => {
    const filter = request.filter ?? {};
    const queryPollAnswersFilter = {
      ...filter,
      is_answer: true,
    };

    const queryPollAnswersRequest = {
      ...request,
      filter: queryPollAnswersFilter,
    };

    return await this.queryPollVotes(queryPollAnswersRequest);
  }

  queryPollOptionVotes = async (
    request: QueryPollVotesRequest & {
      filter: QueryPollVotesRequest['filter'] & { option_id: string };
      poll_id: string;
      user_id?: string;
    },
  ): Promise<StreamResponse<PollVotesResponse>> => {
    return await this.queryPollVotes(request);
  }

  disconnectUser = async () => {
    if (this.wsConnection) {
      this.wsConnection?.offAll();
      await this.wsConnection?.disconnect();
      this.wsConnection = undefined;
    }
    removeConnectionEventListeners(this.updateNetworkConnectionStatus);

    this.connectionIdManager.reset();
    this.tokenManager.reset();
    this.state.partialNext({ connectedUser: undefined });
  };

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  feed = (groupId: string, id: string) => {
    return this.getOrCreateActiveFeed(groupId, id);
  };

  async queryFeeds(request?: QueryFeedsRequest) {
    const response = await this.feedsQueryFeeds(request);

    const feeds = response.feeds.map((f) =>
      this.getOrCreateActiveFeed(f.group_id, f.id, f),
    );

    return {
      feeds,
      next: response.next,
      prev: response.prev,
      metadata: response.metadata,
      duration: response.duration,
    };
  }

  private readonly getOrCreateActiveFeed = (
    group: string,
    id: string,
    data?: FeedResponse,
  ) => {
    const fid = `${group}:${id}`;
    if (this.activeFeeds[fid]) {
      return this.activeFeeds[fid];
    } else {
      const feed = new Feed(this, group, id, data);
      this.activeFeeds[fid] = feed;
      return feed;
    }
  };

  private readonly updateNetworkConnectionStatus = (
    event: { type: 'online' | 'offline' } | Event,
  ) => {
    const networkEvent: NetworkChangedEvent = {
      type: 'network.changed',
      online: event.type === 'online',
    };
    this.eventDispatcher.dispatch(networkEvent);
  };
}

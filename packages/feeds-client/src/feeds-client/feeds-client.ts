import { FeedsApi } from '../gen/feeds/FeedsApi';
import {
  ActivityResponse,
  FeedResponse,
  FileUploadRequest,
  FollowBatchRequest,
  FollowRequest,
  ImageUploadRequest,
  OwnUser,
  PollResponse,
  PollVotesResponse,
  QueryFeedsRequest,
  QueryPollVotesRequest,
  UpdateFollowRequest,
  UserRequest,
  WSEvent,
} from '../gen/models';
import { FeedsEvent, StreamFile, TokenOrProvider } from '../types';
import { StateStore } from '../common/StateStore';
import { TokenManager } from '../common/TokenManager';
import { ConnectionIdManager } from '../common/ConnectionIdManager';
import { StableWSConnection } from '../common/real-time/StableWSConnection';
import { EventDispatcher } from '../common/EventDispatcher';
import { ApiClient } from '../common/ApiClient';
import {
  addConnectionEventListeners,
  removeConnectionEventListeners,
  streamDevToken,
} from '../common/utils';
import { decodeWSEvent } from '../gen/model-decoders/event-decoder-mapping';
import {
  FeedsClientOptions,
  NetworkChangedEvent,
  StreamResponse,
} from '../common/types';
import { ModerationClient } from '../moderation-client';
import { StreamPoll } from '../common/Poll';
import {
  Feed,
  handleFollowCreated,
  handleFollowDeleted,
  handleFollowUpdated,
  handleWatchStarted,
  handleWatchStopped,
} from '../feed';
import { handleUserUpdated } from './event-handlers';
import {
  SyncFailure,
  UnhandledErrorType,
} from '../common/real-time/event-models';

export type FeedsClientState = {
  connected_user: OwnUser | undefined;
  is_ws_connection_healthy: boolean;
};

type FID = string;

export class FeedsClient extends FeedsApi {
  readonly state: StateStore<FeedsClientState>;
  readonly moderation: ModerationClient;

  private readonly tokenManager: TokenManager;
  private wsConnection?: StableWSConnection;
  private readonly connectionIdManager: ConnectionIdManager;
  private readonly eventDispatcher = new EventDispatcher<
    FeedsEvent['type'],
    FeedsEvent & { fid?: string }
  >();

  private readonly polls_by_id: Map<string, StreamPoll>;

  private activeFeeds: Record<FID, Feed> = {};

  private healthyConnectionChangedEventCount = 0;

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
      connected_user: undefined,
      is_ws_connection_healthy: false,
    });
    this.moderation = new ModerationClient(apiClient);
    this.tokenManager = tokenManager;
    this.connectionIdManager = connectionIdManager;
    this.polls_by_id = new Map();
    this.on('all', (event) => {
      const fid = event.fid;

      const feed: Feed | undefined =
        typeof fid === 'string' ? this.activeFeeds[fid] : undefined;

      switch (event.type) {
        case 'connection.changed': {
          const { online } = event;
          this.state.partialNext({ is_ws_connection_healthy: online });

          if (online) {
            this.recoverOnReconnect();
          } else {
            for (const activeFeed of Object.values(this.activeFeeds)) {
              handleWatchStopped.bind(activeFeed)();
            }
          }
          break;
        }
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
          feed?.handleWSEvent(event as unknown as WSEvent);
          if (typeof fid === 'string') {
            delete this.activeFeeds[fid];
          }
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

            for (const activeFeed of Object.values(this.activeFeeds)) {
              const currentActivities = activeFeed.currentState.activities;
              if (currentActivities) {
                const newActivities = [];
                let changed = false;
                for (const activity of currentActivities) {
                  if (activity.poll?.id === event.poll.id) {
                    delete activity.poll;
                    changed = true;
                  }
                  newActivities.push(activity);
                }
                if (changed) {
                  activeFeed.state.partialNext({ activities: newActivities });
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
        case 'feeds.bookmark.added':
        case 'feeds.bookmark.deleted':
        case 'feeds.bookmark.updated': {
          const activityId = event.bookmark.activity.id;
          // TODO: find faster way later on
          const feeds = this.findActiveFeedByActivityId(activityId);
          feeds.forEach((f) => f.handleWSEvent(event));

          break;
        }
        case 'user.updated': {
          handleUserUpdated.call(this, event);
          break;
        }
        default: {
          feed?.handleWSEvent(event as unknown as WSEvent);
        }
      }
    });
  }

  private recoverOnReconnect = async () => {
    this.healthyConnectionChangedEventCount++;

    // we skip the first event as we could potentially be querying twice
    if (this.healthyConnectionChangedEventCount > 1) {
      const entries = Object.entries(this.activeFeeds);

      const results = await Promise.allSettled(
        entries.map(([, feed]) => feed.synchronize()),
      );

      const failures: SyncFailure[] = results.flatMap((result, index) =>
        result.status === 'rejected'
          ? [{ feed: entries[index][0], reason: result.reason }]
          : [],
      );

      this.eventDispatcher.dispatch({
        type: 'errors.unhandled',
        error_type: UnhandledErrorType.ReconnectionReconciliation,
        failures,
      });
    }
  };

  public pollFromState = (id: string) => this.polls_by_id.get(id);

  public hydratePollCache(activities: ActivityResponse[]) {
    for (const activity of activities) {
      if (!activity.poll) {
        continue;
      }
      const pollResponse = activity.poll;
      const pollFromCache = this.pollFromState(pollResponse.id);
      if (!pollFromCache) {
        // @ts-expect-error Incompatibility between PollResponseData and Poll due to teams_role, remove when OpenAPI spec is fixed
        const poll = new StreamPoll({ client: this, poll: pollResponse });
        this.polls_by_id.set(poll.id, poll);
      } else {
        // @ts-expect-error Incompatibility between PollResponseData and Poll due to teams_role, remove when OpenAPI spec is fixed
        pollFromCache.reinitializeState(pollResponse);
      }
    }
  }

  connectUser = async (user: UserRequest, tokenProvider: TokenOrProvider) => {
    if (
      this.state.getLatestValue().connected_user !== undefined ||
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
      this.state.partialNext({
        connected_user: connectedEvent?.me,
        is_ws_connection_healthy: !!this.wsConnection?.isHealthy,
      });
    } catch (err) {
      await this.disconnectUser();
      throw err;
    }
  };

  devToken = (userId: string) => {
    return streamDevToken(userId);
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
  };

  // @ts-expect-error API spec says file should be a string
  uploadFile = (
    request: Omit<FileUploadRequest, 'file'> & { file: StreamFile },
  ) => {
    return super.uploadFile({
      // @ts-expect-error API spec says file should be a string
      file: request.file,
    });
  };

  // @ts-expect-error API spec says file should be a string
  uploadImage = (
    request: Omit<ImageUploadRequest, 'file'> & { file: StreamFile },
  ) => {
    return super.uploadImage({
      // @ts-expect-error API spec says file should be a string
      file: request.file,
      // @ts-expect-error form data will only work if this is a string
      upload_sizes: JSON.stringify(request.upload_sizes),
    });
  };

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
  };

  queryPollOptionVotes = async (
    request: QueryPollVotesRequest & {
      filter: QueryPollVotesRequest['filter'] & { option_id: string };
      poll_id: string;
      user_id?: string;
    },
  ): Promise<StreamResponse<PollVotesResponse>> => {
    return await this.queryPollVotes(request);
  };

  disconnectUser = async () => {
    if (this.wsConnection) {
      this.wsConnection?.offAll();
      await this.wsConnection?.disconnect();
      this.wsConnection = undefined;
    }
    removeConnectionEventListeners(this.updateNetworkConnectionStatus);

    this.connectionIdManager.reset();
    this.tokenManager.reset();
    this.state.partialNext({
      connected_user: undefined,
      is_ws_connection_healthy: false,
    });
  };

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  feed = (groupId: string, id: string) => {
    return this.getOrCreateActiveFeed(groupId, id);
  };

  async queryFeeds(request?: QueryFeedsRequest) {
    const response = await this._queryFeeds(request);

    const feeds = response.feeds.map((f) =>
      this.getOrCreateActiveFeed(f.group_id, f.id, f, request?.watch),
    );

    return {
      feeds,
      next: response.next,
      prev: response.prev,
      metadata: response.metadata,
      duration: response.duration,
    };
  }

  updateNetworkConnectionStatus = (
    event: { type: 'online' | 'offline' } | Event,
  ) => {
    const networkEvent: NetworkChangedEvent = {
      type: 'network.changed',
      online: event.type === 'online',
    };
    this.eventDispatcher.dispatch(networkEvent);
  };

  async updateFollow(request: UpdateFollowRequest) {
    const response = await super.updateFollow(request);

    [
      response.follow.source_feed.feed,
      response.follow.target_feed.feed,
    ].forEach((fid) => {
      const feed = this.activeFeeds[fid];
      if (feed) {
        handleFollowUpdated.bind(feed)(response);
      }
    });

    return response;
  }

  // For follow API endpoints we update the state after HTTP response to allow queryFeeds with watch: false
  async follow(request: FollowRequest) {
    const response = await super.follow(request);

    [
      response.follow.source_feed.feed,
      response.follow.target_feed.feed,
    ].forEach((fid) => {
      const feed = this.activeFeeds[fid];
      if (feed) {
        handleFollowCreated.bind(feed)(response);
      }
    });

    return response;
  }

  async followBatch(request: FollowBatchRequest) {
    const response = await super.followBatch(request);

    response.follows.forEach((follow) => {
      const feed = this.activeFeeds[follow.source_feed.feed];
      if (feed) {
        handleFollowCreated.bind(feed)({ follow });
      }
    });

    return response;
  }

  async unfollow(request: FollowRequest) {
    const response = await super.unfollow(request);

    [request.source, request.target].forEach((fid) => {
      const feed = this.activeFeeds[fid];
      if (feed) {
        handleFollowDeleted.bind(feed)(response);
      }
    });

    return response;
  }

  async stopWatchingFeed(request: { feed_group_id: string; feed_id: string }) {
    const connectionId = await this.connectionIdManager.getConnectionId();
    const response = await super.stopWatchingFeed({
      ...request,
      connection_id: connectionId,
    });

    const feed =
      this.activeFeeds[`${request.feed_group_id}:${request.feed_id}`];
    if (feed) {
      handleWatchStopped.bind(feed)();
    }

    return response;
  }

  private readonly getOrCreateActiveFeed = (
    group: string,
    id: string,
    data?: FeedResponse,
    watch?: boolean,
  ) => {
    const fid = `${group}:${id}`;
    if (this.activeFeeds[fid]) {
      const feed = this.activeFeeds[fid];
      if (watch && !feed.currentState.watch) {
        handleWatchStarted.bind(feed)();
      }
      return feed;
    } else {
      const feed = new Feed(this, group, id, data, watch);
      this.activeFeeds[fid] = feed;
      return feed;
    }
  };

  private findActiveFeedByActivityId(activityId: string) {
    return Object.values(this.activeFeeds).filter((feed) =>
      feed.currentState.activities?.some(
        (activity) => activity.id === activityId,
      ),
    );
  }
}

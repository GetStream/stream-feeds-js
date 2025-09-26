import { FeedsApi } from '../gen/feeds/FeedsApi';
import type {
  ActivityResponse,
  AddCommentReactionRequest,
  AddCommentReactionResponse,
  AddCommentRequest,
  AddCommentResponse,
  AddReactionRequest,
  DeleteActivityReactionResponse,
  DeleteCommentReactionResponse,
  DeleteCommentResponse,
  FeedResponse,
  FileUploadRequest,
  FollowBatchRequest,
  FollowRequest,
  ImageUploadRequest,
  OwnUser,
  PollResponse,
  PollVotesResponse,
  QueryActivitiesRequest,
  QueryFeedsRequest,
  QueryPollVotesRequest,
  UpdateActivityRequest,
  UpdateActivityResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  UpdateFollowRequest,
  UserRequest,
  WSEvent,
} from '../gen/models';
import type { FeedsEvent, StreamFile, TokenOrProvider } from '../types';
import { StateStore } from '@stream-io/state-store';
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
import type {
  FeedsClientOptions,
  NetworkChangedEvent,
  StreamResponse,
} from '../common/types';
import { ModerationClient } from '../moderation-client';
import { StreamPoll } from '../common/Poll';
import {
  Feed,
  handleActivityReactionAdded,
  handleActivityReactionDeleted,
  handleActivityReactionUpdated,
  handleActivityUpdated,
  handleCommentAdded,
  handleCommentDeleted,
  handleCommentReactionAdded,
  handleCommentReactionDeleted,
  handleCommentUpdated,
  handleFeedUpdated,
  handleFollowCreated,
  handleFollowDeleted,
  handleFollowUpdated,
  handleWatchStarted,
  handleWatchStopped,
} from '../feed';
import { handleUserUpdated } from './event-handlers';
import {
  type SyncFailure,
  UnhandledErrorType,
} from '../common/real-time/event-models';
import { updateCommentCount } from '../feed/event-handlers/comment/utils';
import { configureLoggers } from '../utils';
import { handleCommentReactionUpdated } from '../feed/event-handlers/comment/handle-comment-reaction-updated';
import { throttle } from '../utils/throttling';
import {
  DEFAULT_BATCH_OWN_CAPABILITIES_THROTTLING_INTERVAL,
  type GetBatchedOwnCapabilitiesThrottledCallback,
  queueBatchedOwnCapabilities,
  type ThrottledGetBatchedOwnCapabilities,
} from '../utils/throttling/throttled-get-batched-own-capabilities';

export type FeedsClientState = {
  connected_user: OwnUser | undefined;
  is_ws_connection_healthy: boolean;
  own_capabilities_by_fid: Record<string, FeedResponse['own_capabilities']>;
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

  protected throttledGetBatchOwnCapabilities!: ThrottledGetBatchedOwnCapabilities;

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
      own_capabilities_by_fid: {},
    });
    this.moderation = new ModerationClient(apiClient);
    this.tokenManager = tokenManager;
    this.connectionIdManager = connectionIdManager;
    this.polls_by_id = new Map();

    this.setGetBatchOwnCapabilitiesThrottlingInterval(
      options?.query_batch_own_capabilties_throttling_interval ??
        DEFAULT_BATCH_OWN_CAPABILITIES_THROTTLING_INTERVAL,
    );

    configureLoggers(options?.configure_loggers_options);

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

  private setGetBatchOwnCapabilitiesThrottlingInterval = (
    throttlingMs: number,
  ) => {
    this.throttledGetBatchOwnCapabilities =
      throttle<GetBatchedOwnCapabilitiesThrottledCallback>(
        (feeds, callback) => {
          // TODO: Replace this with the actual getBatchCapabilities endpoint when it is ready
          this.queryFeeds({ filter: { feed: { $in: feeds } } }).catch(
            (error) => {
              this.eventDispatcher.dispatch({
                type: 'errors.unhandled',
                error_type:
                  UnhandledErrorType.FetchingOwnCapabilitiesOnNewActivity,
                error,
              });
            },
          );
          callback(feeds);
        },
        throttlingMs,
        { trailing: true },
      );
  };

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

  public hydrateCapabilitiesCache(feedResponses: FeedResponse[]) {
    let ownCapabilitiesCache =
      this.state.getLatestValue().own_capabilities_by_fid;

    const capabilitiesToFetchQueue: string[] = [];

    for (const feedResponse of feedResponses) {
      const { feed, own_capabilities } = feedResponse;

      if (!Object.prototype.hasOwnProperty.call(ownCapabilitiesCache, feed)) {
        if (own_capabilities) {
          ownCapabilitiesCache = {
            ...ownCapabilitiesCache,
            [feed]: own_capabilities,
          };
        } else {
          capabilitiesToFetchQueue.push(feed);
        }
      }
    }

    queueBatchedOwnCapabilities.bind(this)({ feeds: capabilitiesToFetchQueue });

    this.state.partialNext({ own_capabilities_by_fid: ownCapabilitiesCache });
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

  updateActivity = async (
    request: UpdateActivityRequest & {
      id: string;
    },
  ): Promise<StreamResponse<UpdateActivityResponse>> => {
    const response = await super.updateActivity(request);
    for (const feed of Object.values(this.activeFeeds)) {
      handleActivityUpdated.bind(feed)(response, false);
    }
    return response;
  };

  addComment = async (
    request: AddCommentRequest,
  ): Promise<StreamResponse<AddCommentResponse>> => {
    const response = await super.addComment(request);
    const { comment } = response;
    for (const feed of Object.values(this.activeFeeds)) {
      handleCommentAdded.bind(feed)(response, false);
      const parentActivityId = comment.object_id;
      if (feed.hasActivity(parentActivityId)) {
        const activityToUpdate = feed.currentState.activities?.find(
          (activity) => activity.id === parentActivityId,
        );
        if (activityToUpdate) {
          updateCommentCount.bind(feed)({
            activity: {
              ...activityToUpdate,
              comment_count: activityToUpdate.comment_count + 1,
            },
            comment,
            replyCountUpdater: (prevCount) => prevCount + 1,
          });
        }
      }
    }
    return response;
  };

  updateComment = async (
    request: UpdateCommentRequest & { id: string },
  ): Promise<StreamResponse<UpdateCommentResponse>> => {
    const response = await super.updateComment(request);
    for (const feed of Object.values(this.activeFeeds)) {
      handleCommentUpdated.bind(feed)(response, false);
    }
    return response;
  };

  deleteComment = async (request: {
    id: string;
    hard_delete?: boolean;
  }): Promise<StreamResponse<DeleteCommentResponse>> => {
    const response = await super.deleteComment(request);
    const { activity, comment } = response;
    for (const feed of Object.values(this.activeFeeds)) {
      handleCommentDeleted.bind(feed)({ comment }, false);
      updateCommentCount.bind(feed)({
        activity,
        comment,
        replyCountUpdater: (prevCount) => prevCount - 1,
      });
    }
    return response;
  };

  addActivityReaction = async (
    request: AddReactionRequest & {
      activity_id: string;
    },
  ) => {
    const shouldEnforceUnique = request.enforce_unique;
    const response = await super.addActivityReaction(request);
    for (const feed of Object.values(this.activeFeeds)) {
      if (shouldEnforceUnique) {
        handleActivityReactionUpdated.bind(feed)(response, false);
      } else {
        handleActivityReactionAdded.bind(feed)(response, false);
      }
    }
    return response;
  };

  /**
   * @deprecated Use addActivityReaction instead
   */
  addReaction = (
    request: AddReactionRequest & {
      activity_id: string;
    },
  ) => {
    return this.addActivityReaction(request);
  };

  deleteActivityReaction = async (request: {
    activity_id: string;
    type: string;
  }): Promise<StreamResponse<DeleteActivityReactionResponse>> => {
    const response = await super.deleteActivityReaction(request);
    for (const feed of Object.values(this.activeFeeds)) {
      handleActivityReactionDeleted.bind(feed)(response, false);
    }
    return response;
  };

  addCommentReaction = async (
    request: AddCommentReactionRequest & { id: string },
  ): Promise<StreamResponse<AddCommentReactionResponse>> => {
    const shouldEnforceUnique = request.enforce_unique;
    const response = await super.addCommentReaction(request);
    for (const feed of Object.values(this.activeFeeds)) {
      if (shouldEnforceUnique) {
        handleCommentReactionUpdated.bind(feed)(response, false);
      } else {
        handleCommentReactionAdded.bind(feed)(response, false);
      }
    }
    return response;
  };

  deleteCommentReaction = async (request: {
    id: string;
    type: string;
  }): Promise<StreamResponse<DeleteCommentReactionResponse>> => {
    const response = await super.deleteCommentReaction(request);
    for (const feed of Object.values(this.activeFeeds)) {
      handleCommentReactionDeleted.bind(feed)(response, false);
    }
    return response;
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

    // clear all caches
    this.polls_by_id.clear();

    this.state.partialNext({
      connected_user: undefined,
      is_ws_connection_healthy: false,
      own_capabilities_by_fid: {},
    });
  };

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  feed = (groupId: string, id: string) => {
    return this.getOrCreateActiveFeed(groupId, id);
  };

  async queryFeeds(request?: QueryFeedsRequest) {
    const response = await this._queryFeeds(request);

    const feedResponses = response.feeds;

    const feeds = feedResponses.map((feedResponse) =>
      this.getOrCreateActiveFeed(
        feedResponse.group_id,
        feedResponse.id,
        feedResponse,
        request?.watch,
      ),
    );

    this.hydrateCapabilitiesCache(feedResponses);

    return {
      feeds,
      next: response.next,
      prev: response.prev,
      metadata: response.metadata,
      duration: response.duration,
    };
  }

  async queryActivities(request?: QueryActivitiesRequest) {
    const response = await super.queryActivities(request);
    const activityCurrentFeeds = response.activities.map(
      (activity) => activity.current_feed,
    );
    const feedsToHydrateFrom = [];

    for (const feed of activityCurrentFeeds) {
      if (feed) {
        feedsToHydrateFrom.push(feed);
      }
    }

    this.hydrateCapabilitiesCache(feedsToHydrateFrom);

    return response;
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
        handleFollowUpdated.bind(feed)(response, false);
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
        handleFollowCreated.bind(feed)(response, false);
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
        handleFollowDeleted.bind(feed)(response, false);
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

    if (!this.activeFeeds[fid]) {
      this.activeFeeds[fid] = new Feed(this, group, id, data, watch);
    }

    const feed = this.activeFeeds[fid];

    if (!feed.currentState.watch) {
      // feed isn't watched and may be stale, update it
      if (data) handleFeedUpdated.call(feed, { feed: data });
      if (watch) handleWatchStarted.call(feed);
    }

    return feed;
  };

  private findActiveFeedByActivityId(activityId: string) {
    return Object.values(this.activeFeeds).filter((feed) =>
      feed.currentState.activities?.some(
        (activity) => activity.id === activityId,
      ),
    );
  }
}

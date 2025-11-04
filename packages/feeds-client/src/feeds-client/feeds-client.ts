import { FeedsApi } from '../gen/feeds/FeedsApi';
import type {
  ActivityAddedEvent,
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
  GetOrCreateFeedRequest,
  ImageUploadRequest,
  OwnCapabilitiesBatchRequest,
  OwnUser,
  PollResponse,
  PollVotesResponse,
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
import { feedsLoggerSystem } from '../utils';
import { handleCommentReactionUpdated } from '../feed/event-handlers/comment/handle-comment-reaction-updated';
import {
  throttle,
  DEFAULT_BATCH_OWN_CAPABILITIES_THROTTLING_INTERVAL,
  type GetBatchedOwnCapabilitiesThrottledCallback,
  queueBatchedOwnCapabilities,
  type ThrottledGetBatchedOwnCapabilities,
  clearQueuedFeeds,
} from '../utils/throttling';
import { Activity } from '../activity/activity';

export type FeedsClientState = {
  connected_user: OwnUser | undefined;
  is_ws_connection_healthy: boolean;
  own_capabilities_by_fid: Record<string, FeedResponse['own_capabilities']>;
};

type FID = string;

type ActivityId = string;

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

  protected activeActivities: Record<ActivityId, Activity> = {};
  protected activeFeeds: Record<FID, Feed> = {};

  private healthyConnectionChangedEventCount = 0;

  protected throttledGetBatchOwnCapabilities!: ThrottledGetBatchedOwnCapabilities;
  private cancelGetBatchOwnCapabilitiesTimer!: () => void;
  private query_batch_own_capabilties_throttling_interval!: number;

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

    this.query_batch_own_capabilties_throttling_interval =
      options?.query_batch_own_capabilties_throttling_interval ??
      DEFAULT_BATCH_OWN_CAPABILITIES_THROTTLING_INTERVAL;

    feedsLoggerSystem.configureLoggers(options?.configure_loggers_options);

    this.on('all', (event) => {
      const fid = event.fid;

      const feeds = this.findAllActiveFeedsByFid(fid);

      switch (event.type) {
        case 'connection.changed': {
          const { online } = event;
          this.state.partialNext({ is_ws_connection_healthy: online });

          if (online) {
            this.recoverOnReconnect();
          } else {
            for (const activeFeed of this.allActiveFeeds) {
              handleWatchStopped.bind(activeFeed)();
            }
          }
          break;
        }
        case 'feeds.feed.created': {
          if (this.activeFeeds[event.feed.id]) break;

          this.getOrCreateActiveFeed(
            event.feed.group_id,
            event.feed.id,
            event.feed,
          );

          break;
        }
        case 'feeds.feed.deleted': {
          feeds.forEach((f) => f.handleWSEvent(event as unknown as WSEvent));
          if (typeof fid === 'string') {
            delete this.activeFeeds[fid];
            Object.keys(this.activeActivities).forEach((activityId) => {
              if (this.activeActivities[activityId].feed?.feed === fid) {
                delete this.activeActivities[activityId];
              }
            });
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

            for (const activeFeed of this.allActiveFeeds) {
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
          const feeds = this.findAllActiveFeedsByActivityId(activityId);
          feeds.forEach((f) => f.handleWSEvent(event));

          break;
        }
        case 'feeds.activity.feedback': {
          const activityId = event.activity_feedback.activity_id;
          const feeds = this.findAllActiveFeedsByActivityId(activityId);
          feeds.forEach((f) => f.handleWSEvent(event));
          break;
        }
        case 'user.updated': {
          handleUserUpdated.call(this, event);
          break;
        }
        default: {
          feeds.forEach((f) => f.handleWSEvent(event as unknown as WSEvent));
          if (event.type === 'feeds.activity.deleted') {
            delete this.activeActivities[event.activity.id];
          }
        }
      }
    });
  }

  private setGetBatchOwnCapabilitiesThrottlingInterval = (
    throttlingMs: number,
  ) => {
    const {
      throttledFn: throttledGetBatchOwnCapabilities,
      cancelTimer: cancel,
    } = throttle<GetBatchedOwnCapabilitiesThrottledCallback>(
      (feeds, callback) => {
        this.ownCapabilitiesBatch({
          feeds,
        }).catch((error) => {
          this.eventDispatcher.dispatch({
            type: 'errors.unhandled',
            error_type: UnhandledErrorType.FetchingOwnCapabilitiesOnNewActivity,
            error,
          });
        });
        callback(feeds);
      },
      throttlingMs,
      { trailing: true },
    );
    this.throttledGetBatchOwnCapabilities = throttledGetBatchOwnCapabilities;
    this.cancelGetBatchOwnCapabilitiesTimer = cancel;
  };

  private recoverOnReconnect = async () => {
    this.healthyConnectionChangedEventCount++;

    // we skip the first event as we could potentially be querying twice
    if (this.healthyConnectionChangedEventCount > 1) {
      const feedEntries = Object.entries(this.activeFeeds);
      const activityEntries = Object.entries(this.activeActivities);

      const results = await Promise.allSettled([
        ...feedEntries.map(([, feed]) => feed.synchronize()),
        ...activityEntries.map(([, activity]) => activity.synchronize()),
      ]);

      const failures: SyncFailure[] = results.flatMap((result, index) => {
        if (result.status === 'fulfilled') {
          return [];
        }
        const feed =
          feedEntries[index]?.[0] ||
          activityEntries[index - feedEntries.length][1].feed!.feed;
        const activityId = activityEntries[index - feedEntries.length]?.[0];
        return [{ feed, reason: result.reason, activity_id: activityId }];
      });

      this.eventDispatcher.dispatch({
        type: 'errors.unhandled',
        error_type: UnhandledErrorType.ReconnectionReconciliation,
        failures,
      });
    }
  };

  private get allActiveFeeds() {
    return [
      ...Object.values(this.activeFeeds),
      ...Object.values(this.activeActivities)
        .filter((a) => !!a.feed)
        .map((a) => a.feed!),
    ];
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
        // @ts-expect-error Incompatibility between PollResponseData and Poll due to teams_role, remove when OpenAPI spec is fixed
        const poll = new StreamPoll({ client: this, poll: pollResponse });
        this.polls_by_id.set(poll.id, poll);
      } else {
        // @ts-expect-error Incompatibility between PollResponseData and Poll due to teams_role, remove when OpenAPI spec is fixed
        pollFromCache.reinitializeState(pollResponse);
      }
    }
  }

  public hydrateCapabilitiesCache(
    feedResponses: Array<Pick<FeedResponse, 'feed' | 'own_capabilities'>>,
  ) {
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

    this.setGetBatchOwnCapabilitiesThrottlingInterval(
      this.query_batch_own_capabilties_throttling_interval,
    );

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
    for (const feed of this.allActiveFeeds) {
      handleActivityUpdated.bind(feed)(response, false);
    }
    return response;
  };

  addComment = async (
    request: AddCommentRequest,
  ): Promise<StreamResponse<AddCommentResponse>> => {
    const response = await super.addComment(request);
    const { comment } = response;
    for (const feed of this.allActiveFeeds) {
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
    for (const feed of this.allActiveFeeds) {
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
    for (const feed of this.allActiveFeeds) {
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
    for (const feed of this.allActiveFeeds) {
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
    for (const feed of this.allActiveFeeds) {
      handleActivityReactionDeleted.bind(feed)(response, false);
    }
    return response;
  };

  addCommentReaction = async (
    request: AddCommentReactionRequest & { id: string },
  ): Promise<StreamResponse<AddCommentReactionResponse>> => {
    const shouldEnforceUnique = request.enforce_unique;
    const response = await super.addCommentReaction(request);
    for (const feed of this.allActiveFeeds) {
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
    for (const feed of this.allActiveFeeds) {
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

    this.activeActivities = {};
    this.activeFeeds = {};

    this.state.partialNext({
      connected_user: undefined,
      is_ws_connection_healthy: false,
      own_capabilities_by_fid: {},
    });

    this.cancelGetBatchOwnCapabilitiesTimer();
    clearQueuedFeeds();
  };

  on = this.eventDispatcher.on;
  off = this.eventDispatcher.off;

  /**
   *
   * @param groupId for example `user`, `notification` or id of a custom feed group
   * @param id
   * @param options
   * @param options.addNewActivitiesTo - when a new activity is received from a WebSocket event by default it's added to the start of the list. You can change this to `end` to add it to the end of the list. Useful for story feeds.
   * @param options.activityAddedEventFilter - a callback that is called when a new activity is received from a WebSocket event. You can use this to prevent the activity from being added to the feed. Useful for feed filtering, or if you don't want new activities to be added to the feed.
   * @returns
   */
  feed = (
    groupId: string,
    id: string,
    options?: {
      addNewActivitiesTo?: 'start' | 'end';
      activityAddedEventFilter?: (event: ActivityAddedEvent) => boolean;
    },
  ) => {
    return this.getOrCreateActiveFeed(
      groupId,
      id,
      undefined,
      undefined,
      options?.addNewActivitiesTo,
      options?.activityAddedEventFilter,
    );
  };

  activity = (id: ActivityId) => {
    let activity = this.activeActivities[id];
    if (!activity) {
      activity = new Activity(id, this);
      this.activeActivities[id] = activity;
    }
    return activity;
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

  async ownCapabilitiesBatch(request: OwnCapabilitiesBatchRequest) {
    const response = await super.ownCapabilitiesBatch(request);
    const feedResponses = Object.entries(response.capabilities).map(
      ([feed, own_capabilities]) => ({
        feed,
        own_capabilities,
      }),
    );
    this.hydrateCapabilitiesCache(feedResponses);
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
      const feeds = this.findAllActiveFeedsByFid(fid);
      feeds.forEach((f) => handleFollowUpdated.bind(f)(response, false));
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
      const feeds = this.findAllActiveFeedsByFid(fid);
      feeds.forEach((f) => handleFollowCreated.bind(f)(response, false));
    });

    return response;
  }

  async followBatch(request: FollowBatchRequest) {
    const response = await super.followBatch(request);

    response.follows.forEach((follow) => {
      const feeds = this.findAllActiveFeedsByFid(follow.source_feed.feed);
      feeds.forEach((f) => handleFollowCreated.bind(f)({ follow }, false));
    });

    return response;
  }

  async unfollow(request: FollowRequest) {
    const response = await super.unfollow(request);

    [request.source, request.target].forEach((fid) => {
      const feeds = this.findAllActiveFeedsByFid(fid);
      feeds.forEach((f) => handleFollowDeleted.bind(f)(response, false));
    });

    return response;
  }

  async stopWatchingFeed(request: { feed_group_id: string; feed_id: string }) {
    const connectionId = await this.connectionIdManager.getConnectionId();
    const response = await super.stopWatchingFeed({
      ...request,
      connection_id: connectionId,
    });

    const feeds = this.findAllActiveFeedsByFid(
      `${request.feed_group_id}:${request.feed_id}`,
    );
    feeds.forEach((f) => handleWatchStopped.bind(f)());

    return response;
  }

  async getOrCreateFeed(
    request: GetOrCreateFeedRequest & {
      feed_group_id: string;
      feed_id: string;
      connection_id?: string;
    },
  ) {
    const response = await super.getOrCreateFeed(request);

    if (request.watch) {
      const feeds = this.findAllActiveFeedsByFid(
        `${request.feed_group_id}:${request.feed_id}`,
      );
      feeds.forEach((f) => handleWatchStarted.bind(f)());
    }

    return response;
  }

  private readonly getOrCreateActiveFeed = (
    group: string,
    id: string,
    data?: FeedResponse,
    watch?: boolean,
    addNewActivitiesTo?: 'start' | 'end',
    activityAddedEventFilter?: (event: ActivityAddedEvent) => boolean,
  ) => {
    const fid = `${group}:${id}`;

    if (!this.activeFeeds[fid]) {
      this.activeFeeds[fid] = new Feed(
        this,
        group,
        id,
        data,
        watch,
        addNewActivitiesTo,
        activityAddedEventFilter,
      );
    }

    const feed = this.activeFeeds[fid];

    if (!feed.currentState.watch) {
      // feed isn't watched and may be stale, update it
      if (data) handleFeedUpdated.call(feed, { feed: data });
      if (watch) handleWatchStarted.call(feed);
    }

    return feed;
  };

  private findAllActiveFeedsByActivityId(activityId: string) {
    return [
      ...Object.values(this.activeFeeds),
      ...Object.values(this.activeActivities)
        .filter((a) => !!a.feed)
        .map((a) => a.feed!),
    ].filter(
      (feed) =>
        feed.hasActivity(activityId) || feed.hasPinnedActivity(activityId),
    );
  }

  private findAllActiveFeedsByFid(fid: string | undefined) {
    if (!fid) return [];

    const activeFeed = this.activeFeeds[fid];

    return [
      ...(activeFeed ? [activeFeed] : []),
      ...Object.values(this.activeActivities)
        .filter((a) => a.feed?.feed === fid)
        .map((a) => a.feed!),
    ];
  }
}

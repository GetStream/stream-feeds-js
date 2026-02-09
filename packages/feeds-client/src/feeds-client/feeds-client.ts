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
  FollowResponse,
  GetFollowSuggestionsResponse,
  GetOrCreateFeedRequest,
  ImageSize,
  ImageUploadRequest,
  OwnBatchRequest,
  PollResponse,
  PollVotesResponse,
  QueryFeedsRequest,
  QueryPollVotesRequest,
  UnfollowBatchRequest,
  UpdateActivityRequest,
  UpdateActivityResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  UpdateFollowRequest,
  UserRequest,
  WSEvent,
} from '../gen/models';
import type {
  ConnectedUser,
  FeedsEvent,
  StreamFile,
  TokenOrProvider,
} from '../types';
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
  type FeedState,
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
  clearQueuedFeeds,
  type ThrottledGetBatchedOwnFields,
  type GetBatchedOwnFieldsThrottledCallback,
  DEFAULT_BATCH_OWN_FIELDS_THROTTLING_INTERVAL,
} from '../utils/throttling';
import { withRetry } from '../utils/retry';
import { ActivityWithStateUpdates } from '../activity-with-state-updates/activity-with-state-updates';
import { getFeed } from '../activity-with-state-updates/get-feed';
import {
  isOwnCapabilitiesEqual,
  isOwnFollowingsEqual,
  isOwnFollowsEqual,
  isOwnMembershipEqual,
} from '../utils/check-own-fields-equality';

export type FeedsClientState = {
  connected_user: ConnectedUser | undefined;
  is_anonymous: boolean;
  is_ws_connection_healthy: boolean;
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

  protected activeActivities: ActivityWithStateUpdates[] = [];
  protected activeFeeds: Record<FID, Feed> = {};

  private healthyConnectionChangedEventCount = 0;

  protected throttledGetBatchOwnFields!: ThrottledGetBatchedOwnFields;
  private cancelGetBatchOwnFieldsTimer!: () => void;
  private query_batch_own_fields_throttling_interval!: number;

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
    this.state = new StateStore<FeedsClientState>(this.initialState);
    this.moderation = new ModerationClient(apiClient);
    this.tokenManager = tokenManager;
    this.connectionIdManager = connectionIdManager;
    this.polls_by_id = new Map();

    this.query_batch_own_fields_throttling_interval =
      options?.query_batch_own_fields_throttling_interval ??
      DEFAULT_BATCH_OWN_FIELDS_THROTTLING_INTERVAL;

    feedsLoggerSystem.configureLoggers(options?.configure_loggers_options);

    this.on('all', (event) => {
      const fid = event.fid;

      const feeds = this.findAllActiveFeedsFromWSEvent(event);

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

          this.getOrCreateActiveFeed({
            group: event.feed.group_id,
            id: event.feed.id,
            data: event.feed,
            fieldsToUpdate: [],
          });

          break;
        }
        case 'feeds.feed.deleted': {
          feeds.forEach((f) => f.handleWSEvent(event as unknown as WSEvent));
          if (typeof fid === 'string') {
            delete this.activeFeeds[fid];
            this.activeActivities = this.activeActivities.filter(
              (activity) => getFeed.call(activity)?.feed !== fid,
            );
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
                const newActivities: ActivityResponse[] = [];
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
          const allFeeds = this.findAllActiveFeedsByActivityId(activityId);
          allFeeds.forEach((f) => f.handleWSEvent(event));

          break;
        }
        case 'feeds.activity.feedback': {
          const activityId = event.activity_feedback.activity_id;
          const allFeeds = this.findAllActiveFeedsByActivityId(activityId);
          allFeeds.forEach((f) => f.handleWSEvent(event));
          break;
        }
        case 'user.updated': {
          handleUserUpdated.call(this, event);
          break;
        }
        default: {
          feeds.forEach((f) => f.handleWSEvent(event as unknown as WSEvent));
          if (event.type === 'feeds.activity.deleted') {
            this.activeActivities = this.activeActivities.filter(
              (activity) => activity.id !== event.activity.id,
            );
          }
        }
      }
    });
  }

  private setGetBatchOwnFieldsThrottlingInterval = (throttlingMs: number) => {
    const { throttledFn: throttledGetBatchOwnFields, cancelTimer: cancel } =
      throttle<GetBatchedOwnFieldsThrottledCallback>(
        (feeds, callback) => {
          this.ownBatch({
            feeds,
          }).catch((error) => {
            this.eventDispatcher.dispatch({
              type: 'errors.unhandled',
              error_type: UnhandledErrorType.FetchingOwnFieldsOnNewActivity,
              error,
            });
          });
          callback(feeds);
        },
        throttlingMs,
        { trailing: true },
      );
    this.throttledGetBatchOwnFields = throttledGetBatchOwnFields;
    this.cancelGetBatchOwnFieldsTimer = cancel;
  };

  private recoverOnReconnect = async () => {
    this.healthyConnectionChangedEventCount++;

    // we skip the first event as we could potentially be querying twice
    if (this.healthyConnectionChangedEventCount > 1) {
      const feedEntries = Object.entries(this.activeFeeds);

      const results = await Promise.allSettled([
        ...feedEntries.map(([, feed]) => feed.synchronize()),
        ...this.activeActivities.map((activity) => activity.synchronize()),
      ]);

      const failures: SyncFailure[] = results.flatMap((result, index) => {
        if (result.status === 'fulfilled') {
          return [];
        }
        const activity = this.activeActivities[index - feedEntries.length];
        const feed =
          feedEntries[index]?.[0] ?? (activity && getFeed.call(activity)?.feed);

        return [{ feed, reason: result.reason, activity_id: activity?.id }];
      });

      if (failures.length > 0) {
        this.eventDispatcher.dispatch({
          type: 'errors.unhandled',
          error_type: UnhandledErrorType.ReconnectionReconciliation,
          failures,
        });
      }
    }
  };

  private get allActiveFeeds() {
    return [
      ...Object.values(this.activeFeeds),
      ...Object.values(this.activeActivities)
        .filter((a) => !!getFeed.call(a))
        .map((a) => getFeed.call(a)!),
    ] as Feed[];
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

  connectAnonymous = () => {
    this.checkIfUserIsConnected();

    this.connectionIdManager.resolveConnectionidPromise();
    this.tokenManager.setTokenOrProvider(undefined);
    this.setGetBatchOwnFieldsThrottlingInterval(
      this.query_batch_own_fields_throttling_interval,
    );
    this.state.partialNext({
      connected_user: undefined,
      is_anonymous: true,
      is_ws_connection_healthy: false,
    });

    return Promise.resolve();
  };

  connectGuest = async (...args: Parameters<FeedsApi['createGuest']>) => {
    this.checkIfUserIsConnected();

    const response = await this.createGuest(...args);
    await this.connectUser(response.user, response.access_token);
    return response;
  };

  createGuest = async (...args: Parameters<FeedsApi['createGuest']>) => {
    let shouldDisconnect = false;
    if (
      !this.state.getLatestValue().is_anonymous ||
      !this.state.getLatestValue().connected_user
    ) {
      shouldDisconnect = true;
      await this.connectAnonymous();
    }
    const response = await super.createGuest(...args);
    if (shouldDisconnect) {
      await this.disconnectUser();
    }
    return response;
  };

  connectUser = async (user: UserRequest, tokenProvider: TokenOrProvider) => {
    this.checkIfUserIsConnected();

    this.tokenManager.setTokenOrProvider(tokenProvider);

    this.setGetBatchOwnFieldsThrottlingInterval(
      this.query_batch_own_fields_throttling_interval,
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

  uploadFile = (
    request?: Omit<FileUploadRequest, 'file'> & { file?: StreamFile | string },
  ) => {
    return super.uploadFile({
      file: request?.file as string,
    });
  };

  uploadImage = (
    request?: Omit<ImageUploadRequest, 'file'> & { file?: StreamFile | string },
  ) => {
    return super.uploadImage({
      file: request?.file as string,
      upload_sizes: JSON.stringify(
        request?.upload_sizes,
      ) as unknown as ImageSize[],
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

  deleteComment = async (
    ...args: Parameters<FeedsApi['deleteComment']>
  ): Promise<StreamResponse<DeleteCommentResponse>> => {
    const response = await super.deleteComment(...args);
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

  deleteActivityReaction = async (
    ...args: Parameters<FeedsApi['deleteActivityReaction']>
  ): Promise<StreamResponse<DeleteActivityReactionResponse>> => {
    const response = await super.deleteActivityReaction(...args);
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

  deleteCommentReaction = async (
    ...args: Parameters<FeedsApi['deleteCommentReaction']>
  ): Promise<StreamResponse<DeleteCommentReactionResponse>> => {
    const response = await super.deleteCommentReaction(...args);
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

    this.activeActivities = [];
    this.activeFeeds = {};
    this.healthyConnectionChangedEventCount = 0;

    this.state.partialNext(this.initialState);

    this.cancelGetBatchOwnFieldsTimer();
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
    return this.getOrCreateActiveFeed({
      group: groupId,
      id,
      options,
      fieldsToUpdate: [],
    });
  };

  /**
   * If you want to get an activity with state updates outside of a feed, use this method.
   *
   * Usually it's used when you implement an activity details page.
   *
   * @param id - The id of the activity
   * @returns The activity with state updates
   */
  activityWithStateUpdates = (
    id: ActivityId,
    { fromResponse }: { fromResponse?: ActivityResponse } = {
      fromResponse: undefined,
    },
  ) => {
    const activity = new ActivityWithStateUpdates(id, this, { fromResponse });
    this.activeActivities.push(activity);
    return activity;
  };

  async queryFeeds(request?: QueryFeedsRequest) {
    const response = await this._queryFeeds(request);

    const feedResponses = response.feeds;

    const feeds = feedResponses.map((feedResponse) =>
      this.getOrCreateActiveFeed({
        group: feedResponse.group_id,
        id: feedResponse.id,
        data: feedResponse,
        watch: request?.watch,
        fieldsToUpdate: [
          'own_capabilities',
          'own_follows',
          'own_membership',
          'own_followings',
        ],
      }),
    );

    return {
      feeds,
      next: response.next,
      prev: response.prev,
      metadata: response.metadata,
      duration: response.duration,
    };
  }

  async ownBatch(request: OwnBatchRequest) {
    const response = await withRetry(() => super.ownBatch(request));
    Object.entries(response.data).forEach(([fid, ownFields]) => {
      const feed = this.activeFeeds[fid];
      if (feed) {
        feed.state.partialNext(ownFields);
      }
    });
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
    this.updateStateFromFollows([response.follow]);

    return response;
  }

  /**
   * @deprecated Use getOrCreateFollows instead
   * @param request
   * @returns
   */
  async followBatch(request: FollowBatchRequest) {
    const response = await super.followBatch(request);
    this.updateStateFromFollows(response.follows);

    return response;
  }

  async getOrCreateFollows(request: FollowBatchRequest) {
    const response = await super.getOrCreateFollows(request);

    this.updateStateFromFollows(response.created);

    return response;
  }

  async unfollow(request: { source: string; target: string }) {
    const response = await super.unfollow(request);
    this.updateStateFromUnfollows([response.follow]);

    return response;
  }

  async getOrCreateUnfollows(request: UnfollowBatchRequest) {
    const response = await super.getOrCreateUnfollows(request);
    this.updateStateFromUnfollows(response.follows);

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

  async getFollowSuggestions(
    ...params: Parameters<FeedsApi['getFollowSuggestions']>
  ): Promise<StreamResponse<GetFollowSuggestionsResponse & { feeds: Feed[] }>> {
    const response = await super.getFollowSuggestions(...params);

    const feeds = response.suggestions.map((suggestion) => {
      return this.getOrCreateActiveFeed({
        group: suggestion.group_id,
        id: suggestion.id,
        data: suggestion,
        fieldsToUpdate: [
          'own_capabilities',
          'own_follows',
          'own_membership',
          'own_followings',
        ],
      });
    });

    return { ...response, feeds };
  }

  protected readonly getOrCreateActiveFeed = ({
    group,
    id,
    data,
    watch,
    options,
    fieldsToUpdate,
  }: {
    group: string;
    id: string;
    data?: FeedResponse;
    watch?: boolean;
    options?: {
      addNewActivitiesTo?: 'start' | 'end';
      activityAddedEventFilter?: (event: ActivityAddedEvent) => boolean;
    };
    fieldsToUpdate: Array<
      'own_capabilities' | 'own_follows' | 'own_followings' | 'own_membership'
    >;
  }) => {
    const fid = `${group}:${id}`;
    let isCreated = false;

    if (!this.activeFeeds[fid]) {
      isCreated = true;
      this.activeFeeds[fid] = new Feed(
        this,
        group,
        id,
        data,
        watch,
        options?.addNewActivitiesTo,
        options?.activityAddedEventFilter,
      );
    }

    const feed = this.activeFeeds[fid];

    if (!isCreated && options) {
      if (options?.addNewActivitiesTo) {
        feed.addNewActivitiesTo = options.addNewActivitiesTo;
      }
      if (options?.activityAddedEventFilter) {
        feed.activityAddedEventFilter = options.activityAddedEventFilter;
      }
    }

    if (!feed.currentState.watch) {
      if (!isCreated && data) {
        if (
          (feed.currentState.updated_at?.getTime() ?? 0) <
          data.updated_at.getTime()
        ) {
          handleFeedUpdated.call(feed, { feed: data });
        } else if (
          (feed.currentState.updated_at?.getTime() ?? 0) ===
          data.updated_at.getTime()
        ) {
          const fieldsToUpdateData: Array<keyof FeedResponse> = [];
          const fieldChecks: Array<
            [
              (
                | 'own_capabilities'
                | 'own_follows'
                | 'own_membership'
                | 'own_followings'
              ),
              (currentState: FeedState, newState: FeedResponse) => boolean,
            ]
          > = [
            ['own_capabilities', isOwnCapabilitiesEqual],
            ['own_follows', isOwnFollowsEqual],
            ['own_membership', isOwnMembershipEqual],
            ['own_followings', isOwnFollowingsEqual],
          ];
          fieldChecks.forEach(([field, isEqual]) => {
            if (
              fieldsToUpdate.includes(field) &&
              !isEqual(feed.currentState, data)
            ) {
              fieldsToUpdateData.push(field);
            }
          });
          if (fieldsToUpdateData.length > 0) {
            const fieldsToUpdatePayload = fieldsToUpdateData.reduce(
              (acc: Partial<FeedResponse>, field) => {
                // @ts-expect-error TODO: fix this
                acc[field] = data[field];
                return acc;
              },
              {},
            );
            feed.state.partialNext(fieldsToUpdatePayload);
          }
        }
      }
      if (watch) handleWatchStarted.call(feed);
    }

    return feed;
  };

  private findAllActiveFeedsByActivityId(activityId: string) {
    return [
      ...Object.values(this.activeFeeds),
      ...Object.values(this.activeActivities)
        .filter((a) => !!getFeed.call(a))
        .map((a) => getFeed.call(a)!),
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
        .filter((a) => getFeed.call(a)?.feed === fid)
        .map((a) => getFeed.call(a)!),
    ];
  }

  /**
   * When updating from WS events we need a special logic:
   * - Find active feeds that match a given fid.
   * - Find active feed from activities where fid matches any of the feeds the activity is posted to.
   *
   * This logic is different from `findAllActiveFeedsByFid` which only checks the first feed an activity is posted to.
   *
   * @param fid
   * @param activityId
   * @returns
   */
  private findAllActiveFeedsFromWSEvent(event: FeedsEvent) {
    const fid = 'fid' in event ? event.fid : undefined;

    if (!fid) return [];

    const activeFeed = fid ? this.activeFeeds[fid] : undefined;

    return [
      ...(activeFeed ? [activeFeed] : []),
      ...Object.values(this.activeActivities)
        .filter((a) => {
          const feed = getFeed.call(a);
          return (
            feed?.feed === fid ||
            a.currentState.activity?.feeds.some((f) => f === fid)
          );
        })
        .map((a) => getFeed.call(a)!),
    ];
  }

  private updateStateFromFollows(follows: FollowResponse[]) {
    follows.forEach((follow) => {
      const feeds = [
        ...this.findAllActiveFeedsByFid(follow.source_feed.feed),
        ...this.findAllActiveFeedsByFid(follow.target_feed.feed),
      ];
      feeds.forEach((f) => handleFollowCreated.bind(f)({ follow }, false));
    });
  }

  private updateStateFromUnfollows(follows: FollowResponse[]) {
    follows.forEach((follow) => {
      const feeds = [
        ...this.findAllActiveFeedsByFid(follow.source_feed.feed),
        ...this.findAllActiveFeedsByFid(follow.target_feed.feed),
      ];
      feeds.forEach((f) => handleFollowDeleted.bind(f)({ follow }, false));
    });
  }

  private get initialState() {
    return {
      connected_user: undefined,
      is_anonymous: false,
      is_ws_connection_healthy: false,
    };
  }

  private checkIfUserIsConnected() {
    if (
      this.state.getLatestValue().connected_user !== undefined ||
      this.wsConnection ||
      this.state.getLatestValue().is_anonymous
    ) {
      throw new Error(`Can't connect a new user, call "disconnectUser" first`);
    }
  }
}

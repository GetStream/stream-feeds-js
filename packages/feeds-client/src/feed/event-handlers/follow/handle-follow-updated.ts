import type { Feed, FeedState } from '../../../feed';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { EventPayload, PartializeAllBut } from '../../../types-internal';

export function handleFollowUpdated(
  this: Feed,
  eventOrResponse: PartializeAllBut<
    EventPayload<'feeds.follow.updated'>,
    'follow'
  >,
) {
  const follow = eventOrResponse.follow;
  const connectedUserId = this.client.state.getLatestValue().connected_user?.id;
  const currentFeedId = this.fid;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(follow, 'updated'),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
    })
  ) {
    return;
  }

  this.state.next((currentState) => {
    let newState: FeedState | undefined;

    // this feed followed someone
    if (follow.source_feed.feed === currentFeedId) {
      newState ??= {
        ...currentState,
        // Update FeedResponse fields, that has the new follower/following count
        ...follow.source_feed,
      };

      const index =
        currentState.following?.findIndex(
          (f) => f.target_feed.feed === follow.target_feed.feed,
        ) ?? -1;

      if (index >= 0) {
        newState.following = [...newState.following!];
        newState.following[index] = follow;
      }
    } else if (
      // someone followed this feed
      follow.target_feed.feed === currentFeedId
    ) {
      const source = follow.source_feed;

      newState ??= {
        ...currentState,
        // Update FeedResponse fields, that has the new follower/following count
        ...follow.target_feed,
      };

      if (
        source.created_by.id === connectedUserId &&
        currentState.own_follows
      ) {
        const index = currentState.own_follows.findIndex(
          (f) => f.source_feed.feed === follow.source_feed.feed,
        );

        if (index >= 0) {
          newState.own_follows = [...currentState.own_follows];
          newState.own_follows[index] = follow;
        }
      }

      const index =
        currentState.followers?.findIndex(
          (f) => f.source_feed.feed === follow.source_feed.feed,
        ) ?? -1;

      if (index >= 0) {
        newState.followers = [...newState.followers!];
        newState.followers[index] = follow;
      }
    }

    return newState ?? currentState;
  });
}

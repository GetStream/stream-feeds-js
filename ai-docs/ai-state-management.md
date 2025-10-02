# State management

State updates mostly happen in response to WebSocket events. There are two main classes that do state management:

- `FeedsClient`
- `Feed`

Other state updates:

- when calling `getOrCreate` method
- when calling `queryFeeds` methid
- when paginating, like `feed.getNextPage`
- some HTTP responses also trigger a state update: for example follow/unfollow should update the state to allow basic action on the feed without having to watch them

## WebSocket event handlers

For the `Feed` class there is an `eventHandlers` property that watches for all feed related events. We need to add a handler which will call the state update method (unless state update is trivial, in which case we do it inline).

## State store

The project uses reactive state management using the `StateStore` class. There are two important methods here:

- `next` called when we want to do a full state replace, this is rare
- `partialNext` when we to update some part of the state

## State updates

State update code is located in the `src/feed/event-handlers` folder.

When updating the state we need to change the reference of the key we want to update. For example if we add a new activity we need to return a new array, it's not enough to append the new activity for the existing array.

### State update in response WebSocket event (one-way state update)

The state update util method should receive a WebSocket event (and some additional info if necessary) as an input

### State update in response HTTP response and WebSocket event (two-way state update)

These methods should be able to do the state update both from an HTTP response or a WebSocket event. The state update util method should receive relevant objects (for example `event.follow` or `response.follow`).

## Tests

Tests can be run with the `yarn test` command in `packages/feeds-client` folder.

### Unit tests

In the `src/feed/event-handlers` folder we can add unit tests, test files have `.test.ts` suffix.

Unit tests should use the state update methods only to make sure all edge cases a properly covered.

### Integration tests

In the `__integration-tests__` folder we have the integration tests. For example `feed-websocket-events.test.ts` that triggers the feed related WebSocket events and makes sure that:

- custom event handler are called
- state update happens

For testing activity related events we could do a file called `activity-websocket-events.test.ts`.

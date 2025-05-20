# State management

State updates happen in response to WebSocket events. There are two main classes that do state management:

- `FeedsClient`
- `FlatFeed`

## WebSocket event handlers

For the `FlatFeed` class there is an `eventHandlers` property that watches for all feed related events. We need to add a handler which will call the state update method (unless state update is trivial, in which case we do it inline).

## State store

The project uses reactive state management using the `StateStore` class. There are two important methods here:

- `next` called when we want to do a full state replace, this is rare
- `partialNext` when we to update some part of the state

## State updates

State update code is located in the `state-updates` folder. These methods return an `UpdateStateResult` structure. For example for activities it looks like this:

```ts
{
  activities: [{/* activity */}],
  changed: true
}
```

When updating the state we need to change the reference of the key we want to update. For example if we add a new activity we need to return a new array, it's not enough to append the new activity for the existing array.

## Tests

Tests can be run with the `yarn test` command in `packages/feeds-client` folder.

### Unit tests

In the `state-updates` folder we can add unit tests, for example for the `state-updates/activity-utils.ts` file the unit test file would be: `state-updates/activity-utils.test.ts`.

Unit tests should use the state update methods only to make sure all edge cases a properly covered.

### Integration tests

In the `__integration-tests__` folder we have the integration tests. For example `feed-websocket-events.test.ts` that triggers the feed related WebSocket events and makes sure that:

- custom event handler are called
- state update happens

For testing activity related events we could do a file called `activity-websocket-events.test.ts`.

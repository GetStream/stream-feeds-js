# State management

State updates mostly happen in response to WebSocket events. There are two main classes that do state management:

- `FeedsClient`
- `Feed`

Other state updates:

- when calling `getOrCreate` method
- when calling `queryFeeds` method
- when paginating, e.g. `feed.getNextPage`
- some HTTP responses also trigger a state update (e.g. follow/unfollow) so the feed can reflect the action without waiting for WebSocket events

## State store

The project uses reactive state management via the `StateStore` class (from `@stream-io/state-store`). Two important methods:

- `next` – full state replace (used when reinitializing, e.g. after `getOrCreate` with a full replace)
- `partialNext` – update only part of the state (typical for event-driven updates)

When updating state, change the **reference** of the key you update. For example, when adding an activity you must produce a new array; mutating the existing array is not enough for reactivity.

## State update queue (HTTP + WebSocket deduplication)

For actions that can be reflected both by an HTTP response and a WebSocket event (e.g. the user follows someone → REST response, then WS broadcast), the same logical change can arrive twice. The **state update queue** is used so we apply the update only once.

### Where it lives

- Each `Feed` has a `protected readonly stateUpdateQueue: Set<string>` (see `packages/feeds-client/src/feed/feed.ts`).
- Helpers live in `packages/feeds-client/src/utils/state-update-queue.ts`.

### How it works

- **Keys**: For each logical change we form a stable ID (e.g. `activity-updated-<activityId>`, `follow-created-<sourceFeed>-<targetFeed>`). The queue stores **prefixed** keys: `http-<id>` when the update came from HTTP, `ws-<id>` when it came from WebSocket.
- **Deduplication**: When an update arrives, we check the **paired** key (e.g. if this is WS, we look for `http-<id>`). If the paired key is present, we treat this as a duplicate: we remove the paired key and **skip** the state update. Otherwise we add the current prefixed key and **apply** the update.
- **When deduping applies**: Only when `watch` is true, the change is triggered by the connected user, and a `stateUpdateQueueId` is provided. Otherwise we always apply the update.
- **Order**: Either HTTP-first or WS-first is fine; the second arrival for the same logical ID is skipped.

### Helpers

- **`shouldUpdateState({ stateUpdateQueueId, stateUpdateQueue, watch, fromWs?, isTriggeredByConnectedUser })`**  
  Returns `true` if the state update should be applied, `false` if it should be skipped as a duplicate. Event handlers that support both HTTP and WS pass `fromWs: true` for WebSocket and `fromWs: false` for HTTP.
- **`getStateUpdateQueueId(payload, prefix)`**  
  Builds the stable ID for a given event type. `prefix` is one of: `activity-updated`, `activity-reaction-created`, `activity-reaction-deleted`, `activity-reaction-updated`, `comment-created`, `comment-deleted`, `comment-updated`, `comment-reaction-created`, `comment-reaction-deleted`, `comment-reaction-updated`, `follow-created`, `follow-deleted`, `follow-updated`.

### Handlers that use the queue

These handlers use `shouldUpdateState` and `getStateUpdateQueueId` so that HTTP and WebSocket updates for the same logical change are applied once:

- Follow: `handleFollowCreated`, `handleFollowDeleted`, `handleFollowUpdated`
- Activity: `handleActivityUpdated`; `handleActivityReactionAdded`, `handleActivityReactionDeleted`, `handleActivityReactionUpdated`
- Comment: `handleCommentAdded`, `handleCommentDeleted`, `handleCommentUpdated`; `handleCommentReactionAdded`, `handleCommentReactionDeleted`, `handleCommentReactionUpdated`

Handlers that only react to WebSocket (or only to one source) do not use the queue.

### When the queue is cleared

The queue is cleared when the feed state is **reinitialized** (e.g. in `getOrCreate` when doing a full state replace so the queue does not retain stale keys for the old state). See `feed.ts`: `this.stateUpdateQueue.clear()` in the branch that replaces feed state.

## WebSocket event handlers

The `Feed` class has an `eventHandlers` map (by WebSocket event type) that delegates to handler functions. Add or extend a handler there and, for two-way (HTTP + WS) updates, call the state update logic only when `shouldUpdateState` returns true; otherwise keep the update logic in the handler and use `state.partialNext` (or `state.next` where appropriate).

## State update code layout

State update logic lives under `src/feed/event-handlers/`. Handlers either:

- **One-way (WebSocket only)**: Take the WebSocket event (and any extra context) and update state.
- **Two-way (HTTP + WebSocket)**: Take a payload that can come from either HTTP or WS (e.g. `event.follow` or `response.follow`), and use the state update queue so the update is applied only once. They accept an optional `fromWs` (or equivalent) so `shouldUpdateState` can tell HTTP from WS.

## Tests

Tests can be run with `yarn test` in `packages/feeds-client`.

### Unit tests

In `src/feed/event-handlers/` add unit tests with a `.test.ts` suffix. Prefer testing via the public state update functions so edge cases (including queue deduplication) are covered.

### Integration tests

In `__integration-tests__/` (e.g. `feed-websocket-events.test.ts`) we trigger feed-related WebSocket events and assert that custom handlers run and state is updated. For activity-specific flows you can add something like `activity-websocket-events.test.ts`.

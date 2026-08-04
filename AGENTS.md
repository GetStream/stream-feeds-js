# AGENTS.md

Guidance for AI coding agents (Claude Code, Copilot, Cursor, Codex, Aider, etc.) working in this repository. Human readers are welcome, but this file is written for tools.

> **Single source of truth.** `CLAUDE.md` contains nothing but `@AGENTS.md`, which Claude Code expands into this file. Edit this file only — never fork guidance into `CLAUDE.md`.

Agents should prioritize backwards compatibility, API stability, and high test coverage when changing code.

## Repository purpose

Stream's Feeds (v3) SDKs in TypeScript — a plain-JS/low-level client plus thin React and React Native wrappers, covering real-time feeds, comments, notifications, search and moderation.

Three published packages live under `packages/`; `sample-apps/**` and `test-data-generator` are private workspaces.

## Tech & toolchain

- **Language:** TypeScript, React, React Native
- **Runtime:** Node **24** (`.nvmrc` → `v24`; CI runs `24.x`)
- **Package manager:** Yarn **4.14.1** (Berry). The binary is committed at `.yarn/releases/yarn-4.14.1.cjs` and activated via `yarnPath` in `.yarnrc.yml`, so any globally installed `yarn` acts only as a launcher — no Corepack required.
- **Workspaces:** `packages/*`, `sample-apps/**`, `test-data-generator`
- **Task orchestration:** Nx (`nx.json` + per-package `project.json`) — used **only** for the release `version` targets. `cacheableOperations` is empty, so Nx caching is effectively off and day-to-day builds go through `yarn workspaces foreach`.
- **Testing:** Vitest 4. There is no Jest in the published packages (only in the Expo sample app) and no Playwright/e2e suite.
- **Bundler:** Vite 8 / Rolldown for `feeds-client`; plain `tsc` for `react-sdk`; `tsc` + react-native-builder-bob for `react-native-sdk`
- **Lint/format:** ESLint flat config (`eslint.config.mjs`, `--max-warnings=0`) + Prettier (`.prettierrc`: 80 columns, single quotes, trailing commas)
- **Peer ranges:** React `^17 || ^18 || ^19` · React Native `>=0.73.0` · Expo `>=51.0.0`
- **CI:** GitHub Actions — lint + build + tests on every PR
- **Release:** Nx + `@jscutlery/semver`, driven by Conventional Commits

**No Husky, no lint-staged, no commitlint.** Nothing runs automatically on commit — the checks below are yours to run. Conventional Commits are enforced on **PR titles only**, by `check-pr.yml`.

### Yarn specifics that will bite you

- **Dependency catalog.** `.yarnrc.yml` has a `catalog:` block pinning shared versions (`react` 19.1.0, `react-dom` 19.1.0, `@types/react`/`@types/react-dom` ~19.1.0, `@stream-io/node-sdk` 0.7.44). Packages consume them as `"catalog:"`. To bump any of these, **edit the catalog** — never a per-package version string.
- `npmMinimalAgeGate: 3d` — packages published within the last three days are refused.
- `enableScripts: false` — install scripts are disabled globally.
- `enableHardenedMode: true` + `checksumBehavior: update`, `nodeLinker: node-modules`, `nmMode: hardlinks-global`, `enableGlobalCache: true`.
- `postinstall` runs `patch-package` against `patches/` (currently one patch for `conventional-recommended-bump`).

### Root configuration files

`.nvmrc` · `.yarnrc.yml` · `nx.json` · `eslint.config.mjs` · `.prettierrc` / `.prettierignore` · `.editorconfig` · `tsconfig.json` (base, mainly `paths` aliases) · `generate-openapi.sh` · `patches/` · `.claudeignore` / `.cursorignore` / `.cursorindexignore` (all three just exclude `.env*` files)

There is no prose/docs linter — Prettier formats markdown, nothing lints its content.

Respect repo-specific rules. Do not suppress lint rules broadly; justify and scope every exception.

## Project layout

```text
packages/
  feeds-client/                       # Core client — the only package with real source
    src/
      activity-with-state-updates/    # ActivityWithStateUpdates: single-activity state
      bindings/react/                 # contexts/ hooks/ wrappers/ — the /react-bindings entry
      common/                         # ApiClient, TokenManager, EventDispatcher, Poll
        real-time/                    # StableWSConnection, event models
        search/                       # SearchController + Activity/Feed/User search sources
      feed/                           # Feed class, activity filters
        event-handlers/               # activity/ bookmark/ comment/ feed/ feed-member/
                                      #   follow/ notification-feed/ story-feeds/ watch/
      feeds-client/                   # FeedsClient class + client-level event handlers
      gen/                            # GENERATED — feeds/ models/ model-decoders/ moderation/
      test-utils/                     # response/event factories for tests
      utils/                          # state-update-queue, throttling, logger, helpers
      index.ts gen-imports.ts moderation-client.ts types.ts
    __integration-tests__/            # live-API tests, incl. docs-snippets/
  react-sdk/                          # React wrapper — src/index.ts re-exports only
  react-native-sdk/                   # RN wrapper — index.ts, polyfills.ts, wrappers/StreamFeeds.tsx
sample-apps/
  react-demo/                         # Next.js demo (stream-feeds-react-demo)
  react-native/ExpoTikTokApp/         # Expo sample app
test-data-generator/                  # scripts to seed a Stream app with demo data
```

Use the closest folder's patterns and conventions when editing.

## Essential commands

```bash
yarn                       # install all workspaces (postinstall runs patch-package)

# Build
yarn build:all             # every workspace, topological
yarn build:libs            # published packages only — what CI runs
yarn build:client          # @stream-io/feeds-client
yarn build:react-sdk       # @stream-io/feeds-react-sdk
yarn build:react-native-sdk
yarn build:react-demo      # feeds-client + react-sdk + the Next.js demo
yarn clean:all
yarn workspace @stream-io/feeds-client run start   # vite --watch ‖ tsc --watch

# Tests — from packages/feeds-client
yarn test:unit             # unit only; NO credentials needed — use this by default
yarn test <pattern>        # e.g. yarn test feed.test
yarn vitest run <path>     # a single file, single pass
yarn test-ci               # coverage; INCLUDES live integration tests
# from the repo root
yarn test:ci:libs          # what CI runs — needs live Stream credentials
yarn test:ci:all
yarn test:docs-snippets

# Lint / format
yarn prettier --write <changed files>   # REQUIRED before you call a change done
yarn lint:all              # eslint --max-warnings=0 --cache
yarn lint:all:fix

# Codegen
yarn generate              # ./generate-openapi.sh — see "Generated code" below
yarn lint:gen              # eslint --fix + prettier over src/gen
```

**There is no `types` / typecheck script.** Type checking only happens inside each package's `build`, so **`yarn build:libs` is the type gate** — and it is slow. For a fast local check (~2s per package) invoke `tsc` directly. The configs are `composite` + declaration-emitting, so `--noEmit` needs the extra overrides:

```bash
# packages/feeds-client
yarn tsc -p tsconfig.lib.json --composite false --declarationMap false --emitDeclarationOnly false --noEmit
# packages/react-sdk
yarn tsc -p tsconfig.json --composite false --declaration false --noEmit
# packages/react-native-sdk
yarn tsc -p tsconfig.json --composite false --declaration false --declarationMap false --noEmit
```

## Architecture: core concepts

### Package hierarchy

```
@stream-io/feeds-client (packages/feeds-client)   # everything lives here
    ├── @stream-io/feeds-react-sdk          # src/index.ts: re-exports feeds-client
    └── @stream-io/feeds-react-native-sdk   # re-exports + polyfills.ts + wrappers/StreamFeeds.tsx
```

The two SDK packages are deliberately thin. Almost every change belongs in `feeds-client`; touch the wrappers only for framework-specific concerns (RN polyfills, platform wrappers).

### Entry points

`feeds-client` publishes two entries — `package.json` `exports` and `vite.config.ts` `lib.entry` must stay in sync:

| Import path                              | Source                        |
| ---------------------------------------- | ----------------------------- |
| `@stream-io/feeds-client`                | `src/index.ts`                |
| `@stream-io/feeds-client/react-bindings` | `src/bindings/react/index.ts` |

Two Vite details not to "simplify":

- `external` is built as `^dep(\/[\w-]+)?$` regexes from `dependencies` + `peerDependencies`, so **subpath** imports (`@stream-io/state-store/react-bindings`) stay external instead of being bundled.
- The package root also ships hand-written shims `react-bindings.js` / `.mjs` / `.d.ts` that forward into `dist/`. They exist for React Native bundlers (Metro < 0.79) that ignore the `exports` field, and they are listed in `files`. Keep them in step with the real entry.

### Key classes

| Class                                                 | File                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `FeedsClient extends FeedsApi`                        | `src/feeds-client/feeds-client.ts`                               |
| `Feed extends FeedApi`                                | `src/feed/feed.ts`                                               |
| `ActivityWithStateUpdates`                            | `src/activity-with-state-updates/activity-with-state-updates.ts` |
| `ModerationClient`                                    | `src/moderation-client.ts`                                       |
| `StreamPoll`                                          | `src/common/Poll.ts`                                             |
| `ApiClient`, `StreamApiError`                         | `src/common/ApiClient.ts`, `src/common/types.ts`                 |
| `TokenManager`                                        | `src/common/TokenManager.ts`                                     |
| `EventDispatcher`                                     | `src/common/EventDispatcher.ts`                                  |
| `ConnectionIdManager`                                 | `src/common/ConnectionIdManager.ts`                              |
| `StableWSConnection`                                  | `src/common/real-time/StableWSConnection.ts`                     |
| `SearchController`                                    | `src/common/search/SearchController.ts`                          |
| `BaseSearchSource` + `Activity`/`Feed`/`User` sources | `src/common/search/`                                             |

`FeedsClient` and `Feed` extend generated API base classes (`FeedsApi`, `FeedApi`) — see "Generated code".

### State management

State is reactive, held in `StateStore` instances from `@stream-io/state-store` (a dependency of `feeds-client`, re-exported from `src/index.ts`). Two methods matter:

- `next(...)` — full replace (reinitialization, e.g. `getOrCreate` with a full state replace)
- `partialNext(...)` — patch part of the state (the typical event-driven update)

Stores exist on `FeedsClient` (`FeedsClientState`), each `Feed` (`FeedState`), `StreamPoll`, `SearchController`, each search source, and `ActivityWithStateUpdates`.

**Updates must change the reference of the key you write.** Mutating an array or object in place will not re-render — build a new one.

**What writes feed state.** Most updates arrive as WebSocket events, but not all:

- `Feed.getOrCreate()` — the main write path. Sets `is_loading` / `is_loading_activities`, then either patches or fully replaces state (the replace branch also clears `stateUpdateQueue`). It throws `'Only one getOrCreate call is allowed at a time'` if called while `is_loading_activities` is set, and de-duplicates identical in-flight requests.
- `Feed.getNextPage()` — pagination, which delegates to `getOrCreate({ next })` rather than writing state itself. Same for the `loadNextPage*` helpers (comments, replies, follows).
- `FeedsClient.queryFeeds()` — writes indirectly, by hydrating each returned feed through `getOrCreateActiveFeed`.
- Some HTTP responses write directly so the UI reflects an action without waiting for the WebSocket round-trip — follow/unfollow is the canonical case (see the comment at `feeds-client.ts` on updating state after the HTTP response to support `queryFeeds` with `watch: false`). This is exactly why the state update queue below exists.

React reads state through `useStateStore`, re-exported from `@stream-io/state-store/react-bindings`. Four rules, all load-bearing:

1. **The selector must return an object or array**, never a primitive — equality is a shallow per-key `Object.is` comparison.
2. **The selector must be referentially stable.** Declare it at module scope (see `hooks/feed-state-hooks/useFeedActivities.ts`, `hooks/client-state-hooks/useClientConnectedUser.ts`), or wrap it in `useCallback` with minimal deps when it must close over a prop (see `useComments.ts`).
3. The store may be `undefined` before the client/feed exists, so the return type is `O | undefined`; hooks defensively do `?? {}`.
4. Never pass a fresh inline arrow as the selector.

The house style is a destructuring selector declared at module scope, below the hook (see `useFeedActivities.ts` for the canonical example):

```ts
import { useStateStore } from '@stream-io/feeds-client/react-bindings';

export const useSomething = ({ feed: feedFromProps }: { feed?: Feed } = {}) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  return useStateStore(feed?.state, selector) ?? {};
};

// module scope — stable reference across renders
const selector = ({
  is_loading_activities,
  next,
  activities = [],
}: FeedState) => ({
  is_loading: is_loading_activities,
  has_next_page: typeof next !== 'undefined',
  activities,
});
```

## Critical architectural patterns

### 1. HTTP + WebSocket deduplication (state update queue)

**Files:** `src/utils/state-update-queue.ts`, `src/feed/feed.ts`

The same logical change can arrive twice — once in an HTTP response, once as a WebSocket broadcast (follow, reactions, comments). Each `Feed` owns a `protected readonly stateUpdateQueue: Set<string>` and the queue makes sure the update is applied exactly once:

- Keys are `http-<id>` or `ws-<id>`, where `<id>` comes from `getStateUpdateQueueId(payload, prefix)` — the prefix joined with the identifying fields for that event (`activity-updated-<activityId>`, `follow-created-<sourceFeed>-<targetFeed>`, `activity-reaction-created-<activityId>-<reactionType>`, …). The `switch` in `src/utils/state-update-queue.ts` is the authoritative list of valid prefixes; it is `ensureExhausted`-guarded, so adding an event type there is a compile-time-checked change.
- On arrival, `shouldUpdateState({ stateUpdateQueueId, stateUpdateQueue, watch, fromWs, isTriggeredByConnectedUser })` looks for the **paired** key. Found → remove it and **skip** the update. Not found → add this key and **apply**.
- Either order (HTTP-first or WS-first) works.
- Dedup only engages when `watch === true`, the change was triggered by the connected user, and a `stateUpdateQueueId` was supplied. Otherwise the update always applies.
- The queue is cleared on full state re-init (`getOrCreate`'s replace branch) so stale keys don't leak.

19 handlers currently use it — all of `follow/` and `feed-member/`, all six `comment/` handlers, and the activity handlers for `updated`, `deleted`, `pinned`, `unpinned` and the three reaction events. WS-only handlers do not. Rather than trust that list, check:

```bash
grep -rl shouldUpdateState packages/feeds-client/src/feed/event-handlers --include='*.ts' | grep -v test
```

Two-way handlers pass `fromWs: true` from the WebSocket path and `fromWs: false` from the HTTP path (the parameter defaults to `true`).

### 2. WebSocket event handling

**Files:** `src/feed/event-handlers/`, `src/feeds-client/event-handlers/`

`Feed` holds an `eventHandlers` map keyed by WebSocket event type, delegating to one `handle-*.ts` per event, grouped by domain (`activity/`, `bookmark/`, `comment/`, `feed/`, `feed-member/`, `follow/`, `notification-feed/`, `story-feeds/`, `watch/`), each with a co-located `.test.ts`. Client-level handlers live in `src/feeds-client/event-handlers/`.

Handlers come in two shapes:

- **One-way (WS only)** — take the event, update state.
- **Two-way (HTTP + WS)** — take a payload that may come from either (`event.follow` or `response.follow`) and accept `fromWs` so `shouldUpdateState` can tell the sources apart.

When adding an event: add the handler file, export it from the domain `index.ts` and the `event-handlers/index.ts` barrel, register it in the `eventHandlers` map, and add a unit test next to it.

### 3. Generated code

**Directory:** `src/gen/` — `feeds/` (`FeedsApi`, `FeedApi`), `models/`, `model-decoders/`, `moderation/`

**Never hand-edit anything under `src/gen/`.** The files carry no "do not edit" header, so this file is the only place the rule is written down. `yarn generate` runs `generate-openapi.sh`, which:

1. **deletes `packages/feeds-client/src/gen` entirely**,
2. regenerates it from `feeds-clientside-api.yaml` in a **sibling checkout of the private `chat` repo at `../chat`** (relative to this repo's parent directory) — without that checkout the script cannot run,
3. finishes with `yarn lint:gen`.

`yarn lint:gen` is why `eslint-plugin-unused-imports` must stay installed — it cleans up the generator's unused imports.

Generated API classes reach the hand-written client through `src/gen-imports.ts`, a deliberate indirection layer that re-exports `ApiClient`, `StreamResponse` and `FeedsClient as FeedsApi`. It exists to break what would otherwise be a circular import. Don't collapse it.

### 4. React bindings

**Directory:** `src/bindings/react/` — the `/react-bindings` entry point.

- **Contexts** (`contexts/`): `StreamFeedsContext` → `useFeedsClient()`, `StreamFeedContext` → `useFeedContext()`, `StreamActivityWithStateUpdatesContext` → `useActivityWithStateUpdatesContext()`, `StreamSearchContext` → `useSearchContext()`, `StreamSearchResultsContext` → `useSearchResultsContext()`
- **Wrappers** (`wrappers/`, provider components): `StreamFeeds`, `StreamFeed`, `StreamActivityWithStateUpdates`, `StreamSearch`, `StreamSearchResults`
- **Hooks**: `useCreateFeedsClient`; client state (`useClientConnectedUser`, `useWsConnectionState`); feed state (`useFeedActivities`, `useActivityComments`, `useOwnCapabilities`, `useFollowers`, `useFollowing`, `useOwnFollows`, `useOwnFollowings`, `useMembers`, `useFeedMetadata`, `useNotificationStatus`, `useAggregatedActivities`, `useIsAggregatedActivityRead`, `useIsAggregatedActivitySeen`, and `useComments` — **`@deprecated`, use `useActivityComments`**); search (`useSearchResult`, `useSearchQuery`, `useSearchSources`); internal `useStableCallback`

House convention for feed-state hooks: accept an **optional `feed` prop that falls back to `useFeedContext()`**, read via `useStateStore(feed?.state, selector)` with a module-scope selector, wrap pagination callbacks in `useStableCallback`, and return a `useMemo`'d object.

There is **no** `hooks/index.ts`, `contexts/index.ts` or `wrappers/index.ts` — `src/bindings/react/index.ts` enumerates every export explicitly. A new public hook or context must be added there or it will not ship.

## Critical gotchas & invariants

### DO NOT:

1. **Hand-edit `src/gen/`** — `yarn generate` deletes the directory
2. **Mutate state in place** — always produce a new reference for the key you write, or nothing re-renders
3. **Pass an inline selector to `useStateStore`** — it must be module-scope or `useCallback`-wrapped
4. **Bump `react` / `react-dom` / `@types/react*` in a package.json** — edit the `catalog:` in `.yarnrc.yml`
5. **Delete or bypass `src/gen-imports.ts`** — it is what keeps generated code from circularly importing the client
6. **Fire an API call without awaiting it** in an integration test — see the HTTP + WebSocket rule under Testing

### Lint rules worth knowing

Enforced with `--max-warnings=0` from the single flat config at `eslint.config.mjs`:

- `no-console` is an **error** under `packages/**/*.ts` (relaxed in `__integration-tests__/docs-snippets/`)
- `react-hooks/exhaustive-deps` is an **error**, not a warning
- `@typescript-eslint/consistent-type-imports`, `@typescript-eslint/no-shadow`, `import/no-extraneous-dependencies`, `dot-notation` are errors
- `@typescript-eslint/array-type` is `array-simple`
- `@typescript-eslint/no-explicit-any` is **off** — `any` is tolerated, mostly for generated code
- `**/*.test.ts` relaxes `dot-notation` and `no-non-null-asserted-optional-chain`

### Known rough edges — don't trust these

- Root `tsconfig.json` `paths` for `@stream-io/feeds-client` point at `packages/feeds-client/index.ts` and `packages/feeds-client/@react-bindings/index.ts`. **Neither file exists** (the real ones are `src/index.ts` and `src/bindings/react/index.ts`). Only `react-native-sdk` extends the root config.
- `react-native-sdk`'s `build` runs `tsc` and then `rimraf dist` before `bob build`, so that `tsc` pass emits nothing — it is purely a type gate.
- `src/__mocks__/` exists but is empty. It is not a Vitest automock directory in use; ignore it.

## Testing

**Policy:** add or extend tests next to the code, with a `.test.ts` suffix — event handlers and utils have co-located tests, not a central `__tests__/` tree. Reuse the repo's existing factories instead of hand-rolling mocks. Cover `FeedsClient` and `Feed`, event handlers and state updates, React hooks and contexts, and utility functions.

**Test state updates through the public state-update functions**, not by poking at handler internals — that is what exercises the edge cases, queue deduplication included. For a new event, add the unit test beside the handler in `src/feed/event-handlers/<domain>/`, and if the flow needs live-event coverage add an integration test alongside `feed-websocket-events.test.ts` (for example an `activity-websocket-events.test.ts` for activity-specific flows).

Coverage expectations apply to `feeds-client`: `react-native-sdk`'s `test-ci` is `echo 'No tests yet'` and `react-sdk` has no test script at all.

**Runner:** Vitest 4, configured inside `packages/feeds-client/vite.config.ts` (there is no separate `vitest.config.ts`): `retry: 0`, `testTimeout` and `hookTimeout` 60000, v8 coverage.

- **No `setupFiles` and no global setup.** Nothing is polyfilled or registered for you.
- **No `environment`**, so tests run in `node`. DOM-dependent tests opt in per file with a docblock — currently only `useCreateFeedsClient.test.ts`:

  ```ts
  /** @vitest-environment happy-dom */
  ```

- **No `include` override**, so Vitest's defaults sweep both `src/**/*.test.ts` and `__integration-tests__/**`. That is why the scripts slice with `--exclude`: `test:unit` drops `__integration-tests__/**`, `test-ci` drops only `__integration-tests__/docs-snippets/**`.

Import factories from `src/test-utils` (`response-generators.ts`) — entity builders (`generateUserResponse`, `generateFeedResponse`, `generateActivityResponse`, `generateCommentResponse`, `generateFollowResponse`, `generateBookmarkResponse`, `generateFeedMemberResponse`, …) and matching WS-event builders (`generateActivityAddedEvent`, `generateCommentReactionAddedEvent`, `generateFeedMemberUpdatedEvent`, …), plus notification-feed mocks. Mocking style is inline `vi.mock(...)` per file.

### Integration tests

`packages/feeds-client/__integration-tests__/` runs against the live API. Helpers in `utils.ts`: `createTestClient`, `getServerClient` (server-side `@stream-io/node-sdk`), `createTestTokenGenerator`, `getTestUser`, `waitForEvent` (30s timeout), `deleteUsersIgnoringRateLimit`.

Env vars are read through `import.meta.env`, so they **must** be `VITE_`-prefixed in `packages/feeds-client/.env` (template: `.env-example`):

- `VITE_STREAM_API_KEY` — required
- `VITE_STREAM_API_SECRET` — required for the server client and token generation
- `VITE_API_URL` — optional base-URL override

`__integration-tests__/docs-snippets/` holds executable documentation examples, run separately by `yarn test:docs-snippets`.

**Integration tests: HTTP + WebSocket.** When a test calls an async client API that should produce a WebSocket event (or state updated from that event), always await the HTTP/API promise together with the event waiter. Do not fire the API and only await `waitForEvent` — a late-rejecting request causes unhandled rejections and hides failures. Typical pattern: start `waitForEvent(clientOrFeed, 'event.name')`, assign the API call to a variable, then `await Promise.all([eventPromise, apiPromise])`. See `__integration-tests__/utils.ts` for `waitForEvent` and `feed-websocket-events.test.ts` for an example.

## Build system

- **`feeds-client`** — `vite build` and `tsc -p tsconfig.lib.json` run concurrently. Vite emits `dist/es/*.mjs` + `dist/cjs/*.js` (no minification, sourcemaps on, target `es2020`, `emptyOutDir: false` so the two jobs don't clobber each other); `tsc` is `emitDeclarationOnly` with `noEmitOnError` into `dist/types/`.
- **`react-sdk`** — `rimraf dist` then plain `tsc` (`composite`, `declaration`, `module: nodenext`).
- **`react-native-sdk`** — `tsc` (type gate) → `rimraf dist` → `bob build`, emitting `commonjs`, `module` and `typescript` targets.

`feeds-client` tsconfig graph: `tsconfig.json` is solution-style (`files: []` + references) → `tsconfig.lib.json` (src; excludes `**/*.test.ts` and `**/test-utils/**`) · `tsconfig.test.json` (tests + test-utils) · `tsconfig.node.json` (`vite.config.ts` itself, with `noUnusedLocals`/`noUnusedParameters`/`erasableSyntaxOnly`).

## Styling, i18n and accessibility

**None of the three exist in the published packages, by design.** All of `packages/*` is headless: no CSS or SCSS, no theme system, no design tokens, no i18next or locale files, no `aria-*` or `accessibilityLabel`. The only `.tsx` files are context providers and wrappers — nothing renders markup. Do not invent a theming or localization layer here.

The `translation` symbols in `src/gen/` are the Stream API's **server-side** activity/comment translation endpoints, not app localization.

Styling exists only in `sample-apps/react-demo` (Tailwind CSS v4 + daisyUI).

## CI

| Workflow                | Trigger                       | What it does                                                                                                                               |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `check-pr.yml`          | pull_request                  | Enforces a Conventional Commit **PR title**                                                                                                |
| `lint-test.yml`         | push to `main`, PRs           | Node 24 → `yarn install --immutable` → `lint:all` → `build:libs` → `test:ci:libs` → `test:docs-snippets` → Vercel deploy of the React demo |
| `release.yml`           | manual `workflow_dispatch`    | Same gate, then `yarn release`                                                                                                             |
| `refresh-demo-data.yml` | cron (every 10 days) + manual | Reseeds demo data via `test-data-generator`                                                                                                |
| `cleanup-old-users.yml` | cron (daily) + manual         | Calls the demo app's cleanup endpoint                                                                                                      |

`test:ci:libs` executes the **live** integration tests, so CI (and any local run of it) needs real Stream credentials. `yarn test:unit` is the credential-free path.

## Sample apps

### `sample-apps/react-demo`

Next.js (App Router) demo showcasing the SDK, deployed by CI. It is a **reference implementation** — both source-code quality and visual design should be excellent.

- **UI:** Tailwind CSS v4 + **daisyUI** + `material-symbols`. Use daisyUI components idiomatically rather than hand-rolling styles.
- **Quality bar:** clean, well-structured React following current best practices; modern, polished UI. Both matter.
- **Setup:** build the libs first (`yarn build:client` && `yarn build:react-sdk`), add `sample-apps/react-demo/.env` with `NEXT_PUBLIC_API_KEY` and `API_SECRET`, then `yarn dev` from that directory. Pass `?user_id=<id>` or let the app generate a user.

### `sample-apps/react-native/ExpoTikTokApp`

Expo + expo-router sample using Firebase messaging, notifee and react-native-video/Mux. See its own README for setup.

If something about the SDK's intended usage isn't clear, ask for a documentation link rather than guessing.

## Contribution rules

### Linting & formatting

Nothing runs on commit — run it yourself:

```bash
yarn prettier --write <changed files>
yarn lint:all
yarn lint:all:fix
```

**Always run `yarn prettier --write` on changed files before considering a change complete.** Follow the "zero warnings" policy — fix new warnings, never introduce any. Respect `eslint.config.mjs` and `.prettierrc`; scope and justify every exception.

### Commits & PRs

Use [Conventional Commits](https://www.conventionalcommits.org/). CI validates the **PR title**, and `@jscutlery/semver` derives version bumps and changelogs from commit messages (`skipCommitTypes`: `ci`, `refactor`, `test`, `docs`, `chore`; changelog sections for `feat`, `fix`, `perf` only).

```
feat(feeds-client): add activity pin state handler

Closes FEEDS-1234
```

Keep PRs small and focused; include tests. Follow `.github/pull_request_template.md` (ticket, docs link, overview, implementation notes). Never commit unless explicitly asked.

Checklist before you open a PR:

- [ ] `yarn prettier --write <changed files>`
- [ ] `yarn lint:all` clean — zero warnings
- [ ] `yarn build:libs` passes (the type gate)
- [ ] `yarn test:unit` passes; integration tests too if you have credentials
- [ ] Tests added or extended for the change
- [ ] Public API changes documented, with migration notes
- [ ] PR title is a Conventional Commit

### Release

`yarn release` → `nx run-many --target version`, using `@jscutlery/semver` with `preset: conventionalcommits` and `baseBranch: main`. `react-sdk` and `react-native-sdk` set `trackDeps: true`, so they bump automatically when `feeds-client` does. Releases are triggered manually via the `release.yml` workflow — not on merge.

### Security & credentials

Never commit API keys or customer data. Example code must use obvious placeholders (e.g. `YOUR_STREAM_KEY`). Scripts must fail closed on missing env vars.

### Compatibility & distribution

Support React `^17 || ^18 || ^19` and React Native `>=0.73.0`. Packages must work from both CommonJS and ESM consumers — keep `package.json` `exports`, the Vite entries and the root `react-bindings.*` shims consistent. Don't add third-party dependencies without discussion.

### When in doubt

Mirror existing patterns in the nearest module. Prefer additive changes; avoid breaking public APIs. Ask maintainers (`.github/CODEOWNERS`) through PR mentions for modules you touch.

## References

- **PR template:** `.github/pull_request_template.md`
- **Feeds docs:** https://getstream.io/activity-feeds/docs/
- **React tutorial:** https://getstream.io/activity-feeds/sdk/react/
- **React Native tutorial:** https://getstream.io/activity-feeds/sdk/react-native/
- **Stream agent skills** (installed via `getstream init`): https://getstream.io/agent-skills/docs/installation/

---

End of machine guidance. Edit this file to refine agent behavior over time; keep human-facing details in `README.md` and the docs site.

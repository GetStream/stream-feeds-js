# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Install dependencies (run from repository root)
yarn

# Build all packages
yarn build:all

# Build specific packages
yarn build:client          # Build feeds-client only
yarn build:react-sdk       # Build React SDK only
yarn build:react-native-sdk # Build React Native SDK only

# Development mode with watch (feeds-client)
yarn workspace @stream-io/feeds-client run start
```

## Testing

```bash
# Run all tests
yarn test:ci:all

# Run tests for library packages only (no sample apps)
yarn test:ci:libs

# Run tests for feeds-client (in packages/feeds-client)
yarn test                  # Run all tests with vitest
yarn test:unit             # Run unit tests only (excludes integration tests)
yarn test <pattern>        # Run specific test file, e.g., yarn test feed.test

# Run a single test file
yarn vitest run path/to/test.test.ts

# Integration tests require environment variables:
# VITE_STREAM_API_KEY and VITE_STREAM_API_SECRET (see packages/feeds-client/__integration-tests__/utils.ts)
```

## Linting

```bash
yarn lint:all              # Lint all TypeScript files
yarn lint:all:fix          # Lint and auto-fix
```

## Verification After Changes

**IMPORTANT**: After making code changes, always verify the build and lint status:

```bash
yarn build:all             # Ensure all packages build successfully
yarn lint:all              # Check for linting errors
```

These commands should be run from the repository root before considering changes complete.

## Code Generation

```bash
yarn generate              # Regenerate OpenAPI types (runs generate-openapi.sh)
yarn lint:gen              # Lint and format generated code
```

## Architecture

This is a Yarn 4 monorepo with three main packages and sample applications.

### Package Hierarchy

```
@stream-io/feeds-client (packages/feeds-client)
    └── @stream-io/feeds-react-sdk (packages/react-sdk) - re-exports feeds-client
    └── @stream-io/feeds-react-native-sdk (packages/react-native-sdk) - re-exports feeds-client
```

### feeds-client Structure

The core SDK with two entry points:
- Main entry (`index.ts`): `FeedsClient`, `Feed`, state management, types
- React bindings entry (`/react-bindings`): hooks, contexts, wrapper components

Key classes:
- **FeedsClient** (`src/feeds-client/feeds-client.ts`): Main client for API communication, WebSocket connections, and state management. Extends auto-generated `FeedsApi`.
- **Feed** (`src/feed/feed.ts`): Represents a single feed with its state. Extends auto-generated `FeedApi`.
- **StateStore**: From `@stream-io/state-store`, manages reactive state for both client and feeds.

### Generated Code

`src/gen/` contains OpenAPI-generated code:
- `models/`: API request/response types
- `feeds/`: `FeedsApi` and `FeedApi` base classes
- `model-decoders/`: WebSocket event decoders

### React Bindings

Located in `src/bindings/react/`:
- **Contexts**: `StreamFeedsContext`, `StreamFeedContext`, `StreamActivityWithStateUpdatesContext`, `StreamSearchContext`
- **Hooks**: `useCreateFeedsClient`, client/feed/search state hooks
- **Wrappers**: `StreamFeeds`, `StreamFeed`, `StreamActivityWithStateUpdates`, `StreamSearch`

### Event Handling

WebSocket events are processed through handlers in `src/feed/event-handlers/`. Each event type (activity, comment, follow, bookmark, etc.) has dedicated handler files that update the appropriate state stores.

### Sample Apps

- `sample-apps/react-demo`: Next.js demo app with stories feature with DaisyUI and Tailwind
- `sample-apps/react-sample-app`: Advanced Next.js example
- `sample-apps/react-native/ExpoTikTokApp`: Expo React Native example

## Key Patterns

- State management uses `@stream-io/state-store` with React bindings via `useSyncExternalStore`
- API types are generated from OpenAPI spec - don't manually edit files in `src/gen/`
- Integration tests in `packages/feeds-client/__integration-tests__/` require Stream API credentials
- Tests use vitest; configuration is in `vite.config.ts`

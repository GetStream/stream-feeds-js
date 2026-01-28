Guidance for AI coding agents (Copilot, Cursor, Aider, Claude, etc.) working in this repository. Human readers are welcome, but this file is written for tools.

### Repository purpose

This repo hosts Stream's Feeds JS SDKs in TypeScript. It provides:
• A comprehensive JS, React and React Native client for Stream's Feeds (v3) API
• Support for real-time feeds, notifications, and moderation

Agents should prioritize backwards compatibility, API stability, and high test coverage when changing code.

### Tech & toolchain

• Language: TypeScript, React, React Native
• Package managers: Yarn with workspaces
• Node.js: 22.0.0 or newer
• Runtime targets: React 18+, React Native 0.73+
• CI: GitHub Actions (assume PR validation on build + tests + lint)
• Linters & docs: ESLint + Prettier
• Build tools: Rollup, Vite, TypeScript

### Project layout (monorepo)

packages/
  feeds-client/                # Core Feeds API client
    src/
      activity-with-state-updates/  # Activity state management
      bindings/                # Framework bindings
      common/                  # Common utilities (API client, state management, real-time)
      feed/                    # Feed management and event handlers
      feeds-client/            # Main FeedsClient class
      gen/                     # Generated API clients and models
      utils/                   # Utility functions
  react-sdk/                   # React SDK wrapper with hooks and contexts
  react-native-sdk/            # React Native SDK wrapper
sample-apps/
  react-demo/                  # Next.js demo application (stream-feeds-react-demo)
  react-sample-app/            # Next.js sample application (facebook-clone)
  react-native/                # React Native sample application (ExpoTikTokApp)

Use the closest folder's patterns and conventions when editing.

### Local setup (Monorepo)

1.  Ensure Node.js 22+ is installed
2.  Install dependencies: `yarn install`
3.  Build all packages: `yarn build:all`
4.  Run tests: `yarn test:ci:all`

### Package-specific setup

For individual packages:

```bash
# Core feeds client
yarn workspace @stream-io/feeds-client run build
yarn workspace @stream-io/feeds-client run test

# React SDK
yarn workspace @stream-io/feeds-react-sdk run build

# React Native SDK
yarn workspace @stream-io/feeds-react-native-sdk run build
```

### Available Scripts

Root-level scripts:
• `build:all` - Build all packages
• `build:libs` - Build only library packages (no sample apps)
• `test:ci:all` - Run all tests with coverage
• `test:ci:libs` - Run library tests only
• `lint:all` - Lint all packages
• `lint:all:fix` - Fix linting issues
• `generate` - Regenerate API clients from OpenAPI specs

Package-specific scripts (check individual package.json files):
• `build` - Build the package
• `test` - Run tests with Vitest
• `test:unit` - Run unit tests only
• `test-ci` - Run tests with coverage
• `clean` - Clean build artifacts

Agents should check package.json scripts before running commands.

### Build & test commands (CLI)

Use yarn/npm for day-to-day work; use CLI for CI parity & agent automation.

Build all packages:

```bash
yarn build:all
```

Build only libraries (no sample apps):

```bash
yarn build:libs
```

Run all tests:

```bash
yarn test:ci:all
```

Run library tests only:

```bash
yarn test:ci:libs
```

Run linting:

```bash
yarn lint:all
```

Fix linting issues:

```bash
yarn lint:all:fix
```

Generate API clients:

```bash
yarn generate
```

Linting & formatting
• ESLint and Prettier are configured for this project. Run before committing:

```bash
yarn lint:all
yarn lint:all:fix
```

• Respect eslint.config.mjs and .prettierrc configurations. Do not suppress rules broadly; justify and scope exceptions.
• The project uses lint-staged with Husky for pre-commit hooks.
• Each package may have its own linting configuration - check individual package.json files.

Commit / PR conventions
• Use conventional commit format for commit messages.
• Keep PRs small and focused; include tests.
• Follow the project’s “zero warnings” policy—fix new warnings and avoid introducing any.
• Ensure public API changes include docs and migration notes.

Testing policy
• Add/extend tests in each package's test directories with .test.ts suffix.
• Cover:
  • Core FeedsClient and Feed classes
  • Event handlers and state management - see ai-docs/ai-state-management for details
  • React hooks and contexts (react-sdk, react-native-sdk)
  • Utility functions (token creation, rate limiting, search)
  • Generated API clients and their interactions
• Integration tests are in `__integration-tests__/` directories

Security & credentials
• Never commit API keys or customer data.
• Example code must use obvious placeholders (e.g., YOUR_STREAM_KEY).
• If you add scripts, ensure they fail closed on missing env vars.

Compatibility & distribution
• Support React 18+ and React Native 0.73+ for respective SDKs.
• Don't introduce third-party deps without discussion.
• Validate yarn workspaces integration and ensure packages work in both CommonJS and ES modules.
• Test compatibility across all target runtimes (React, React Native).
• Each package has its own distribution targets - check individual package.json files.

When in doubt
• Mirror existing patterns in the nearest module.
• Prefer additive changes; avoid breaking public APIs.
• Ask maintainers (CODEOWNERS) through PR mentions for modules you touch.

⸻

Quick agent checklist (per commit)
• Build all packages: `yarn build:all`
• Run all tests: `yarn test:ci:all`
• Run linting: `yarn lint:all`
• Fix linting issues: `yarn lint:all:fix`
• Add/adjust tests
• No new warnings or linting errors
• Test affected packages individually if needed

End of machine guidance. Edit this file to refine agent behavior over time; keep human-facing details in README.md and docs.

## React Demo app

### Purpose

This is a React demo application showcasing the Stream Feeds SDK. Both source code quality and visual design should be excellent—this app serves as a reference implementation.

### UI Framework

This project uses **Tailwind CSS** with **daisyUI** for styling.

#### daisyUI Setup for Cursor

To get accurate daisyUI code generation, use one of these methods:

**Quick use in chat:**
```
@web https://daisyui.com/llms.txt
```

### Stream Feeds SDK Documentation

If something is not clear, ask for a documentation link

### Quality Standards

- **Source code**: Clean, well-structured, following React best practices
- **Design**: Modern, polished UI using daisyUI components effectively
- **Both must be excellent**—this is a showcase application

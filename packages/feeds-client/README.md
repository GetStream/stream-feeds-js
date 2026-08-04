# Official plain JS SDK and low-level client for Stream Feeds

Bring users together through personalized feeds, threaded discussions, and real-time updates that make every interaction feel meaningful.

## **Quick Links**

- [Register](https://getstream.io/chat/trial/) to get an API key for Stream Feeds
- [AI Agent Skills](#build-with-ai-agents) for Claude Code, Cursor, and Codex
- [React Sample apps](../../#react-demo-app)
- [Docs](https://getstream.io/activity-feeds/docs/)

## What is Stream?

Stream allows developers to rapidly deploy scalable feeds, chat messaging and video with an industry leading 99.999% uptime SLA guarantee.

Stream's Activity Feed V3 SDK enables teams of all sizes to build scalable activity feeds. The best place to get started is to follow one of the tutorials:

- [React tutorial](https://getstream.io/activity-feeds/sdk/react/)
- [React Native tutorial](https://getstream.io/activity-feeds/sdk/react-native/)

## Build with AI Agents

If you build with an AI coding agent, our [agent skills](https://getstream.io/agent-skills/docs/installation/) teach it how to use Stream's SDKs correctly. Install them once:

```bash
curl -fsSL https://getstream.io/cli.sh | bash
getstream init
```

This package is the headless, framework-agnostic client, so reach for [`/stream-docs`](https://getstream.io/agent-skills/docs/skills/stream-docs/) to look up any client method, state field or WebSocket event against the live documentation:

```
/stream-docs how do I paginate activities with the Feeds JS client?
```

If you are building a UI on top of it, use [`/stream-react`](https://getstream.io/agent-skills/docs/skills/stream-react/) for web or [`/stream-react-native`](https://getstream.io/agent-skills/docs/skills/stream-react-native/) for React Native and Expo instead — those can scaffold an app with the SDK wired up, add Feeds to an app you already have, or audit an existing integration. Works with Claude Code, Cursor, Codex, and any other agent that reads the universal `.agents` location.

## 👩‍💻 Free for Makers 👨‍💻

Stream is free for most side and hobby projects. To qualify, your project/company needs to have < 5 team members and < $10k in monthly revenue. Makers get $100 in monthly credit for feeds for free.

## 💡 Supported Features 💡

Here are some of the features we support:

- **For-You feed**: Most modern apps combine a “For You” feed with a regular “Following” feed. With activity selectors you can:
  - surface popular activities
  - show activities near the user
  - match activities to a user’s interests
  - mix-and-match these selectors to build an engaging personalized feed.
- **Comments**: Voting, threading, images, URL previews, @mentions & notifications. Basically all the features of Reddit style commenting systems.
- **Advanced feed features**: Activity expiration • visibility controls • feed visibility levels • feed members • bookmarking • follow-approval flow • stories support.
- **Activity filtering**: Filter activity feeds with almost no hit to performance
- **Search & queries**: Activity search, **query activities**, and **query feeds** endpoints.
- **Modern essentials**: Permissions • OpenAPI spec • GDPR endpoints • realtime WebSocket events • push notifications • “own capabilities” API.

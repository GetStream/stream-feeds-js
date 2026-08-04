# Official React SDK for Steram Feeds

Bring users together through personalized feeds, threaded discussions, and real-time updates that make every interaction feel meaningful.

Supported React versions: ^17 || ^18 || ^19

## **Quick Links 🔗**

- [Register](https://getstream.io/chat/trial/) to get an API key for Stream Feeds
- [AI Agent Skills](#build-with-ai-agents) for Claude Code, Cursor, and Codex
- [Sample apps](../../#react-demo-app)
- [Docs](https://getstream.io/activity-feeds/docs/)

## What is Stream?

Stream allows developers to rapidly deploy scalable feeds, chat messaging and video with an industry leading 99.999% uptime SLA guarantee.

Stream's Activity Feed V3 SDK enables teams of all sizes to build scalable activity feeds. The best place to get started is to [follow the tutorial](https://getstream.io/activity-feeds/sdk/react/).

## Build with AI Agents

If you build with an AI coding agent, our [agent skills](https://getstream.io/agent-skills/docs/installation/) teach it how to use this SDK correctly. Install them once:

```bash
curl -fsSL https://getstream.io/cli.sh | bash
getstream init
```

Then reach for the [`/stream-react`](https://getstream.io/agent-skills/docs/skills/stream-react/) skill:

```
/stream-react scaffold a Next.js app with a following feed and an activity composer
/stream-react add a notification feed to my existing React app
```

It can scaffold a new Next.js app with the SDK wired up, add Feeds to an app you already have, audit an existing integration, or migrate between SDK major versions. Works with Claude Code, Cursor, Codex, and any other agent that reads the universal `.agents` location.

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

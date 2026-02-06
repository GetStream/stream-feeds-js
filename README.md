# Stream Feeds for JavaScript, React and React Native

Bring users together through personalized feeds, threaded discussions, and real-time updates that make every interaction feel meaningful.

## **Quick Links**

- [Register](https://getstream.io/chat/trial/) to get an API key for Stream Feeds
- [React SDK](./packages/react-sdk#official-react-sdk-for-steram-feeds)
- [React Native SDK](./packages/react-native-sdk#official-react-native-sdk-for-stream-feeds)
- [JavaScript SDK](./packages/feeds-client#official-plain-js-sdk-and-low-level-client-for-stream-feeds)
- [React sample apps](#react-demo-app)
- [React native sample app](./sample-apps/react-native/ExpoTikTokApp/#expo-tiktok-sample-app)
- [Docs](https://getstream.io/activity-feeds/docs/)

## What is Stream?

Stream allows developers to rapidly deploy scalable feeds, chat messaging and video with an industry leading 99.999% uptime SLA guarantee.

Stream's Activity Feed V3 SDK enables teams of all sizes to build scalable activity feeds. The best place to get started is to follow one of the tutorials:

- [React tutorial](https://getstream.io/activity-feeds/sdk/react/)
- [React Native tutorial](https://getstream.io/activity-feeds/sdk/react-native/)

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

## React demo app

Deployed version: https://feeds-react-tutorial-getstreamio.vercel.app/

Prerequisites:

- Install dependencies: `yarn`
- Build React SDK: `yarn build:client` and `yarn build:react-sdk`
- Create a `.env` file in `sample-apps/react-demo`:

```
NEXT_PUBLIC_API_KEY=your_api_key_here
API_SECRET=your_API_secret
```

After the above steps run the following command in `sample-apps/react-demo`:

```
yarn dev
```

You can provide `user_id=<user id>` query param when opening the app, or provide nothing, and let the application generate a user for you.

## Test Data Generator

The `test-data-generator` directory contains scripts to populate your Stream Feeds app with sample data for testing and development purposes.

### Setup

1. Create a `.env` file in `test-data-generator/` with your credentials:

```
STREAM_API_KEY=<Stream API key>
API_SECRET=<Stream API secret>
API_URL=<Optional, Stream API URL>
```

2. Install dependencies: `yarn` (from the repository root)

### Typical use-case

Run these scripts in the following order from `test-data-generator` folder:

```bash
yarn create-users
yarn create-follows
# Adjust what features you need
yarn create-posts --features link,attachment,mention,poll,reaction,comment,bookmark,repost
# Optional, only useful if you have story feeds
yarn create-stories
```

### Available Scripts

Run these commands from the `test-data-generator/` directory:

| Script          | Command                | Description                                |
| --------------- | ---------------------- | ------------------------------------------ |
| Create Users    | `yarn create-users`    | Creates users and their feeds              |
| Create Follows  | `yarn create-follows`  | Sets up follow relationships between users |
| Create Posts    | `yarn create-posts`    | Generates sample activities/posts          |
| Create Stories  | `yarn create-stories`  | Creates sample stories                     |
| Download Images | `yarn download-images` | Downloads sample images for posts          |

### Create Posts Feature Flags

The `create-posts` script supports a `--features` flag to control which features are included in the generated posts:

```bash
yarn create-posts --features <feature1,feature2,...>
```

**Available features:**

| Feature      | Description                              |
| ------------ | ---------------------------------------- |
| `link`       | Adds random URLs to posts                |
| `attachment` | Uploads and attaches 1-3 images to posts |
| `mention`    | Adds @mentions to other users            |
| `poll`       | Creates and attaches polls to posts      |
| `reaction`   | Adds 1-5 reactions from random users     |
| `comment`    | Adds 1-5 comments from random users      |
| `bookmark`   | Bookmarks posts by random users          |
| `repost`     | Creates reposts of existing activities   |

**Examples:**

```bash
# Create basic posts without any features
yarn create-posts

# Create posts with polls and reactions
yarn create-posts --features poll,reaction

# Create posts with all content features
yarn create-posts --features link,attachment,mention,poll,reaction,comment,bookmark,repost
```

> Note: Each feature has a probability of being included (not every post will have every enabled feature). Link and attachment are mutually exclusive per post.

## Local Setup

### Prerequisites

You'll need to have [node 22](https://nodejs.org/en/download) installed on your computer

### Install dependencies

In the repository root run the following command to install all dependencies of all packages in this monorepo:

```
yarn
```

### Build and run JS client

```
cd packages/feeds-client
yarn build
# or
yarn start
```

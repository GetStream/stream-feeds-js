# Stream Feeds for JavaScript, React and React Native

Bring users together through personalized feeds, threaded discussions, and real-time updates that make every interaction feel meaningful.

## **Quick Links**

- [Register](https://getstream.io/chat/trial/) to get an API key for Stream Feeds
- [React SDK](./packages/react-sdk#official-react-sdk-for-steram-feeds)
- [React Native SDK](./packages/react-native-sdk#official-react-native-sdk-for-stream-feeds)
- [JavaScript SDK](./packages/feeds-client#official-plain-js-sdk-and-low-level-client-for-stream-feeds)
- [React sample apps](#react-sample-apps)
- [React native sample app](./sample-apps/react-native/ExpoTikTokApp/#expo-tiktok-sample-app)
- [Docs](https://getstream.io/activity-feeds/docs/)

## What is Stream?

Stream allows developers to rapidly deploy scalable feeds, chat messaging and video with an industry leading 99.999% uptime SLA guarantee.

Stream's Activity Feed V3 SDK enables teams of all sizes to build scalable activity feeds. The best place to get started is to follow the tutorial:

TODO

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

## React sample apps

### Simple React app with stories

Deployed version: https://feeds-react-tutorial-getstreamio.vercel.app/

Prerequisites:

- Install dependecies: `yarn`
- Build React SDK: `yarn build:client` and `yarn build:react-sdk`
- Create a `.env` file in `sample-apps/react-sample-app` with one of the following content:

Use this if you want to use a single user only:

```
VITE_API_KEY=your_api_key_here
VITE_USER_ID=your_user_id_here
VITE_USER_NAME=Your Name
VITE_USER_TOKEN=your_user_token_here
```

If your app [is configured to accept development tokens](https://getstream.io/activity-feeds/docs/javascript/tokens-and-authentication/#developer-tokens), you can use dev tokens to test with muliple users, in this case just provide an API key:

```
VITE_API_KEY=your_api_key_here
```

If you have a token provider backend, you can also provide a URL that takes `user_id` as a query param:

```
VITE_API_KEY=your_api_key_here
VITE_TOKEN_URL=optional,no need for user info in this case
```

After the above steps run the following command in `sample-apps/react-tutorial`:

```
yarn dev
```

### Advanced React app

Prerequisites:

- Install dependecies: `yarn`
- Build React SDK: `yarn build:client` and `yarn build:react-sdk`
- Create a `.env` file in `sample-apps/react-sample-app` with the following content:

```
NEXT_PUBLIC_STREAM_API_KEY=<Your API key>
NEXT_API_SECRET=<Your API secret>
NEXT_PUBLIC_API_URL=<Optionally provide an API URL>
```

- Run the `node setup-env.js` script in `sample-apps/react-sample-app`
- If you want to have some pre-made posts in your app, optinally run the `node create-posts.js` script as well

After the above steps run the following command in `sample-apps/react-sample-app`:

```
yarn dev
```

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

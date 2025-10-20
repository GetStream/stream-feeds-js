# Stream Feeds for JavaScript

⚠️ Activity feeds v3 is currently in beta.

## Repository Contents

- JS client for feeds v3
- React hooks for feeds v3
- React Native client for feeds v3 (coming soon)
- React client for feeds v3 (coming soon)
- React and React Native sample apps

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

### Run react sample app

Prerequisites:

- Build/run JS client
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

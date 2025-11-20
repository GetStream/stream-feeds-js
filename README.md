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

### Run react tutorial app

Prerequisites:

- Install dependecies: `yarn`
- Build React SDK and tutorial: `build:react-tutorial`
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

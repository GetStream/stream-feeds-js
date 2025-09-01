# Expo TikTok Sample App

This is a sample application displaying some of the capabilities of our `feeds-react-native-sdk`, build using `Expo`.

## Running the app

### Install the `expo` toolset

- Install the global `expo` package by running `npm install -g expo`

### Clone the Project

```bash
git clone https://github.com/GetStream/stream-feeds-js.git
```

### Installation

1. At the root of the project, install dependencies

```bash
yarn install
```

2. Build all of the libraries

```bash
yarn build:libs
```

3. Move to the `packages/feeds-client` directory and run it in `--watch` mode:

```bash
cd packages/feeds-client && yarn start
```

4. Open a new terminal window and move to the `sample-apps/react-native/ExpoTikTokApp` directory and install the dependencies:

```bash
cd sample-apps/react-native/ExpoTikTokApp && yarn install
```

5. (optional) Generate a Google Maps API key

In order for viewing a designated location on a map to work as a feature, you will need to create a Google Maps API key.

For this purpose, you can follow [their official documentation](https://developers.google.com/maps/documentation/android-sdk/get-api-key).

To include it in the app, you will need to set it to the `EXPO_PUBLIC_MAPS_API_KEY` environment variable.

Omitting this step will simply disable the feature.

> **WARNING**: Before you can start using the Google Maps Platform APIs and SDKs, you must sign up and create a [billing account](https://developers.google.com/maps/gmp-get-started#create-billing-account)!

6. (optional) Generate a `Geoapify` API key

In order for the location search feature to be available, you're going to need to generate a `Geoapify` API key. 

To do that, you may follow [their documentation](https://www.geoapify.com/get-started-with-maps-api/).

To include it in the app, you will need to set it to the `EXPO_PUBLIC_PLACES_API_KEY` environment variable.

Omitting this step will simply disable the feature.

7. (optional) Create a `.env` file

If you did any of steps `5.` or `6.`, you will need to add them to a `.env` file so that they can be consumed by the app.

To do this, create the file in `sample-apps/react-native/ExpoTikTokApp` and fill in the respective environment variables.

It should look something like this:

```
; Expo

EXPO_PUBLIC_PLACES_API_KEY=<geapify-api-key>
EXPO_PUBLIC_MAPS_API_KEY=<google-maps-api-key>

; Setup (only needed if you use your own API key)

STREAM_API_SECRET=<stream-api-secret>
```

### Run

To run the application for different platforms, use the following commands:

- For iOS

```bash
yarn run ios -d
```

- For android

```bash
yarn run android -d
```

## Using user tokens directly

If you want to use user tokens instead of the default token provider setup you can do the following:

1. Generate a user token using a user ID and API secret [here](https://getstream.io/chat/docs/react/token_generator/).
2. Open `sample-apps/react-native/ExpoTikTokApp/users.json` and add a `token` field to any user

The `token` field will be preferred over the token provider, if it exists.

> **NOTE**: Since users are cached when logged in, if you change the `token` of a user from `users.json` it's best to uninstall and then reinstall the app so that the cache is cleared.

## Using your own API key

To use your own API key with the sample app, you may do the following steps.

1. Open the `sample-apps/react-native/ExpoTikTokApp/constants/stream.js` file and change the `apiKey` variable to your own API key
2. Populate the app with the respective API key with users, their feeds and their follow relationships; the easiest way to do this is by running `yarn setup`
   - In case you need to modify anything, the script is located at `sample-apps/react-native/ExpoTikTokApp/setup-env.js`; if things are removed from it however the sample app may not work exactly as intended (addition is fine, though)
   - The script relies on the `STREAM_API_SECRET` environment variable, if you need to use it make sure it's set in your `.env` file as well
3. Create user tokens manually for the users you'd like to use like it's explained [here](#using-user-tokens-directly), since the token provider is not going to work out of the box
   - Alternatively you can also run your own backend, which would expose a token generation endpoint; in order to change this you can change the `tokenCreationUrl` variable in `sample-apps/react-native/ExpoTikTokApp/constants/stream.js` 

# Expo TikTok Sample App

This is a sample application displaying some of the capabilities of our `feeds-react-native-sdk`, build using `Expo`.

## How to run the app

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

2. Move to the `packages/feeds-client` directory and run it in `--watch` mode:

```bash
cd packages/feeds-client && yarn start
```

3. Move to the `sample-apps/react-native/ExpoTikTokApp` directory and install the dependencies:

```bash
cd ../../sample-apps/react-native/ExpoTikTokApp && yarn install
```

4. (optional) Generate a google maps API key

UNDER CONSTRUCTION

5. (optional) Generate a `Geoapify` API key

In order for the location search feature to be available, you're going to need to generate a `Geoapify` API key. 

To do that, you may follow [their documentation](https://www.geoapify.com/get-started-with-maps-api/).

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

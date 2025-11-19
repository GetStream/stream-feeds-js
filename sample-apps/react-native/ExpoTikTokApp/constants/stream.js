// ==== DEFAULT ====

export const apiKey = 'z3hzbmmtrdtv';
export const tokenCreationUrl =
  'https://pronto.getstream.io/api/auth/create-token?environment=feeds-expo-tiktok-sample-app';
export const baseUrl = undefined;

// ==== END-DEFAULT ====

// ==== MUX ====

// export const apiKey = '7r69u2vczu6x';
// export const tokenCreationUrl =
//   'https://pronto.getstream.io/api/auth/create-token?environment=feeds-expo-mux-app';
// export const baseUrl = undefined;

// ==== END-MUX ====

// ==== LOCAL ====

// export const apiKey = '892s22ypvt6m';
// export const tokenCreationUrl =
//   'http://localhost:3001/api/create-token?environment=feeds-expo-tiktok-sample-app';
// export const baseUrl = 'http://localhost:3030';

// ==== END-LOCAL ====

export const placesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;
export const mapApiKey = process.env.EXPO_PUBLIC_MAPS_API_KEY;

export const COMMENTS_LOADING_CONFIG = { sort: 'last', limit: 5 };
export const ACTIVITY_TEXT_MAX_CHARACTERS = 250;

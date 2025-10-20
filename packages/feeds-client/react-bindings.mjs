/**
 * Manual re-exports for React Native bundlers (e.g. Metro < 0.79) that do not
 * fully support the `exports` field in package.json. These files forward to the
 * built artifacts under `dist/`.
 */
export * from './dist/es/react-bindings.mjs';
/**
 * If we ever decide to add a `default` export to our `react-bindings` package,
 * please make sure to uncomment the line below.
 */
// export { default } from './dist/es/react-bindings.mjs';

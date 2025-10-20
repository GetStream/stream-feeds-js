'use strict';
/**
 * Manual re-exports for React Native bundlers (e.g. Metro < 0.79) that do not
 * fully support the `exports` field in package.json. These files forward to the
 * built artifacts under `dist/`.
 */
module.exports = require('./dist/cjs/react-bindings.js');

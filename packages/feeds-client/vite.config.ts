import { defineConfig } from 'vitest/config';

export default defineConfig({
  // TODO: move build process to Vite
  build: {},
  test: {
    retry: 0,
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});

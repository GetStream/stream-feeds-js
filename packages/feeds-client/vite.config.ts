import { defineConfig } from 'vitest/config';

export default defineConfig({
  // TODO: move build process to Vite
  build: {},
  test: {
    retry: 0,
    testTimeout: 20000,
    hookTimeout: 20000,
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
    },
  },
});

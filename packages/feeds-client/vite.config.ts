import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import { default as dts } from 'vite-plugin-dts';
import { dependencies, peerDependencies } from './package.json';

const external = [
  ...Object.keys(dependencies ?? {}),
  ...Object.keys(peerDependencies ?? {}),
];

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, './src/index.ts'),
        'react-bindings': resolve(__dirname, './src/bindings/react/index.ts'),
      },
      fileName(format, entryName) {
        return `${format}/${entryName}.${format === 'cjs' ? 'js' : 'mjs'}`;
      },
      name: '@stream-io/feeds-client',
    },
    emptyOutDir: true,
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      external,
    },
  },
  plugins: [
    {
      ...dts({ outDir: resolve(__dirname, './dist/types') }),
      apply: 'build',
    },
  ],
  resolve: {
    alias: {
      '@self': resolve(__dirname, './src'),
    },
  },
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

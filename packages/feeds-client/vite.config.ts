import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import { name, dependencies, peerDependencies } from './package.json';

const external = [
  ...Object.keys(dependencies),
  ...Object.keys(peerDependencies),
  // regex patterns to match subpaths of external dependencies
  // e.g. @stream-io/abc and @stream-io/abc/xyz (without this, Vite bundles subpaths)
].map((dependency) => new RegExp(`^${dependency}(\\/[\\w-]+)?$`));

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: resolve(__dirname, 'tsconfig.lib.json'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, './src/index.ts'),
        'react-bindings': resolve(__dirname, './src/bindings/react/index.ts'),
      },
      fileName(format, entryName) {
        return `${format}/${entryName}.${format === 'cjs' ? 'js' : 'mjs'}`;
      },
      name,
    },
    emptyOutDir: false,
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      external,
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

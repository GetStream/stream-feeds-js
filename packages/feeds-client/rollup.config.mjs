import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

import pkg from './package.json' with { type: 'json' };

// these modules are used only in nodejs and are not needed in the browser
const browserIgnoredModules = ['https', 'util', 'stream'];

/**
 * A plugin which converts the nodejs modules to empty modules for the browser.
 *
 * @type {import('rollup').Plugin}
 */
const browserIgnorePlugin = {
  name: 'browser-remapper',
  resolveId: (importee) =>
    browserIgnoredModules.includes(importee) ? importee : null,
  load: (id) =>
    browserIgnoredModules.includes(id) ? 'export default null;' : null,
};

const external = [
  'react/jsx-runtime',
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const namespacedPackages = [
  { input: 'index.ts', indexFileName: 'index' },
  { input: '@react-bindings/index.ts', indexFileName: 'index-react-bindings' },
];

const configs = namespacedPackages
  .map(({ input, indexFileName }) => {
    /**
     * @type {import('rollup').RollupOptions}
     */
    const browserConfig = {
      input,
      output: [
        {
          file: `dist/${indexFileName}.browser.js`,
          format: 'es',
          sourcemap: true,
        },
        {
          file: `dist/${indexFileName}.browser.cjs`,
          format: 'cjs',
          sourcemap: true,
        },
      ],
      external: external.filter((dep) => !browserIgnoredModules.includes(dep)),
      plugins: [
        replace({
          preventAssignment: true,
          'process.env.PKG_VERSION': JSON.stringify(pkg.version),
        }),
        browserIgnorePlugin,
        typescript({ tsconfig: './tsconfig.lib.json' }),
      ],
    };

    const nodeConfig = {
      input,
      output: [
        {
          file: `dist/${indexFileName}.node.cjs`,
          format: 'cjs',
          sourcemap: true,
        },
        {
          file: `dist/${indexFileName}.node.js`,
          format: 'es',
          sourcemap: true,
        },
      ],
      external,
      plugins: [
        replace({
          preventAssignment: true,
          'process.env.PKG_VERSION': JSON.stringify(pkg.version),
        }),
        typescript({ tsconfig: './tsconfig.lib.json' }),
      ],
    };

    return [browserConfig, nodeConfig];
  })
  .flat();

export default configs;

import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEsLint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { ignores: ['**/node_modules/**', '**/build/**', '**/dist/**'] },
  { languageOptions: { globals: globals.node } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEsLint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    rules: {
      'dot-notation': 'error',
      'unused-imports/no-unused-imports': 'error',
      'no-async-promise-executor': 'off',
      'no-empty-pattern': 'off',
      'no-empty': 'off',
      'prefer-const': 'warn',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'import/no-extraneous-dependencies': 'error',
      'react/no-children-prop': 'off',
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    // This pattern helps keep docs snippets shorter
    files: ['**/__integration-tests__/docs-snippets/*.test.ts'],
    rules: {
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    },
  },
];

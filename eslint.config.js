import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default ts.config(
  // 1. Global Ignores
  {
    ignores: ['dist/**', 'node_modules/**', '.tmp/**', '**/.git/**'],
  },

  // 2. Base Recommended Rules
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],

  // 3. Environment Globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 4. Svelte & TypeScript Parser Integration
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  }
);

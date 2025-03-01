// eslint.config.mjs
import js from '@eslint/js';
import eslintConfigNext from 'eslint-config-next';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  ...eslintConfigNext.configs['core-web-vitals'], // Spread the configs
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': eslintPluginTypescript,
    },
    rules: {
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginTypescript.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['node_modules/'],
  },
];
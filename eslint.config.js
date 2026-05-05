import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      {
        languageOptions: {
          parser: tsparser,
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
          },
        },
        plugins: {
          '@typescript-eslint': tseslint,
        },
        rules: {
          ...tseslint.configs.recommended.rules,
          ...reactHooks.configs.flat.recommended.rules,
          ...reactRefresh.configs.vite.rules,
        },
      },
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])

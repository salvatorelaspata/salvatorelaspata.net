import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
)

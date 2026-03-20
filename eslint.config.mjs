import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', 'scripts/', 'static/', 'cordova/'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'preserve-caught-error': 'off',
      semi: ['error', 'always'],
      'quote-props': 'off',
      'sort-keys': 'off',
      'import/order': 'off',
      'no-console': 'off',
      'indent': ['error', 2],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      'max-len': [
        'error',
        {
          code: 120,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],
    },
  },
);

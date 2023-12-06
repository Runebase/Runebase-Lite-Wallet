// eslint-disable-next-line no-undef
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', 'node_modules', 'scripts', 'static'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/naming-convention': 'off', // temp
    '@typescript-eslint/ban-types': 'off', // temp
    semi: ['error', 'always'],
    'quote-props': 'off',
    'sort-keys': 'off',
    'import/order': 'off',
    'no-console': 'off',
    'indent': ['error', 2],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
    // '@typescript-eslint/naming-convention': [
    //   'error',
    //   { selector: 'variableLike', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
    //   { selector: 'variable', modifiers: ['const'], format: ['camelCase', 'UPPER_CASE'] },
    //   { selector: 'property', format: null },
    // ],
    '@typescript-eslint/no-empty-interface': 'off',
    'max-len': [
      'error',
      {
        'code': 120,
        'ignoreRegExpLiterals': true,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true,
        'ignoreComments': true
      }
    ],
  },
};

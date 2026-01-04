module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        React: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];

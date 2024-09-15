module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    // Add your custom rules here
    'no-unused-vars': 'warn', // Changed from 'error' to 'warn'
    // Add more rules as needed
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

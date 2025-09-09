module.exports = {
  root: false,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: null,
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: ['node_modules/', 'feature-patches/', '.next/', 'coverage/'],
  rules: {
    // keep minimal, avoid opinionated rules for quick pass
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
}

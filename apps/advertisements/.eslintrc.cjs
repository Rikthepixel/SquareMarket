module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs", "db"],
  parser: "@typescript-eslint/parser",
  plugins: [],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.base.json"
  },
  plugins: [
    "@typescript-eslint",
    "prettier"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "prettier/prettier": [
      "error",
      { endOfLine: "auto"
      }
    ]
  }
};


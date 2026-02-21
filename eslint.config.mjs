import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                Bun: "readonly",
                process: "readonly",
                React: "readonly",
                JSX: "readonly",
                RequestInit: "readonly",
                FormData: "readonly",
                Response: "readonly",
                Headers: "readonly",
                fetch: "readonly",
                Express: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": ts,
            prettier: prettier,
        },
        rules: {
            ...ts.configs.recommended.rules,
            ...prettierConfig.rules,
            "prettier/prettier": "error",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-require-imports": "off",
            "no-empty": ["error", { "allowEmptyCatch": true }],
            "no-undef": "off",
        },
    },
    {
        ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", ".expo/**"],
    },
];

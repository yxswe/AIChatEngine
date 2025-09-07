import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable all rules by setting them to "off"
      ...Object.fromEntries(
        Object.keys(require('eslint').linter.defaultConfig.rules).map(rule => [rule, 'off'])
      ),
      // Also disable TypeScript and React specific rules
      "@typescript-eslint/*": "off",
      "react/*": "off",
      "jsx-*": "off",
    },
  },
];

export default eslintConfig;

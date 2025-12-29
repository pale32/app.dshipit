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
    rules: {
      // Performance Rules
      "react/no-array-index-key": "warn",
      "react/jsx-no-bind": [
        "warn",
        {
          ignoreRefs: true,
          allowArrowFunctions: true,
          allowFunctions: true,
          allowBind: false,
          ignoreDOMComponents: true,
        },
      ],
      "react-hooks/exhaustive-deps": "error",
      "react/no-unstable-nested-components": "warn",
      "react/jsx-pascal-case": "error",

      // Custom CSS Prevention Rules - Allow legitimate dynamic styles
      "react/forbid-dom-props": [
        "error",
        {
          forbid: [], // Disabled - using no-restricted-syntax instead for more granular control
        },
      ],

      // TypeScript Performance (removed type-checking rules)
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-unused-vars": "off",

      // General Code Quality
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",

      // React Best Practices
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": [
        "error",
        {
          props: "never",
          children: "never",
        },
      ],
      "react/no-unescaped-entities": "off",

      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      // Import/Export
      "import/no-default-export": "off", // Next.js pages need default exports
      "import/prefer-default-export": "off",

      // Custom restrictions to enforce Tailwind
      "no-restricted-syntax": [
        "error",
        {
          selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression',
          message:
            "Avoid inline style objects. Use Tailwind classes instead. Only use for truly dynamic values.",
        },
      ],
    },
  },
  {
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // Allow dynamic styles in specific UI components
    files: ["**/ui/progress.tsx", "**/ui/chart.tsx", "**/Sidebar.tsx", "**/components/ui/**/*.tsx", "**/product-research/**/*.tsx"],
    rules: {
      "react/forbid-dom-props": "off",
      "no-restricted-syntax": "off",
    },
  },
];

export default eslintConfig;
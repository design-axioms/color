import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginSvelte from "eslint-plugin-svelte";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import tseslint from "typescript-eslint";
import axiomaticPlugin from "./packages/eslint-plugin/dist/index.mjs";

// eslint-disable-next-line @typescript-eslint/no-deprecated
export default tseslint.config(
  js.configs.recommended,
  // 1. Type-Aware Base (SRC) - Full Type Checking
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.cjs",
      "**/*.svelte",
    ],
    ignores: [
      "**/scripts/**",
      "**/tests/**",
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/*.config.ts",
      "**/bin/**",
      "**/examples/**",
      "site/**",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".astro", ".svelte"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },
  // 2. Fast Base (SCRIPTS/TESTS/SITE) - No Type Checking
  {
    files: [
      "**/scripts/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      "**/tests/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/*.config.ts",
      "**/bin/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      "**/examples/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      "site/**/*.{ts,tsx,js,jsx,mjs,cjs,svelte}",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@axiomatic-design/no-hardcoded-colors": "off",
      "@axiomatic-design/no-raw-tokens": "off",
    },
  },

  // 2b. Complexity/Size Guardrails (Targeted)
  // These are warn-only on purpose: they provide continuous pressure to keep
  // automation scripts maintainable without blocking unrelated work.
  {
    files: ["scripts/check-violations/run.ts"],
    rules: {
      // Cyclomatic complexity (ESLint core). Helps surface “giant main()” drift.
      complexity: ["warn", { max: 60 }],

      // File/function size. These are conservative starting points; tune down as we refactor.
      "max-lines": [
        "warn",
        {
          max: 1600,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "warn",
        {
          max: 260,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-statements": ["warn", 140],
      "max-depth": ["warn", 5],
      "max-params": ["warn", 6],
    },
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.cjs",
      "**/*.svelte",
    ],
    ignores: [
      "**/scripts/**",
      "**/tests/**",
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/*.config.ts",
      "**/bin/**",
      "**/examples/**",
      "site/**",
    ],
  })),
  // 3. Site - Recommended (Not Strict Type Checked) for Performance
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["site/**/*.{ts,tsx,js,jsx,mjs,cjs,svelte}"],
  })),
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginSvelte.configs["flat/recommended"],
  {
    plugins: {
      "@axiomatic-design": axiomaticPlugin,
    },
    rules: {
      "@axiomatic-design/no-hardcoded-colors": "warn",
      "@axiomatic-design/no-raw-tokens": "warn",
    },
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.cjs",
      "**/*.svelte",
    ],
    ignores: [
      "**/scripts/**",
      "**/tests/**",
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/*.config.ts",
      "**/bin/**",
      "**/examples/**",
      "site/**",
    ],
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
        },
      ],
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
          minimumDescriptionLength: 3,
        },
      ],
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        // Widget Roles
        ...[
          {
            element: "button",
            role: "button",
            replacement: "<button>",
          },
          {
            element: "input",
            role: "checkbox",
            replacement: '<input type="checkbox">',
          },
          {
            element: "input",
            role: "radio",
            replacement: '<input type="radio">',
          },
          {
            element: "input",
            role: "textbox",
            replacement: '<input type="text"> or <textarea>',
            extraSelectors: "[name.name!='textarea']",
          },
          {
            element: "input",
            role: "searchbox",
            replacement: '<input type="search">',
          },
          {
            element: "input",
            role: "spinbutton",
            replacement: '<input type="number">',
          },
          {
            element: "input",
            role: "slider",
            replacement: '<input type="range">',
          },
          {
            element: "select",
            role: "combobox",
            replacement: '<select> or <input list="...">',
            extraSelectors: "[name.name!='input']",
          },
          {
            element: "select",
            role: "listbox",
            replacement: "<select>",
          },
          {
            element: "option",
            role: "option",
            replacement: "<option>",
          },
          {
            element: "progress",
            role: "progressbar",
            replacement: "<progress>",
          },
          {
            element: "meter",
            role: "meter",
            replacement: "<meter>",
          },
          {
            element: "a",
            role: "link",
            replacement: "<a>",
          },
          // Document Structure Roles
          {
            element: "article",
            role: "article",
            replacement: "<article>",
          },
          {
            element: "aside",
            role: "complementary",
            replacement: "<aside>",
          },
          {
            element: "nav",
            role: "navigation",
            replacement: "<nav>",
          },
          {
            element: "main",
            role: "main",
            replacement: "<main>",
          },
          {
            element: "form",
            role: "form",
            replacement: "<form>",
          },
          {
            element: "header",
            role: "banner",
            replacement: "<header>",
          },
          {
            element: "footer",
            role: "contentinfo",
            replacement: "<footer>",
          },
          {
            element: "section",
            role: "region",
            replacement: "<section>",
          },
          {
            element: "search",
            role: "search",
            replacement: "<search>",
          },
          {
            element: "h1",
            role: "heading",
            replacement: "<h1>-<h6>",
            extraSelectors:
              "[name.name!='h2'][name.name!='h3'][name.name!='h4'][name.name!='h5'][name.name!='h6']",
          },
          {
            element: "ul",
            role: "list",
            replacement: "<ul> or <ol>",
            extraSelectors: "[name.name!='ol']",
          },
          {
            element: "li",
            role: "listitem",
            replacement: "<li>",
          },
          {
            element: "img",
            role: "img",
            replacement: "<img> or <picture>",
            extraSelectors: "[name.name!='picture'][name.name!='svg']",
          },
          {
            element: "figure",
            role: "figure",
            replacement: "<figure>",
          },
          {
            element: "dfn",
            role: "definition",
            replacement: "<dfn>",
          },
          {
            element: "dfn",
            role: "term",
            replacement: "<dfn> or <dt>",
            extraSelectors: "[name.name!='dt']",
          },
          // Table Roles
          {
            element: "table",
            role: "table",
            replacement: "<table>",
          },
          {
            element: "tr",
            role: "row",
            replacement: "<tr>",
          },
          {
            element: "td",
            role: "cell",
            replacement: "<td>",
          },
          {
            element: "th",
            role: "columnheader",
            replacement: "<th>",
          },
          {
            element: "th",
            role: "rowheader",
            replacement: "<th>",
          },
          // Misc
          {
            element: "dialog",
            role: "dialog",
            replacement: "<dialog>",
          },
          {
            element: "hr",
            role: "separator",
            replacement: "<hr>",
          },
          {
            element: "output",
            role: "status",
            replacement: "<output>",
          },
        ].map(({ element, role, replacement, extraSelectors = "" }) => ({
          selector: `SvelteElement[name.name!='${element}']${extraSelectors} > SvelteStartTag > SvelteAttribute[key.name='role'] > SvelteLiteral[value='${role}']`,
          message: `Use ${replacement} instead of role="${role}".`,
        })),

        // Abstract Roles (Never use)
        {
          selector:
            "SvelteElement > SvelteStartTag > SvelteAttribute[key.name='role'] > SvelteLiteral[value=/(^command$|^composite$|^input$|^landmark$|^range$|^roletype$|^section$|^sectionhead$|^select$|^structure$|^widget$|^window$)/]",
          message:
            "Do not use abstract ARIA roles. They are for browser implementation only.",
        },
      ],
    },
  },
  {
    files: ["**/*.svelte.ts"],
    ignores: ["site/**"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
  {
    files: ["**/tests/**", "**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@axiomatic-design/no-raw-tokens": "off",
      "@axiomatic-design/no-hardcoded-colors": "off",
    },
  },
  {
    files: ["site/src/**/*.{ts,svelte}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/src/lib/**", "**/src/lib"],
              message:
                "Import from '@axiomatic-design/color' instead of direct source files.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/**/*.{ts,tsx,js,jsx}",
      "site/src/**/*.{ts,svelte,tsx,js,jsx}",
      "scripts/**/*.{ts,js}",
    ],
    rules: {
      // We never use blocking browser dialogs to communicate state.
      "no-alert": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "**/dist/**",
      "coverage/**",
      "**/*.config.ts",
      "**/__tests__/**",
      "site/dist/**",
      "**/.astro/**",
      "**/*.d.ts",
      "check-repro.cjs",
      "debug-gts-ast-2.js",
      "examples/grand-simulation/tailwind.preset.js",
      "examples/zero-to-one-simulation/**",
      "packages/vscode-extension/scripts/**",
      "packages/vscode-extension/dist/**",
      "tests/golden-masters/**",
      "vendor/**",
      ".locald/**",
      "bin/**",
      "temp-math/**",
      ".tmp/**",
      "snippets/**",
      "**/node_modules/**",
    ],
  },
  {
    files: ["site/**/*.svelte.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: false,
      },
    },
  },
  {
    files: [
      "src/lib/index.ts",
      "src/lib/math.ts",
      "src/lib/generator/index.ts",
      "src/lib/runtime.ts",
      "src/lib/types.ts",
      "src/lib/constants.ts",
      "src/lib/browser.ts",
      "src/lib/utilities.ts",
      "src/lib/inspector/index.ts",
      "src/cli/index.ts",
    ],
    plugins: {
      jsdoc,
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          publicOnly: true,
        },
      ],
      "jsdoc/require-description": "error",
    },
  },
  eslintConfigPrettier,
);

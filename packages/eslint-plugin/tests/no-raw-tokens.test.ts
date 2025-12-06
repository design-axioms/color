import { RuleTester } from "@typescript-eslint/rule-tester";
import fs from "fs";
import path from "path";
import { afterAll, beforeAll, describe, it } from "vitest";
import { noRawTokens, resetCache } from "../src/rules/no-raw-tokens";

const MOCK_CSS_DIR = path.join(process.cwd(), "css");
const MOCK_THEME_PATH = path.join(MOCK_CSS_DIR, "theme.css");
const MOCK_UTILS_PATH = path.join(MOCK_CSS_DIR, "utilities.css");
const MOCK_CONFIG_PATH = path.join(process.cwd(), "color-config.json");

const MOCK_THEME_CONTENT = `
:root {
  --axm-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --axm-chart-1: #ff0000;
  --local-light-h: 0;
  --text-lightness-source: 0;
}
`;

const MOCK_UTILS_CONTENT = `
.shadow-sm {
  box-shadow: var(--axm-shadow-sm);
}
`;

const MOCK_CONFIG_CONTENT = JSON.stringify({
  groups: [
    {
      surfaces: [{ slug: "page" }, { slug: "card" }],
    },
  ],
});

let originalConfigContent: string | null = null;

beforeAll(() => {
  resetCache();
  if (!fs.existsSync(MOCK_CSS_DIR)) {
    fs.mkdirSync(MOCK_CSS_DIR, { recursive: true });
  }
  fs.writeFileSync(MOCK_THEME_PATH, MOCK_THEME_CONTENT);
  fs.writeFileSync(MOCK_UTILS_PATH, MOCK_UTILS_CONTENT);

  if (fs.existsSync(MOCK_CONFIG_PATH)) {
    originalConfigContent = fs.readFileSync(MOCK_CONFIG_PATH, "utf-8");
  }
  fs.writeFileSync(MOCK_CONFIG_PATH, MOCK_CONFIG_CONTENT);
});

afterAll(() => {
  if (fs.existsSync(MOCK_THEME_PATH)) fs.unlinkSync(MOCK_THEME_PATH);
  if (fs.existsSync(MOCK_UTILS_PATH)) fs.unlinkSync(MOCK_UTILS_PATH);

  if (originalConfigContent) {
    fs.writeFileSync(MOCK_CONFIG_PATH, originalConfigContent);
  } else if (fs.existsSync(MOCK_CONFIG_PATH)) {
    fs.unlinkSync(MOCK_CONFIG_PATH);
  }

  if (
    fs.existsSync(MOCK_CSS_DIR) &&
    fs.readdirSync(MOCK_CSS_DIR).length === 0
  ) {
    fs.rmdirSync(MOCK_CSS_DIR);
  }
});

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

describe("no-raw-tokens", () => {
  ruleTester.run("no-raw-tokens", noRawTokens, {
    valid: [{ code: 'const color = "var(--axm-chart-1)";' }],
    invalid: [
      {
        code: 'const color = "var(--local-light-h)";',
        errors: [{ messageId: "internalToken" }],
      },
      {
        code: 'const color = "var(--text-lightness-source)";',
        errors: [{ messageId: "internalToken" }],
      },
      {
        code: 'const color = "var(--surface-page)";',
        errors: [{ messageId: "useClassForSurface", data: { slug: "page" } }],
      },
      {
        code: 'const color = "var(--surface-card)";',
        errors: [{ messageId: "useClassForSurface", data: { slug: "card" } }],
      },
      {
        code: 'const color = "var(--axm-shadow-sm)";',
        errors: [
          {
            messageId: "preferClass",
            data: { name: "--axm-shadow-sm", className: "shadow-sm" },
          },
        ],
      },
    ],
  });
});

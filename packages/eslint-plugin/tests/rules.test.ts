import { RuleTester } from "@typescript-eslint/rule-tester";
import { beforeAll, describe, it, vi } from "vitest";
import {
  noHardcodedColors,
  resetCache as resetHardcodedCache,
} from "../src/rules/no-hardcoded-colors";
import {
  noRawTokens,
  resetCache as resetRawTokensCache,
} from "../src/rules/no-raw-tokens";

// Mock the theme loader utils
vi.mock("../src/utils/load-theme", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/utils/load-theme")>();
  return {
    ...actual,
    findThemeCss: () => "/mock/theme.css",
    findUtilitiesCss: () => "/mock/utilities.css",
    findColorConfig: () => "/mock/color-config.json",
    extractVariablesFromCss: () =>
      new Set([
        "--axm-shadow-sm",
        "--axm-chart-1",
        "--axm-text-high-token",
        "--axm-surface-card",
        "--axm-border-token",
        "--custom-var",
      ]),
    extractVariableToClassMap: () =>
      new Map([
        ["--axm-shadow-sm", "shadow-sm"],
        ["--axm-text-high-token", "text-strong"],
        ["--axm-surface-card", "surface-card"],
      ]),
    loadColorConfig: () => ({
      groups: [],
    }),
  };
});

beforeAll(() => {
  resetHardcodedCache();
  resetRawTokensCache();
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

describe("no-hardcoded-colors", () => {
  ruleTester.run("no-hardcoded-colors", noHardcodedColors, {
    valid: [
      { code: '<div style={{ color: "var(--text-subtle)" }}></div>' },
      { code: '<div style={{ backgroundColor: "transparent" }}></div>' },
      { code: '<div className="bg-red-500"></div>' },
      { code: '<div style={{ width: "100px" }}></div>' },
    ],
    invalid: [
      {
        code: '<div style={{ color: "#fff" }}></div>',
        errors: [
          {
            messageId: "noHardcodedColors",
            suggestions: [
              {
                desc: "Replace with var(--axm-text-high-token)",
                output:
                  '<div style={{ color: "var(--axm-text-high-token)" }}></div>',
              },
            ],
          },
        ],
      },
      {
        code: '<div style={{ backgroundColor: "red" }}></div>',
        errors: [
          {
            messageId: "noHardcodedColors",
            suggestions: [
              {
                desc: "Replace with var(--axm-surface-card)",
                output:
                  '<div style={{ backgroundColor: "var(--axm-surface-card)" }}></div>',
              },
            ],
          },
        ],
      },
      {
        code: '<div style={{ borderColor: "rgb(0,0,0)" }}></div>',
        errors: [
          {
            messageId: "noHardcodedColors",
            suggestions: [
              {
                desc: "Replace with var(--axm-border-token)",
                output:
                  '<div style={{ borderColor: "var(--axm-border-token)" }}></div>',
              },
            ],
          },
        ],
      },
      {
        code: '<div style={{ fill: "blue" }}></div>',
        errors: [
          {
            messageId: "noHardcodedColors",
            suggestions: [
              {
                desc: "Replace with var(--axm-surface-card)",
                output:
                  '<div style={{ fill: "var(--axm-surface-card)" }}></div>',
              },
            ],
          },
        ],
      },
      {
        code: '<div style={{ stroke: "rgba(255, 0, 0, 0.5)" }}></div>',
        errors: [
          {
            messageId: "noHardcodedColors",
            suggestions: [
              {
                desc: "Replace with var(--axm-text-high-token)",
                output:
                  '<div style={{ stroke: "var(--axm-text-high-token)" }}></div>',
              },
            ],
          },
        ],
      },
    ],
  });
});

describe("no-raw-tokens", () => {
  ruleTester.run("no-raw-tokens", noRawTokens, {
    valid: [
      { code: 'const color = "var(--axm-chart-1)";' },
      { code: 'const color = "var(--custom-var)";' },
    ],
    invalid: [
      {
        code: 'const color = "var(--scale-gray-500)";',
        errors: [{ messageId: "internalToken" }],
      },
      {
        code: 'const color = "var(--axm-non-existent)";',
        errors: [{ messageId: "unknownTokenNoSuggestion" }],
      },
      {
        code: 'const color = "var(--axm-shadow-smm)";',
        errors: [
          {
            messageId: "unknownToken",
            suggestions: [
              {
                desc: "Replace with --axm-shadow-sm",
                output: 'const color = "var(--axm-shadow-sm)";',
              },
            ],
          },
        ],
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
      {
        code: 'const color = "var(--axm-text-high-token)";',
        errors: [
          {
            messageId: "preferClass",
            data: { name: "--axm-text-high-token", className: "text-strong" },
          },
        ],
      },
      {
        code: 'const color = "var(--axm-surface-card)";',
        errors: [
          {
            messageId: "preferClass",
            data: { name: "--axm-surface-card", className: "surface-card" },
          },
        ],
      },
      {
        code: 'const style = { boxShadow: "var(--axm-shadow-sm)" };',
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

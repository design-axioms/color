import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { beforeAll, describe, it, vi } from "vitest";
import * as vueParser from "vue-eslint-parser";
import {
  noHardcodedColors,
  resetCache,
} from "../src/rules/no-hardcoded-colors";

// Mock findThemeCss to return null so we don't get suggestions from real CSS
vi.mock("../src/utils/load-theme", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/utils/load-theme")>();
  return {
    ...actual,
    findThemeCss: () => null,
  };
});

RuleTester.describe = describe;
RuleTester.it = it;

beforeAll(() => {
  resetCache();
});

const ruleTester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

describe("no-hardcoded-colors (Vue Smoke)", () => {
  ruleTester.run("no-hardcoded-colors", noHardcodedColors, {
    valid: [],
    invalid: [
      {
        code: `
<template>
  <div style="color: red">Hello World</div>
</template>
        `,
        filename: "test.vue",
        errors: [
          {
            messageId: "noHardcodedColors",
            data: { value: "red" },
          },
        ],
      },
    ],
  });
});

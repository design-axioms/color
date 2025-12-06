import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as emberParser from "ember-eslint-parser";
import { beforeAll, describe, it, vi } from "vitest";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    parser: emberParser as any,
    parserOptions: {
      parser: tsParser,
    },
  },
});

describe("no-hardcoded-colors (GTS Smoke)", () => {
  ruleTester.run("no-hardcoded-colors", noHardcodedColors, {
    valid: [],
    invalid: [
      {
        code: `
<template>
  <div style="color: red">Hello World</div>
</template>
        `,
        filename: "test.gts",
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

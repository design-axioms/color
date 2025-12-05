import * as tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as svelteParser from "svelte-eslint-parser";
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
    parser: svelteParser,
    parserOptions: {
      parser: tsParser,
    },
  },
});

describe("no-hardcoded-colors (Svelte Smoke)", () => {
  // This test confirms we can parse Svelte files
  // The rule currently won't catch anything because it targets JSXAttribute
  // TODO: Update the rule to support Svelte/HTML style attributes, then move this to 'invalid'
  ruleTester.run("no-hardcoded-colors", noHardcodedColors, {
    valid: [],
    invalid: [
      {
        code: `
<script>
  let name = 'world';
</script>

<div style="color: red">Hello {name}!</div>
        `,
        filename: "test.svelte",
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

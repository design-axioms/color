import { TSESLint } from "@typescript-eslint/utils";
import { noHardcodedColors } from "./rules/no-hardcoded-colors";
import { noRawTokens } from "./rules/no-raw-tokens";

const plugin: TSESLint.Linter.Plugin = {
  meta: {
    name: "@axiomatic-design/eslint-plugin",
    version: "0.1.0",
  },
  rules: {
    "no-hardcoded-colors": noHardcodedColors,
    "no-raw-tokens": noRawTokens,
  },
};

export = plugin;

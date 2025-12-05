import { TSESLint } from "@typescript-eslint/utils";
import {
  ColorConfig,
  extractVariablesFromCss,
  extractVariableToClassMap,
  findColorConfig,
  findThemeCss,
  findUtilitiesCss,
  loadColorConfig,
} from "../utils/load-theme";
import { findClosestMatch } from "../utils/string-distance";

// Cache
let allowedVariables: Set<string> | null = null;
let variableToClassMap: Map<string, string> | null = null;
let colorConfig: ColorConfig | null = null;

export function resetCache(): void {
  allowedVariables = null;
  variableToClassMap = null;
  colorConfig = null;
}

export const noRawTokens: TSESLint.RuleModule<string> = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow usage of internal or non-existent tokens" },
    messages: {
      unknownToken:
        'The token "{{name}}" does not exist in the generated theme. Did you mean "{{suggestion}}"?',
      unknownTokenNoSuggestion:
        'The token "{{name}}" does not exist in the generated theme.',
      internalToken:
        'The token "{{name}}" is internal. Use a semantic token instead.',
      preferClass:
        'Prefer using the utility class "{{className}}" instead of the raw token "{{name}}".',
      useClassForSurface:
        'Surfaces should be applied via utility classes (e.g. ".surface-{{slug}}"), not variables.',
    },
    hasSuggestions: true,
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    if (!allowedVariables) {
      const cwd = context.cwd;
      const cssPath = findThemeCss(cwd);
      if (cssPath) {
        allowedVariables = extractVariablesFromCss(cssPath);
      } else {
        allowedVariables = new Set();
      }

      const utilPath = findUtilitiesCss(cwd);
      if (utilPath) {
        variableToClassMap = extractVariableToClassMap(utilPath);
      } else {
        variableToClassMap = new Map();
      }

      const configPath = findColorConfig(cwd);
      if (configPath) {
        colorConfig = loadColorConfig(configPath);
      }
    }

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;

        const regex = /var\((--[a-zA-Z0-9-]+)\)/g;
        let match;
        while ((match = regex.exec(node.value)) !== null) {
          const varName = match[1];
          const quoteOffset = 1;
          const start = node.range[0] + quoteOffset + match.index + 4;
          const end = start + varName.length;

          // Check 1: Is it a banned prefix?
          if (
            varName.startsWith("--scale-") ||
            varName.startsWith("--primitive-") ||
            varName.startsWith("--color-") ||
            varName.startsWith("--local-") ||
            varName.startsWith("--base-") ||
            varName.startsWith("--context-") ||
            varName.startsWith("--surface-light-") ||
            varName.startsWith("--surface-dark-") ||
            varName.includes("-source")
          ) {
            context.report({
              node,
              messageId: "internalToken",
              data: { name: varName },
            });
            continue;
          }

          // Check 2: Is it a surface token that should be a class?
          if (varName.startsWith("--surface-") && colorConfig) {
            const slug = varName.replace("--surface-", "");
            // Flatten groups to find surface
            const surfaces =
              colorConfig.groups?.flatMap((g) => g.surfaces || []) || [];
            const surface = surfaces.find((s) => s.slug === slug);

            if (surface) {
              context.report({
                node,
                messageId: "useClassForSurface",
                data: { slug },
              });
              continue;
            }
          }

          // Check 3: Is it a token that doesn't exist?
          if (allowedVariables && allowedVariables.size > 0) {
            if (!allowedVariables.has(varName)) {
              const suggestion = findClosestMatch(varName, allowedVariables);
              if (suggestion) {
                context.report({
                  node,
                  messageId: "unknownToken",
                  data: { name: varName, suggestion },
                  suggest: [
                    {
                      desc: `Replace with {{suggestion}}`,
                      data: { suggestion },
                      fix(fixer) {
                        return fixer.replaceTextRange([start, end], suggestion);
                      },
                    },
                  ],
                });
              } else {
                context.report({
                  node,
                  messageId: "unknownTokenNoSuggestion",
                  data: { name: varName },
                });
              }
            } else {
              // Check 4: Does a utility class exist for this token?
              if (variableToClassMap && variableToClassMap.has(varName)) {
                const className = variableToClassMap.get(varName);
                context.report({
                  node,
                  messageId: "preferClass",
                  data: { name: varName, className },
                });
              }
            }
          }
        }
      },
    };
  },
};

import { AST_NODE_TYPES, TSESLint, TSESTree } from "@typescript-eslint/utils";
import { extractVariablesFromCss, findThemeCss } from "../utils/load-theme";

// Minimal interfaces for non-standard nodes
interface SvelteLiteral extends TSESTree.BaseNode {
  type: "SvelteLiteral";
  value: string;
}

interface SvelteAttribute extends TSESTree.BaseNode {
  key: { name: string };
  value: (SvelteLiteral | TSESTree.BaseNode)[];
}

interface VLiteral extends TSESTree.BaseNode {
  type: "VLiteral";
  value: string;
}

interface VAttribute extends TSESTree.BaseNode {
  key: { name: string };
  value: VLiteral | null;
}

interface GlimmerTextNode extends TSESTree.BaseNode {
  type: "GlimmerTextNode";
  chars: string;
}

interface GlimmerAttrNode extends TSESTree.BaseNode {
  name: string;
  value: TSESTree.BaseNode;
}

interface VueParserServices {
  defineTemplateBodyVisitor(
    templateBodyVisitor: Record<string, unknown>,
    scriptVisitor: Record<string, unknown>,
  ): Record<string, unknown>;
}

const COLOR_PROPERTIES = new Set([
  "color",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "fill",
  "stroke",
]);

const HEX_REGEX = /^#([0-9A-F]{3}){1,2}$/i;
const RGB_REGEX = /^rgba?\(.*\)$/i;
const HSL_REGEX = /^hsla?\(.*\)$/i;
// Basic set of named colors to start with
const NAMED_COLORS = new Set([
  "black",
  "silver",
  "gray",
  "white",
  "maroon",
  "red",
  "purple",
  "fuchsia",
  "green",
  "lime",
  "olive",
  "yellow",
  "navy",
  "blue",
  "teal",
  "aqua",
  "orange",
  "aliceblue",
  "antiquewhite",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "blanchedalmond",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkgrey",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "greenyellow",
  "grey",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "limegreen",
  "linen",
  "magenta",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "oldlace",
  "olive",
  "olivedrab",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "whitesmoke",
  "yellowgreen",
  "rebeccapurple",
]);

// Cache the allowed variables
let allowedVariables: Set<string> | null = null;

export function resetCache(): void {
  allowedVariables = null;
}

function isColor(value: string): boolean {
  return (
    HEX_REGEX.test(value) ||
    RGB_REGEX.test(value) ||
    HSL_REGEX.test(value) ||
    NAMED_COLORS.has(value.toLowerCase())
  );
}

function getSuggestionsForProperty(
  propName: string,
  tokens: Set<string>,
): string[] {
  const suggestions: string[] = [];
  const lowerProp = propName.toLowerCase();

  // Heuristic: Filter tokens based on property name
  for (const token of tokens) {
    if (lowerProp.includes("background") || lowerProp.includes("fill")) {
      if (token.includes("surface") || token.includes("bg"))
        suggestions.push(token);
    } else if (lowerProp.includes("border") || lowerProp.includes("outline")) {
      if (token.includes("border") || token.includes("ring"))
        suggestions.push(token);
    } else if (
      lowerProp.includes("text") ||
      lowerProp.includes("color") ||
      lowerProp.includes("stroke")
    ) {
      if (token.includes("text") || token.includes("fg"))
        suggestions.push(token);
    }
  }

  // If no specific matches, return generic ones or empty
  return suggestions.slice(0, 3); // Limit to top 3
}

export const noHardcodedColors: TSESLint.RuleModule<string> = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow hardcoded colors in JSX styles",
    },
    messages: {
      noHardcodedColors:
        'Avoid hardcoded colors like "{{value}}". Use a system token instead.',
    },
    hasSuggestions: true,
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    if (!allowedVariables) {
      const cssPath = findThemeCss(context.cwd);
      if (cssPath) {
        allowedVariables = extractVariablesFromCss(cssPath);
      } else {
        allowedVariables = new Set();
      }
    }

    const visitors = {
      // Handle Svelte/HTML style attributes: style="color: red"
      'SvelteAttribute[key.name="style"]'(node: SvelteAttribute) {
        for (const val of node.value) {
          if (val.type === "SvelteLiteral" && typeof val.value === "string") {
            const styleString = val.value;
            // Simple CSS parser: split by ; then :
            const declarations = styleString.split(";");
            let currentOffset = 0;

            for (const decl of declarations) {
              const colonIndex = decl.indexOf(":");
              if (colonIndex !== -1) {
                const prop = decl.substring(0, colonIndex).trim();
                const valuePart = decl.substring(colonIndex + 1);
                const value = valuePart.trim();

                // Map CSS property to JS property name for COLOR_PROPERTIES check
                // e.g. background-color -> backgroundColor
                const camelProp = prop.replace(/-([a-z])/g, (g) =>
                  g[1].toUpperCase(),
                );

                if (
                  COLOR_PROPERTIES.has(camelProp) ||
                  prop === "color" ||
                  prop === "fill" ||
                  prop === "stroke"
                ) {
                  if (isColor(value)) {
                    // Calculate location
                    // We need the index of the value in the original string
                    const declStart = styleString.indexOf(decl, currentOffset);
                    const valueStart =
                      styleString.indexOf(valuePart, declStart) +
                      valuePart.indexOf(value);

                    // Create a range for the value
                    const start = val.range[0] + valueStart;
                    const end = start + value.length;

                    const suggestions = allowedVariables
                      ? getSuggestionsForProperty(camelProp, allowedVariables)
                      : [];
                    const suggest = suggestions.map((token) => ({
                      desc: `Replace with var(${token})`,
                      fix(fixer: TSESLint.RuleFixer) {
                        return fixer.replaceTextRange(
                          [start, end],
                          `var(${token})`,
                        );
                      },
                    }));

                    context.report({
                      loc: {
                        start: context.sourceCode.getLocFromIndex(start),
                        end: context.sourceCode.getLocFromIndex(end),
                      },
                      messageId: "noHardcodedColors",
                      data: {
                        value: value,
                      },
                      suggest,
                    });
                  }
                }
              }
              currentOffset += decl.length + 1; // +1 for ;
            }
          }
        }
      },

      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (
          node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
          node.name.name !== "style"
        )
          return;
        if (
          !node.value ||
          node.value.type !== AST_NODE_TYPES.JSXExpressionContainer
        )
          return;
        if (node.value.expression.type !== AST_NODE_TYPES.ObjectExpression)
          return;

        for (const prop of node.value.expression.properties) {
          if (prop.type !== AST_NODE_TYPES.Property) continue;
          if (prop.key.type !== AST_NODE_TYPES.Identifier) continue;
          if (!COLOR_PROPERTIES.has(prop.key.name)) continue;

          if (
            prop.value.type === AST_NODE_TYPES.Literal &&
            typeof prop.value.value === "string"
          ) {
            if (isColor(prop.value.value)) {
              const suggestions = allowedVariables
                ? getSuggestionsForProperty(prop.key.name, allowedVariables)
                : [];
              const suggest = suggestions.map((token) => ({
                desc: `Replace with var(${token})`,
                fix(fixer: TSESLint.RuleFixer) {
                  return fixer.replaceText(prop.value, `"var(${token})"`);
                },
              }));

              context.report({
                node: prop.value,
                messageId: "noHardcodedColors",
                data: {
                  value: prop.value.value,
                },
                suggest,
              });
            }
          }
        }
      },
    };

    // Vue Template Visitor
    const vueVisitors = {
      'VAttribute[key.name="style"]'(node: VAttribute) {
        const styleString = node.value.value;
        // Simple CSS parser: split by ; then :
        const declarations = styleString.split(";");
        let currentOffset = 0;

        for (const decl of declarations) {
          const colonIndex = decl.indexOf(":");
          if (colonIndex !== -1) {
            const prop = decl.substring(0, colonIndex).trim();
            const valuePart = decl.substring(colonIndex + 1);
            const value = valuePart.trim();

            const camelProp = prop.replace(/-([a-z])/g, (g) =>
              g[1].toUpperCase(),
            );

            if (
              COLOR_PROPERTIES.has(camelProp) ||
              prop === "color" ||
              prop === "fill" ||
              prop === "stroke"
            ) {
              if (isColor(value)) {
                // Calculate location
                const declStart = styleString.indexOf(decl, currentOffset);
                const valueStart =
                  styleString.indexOf(valuePart, declStart) +
                  valuePart.indexOf(value);

                // Create a range for the value
                // node.value.range[0] includes the opening quote, so we add 1
                const start = node.value.range[0] + 1 + valueStart;
                const end = start + value.length;

                const suggestions = allowedVariables
                  ? getSuggestionsForProperty(camelProp, allowedVariables)
                  : [];
                const suggest = suggestions.map((token) => ({
                  desc: `Replace with var(${token})`,
                  fix(fixer: TSESLint.RuleFixer) {
                    return fixer.replaceTextRange(
                      [start, end],
                      `var(${token})`,
                    );
                  },
                }));

                context.report({
                  loc: {
                    start: context.sourceCode.getLocFromIndex(start),
                    end: context.sourceCode.getLocFromIndex(end),
                  },
                  messageId: "noHardcodedColors",
                  data: {
                    value: value,
                  },
                  suggest,
                });
              }
            }
          }
          currentOffset += decl.length + 1; // +1 for ;
        }
      },
    };

    // Glimmer/Ember Template Visitor
    const glimmerVisitors = {
      'GlimmerAttrNode[name="style"]'(node: GlimmerAttrNode) {
        if ((node.value.type as string) !== "GlimmerTextNode") return;

        const styleString = (node.value as GlimmerTextNode).chars;
        // Simple CSS parser: split by ; then :
        const declarations = styleString.split(";");
        let currentOffset = 0;

        for (const decl of declarations) {
          const colonIndex = decl.indexOf(":");
          if (colonIndex !== -1) {
            const prop = decl.substring(0, colonIndex).trim();
            const valuePart = decl.substring(colonIndex + 1);
            const value = valuePart.trim();

            const camelProp = prop.replace(/-([a-z])/g, (g) =>
              g[1].toUpperCase(),
            );

            if (
              COLOR_PROPERTIES.has(camelProp) ||
              prop === "color" ||
              prop === "fill" ||
              prop === "stroke"
            ) {
              if (isColor(value)) {
                // Calculate location
                const declStart = styleString.indexOf(decl, currentOffset);
                const valueStart =
                  styleString.indexOf(valuePart, declStart) +
                  valuePart.indexOf(value);

                // Create a range for the value
                // node.value.range[0] includes the opening quote, so we add 1
                const start = node.value.range[0] + 1 + valueStart;
                const end = start + value.length;

                const suggestions = allowedVariables
                  ? getSuggestionsForProperty(camelProp, allowedVariables)
                  : [];
                const suggest = suggestions.map((token) => ({
                  desc: `Replace with var(${token})`,
                  fix(fixer: TSESLint.RuleFixer) {
                    return fixer.replaceTextRange(
                      [start, end],
                      `var(${token})`,
                    );
                  },
                }));

                context.report({
                  loc: {
                    start: context.sourceCode.getLocFromIndex(start),
                    end: context.sourceCode.getLocFromIndex(end),
                  },
                  messageId: "noHardcodedColors",
                  data: {
                    value: value,
                  },
                  suggest,
                });
              }
            }
          }
          currentOffset += decl.length + 1; // +1 for ;
        }
      },
    };

    // If we are in a Vue environment, register the template visitor
    const parserServices = context.sourceCode.parserServices as unknown as
      | VueParserServices
      | undefined;
    if (parserServices?.defineTemplateBodyVisitor) {
      return parserServices.defineTemplateBodyVisitor(vueVisitors, visitors);
    }

    return {
      ...visitors,
      ...vueVisitors, // Also include Vue visitors in case the parser handles them directly (some configs do)
      ...glimmerVisitors,
    };
  },
};

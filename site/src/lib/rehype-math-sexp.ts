/* eslint-disable */
import { h } from "hastscript";
import { visit } from "unist-util-visit";

const ENTITIES: Record<string, string> = {
  alpha: "𝛼",
  beta: "𝛽",
  gamma: "𝛾",
  Gamma: "Γ",
  delta: "𝛿",
  Delta: "Δ",
  epsilon: "𝜖",
  zeta: "𝜁",
  eta: "𝜂",
  theta: "𝜃",
  iota: "𝜄",
  kappa: "𝜅",
  lambda: "𝜆",
  mu: "𝜇",
  nu: "𝜈",
  xi: "𝜉",
  pi: "𝜋",
  rho: "𝜌",
  sigma: "𝜎",
  Sigma: "Σ",
  tau: "𝜏",
  phi: "𝜙",
  Phi: "Φ",
  chi: "𝜒",
  psi: "𝜓",
  Psi: "Ψ",
  omega: "𝜔",
  Omega: "Ω",
  times: "×",
  cdot: "⋅",
  in: "∈",
  to: "→",
  approx: "≈",
  le: "≤",
  ge: "≥",
  infinity: "∞",
  empty: "∅",
  union: "∪",
  intersect: "∩",
  Voice: "𝒱",
};

/**
 * S-Expression Parser
 * Parses a string like "(row (sup x 2))" into a nested array structure.
 * Returns: [['row', ['sup', 'x', '2']]] (Array of top-level expressions)
 */
function parseSExp(input: string): any[] {
  const tokens = input
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .replace(/,/g, " , ")
    .trim()
    .split(/\s+/);

  let position = 0;

  function walk(): any {
    const token = tokens[position++];

    if (token === "(") {
      const node = [];
      while (tokens[position] !== ")" && position < tokens.length) {
        node.push(walk());
      }
      position++; // Skip ')'
      return node;
    }

    if (token === ")") {
      throw new Error("Unexpected )");
    }

    return token;
  }

  const ast = [];
  while (position < tokens.length) {
    const node = walk();
    if (node !== undefined && node !== "") {
      ast.push(node);
    }
  }
  return ast;
}

/**
 * Transformer
 * Converts S-Exp AST to HAST nodes
 */
function transform(node: any): any {
  // 1. ATOMS
  if (!Array.isArray(node)) {
    // String literals
    if (node.startsWith('"') && node.endsWith('"')) {
      return h("mtext", node.slice(1, -1));
    }
    // Numbers
    if (/^-?\d+(\.\d+)?$/.test(node)) {
      return h("mn", node);
    }
    // Operators
    if (/^[+\-=→⋅\(\)∈⟨⟩,]+$/.test(node)) {
      return h("mo", node);
    }
    // Named Entities
    if (ENTITIES[node]) {
      return h("mi", ENTITIES[node]);
    }
    // Identifiers (default)
    return h("mi", node);
  }

  // 2. LISTS
  const [head, ...args] = node;
  const attributes: any = {};

  // Check for attribute map: (tag {:key "val"} ...)
  if (
    args.length > 0 &&
    typeof args[0] === "string" &&
    args[0].startsWith("{")
  ) {
    const attrString = args.shift();
    try {
      const inner = attrString.slice(1, -1).trim();
      if (inner.length > 0) {
        const pairs = inner.match(/:[\w-]+\s+"[^"]+"/g);
        if (pairs) {
          pairs.forEach((pair: string) => {
            const [k, v] = pair.split(/\s+(?=")/);
            const key = k.replace(":", "");
            const val = v.slice(1, -1);
            attributes[key] = val;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parse attributes:", attrString, e);
    }
  }

  const children = args.map(transform);

  switch (head) {
    case "math":
      return h("math", { display: "block", ...attributes }, children);
    case "row":
      return h("mrow", attributes, children);
    case "frac":
      return h("mfrac", attributes, children);
    case "sqrt":
      return h("msqrt", attributes, children);
    case "root":
      return h("mroot", attributes, children);
    case "sup":
      return h("msup", attributes, children);
    case "sub":
      return h("msub", attributes, children);
    case "subsup":
      return h("msubsup", attributes, children);
    case "over":
      return h("mover", attributes, children);
    case "under":
      return h("munder", attributes, children);
    case "underover":
      return h("munderover", attributes, children);
    case "table":
      if (attributes["col-gap"]) {
        attributes["columnspacing"] = attributes["col-gap"];
        delete attributes["col-gap"];
      }
      return h("mtable", attributes, children);
    case "tr":
      return h("mtr", attributes, children);
    case "td":
      return h("mtd", attributes, children);
    case "tdr":
      return h(
        "mtd",
        {
          ...attributes,
          style: `text-align: right; ${attributes.style || ""}`,
        },
        children,
      );
    case "tdc":
      return h(
        "mtd",
        {
          ...attributes,
          style: `text-align: center; ${attributes.style || ""}`,
        },
        children,
      );
    case "tdl":
      return h(
        "mtd",
        { ...attributes, style: `text-align: left; ${attributes.style || ""}` },
        children,
      );
    case "style":
      return h("mstyle", attributes, children);
    case "phantom":
      return h("mphantom", attributes, children);
    case "cases":
      return h("mrow", [
        h("mo", "{"),
        h("mtable", { style: "text-align: left;" }, children),
      ]);
    case "fenced":
      return h("mrow", attributes, [
        h("mo", attributes.open || "("),
        ...children,
        h("mo", attributes.close || ")"),
      ]);
    case "abs":
      return h("mrow", attributes, [h("mo", "|"), ...children, h("mo", "|")]);
    case "text":
      return h(
        "mtext",
        attributes,
        args.map((a) => a.replace(/^"|"$/g, "")),
      );
    default:
      // Fallback to mrow if it looks like a list
      return h("mrow", attributes, [transform(head), ...children]);
  }
}

export function rehypeMathSexp() {
  return (tree: any) => {
    visit(tree, "element", (node: any, index, parent: any) => {
      void index;
      const classes = Array.isArray(node.properties?.className)
        ? node.properties.className
        : [];

      const isInline = classes.includes("math-inline");
      const isDisplay = classes.includes("math-display");

      if (isInline || isDisplay) {
        if (parent && parent.tagName === "pre") {
          parent.tagName = "div";
          parent.properties = { ...parent.properties, class: "math-wrapper" };
        }

        const value = node.children
          .filter((c: any) => c.type === "text")
          .map((c: any) => c.value)
          .join("")
          .trim();

        // Heuristic: If it starts with $ or has parens, try parsing.
        // Or just try parsing everything since we control the input.
        if (value && value.startsWith("(")) {
          try {
            const ast = parseSExp(value);
            const children = ast.map(transform);

            const displayMode = isDisplay ? "block" : undefined;

            // Always wrap top-level children in an mrow to ensure they stay on one line
            // regardless of the container's display mode.
            const mathNode = h("math", { display: displayMode }, [
              h("mrow", children),
            ]);

            node.tagName = mathNode.tagName;
            node.properties = mathNode.properties;
            node.children = mathNode.children;

            // Remove classes to prevent other plugins (like rehype-katex) from processing this
            node.properties.className = [];
          } catch (e) {
            console.error("S-Exp Parse Error:", e);
          }
        }
      }
    });
  };
}

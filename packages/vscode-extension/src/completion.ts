import * as vscode from "vscode";
import Parser from "web-tree-sitter";
import { TreeSitterParser } from "./parser";
import { TOKENS } from "./tokens";

const QUERIES: Record<string, string> = {
  html: `(attribute (attribute_name) @attr_name (#eq? @attr_name "class") (quoted_attribute_value (attribute_value) @class_value))`,
  javascriptreact: `(jsx_attribute (property_identifier) @attr_name (#match? @attr_name "^(className|class)$") (string (string_fragment) @class_value))`,
  typescriptreact: `(jsx_attribute (property_identifier) @attr_name (#match? @attr_name "^(className|class)$") (string (string_fragment) @class_value))`,
  vue: `(attribute (attribute_name) @attr_name (#eq? @attr_name "class") (quoted_attribute_value (attribute_value) @class_value))`,
  // Svelte/Astro fallback to HTML query if using HTML parser, or specific if using their parser
  svelte: `(attribute (attribute_name) @attr_name (#eq? @attr_name "class") (quoted_attribute_value (attribute_value) @class_value))`,
};

export class AxiomaticCompletionProvider
  implements vscode.CompletionItemProvider
{
  constructor(private parser: TreeSitterParser) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const parser = await this.parser.getParser(document.languageId);
    if (!parser) {
      return undefined;
    }

    const text = document.getText();
    const tree = parser.parse(text);
    const queryStr = QUERIES[document.languageId] || QUERIES["html"]; // Default to HTML query

    if (!queryStr) {
      return undefined;
    }

    let query: Parser.Query;
    try {
      query = parser.getLanguage().query(queryStr);
    } catch (e) {
      console.error(`Invalid query for ${document.languageId}:`, e);
      return undefined;
    }

    const captures = query.captures(tree.rootNode);

    // Find if cursor is inside a captured node
    const cursorIndex = document.offsetAt(position);

    const hit = captures.find((c) => {
      if (c.name !== "class_value") return false;
      return c.node.startIndex <= cursorIndex && c.node.endIndex >= cursorIndex;
    });

    if (hit) {
      return TOKENS.map((t) => {
        const item = new vscode.CompletionItem(
          t,
          vscode.CompletionItemKind.Color,
        );
        item.detail = "Axiomatic Color";
        return item;
      });
    }

    return undefined;
  }
}

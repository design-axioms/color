import * as vscode from "vscode";
import colorMapData from "./color-map.json";
import { TreeSitterParser } from "./parser";

const colorMap = colorMapData as Record<string, string>;

const QUERIES: Record<string, string> = {
  html: `(attribute (attribute_name) @attr_name (#eq? @attr_name "class") (quoted_attribute_value (attribute_value) @class_value))`,
  javascriptreact: `(jsx_attribute (property_identifier) @attr_name (#match? @attr_name "^(className|class)$") (string (string_fragment) @class_value))`,
  typescriptreact: `(jsx_attribute (property_identifier) @attr_name (#match? @attr_name "^(className|class)$") (string (string_fragment) @class_value))`,
  vue: `(attribute (attribute_name) @attr_name (#eq? @attr_name "class") (quoted_attribute_value (attribute_value) @class_value))`,
  svelte: `(attribute (attribute_name) @attr_name (#eq? @attr_name "class") (quoted_attribute_value (attribute_value) @class_value))`,
};

export class AxiomaticDecorator {
  private decorationTypes: Map<string, vscode.TextEditorDecorationType> =
    new Map();
  private activeEditor: vscode.TextEditor | undefined;
  private timeout: NodeJS.Timeout | undefined;

  constructor(private parser: TreeSitterParser) {
    this.activeEditor = vscode.window.activeTextEditor;
  }

  public activate(context: vscode.ExtensionContext): void {
    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        this.activeEditor = editor;
        if (editor) {
          this.triggerUpdate();
        }
      },
      null,
      context.subscriptions,
    );

    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (
          this.activeEditor &&
          event.document === this.activeEditor.document
        ) {
          this.triggerUpdate();
        }
      },
      null,
      context.subscriptions,
    );

    if (this.activeEditor) {
      this.triggerUpdate();
    }
  }

  private triggerUpdate(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.timeout = setTimeout(() => {
      void this.updateDecorations();
    }, 500);
  }

  private async updateDecorations(): Promise<void> {
    if (!this.activeEditor) return;
    const document = this.activeEditor.document;
    const parser = await this.parser.getParser(document.languageId);
    if (!parser) return;

    const text = document.getText();
    const tree = parser.parse(text);
    const queryStr = QUERIES[document.languageId] || QUERIES["html"];
    if (!queryStr) return;

    let query;
    try {
      query = parser.getLanguage().query(queryStr);
    } catch {
      return;
    }

    const captures = query.captures(tree.rootNode);
    const decorations: Map<string, vscode.Range[]> = new Map();

    captures.forEach((c) => {
      if (c.name !== "class_value") return;
      const classNames = c.node.text.split(/\s+/);
      const currentOffset = c.node.startIndex;

      classNames.forEach((className) => {
        if (colorMap[className]) {
          const color = colorMap[className];
          // Calculate range for this specific class name
          // This is a simplification; ideally we'd map the exact position
          // But since we split by space, we need to find the index in the node text
          const index = c.node.text.indexOf(
            className,
            currentOffset - c.node.startIndex,
          );
          if (index !== -1) {
            const startPos = document.positionAt(c.node.startIndex + index);
            const endPos = document.positionAt(
              c.node.startIndex + index + className.length,
            );
            const range = new vscode.Range(startPos, endPos);

            if (!decorations.has(color)) {
              decorations.set(color, []);
            }
            decorations.get(color)?.push(range);
          }
        }
        // Advance offset? No, indexOf handles it if we are careful, but duplicates in same string are tricky.
        // For MVP, we just highlight.
      });
    });

    // Clear old decorations
    this.decorationTypes.forEach((d) => {
      d.dispose();
    });
    this.decorationTypes.clear();

    // Apply new decorations
    decorations.forEach((ranges, color) => {
      const decorationType = vscode.window.createTextEditorDecorationType({
        before: {
          contentText: " ",
          margin: "0 4px 0 0",
          width: "10px",
          height: "10px",
          backgroundColor: color,
          border: "1px solid rgba(128, 128, 128, 0.5)",
        },
      });
      this.decorationTypes.set(color, decorationType);
      this.activeEditor?.setDecorations(decorationType, ranges);
    });
  }
}

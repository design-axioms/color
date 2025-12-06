import * as path from "path";
import * as vscode from "vscode";
import Parser from "web-tree-sitter";

const GRAMMARS = {
  html: "tree-sitter-html.wasm",
  css: "tree-sitter-css.wasm",
  javascript: "tree-sitter-javascript.wasm",
  typescript: "tree-sitter-typescript.wasm",
  javascriptreact: "tree-sitter-tsx.wasm",
  typescriptreact: "tree-sitter-tsx.wasm",
  vue: "tree-sitter-vue.wasm",
  // 'svelte': 'tree-sitter-svelte.wasm', // Not available yet
  // 'astro': 'tree-sitter-astro.wasm', // Not available yet
};

export class TreeSitterParser {
  private parsers: Map<string, Parser> = new Map();
  private languages: Map<string, Parser.Language> = new Map();
  private initialized = false;

  constructor(private context: vscode.ExtensionContext) {}

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await Parser.init({
        locateFile: (scriptName: string) => {
          return path.join(this.context.extensionPath, "grammars", scriptName);
        },
      });
      this.initialized = true;
      console.log("Tree-sitter initialized");
    } catch (e) {
      console.error("Failed to initialize tree-sitter:", e);
    }
  }

  async getParser(languageId: string): Promise<Parser | undefined> {
    if (!this.initialized) await this.init();

    if (this.parsers.has(languageId)) {
      return this.parsers.get(languageId);
    }

    const wasmFile = GRAMMARS[languageId as keyof typeof GRAMMARS];
    if (!wasmFile) {
      // Fallback for svelte/astro to html for now if needed, or just return undefined
      if (languageId === "svelte" || languageId === "astro") {
        // return this.getParser('html'); // Optional fallback
      }
      return undefined;
    }

    try {
      const wasmPath = path.join(
        this.context.extensionPath,
        "grammars",
        wasmFile,
      );
      const lang = await Parser.Language.load(wasmPath);
      const parser = new Parser();
      parser.setLanguage(lang);

      this.parsers.set(languageId, parser);
      this.languages.set(languageId, lang);
      return parser;
    } catch (e) {
      console.error(`Failed to load grammar for ${languageId}:`, e);
      return undefined;
    }
  }
}

import * as vscode from "vscode";
import { AxiomaticCompletionProvider } from "./completion";
import { AxiomaticDecorator } from "./decorator";
import { TreeSitterParser } from "./parser";

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  console.log("Axiomatic Color extension activating...");

  const parser = new TreeSitterParser(context);
  await parser.init();

  const provider = new AxiomaticCompletionProvider(parser);
  const selector = [
    { language: "html", scheme: "file" },
    { language: "javascriptreact", scheme: "file" },
    { language: "typescriptreact", scheme: "file" },
    { language: "vue", scheme: "file" },
    { language: "svelte", scheme: "file" },
    { language: "astro", scheme: "file" },
  ];

  const disposable = vscode.languages.registerCompletionItemProvider(
    selector,
    provider,
    " ",
    '"',
    "'",
  );
  context.subscriptions.push(disposable);

  const decorator = new AxiomaticDecorator(parser);
  decorator.activate(context);

  console.log("Axiomatic Color extension activated.");
}

export function deactivate(): void {}

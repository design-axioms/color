<script lang="ts">
  import {
    toDTCG,
    toTailwind,
    toTypeScript,
    type SolverConfig,
    type Theme,
  } from "@axiomatic-design/color";
  import { configState } from "../../../lib/state/ConfigState.svelte.ts";

  let format = $state<"css" | "dtcg" | "tailwind" | "typescript">("css");
  let output = $state("");

  // Workaround for linter not picking up .svelte.ts types correctly
  interface IConfigState {
    solved: Theme | null;
    config: SolverConfig;
    css: string;
  }
  const appState = configState as unknown as IConfigState;

  $effect(() => {
    if (!appState.solved) return;

    try {
      switch (format) {
        case "css":
          output = appState.css;
          break;
        case "dtcg":
          output = JSON.stringify(
            toDTCG(appState.solved, appState.config),
            null,
            2,
          );
          break;
        case "tailwind":
          output = JSON.stringify(toTailwind(appState.solved), null, 2);
          break;
        case "typescript":
          output = toTypeScript(appState.solved);
          break;
      }
    } catch (e) {
      output = `Error generating export: ${String(e)}`;
    }
  });

  function copyToClipboard(): void {
    void navigator.clipboard.writeText(output);
  }

  function downloadFile(): void {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    let filename = "theme";
    switch (format) {
      case "css":
        filename += ".css";
        break;
      case "dtcg":
        filename += ".json";
        break;
      case "tailwind":
        filename += ".json";
        break;
      case "typescript":
        filename += ".ts";
        break;
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="export-view">
  <div class="toolbar">
    <div class="tabs">
      <button class:active={format === "css"} onclick={() => (format = "css")}
        >CSS</button
      >
      <button class:active={format === "dtcg"} onclick={() => (format = "dtcg")}
        >DTCG (JSON)</button
      >
      <button
        class:active={format === "tailwind"}
        onclick={() => (format = "tailwind")}>Tailwind</button
      >
      <button
        class:active={format === "typescript"}
        onclick={() => (format = "typescript")}>TypeScript</button
      >
    </div>
    <div class="actions">
      <button class="action-btn" onclick={copyToClipboard}>Copy</button>
      <button class="action-btn" onclick={downloadFile}>Download</button>
    </div>
  </div>
  <div class="editor">
    <pre><code>{output}</code></pre>
  </div>
</div>

<style>
  .export-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--surface-page);
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--computed-border-dec-color);
    background: var(--surface-card);
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.25rem 0.75rem;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--computed-fg-color);
  }

  button:hover {
    background: var(--surface-action);
  }

  button.active {
    background: var(--surface-action);
    border-color: var(--computed-border-int-color);
    font-weight: 500;
  }

  .action-btn {
    background: var(--surface-action);
    border: 1px solid var(--computed-border-dec-color);
  }

  .editor {
    flex: 1;
    overflow: auto;
    padding: 1rem;
    background: var(--surface-page);
  }

  pre {
    margin: 0;
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
  }
</style>

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

<div class="export-view surface-page">
  <div class="toolbar surface-card">
    <div class="tabs">
      <button
        class:active={format === "css"}
        class:surface-action={format === "css"}
        class:text-inverse={format === "css"}
        onclick={() => (format = "css")}
      >
        CSS
      </button>
      <button
        class:active={format === "dtcg"}
        class:surface-action={format === "dtcg"}
        class:text-inverse={format === "dtcg"}
        onclick={() => (format = "dtcg")}
      >
        DTCG (JSON)
      </button>
      <button
        class:active={format === "tailwind"}
        class:surface-action={format === "tailwind"}
        class:text-inverse={format === "tailwind"}
        onclick={() => (format = "tailwind")}
      >
        Tailwind
      </button>
      <button
        class:active={format === "typescript"}
        class:surface-action={format === "typescript"}
        class:text-inverse={format === "typescript"}
        onclick={() => (format = "typescript")}
      >
        TypeScript
      </button>
    </div>
    <div class="actions">
      <button
        class="action-btn surface-action text-inverse preset-bordered"
        onclick={copyToClipboard}
      >
        Copy
      </button>
      <button
        class="action-btn surface-action text-inverse preset-bordered"
        onclick={downloadFile}
      >
        Download
      </button>
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
  }

  .toolbar {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
  }

  .toolbar::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    opacity: 0.12;
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
    color: inherit;
    opacity: 0.8;
  }

  button:hover {
    outline: 1px solid currentColor;
    outline-offset: -1px;
    opacity: 1;
  }

  button.active {
    font-weight: 500;
    opacity: 1;
  }

  .action-btn {
    opacity: 1;
  }

  .editor {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }

  pre {
    margin: 0;
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.875rem;
    white-space: pre-wrap;
  }
</style>

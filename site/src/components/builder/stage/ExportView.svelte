<script lang="ts">
  import {
    toDTCG,
    toTailwind,
    toTypeScript,
    type SolverConfig,
    type Theme,
  } from "@axiomatic-design/color";
  import { configState } from "../../../lib/state/ConfigState.svelte.ts";

  let format = $state<"css" | "dtcg" | "tailwind" | "typescript" | "config">(
    "css",
  );
  let output = $state("");

  // Workaround for linter not picking up .svelte.ts types correctly
  interface IConfigState {
    solved: Theme | null;
    config: SolverConfig;
    css: string;
    exportConfigJson: () => string;
    loadConfigFromFile: (file: File) => Promise<void>;
  }
  const appState = configState as unknown as IConfigState;

  $effect(() => {
    try {
      switch (format) {
        case "config":
          output = appState.exportConfigJson();
          break;
        case "css":
          if (!appState.solved) return;
          output = appState.css;
          break;
        case "dtcg":
          if (!appState.solved) return;
          output = JSON.stringify(
            toDTCG(appState.solved, appState.config),
            null,
            2,
          );
          break;
        case "tailwind":
          if (!appState.solved) return;
          output = JSON.stringify(toTailwind(appState.solved), null, 2);
          break;
        case "typescript":
          if (!appState.solved) return;
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
      case "config":
        filename = "color-config.json";
        break;
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
        class:active={format === "config"}
        class:surface-action={format === "config"}
        class:text-inverse={format === "config"}
        onclick={() => (format = "config")}
      >
        Config (JSON)
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
      {#if format === "config"}
        <label class="action-btn surface-action text-inverse preset-bordered">
          Import
          <input
            data-testid="studio-config-import"
            type="file"
            accept="application/json,.json"
            onchange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) void appState.loadConfigFromFile(file);
              // Allow importing the same file repeatedly.
              e.currentTarget.value = "";
            }}
          />
        </label>
      {/if}
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

  {#if format === "config" && (configState.notice || configState.error)}
    <div class="messages">
      {#if configState.error}
        <div
          class="message surface-status-error text-high"
          data-testid="studio-config-error"
        >
          {configState.error}
        </div>
      {/if}
      {#if configState.notice}
        <div
          class="message surface-status-success text-positive"
          data-testid="studio-config-notice"
        >
          {configState.notice}
        </div>
      {/if}
    </div>
  {/if}

  <div class="editor">
    <pre><code data-testid="studio-export-output">{output}</code></pre>
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

  label.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  label.action-btn input[type="file"] {
    display: none;
  }

  .messages {
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .message {
    white-space: pre-wrap;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid currentColor;
    opacity: 0.9;
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

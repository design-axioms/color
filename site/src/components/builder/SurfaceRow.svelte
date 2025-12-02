<script lang="ts">
  import type { Polarity, SurfaceConfig } from "@axiomatic-design/color/types";
  import { formatHex } from "culori";
  import { getContext } from "svelte";
  import { builderState } from "../../lib/state/BuilderState.svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";
  import ContrastBadge from "./ContrastBadge.svelte";

  interface Props {
    surface: SurfaceConfig;
    groupIndex: number;
    surfaceIndex: number;
  }

  let { surface, groupIndex, surfaceIndex }: Props = $props();

  const themeState = getContext<ThemeState>("theme");
  const configState = getContext<ConfigState>("config");

  let isSelected = $derived(builderState.selectedSurfaceId === surface.slug);
  let isExpanded = $derived(isSelected); // Expand when selected
  let resolvedTheme = $derived(themeState.mode);
  let solved = $derived(configState.solved);

  let colorSpec = $derived(
    solved?.backgrounds.get(surface.slug)?.[resolvedTheme],
  );
  let hexValue = $derived(
    colorSpec ? formatHex({ mode: "oklch", ...colorSpec }) : "",
  );

  function update(updates: Partial<SurfaceConfig>): void {
    configState.updateSurface(groupIndex, surfaceIndex, updates);
  }

  function remove(): void {
    configState.removeSurface(groupIndex, surfaceIndex);
  }

  function handleDragStart(e: DragEvent): void {
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "surface",
          groupIndex,
          surfaceIndex,
        }),
      );
    }
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        try {
          interface DragData {
            type: "group" | "surface";
            groupIndex?: number;
            surfaceIndex?: number;
          }
          const parsed = JSON.parse(data) as DragData;
          if (
            parsed.type === "surface" &&
            typeof parsed.groupIndex === "number" &&
            typeof parsed.surfaceIndex === "number"
          ) {
            // Don't move if dropping on itself
            if (
              parsed.groupIndex === groupIndex &&
              parsed.surfaceIndex === surfaceIndex
            ) {
              return;
            }
            configState.moveSurface(
              parsed.groupIndex,
              parsed.surfaceIndex,
              groupIndex,
              surfaceIndex,
            );
          }
        } catch (e) {
          console.error("Failed to parse drop data", e);
        }
      }
    }
  }

  function copyHex(e: Event): void {
    e.stopPropagation();
    if (hexValue) {
      void navigator.clipboard.writeText(hexValue);
      // Could add a toast here
    }
  }
</script>

<div
  class="surface-row {isSelected ? 'selected' : ''}"
  draggable="true"
  ondragstart={handleDragStart}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  role="treeitem"
  aria-selected={isSelected}
>
  <div class="selection-marker" class:visible={isSelected}></div>
  <div
    class="row-content"
    onclick={() => {
      builderState.selectSurface(isSelected ? null : surface.slug);
    }}
    onkeydown={(e) => {
      if (e.key === "Enter") {
        builderState.selectSurface(isSelected ? null : surface.slug);
      }
    }}
    role="button"
    tabindex="0"
  >
    <span class="drag-handle">⋮⋮</span>

    <span class="text-strong label">
      {surface.label}
    </span>

    <div class="meta-group">
      {#if hexValue}
        <button
          class="hex-badge surface-workspace bordered font-mono text-subtle"
          onclick={copyHex}
          title="Copy Hex"
        >
          {hexValue.toUpperCase()}
        </button>
      {/if}

      {#if surface.override?.light || surface.override?.dark}
        <span title="Has manual overrides" class="override-icon">⚠️</span>
      {/if}

      <ContrastBadge slug={surface.slug} mode={resolvedTheme} {solved} />
    </div>
  </div>

  {#if isExpanded}
    <div class="row-details surface-workspace">
      <!-- Data Density Section -->
      {#if colorSpec}
        <div class="data-grid bordered">
          <div class="data-item">
            <span class="label text-subtle">L</span>
            <span class="value font-mono">{colorSpec.l.toFixed(3)}</span>
          </div>
          <div class="data-item">
            <span class="label text-subtle">C</span>
            <span class="value font-mono">{colorSpec.c.toFixed(3)}</span>
          </div>
          <div class="data-item">
            <span class="label text-subtle">H</span>
            <span class="value font-mono">{colorSpec.h.toFixed(1)}°</span>
          </div>
        </div>
      {/if}

      <div class="form-grid">
        <label>
          <span class="text-subtle">Label</span>
          <input
            type="text"
            class="bordered text-strong"
            value={surface.label}
            oninput={(e) => {
              update({ label: e.currentTarget.value });
            }}
          />
        </label>
        <label>
          <span class="text-subtle">Slug</span>
          <input
            type="text"
            class="bordered text-strong"
            value={surface.slug}
            oninput={(e) => {
              update({ slug: e.currentTarget.value });
            }}
          />
        </label>
        <label>
          <span class="text-subtle">Polarity</span>
          <select
            class="bordered text-strong"
            value={surface.polarity}
            onchange={(e) => {
              update({ polarity: e.currentTarget.value as Polarity });
            }}
          >
            <option value="page">Page</option>
            <option value="inverted">Inverted</option>
          </select>
        </label>
        <label>
          <span class="text-subtle"
            >Target Chroma ({surface.targetChroma ?? 0})</span
          >
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.01"
            value={surface.targetChroma ?? 0}
            oninput={(e) => {
              update({ targetChroma: Number(e.currentTarget.value) });
            }}
          />
        </label>
      </div>

      <!-- Overrides -->
      <div class="overrides-section">
        <span class="section-title text-strong">Overrides</span>
        <div class="override-grid">
          <label>
            <span>Light</span>
            <div class="color-input-group">
              <input
                type="color"
                value={surface.override?.light ?? "#ffffff"}
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      light: e.currentTarget.value,
                    },
                  });
                }}
              />
              <input
                type="text"
                class="bordered font-mono text-strong"
                value={surface.override?.light ?? ""}
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      light: e.currentTarget.value,
                    },
                  });
                }}
                placeholder="#RRGGBB"
              />
            </div>
          </label>
          <label>
            <span>Dark</span>
            <div class="color-input-group">
              <input
                type="color"
                value={surface.override?.dark ?? "#000000"}
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      dark: e.currentTarget.value,
                    },
                  });
                }}
              />
              <input
                type="text"
                class="bordered font-mono text-strong"
                value={surface.override?.dark ?? ""}
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      dark: e.currentTarget.value,
                    },
                  });
                }}
                placeholder="#RRGGBB"
              />
            </div>
          </label>
        </div>
        {#if surface.override?.light || surface.override?.dark}
          <button
            onclick={() => {
              update({ override: undefined });
            }}
            class="clear-button text-subtle"
          >
            Clear Overrides
          </button>
        {/if}
      </div>

      <div class="actions-row">
        <button
          onclick={(e) => {
            e.stopPropagation();
            remove();
          }}
          class="delete-button"
        >
          Delete Surface
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .surface-row {
    position: relative;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: all 0.2s;
    overflow: hidden;
  }

  .surface-row:hover {
    /* background: var(--surface-workspace); */
    /* Use a subtle background on hover if needed, or rely on state-selected */
    background: oklch(from var(--computed-fg-color) l c h / 0.05);
  }

  /* .surface-row.selected handled by state-selected class */

  .selection-marker {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(
      --highlight-ring-color,
      #d946ef
    ); /* Fallback or use computed? */
    opacity: 0;
    transition: opacity 0.2s;
  }

  .selection-marker.visible {
    opacity: 1;
  }

  .row-content {
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .drag-handle {
    color: currentColor;
    opacity: 0.5;
    cursor: grab;
    font-size: 1rem;
  }

  .label {
    flex: 1;
    font-size: 0.9rem;
  }

  .meta-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hex-badge {
    /* background: var(--surface-workspace); */
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.75rem;
    cursor: copy;
  }

  .hex-badge:hover {
    filter: brightness(0.95);
  }

  .override-icon {
    font-size: 0.8rem;
    cursor: help;
  }

  /* Expanded Details */
  .row-details {
    padding: 0.75rem;
    border-top: 1px solid var(--computed-border-dec-color);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    cursor: default;
    /* background: var(--surface-workspace); */
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .data-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .data-item .label {
    font-size: 0.7rem;
  }

  .data-item .value {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-grid label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
  }

  .form-grid input[type="text"],
  .form-grid select {
    padding: 0.4rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .overrides-section {
    border-top: 1px solid var(--computed-border-dec-color);
    padding-top: 0.75rem;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
  }

  .override-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .color-input-group {
    display: flex;
    gap: 0.25rem;
  }

  .color-input-group input[type="color"] {
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  .color-input-group input[type="text"] {
    flex: 1;
    padding: 0.4rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .clear-button {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
  }

  .actions-row {
    display: flex;
    justify-content: flex-end;
  }

  .delete-button {
    color: oklch(
      0.6 0.2 var(--hue-error)
    ); /* This is still manual, but maybe acceptable for now? */
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .delete-button:hover {
    text-decoration: underline;
  }
</style>

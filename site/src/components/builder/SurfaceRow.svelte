<script lang="ts">
  import type { SurfaceConfig } from "@algebraic-systems/color-system/types";
  import { getContext } from "svelte";
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

  let isExpanded = $state(false);
  let resolvedTheme = $derived(themeState.mode);
  let solved = $derived(configState.solved);

  function update(updates: Partial<SurfaceConfig>) {
    configState.updateSurface(groupIndex, surfaceIndex, updates);
  }

  function remove() {
    configState.removeSurface(groupIndex, surfaceIndex);
  }

  function handleDragStart(e: DragEvent) {
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "surface",
          groupIndex,
          surfaceIndex,
        })
      );
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "surface") {
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
              surfaceIndex
            );
          }
        } catch (e) {
          console.error("Failed to parse drop data", e);
        }
      }
    }
  }
</script>

<div
  class="surface-workspace bordered"
  style="border-radius: 6px; overflow: hidden; cursor: grab;"
  draggable="true"
  ondragstart={handleDragStart}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  role="listitem"
>
  <div
    style="padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;"
    onclick={() => (isExpanded = !isExpanded)}
    onkeydown={(e) => e.key === "Enter" && (isExpanded = !isExpanded)}
    role="button"
    tabindex="0"
  >
    <span class="text-subtle" style="cursor: grab;">☰</span>
    <span
      style:transform={isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
      style:transition="transform 0.2s"
    >
      ▶
    </span>
    <span class="text-strong" style="flex: 1;">
      {surface.label}
    </span>
    {#if surface.override?.light || surface.override?.dark}
      <span
        title="Has manual overrides"
        style="font-size: 0.8rem; cursor: help;">⚠️</span
      >
    {/if}
    <ContrastBadge slug={surface.slug} mode={resolvedTheme} {solved} />
    <span class="text-subtle" style="font-size: 0.8rem;">
      {surface.slug}
    </span>
  </div>

  {#if isExpanded}
    <div
      style="padding: 0.75rem; border-top: 1px solid var(--border-subtle-token); display: flex; flex-direction: column; gap: 0.75rem;"
    >
      <label
        class="text-subtle"
        style="display: flex; flex-direction: column; gap: 0.25rem;"
      >
        Label
        <input
          type="text"
          value={surface.label}
          oninput={(e) => update({ label: e.currentTarget.value })}
          style="padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: transparent; color: var(--text-high-token);"
        />
      </label>
      <label
        class="text-subtle"
        style="display: flex; flex-direction: column; gap: 0.25rem;"
      >
        Slug
        <input
          type="text"
          value={surface.slug}
          oninput={(e) => update({ slug: e.currentTarget.value })}
          style="padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: transparent; color: var(--text-high-token);"
        />
      </label>
      <label
        class="text-subtle"
        style="display: flex; flex-direction: column; gap: 0.25rem;"
      >
        Polarity
        <select
          value={surface.polarity}
          onchange={(e) => update({ polarity: e.currentTarget.value as any })}
          style="padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: var(--surface-token); color: var(--text-high-token);"
        >
          <option value="page">Page</option>
          <option value="inverted">Inverted</option>
        </select>
      </label>

      <label
        class="text-subtle"
        style="display: flex; flex-direction: column; gap: 0.25rem;"
      >
        Target Chroma ({surface.targetChroma ?? 0})
        <input
          type="range"
          min="0"
          max="0.4"
          step="0.01"
          value={surface.targetChroma ?? 0}
          oninput={(e) =>
            update({ targetChroma: Number(e.currentTarget.value) })}
          style="width: 100%;"
        />
      </label>

      <!-- Overrides -->
      <div
        style="border-top: 1px solid var(--border-subtle-token); padding-top: 0.75rem; margin-top: 0.5rem;"
      >
        <span
          class="text-strong"
          style="font-size: 0.9rem; display: block; margin-bottom: 0.5rem;"
          >Overrides</span
        >
        <div
          style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;"
        >
          <label
            class="text-subtle"
            style="display: flex; flex-direction: column; gap: 0.25rem;"
          >
            Light Mode
            <div style="display: flex; gap: 0.25rem;">
              <input
                type="color"
                value={surface.override?.light ?? "#ffffff"}
                oninput={(e) =>
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      light: e.currentTarget.value,
                    },
                  })}
                style="height: 30px; width: 30px; padding: 0; border: none; background: none; cursor: pointer;"
              />
              <input
                type="text"
                placeholder="#RRGGBB"
                value={surface.override?.light ?? ""}
                oninput={(e) =>
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      light: e.currentTarget.value,
                    },
                  })}
                style="flex: 1; padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: transparent; color: var(--text-high-token); font-family: monospace;"
              />
            </div>
          </label>
          <label
            class="text-subtle"
            style="display: flex; flex-direction: column; gap: 0.25rem;"
          >
            Dark Mode
            <div style="display: flex; gap: 0.25rem;">
              <input
                type="color"
                value={surface.override?.dark ?? "#000000"}
                oninput={(e) =>
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      dark: e.currentTarget.value,
                    },
                  })}
                style="height: 30px; width: 30px; padding: 0; border: none; background: none; cursor: pointer;"
              />
              <input
                type="text"
                placeholder="#RRGGBB"
                value={surface.override?.dark ?? ""}
                oninput={(e) =>
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      dark: e.currentTarget.value,
                    },
                  })}
                style="flex: 1; padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: transparent; color: var(--text-high-token); font-family: monospace;"
              />
            </div>
          </label>
        </div>
        {#if surface.override?.light || surface.override?.dark}
          <button
            onclick={() => update({ override: undefined })}
            class="text-subtle"
            style="margin-top: 0.5rem; font-size: 0.8rem; text-decoration: underline; background: none; border: none; cursor: pointer;"
          >
            Clear Overrides
          </button>
        {/if}
      </div>

      <div
        style="display: flex; justify-content: flex-end; margin-top: 0.5rem;"
      >
        <button
          onclick={(e) => {
            e.stopPropagation();
            remove();
          }}
          class="text-subtle"
          style="color: var(--hue-error); background: transparent; border: none; cursor: pointer; font-size: 0.9rem;"
        >
          Delete Surface
        </button>
      </div>
    </div>
  {/if}
</div>

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
  class="surface-workspace bordered"
  style="border-radius: 6px; overflow: hidden; cursor: grab; {isSelected
    ? 'background-color: var(--highlight-surface-color); border-color: var(--highlight-ring-color);'
    : ''}"
  draggable="true"
  ondragstart={handleDragStart}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  role="listitem"
>
  <div
    style="padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;"
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
    <span class="text-subtle" style="cursor: grab;">☰</span>
    <span
      style:transform={isSelected ? "rotate(90deg)" : "rotate(0deg)"}
      style:transition="transform 0.2s"
    >
      ▶
    </span>
    <span class="text-strong" style="flex: 1;">
      {surface.label}
    </span>

    {#if hexValue}
      <button
        class="text-subtle code-font"
        style="background: none; border: none; cursor: copy; font-size: 0.8rem; padding: 2px 4px; border-radius: 4px;"
        onclick={copyHex}
        title="Copy Hex"
      >
        {hexValue.toUpperCase()}
      </button>
    {/if}

    {#if surface.override?.light || surface.override?.dark}
      <span
        title="Has manual overrides"
        style="font-size: 0.8rem; cursor: help;">⚠️</span
      >
    {/if}
    <ContrastBadge slug={surface.slug} mode={resolvedTheme} {solved} />
  </div>

  {#if isExpanded}
    <div
      style="padding: 0.75rem; border-top: 1px solid var(--border-subtle-token); display: flex; flex-direction: column; gap: 0.75rem; cursor: default;"
      onclick={(e) => {
        e.stopPropagation();
      }}
      onkeydown={(e) => {
        e.stopPropagation();
      }}
      role="group"
    >
      <!-- Data Density Section -->
      {#if colorSpec}
        <div
          class="surface-card bordered"
          style="padding: 0.5rem; border-radius: 4px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center;"
        >
          <div>
            <div class="text-subtlest" style="font-size: 0.75rem;">
              Lightness
            </div>
            <div class="text-strong code-font">{colorSpec.l.toFixed(3)}</div>
          </div>
          <div>
            <div class="text-subtlest" style="font-size: 0.75rem;">Chroma</div>
            <div class="text-strong code-font">{colorSpec.c.toFixed(3)}</div>
          </div>
          <div>
            <div class="text-subtlest" style="font-size: 0.75rem;">Hue</div>
            <div class="text-strong code-font">{colorSpec.h.toFixed(1)}°</div>
          </div>
        </div>
      {/if}

      <label
        class="text-subtle"
        style="display: flex; flex-direction: column; gap: 0.25rem;"
      >
        Label
        <input
          type="text"
          value={surface.label}
          oninput={(e) => {
            update({ label: e.currentTarget.value });
          }}
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
          oninput={(e) => {
            update({ slug: e.currentTarget.value });
          }}
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
          onchange={(e) => {
            update({ polarity: e.currentTarget.value as Polarity });
          }}
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
          oninput={(e) => {
            update({ targetChroma: Number(e.currentTarget.value) });
          }}
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
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      light: e.currentTarget.value,
                    },
                  });
                }}
                style="height: 30px; width: 30px; padding: 0; border: none; background: none; cursor: pointer;"
              />
              <input
                type="text"
                placeholder="#RRGGBB"
                value={surface.override?.light ?? ""}
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      light: e.currentTarget.value,
                    },
                  });
                }}
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
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      dark: e.currentTarget.value,
                    },
                  });
                }}
                style="height: 30px; width: 30px; padding: 0; border: none; background: none; cursor: pointer;"
              />
              <input
                type="text"
                placeholder="#RRGGBB"
                value={surface.override?.dark ?? ""}
                oninput={(e) => {
                  update({
                    override: {
                      ...(surface.override ?? {}),
                      dark: e.currentTarget.value,
                    },
                  });
                }}
                style="flex: 1; padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: transparent; color: var(--text-high-token); font-family: monospace;"
              />
            </div>
          </label>
        </div>
        {#if surface.override?.light || surface.override?.dark}
          <button
            onclick={() => {
              update({ override: undefined });
            }}
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

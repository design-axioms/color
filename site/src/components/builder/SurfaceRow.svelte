<script lang="ts">
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";

  interface Props {
    surface: { label: string };
    groupIndex: number;
    surfaceIndex: number;
  }

  let { surface, groupIndex, surfaceIndex }: Props = $props();

  const configState = getContext<ConfigState>("config");

  function handleRemove(): void {
    configState.removeSurface(groupIndex, surfaceIndex);
  }

  function handleUpdate(e: Event): void {
    const target = e.target as HTMLInputElement;
    configState.updateSurface(groupIndex, surfaceIndex, {
      label: target.value,
    });
  }
</script>

<li class="surface-row surface-card bordered">
  <span class="drag-handle text-subtle">::</span>
  <input
    type="text"
    value={surface.label}
    oninput={handleUpdate}
    class="surface-name-input text-strong"
  />
  <button
    onclick={handleRemove}
    class="icon-button delete-button text-subtle hover-text-error"
    title="Remove Surface"
  >
    &times;
  </button>
</li>

<style>
  .surface-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
  }

  .drag-handle {
    cursor: grab;
    font-size: 1rem;
    line-height: 1;
  }

  .surface-name-input {
    flex: 1;
    background: transparent;
    border: none;
    font-size: 0.9rem;
  }

  .surface-name-input:focus {
    outline: none;
    text-decoration: underline;
  }

  .icon-button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0 0.25rem;
  }
</style>

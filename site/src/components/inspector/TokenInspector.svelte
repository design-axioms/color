<script lang="ts">
  import { setContext } from "svelte";
  import InspectorPanel from "./InspectorPanel.svelte";

  let selectedElement = $state<HTMLElement | null>(null);

  function select(element: HTMLElement | null): void {
    selectedElement = element;
  }

  setContext("inspector", {
    select,
    get selected() {
      return selectedElement;
    },
  });
</script>

<div class="token-inspector-container not-content surface-sunken bordered">
  <div class="inspector-content">
    <slot />
  </div>

  {#if selectedElement}
    <InspectorPanel
      element={selectedElement}
      onClose={() => {
        select(null);
      }}
    />
  {/if}
</div>

<style>
  .token-inspector-container {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }

  .inspector-content {
    padding: 1.5rem;
    /* Ensure the content has a stacking context */
    position: relative;
    z-index: 1;
  }
</style>

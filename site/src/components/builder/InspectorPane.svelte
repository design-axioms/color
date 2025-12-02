<script lang="ts">
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";

  let {
    title,
    children,
    isOpen = $bindable(true),
  }: {
    title: string;
    children: Snippet;
    isOpen?: boolean;
  } = $props();
</script>

<div class="inspector-pane">
  <button
    class="inspector-header text-strong"
    onclick={() => (isOpen = !isOpen)}
    aria-expanded={isOpen}
  >
    <span>{title}</span>
    <span class="icon text-subtle">{isOpen ? "▼" : "▶"}</span>
  </button>
  {#if isOpen}
    <div class="inspector-content" transition:slide={{ duration: 200 }}>
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .inspector-pane {
    border-bottom: 1px solid var(--computed-border-dec-color);
  }

  .inspector-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 0.9rem;
    user-select: none;
  }

  .inspector-header:hover {
    background-color: var(--computed-surface);
  }

  .inspector-content {
    padding: 0 1rem 1rem 1rem;
  }

  .icon {
    font-size: 0.75rem;
  }
</style>

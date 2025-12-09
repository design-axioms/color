<script lang="ts">
  import { type Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<aside class="plain-english surface-card bordered">
  <div class="header">
    <span class="icon">ℹ️</span>
    <span class="title">In Plain English</span>
  </div>
  <div class="content">
    {@render children()}
  </div>
</aside>

<style>
  .plain-english {
    margin: 2rem 0;
    padding: 1.5rem;
    border-radius: 0.5rem;
    /* Use a serif font for the "academic" feel */
    font-family: "Erewhon Math", "Libertinus Math", serif;
    /* Ensure text color is strong */
    color: var(--axm-text-body-token);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-family: var(--sl-font-system); /* Keep header sans-serif */
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--axm-text-subtle-token);
    border-bottom: 1px solid var(--axm-border-dec-token);
    padding-bottom: 0.5rem;
  }

  .icon {
    font-size: 1.1em;
  }

  .content {
    font-size: 1.05rem;
    line-height: 1.7;
  }

  /* Style the list items */
  .content :global(ul) {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .content :global(li) {
    position: relative;
    padding-left: 1.25rem;
  }

  .content :global(li::before) {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--axm-key-brand-color); /* Use brand color for bullets */
    font-weight: bold;
  }

  .content :global(strong) {
    color: var(--axm-text-strong-token);
    font-weight: 700;
  }
</style>

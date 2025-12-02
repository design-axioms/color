<script lang="ts">
  import { getContext } from "svelte";
  import type { ThemeState } from "../lib/state/ThemeState.svelte";

  const theme = getContext<ThemeState>("theme");
</script>

<button
  class="theme-toggle"
  onclick={() => {
    theme.toggle();
  }}
  aria-label="Toggle theme"
>
  {theme.isDark ? "🌙" : "☀️"}
</button>

<style>
  .theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  .theme-toggle:hover {
    background-color: var(--surface-hover);
  }
</style>
